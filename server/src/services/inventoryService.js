import { ensure } from '../utils/errors.js';
export const TYPES = { receipts: 'Receipt', deliveries: 'Delivery', transfers: 'Transfer', adjustments: 'Adjustment' };
export const FLOWS = { Receipt: ['Draft', 'Ready', 'Done'], Delivery: ['Draft', 'Waiting', 'Ready', 'Done'], Transfer: ['Draft', 'Ready', 'Done'], Adjustment: ['Draft', 'Ready', 'Done'] };
const OPS = { Receipt: 'IN', Delivery: 'OUT', Transfer: 'INT', Adjustment: 'ADJ' };
const numeric = (value, label, zero = true) => { const n = Number(value); ensure(value !== '' && value != null && Number.isFinite(n) && (zero ? n >= 0 : n > 0), `${label} must be ${zero ? 'zero or greater' : 'greater than zero'}.`); return n; };

export function createInventoryService(repo) {
  const find = (collection, id) => { const item = repo.get(collection, id); ensure(item, `${collection} record not found.`, 404); return item; };
  const stockAt = (product, location) => repo.all('stock').find(s => s.productRef === product && s.locationRef === location);
  function writeStock(product, location, change, doc) {
    let stock = stockAt(product, location);
    if (!stock) stock = repo.insert('stock', { productRef: product, locationRef: location, onHand: 0, freeToUse: 0 });
    ensure(stock.onHand + change >= 0 && stock.freeToUse + change >= 0, 'Insufficient stock. Refresh availability and try again.');
    stock.onHand += change; stock.freeToUse += change;
    if (change !== 0) repo.insert('ledger', { timestamp: new Date().toISOString(), type: doc.type, product, quantityChange: change, fromLocation: doc.fromLocation || '', toLocation: doc.toLocation || '', relatedDocument: doc.id, direction: change > 0 ? 'IN' : 'OUT' });
  }
  function enrich(doc) {
    const outgoing = ['Delivery', 'Transfer'].includes(doc.type);
    const totals = new Map(); doc.lines.forEach(l => totals.set(l.product, (totals.get(l.product) || 0) + l.quantity));
    return { ...doc, responsibleName: repo.get('users', doc.responsible)?.name, lines: doc.lines.map(line => ({ ...line, available: stockAt(line.product, doc.fromLocation)?.freeToUse || 0, insufficientStock: outgoing && doc.status !== 'Done' && (totals.get(line.product) > (stockAt(line.product, doc.fromLocation)?.freeToUse || 0)) })) };
  }
  function validateDocument(type, input, user) {
    ensure(FLOWS[type], 'Invalid document type.');
    const warehouse = find('warehouses', input.warehouseRef);
    ensure(input.contact?.trim(), type === 'Transfer' ? 'Vendor is required.' : 'Contact is required.');
    ensure(/^\d{4}-\d{2}-\d{2}$/.test(input.scheduleDate) && !Number.isNaN(Date.parse(input.scheduleDate)), 'Schedule date is required.');
    const fromLocation = ['Delivery', 'Transfer'].includes(type) ? input.fromLocation : '';
    const toLocation = ['Receipt', 'Transfer', 'Adjustment'].includes(type) ? input.toLocation : '';
    if (fromLocation) find('locations', fromLocation);
    if (toLocation) find('locations', toLocation);
    ensure(type !== 'Transfer' || fromLocation !== toLocation, 'From and To locations must be different.');
    const mainLocation = ['Delivery', 'Transfer'].includes(type) ? fromLocation : toLocation;
    ensure(mainLocation && find('locations', mainLocation).warehouseRef === warehouse.id, 'Select a location in the selected warehouse.');
    if (type === 'Transfer') ensure(toLocation, 'To location is required.');
    if (type === 'Delivery') ensure(input.operationType?.trim(), 'Operation Type is required.');
    ensure(Array.isArray(input.lines) && input.lines.length, 'Add at least one product.');
    const seen = new Set();
    const lines = input.lines.map(line => {
      find('products', line.product);
      ensure(!seen.has(line.product), 'Each product may appear only once. Combine its quantities.'); seen.add(line.product);
      return { product: line.product, quantity: numeric(line.quantity, 'Quantity', type === 'Adjustment') };
    });
    return { type, contact: input.contact.trim(), scheduleDate: input.scheduleDate, responsible: user.id, warehouseRef: warehouse.id, fromLocation, toLocation, lines, operationType: type === 'Delivery' ? input.operationType.trim() : '', notes: String(input.notes || '') };
  }
  const api = {
    products(filters = {}) {
      return repo.all('products').map(p => {
        const stock = repo.all('stock').filter(s => s.productRef === p.id && (!filters.location || s.locationRef === filters.location) && (!filters.warehouse || repo.get('locations', s.locationRef)?.warehouseRef === filters.warehouse));
        const onHand = stock.reduce((n, s) => n + s.onHand, 0), freeToUse = stock.reduce((n, s) => n + s.freeToUse, 0);
        return { ...p, onHand, freeToUse, stock, stockStatus: onHand === 0 ? 'Out of Stock' : onHand <= p.reorderThreshold ? 'Low Stock' : 'In Stock' };
      });
    },
    saveProduct(input, id, user) {
      const name = input.name?.trim(), sku = input.sku?.trim(); ensure(name && sku && input.category?.trim() && input.unitOfMeasure?.trim(), 'Name, SKU, Category, and Unit of Measure are required.');
      ensure(!repo.all('products').some(p => p.id !== id && p.sku.toLowerCase() === sku.toLowerCase()), 'SKU already exists.');
      const data = { name, sku, category: input.category.trim(), unitOfMeasure: input.unitOfMeasure.trim(), perUnitCost: numeric(input.perUnitCost, 'Per Unit Cost'), reorderThreshold: numeric(input.reorderThreshold, 'Reordering Rule'), description: String(input.description || '') };
      return repo.transaction(() => {
        if (id) { find('products', id); return repo.update('products', id, data); }
        const product = repo.insert('products', data);
        const quantity = numeric(input.initialStock ?? 0, 'Initial Stock');
        if (quantity > 0) api.manualStock(product.id, { locationRef: input.locationRef, quantity }, user);
        return product;
      });
    },
    settings(collection) { return repo.all(collection); },
    saveSetting(collection, input, id) {
      ensure(['warehouses', 'locations'].includes(collection), 'Invalid setting.');
      ensure(input.name?.trim() && /^[A-Za-z0-9-]+$/.test(input.shortCode || ''), 'Name and an alphanumeric Short Code are required.');
      const data = { name: input.name.trim(), shortCode: input.shortCode.toUpperCase() };
      if (collection === 'warehouses') { ensure(input.address?.trim(), 'Address is required.'); data.address = input.address.trim(); }
      else { find('warehouses', input.warehouseRef); data.warehouseRef = input.warehouseRef; }
      ensure(!repo.all(collection).some(x => x.id !== id && x.shortCode === data.shortCode && (collection === 'warehouses' || x.warehouseRef === data.warehouseRef)), 'Short Code already exists.');
      if (id) {
        const previous = find(collection, id);
        if (collection === 'locations' && previous.warehouseRef !== data.warehouseRef) ensure(!repo.all('stock').some(s => s.locationRef === id) && !repo.all('documents').some(d => d.fromLocation === id || d.toLocation === id), 'An active location cannot be moved to another warehouse.');
        return repo.update(collection, id, data);
      }
      return repo.insert(collection, data);
    },
    list(type) { return repo.all('documents').filter(d => d.type === type).map(enrich); },
    detail(type, id) { const doc = find('documents', id); ensure(doc.type === type, 'Document not found.', 404); return enrich(doc); },
    create(type, input, user) {
      const values = validateDocument(type, input, user);
      return repo.transaction(() => enrich(repo.insert('documents', { ...values, reference: repo.nextReference(`${find('warehouses', values.warehouseRef).shortCode}/${OPS[type]}`), status: 'Draft' })));
    },
    update(type, id, input, user) {
      const doc = api.detail(type, id); ensure(doc.status === 'Draft', 'Only Draft documents can be edited.');
      ensure(input.warehouseRef === doc.warehouseRef, 'Warehouse cannot change after a reference is assigned.');
      const values = validateDocument(type, input, user); values.responsible = doc.responsible;
      return enrich(repo.update('documents', id, values));
    },
    transition(type, id, action) {
      return repo.transaction(() => {
        const doc = find('documents', id); ensure(doc.type === type, 'Document not found.', 404);
        ensure(!['Done', 'Canceled'].includes(doc.status), 'Completed or canceled documents cannot be changed.');
        if (action === 'cancel') doc.status = 'Canceled';
        else if (action === 'todo') {
          ensure(doc.status === 'Draft', 'TODO is only available in Draft.');
          const insufficient = enrich(doc).lines.some(l => l.insufficientStock);
          if (doc.type === 'Transfer') ensure(!insufficient, 'Insufficient stock for transfer.');
          doc.status = doc.type === 'Delivery' && insufficient ? 'Waiting' : 'Ready';
        } else if (action === 'check') {
          ensure(doc.type === 'Delivery' && doc.status === 'Waiting', 'Availability check is only available for Waiting deliveries.');
          ensure(!enrich(doc).lines.some(l => l.insufficientStock), 'Still waiting for stock.'); doc.status = 'Ready';
        } else if (action === 'validate') {
          ensure(doc.status === 'Ready', 'Validate is only available in Ready.');
          ensure(!enrich(doc).lines.some(l => l.insufficientStock), 'Insufficient stock. Receive stock before validating.');
          for (const line of doc.lines) {
            if (doc.type === 'Receipt') writeStock(line.product, doc.toLocation, line.quantity, doc);
            if (doc.type === 'Delivery') writeStock(line.product, doc.fromLocation, -line.quantity, doc);
            if (doc.type === 'Transfer') { writeStock(line.product, doc.fromLocation, -line.quantity, doc); writeStock(line.product, doc.toLocation, line.quantity, doc); }
            if (doc.type === 'Adjustment') {
              const old = stockAt(line.product, doc.toLocation); const delta = line.quantity - (old?.onHand || 0);
              writeStock(line.product, doc.toLocation, delta, { ...doc, fromLocation: delta < 0 ? doc.toLocation : '', toLocation: delta > 0 ? doc.toLocation : '' });
            }
          }
          doc.status = 'Done'; doc.completedAt = new Date().toISOString();
        } else ensure(false, 'Invalid action.');
        return enrich(doc);
      });
    },
    manualStock(product, { locationRef, quantity }, user) {
      return repo.transaction(() => {
        const location = find('locations', locationRef);
        const doc = api.create('Adjustment', { warehouseRef: location.warehouseRef, toLocation: locationRef, contact: 'Manual Stock Update', scheduleDate: new Date().toLocaleDateString('en-CA'), lines: [{ product, quantity }] }, user);
        api.transition('Adjustment', doc.id, 'todo'); return api.transition('Adjustment', doc.id, 'validate');
      });
    },
    ledger() { return repo.all('ledger').map(l => { const doc = find('documents', l.relatedDocument); return { ...l, reference: doc.reference, contact: doc.contact, status: doc.status, scheduleDate: doc.scheduleDate, productName: find('products', l.product).name }; }).reverse(); },
    dashboard(filters = {}) {
      const products = api.products(filters).filter(p => !filters.category || p.category === filters.category);
      const docs = repo.all('documents').filter(d => (!filters.type || d.type === filters.type) && (!filters.status || d.status === filters.status) && (!filters.warehouse || d.warehouseRef === filters.warehouse) && (!filters.location || [d.fromLocation, d.toLocation].includes(filters.location)) && (!filters.category || d.lines.some(l => products.some(p => p.id === l.product))));
      const pending = docs.filter(d => !['Done', 'Canceled'].includes(d.status));
      const today = new Date().toLocaleDateString('en-CA');
      const module = type => { const list = pending.filter(d => d.type === type); return { pending: list.length, late: list.filter(d => d.scheduleDate < today).length, operations: list.filter(d => d.scheduleDate > today).length, waiting: list.filter(d => d.status === 'Waiting').length }; };
      return { totalProducts: products.length, inStock: products.filter(p => p.onHand > p.reorderThreshold).length, lowStock: products.filter(p => p.stockStatus === 'Low Stock').length, outOfStock: products.filter(p => !p.onHand).length, receipts: module('Receipt'), deliveries: module('Delivery'), transfers: module('Transfer'), recent: [...docs].reverse().slice(0, 5), inventoryValue: products.reduce((n, p) => n + p.onHand * p.perUnitCost, 0) };
    },
  };
  return api;
}
