import { ensure } from '../utils/errors.js';
import { numeric } from '../utils/numbers.js';
import { findRecord } from '../utils/records.js';
import { FLOWS } from '../domain/flows.js';

export function createOperationService(repo, { stock, reference, mutations }) {
  const find = (collection, id) => findRecord(repo, collection, id);
  const stockAt = stock.stockAt;
  function enrich(doc) {
    const outgoing = ['Delivery', 'Transfer'].includes(doc.type);
    const totals = new Map();
    doc.lines.forEach(l => totals.set(l.product, (totals.get(l.product) || 0) + l.quantity));
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
      ensure(!seen.has(line.product), 'Each product may appear only once. Combine its quantities.');
      seen.add(line.product);
      return { product: line.product, quantity: numeric(line.quantity, 'Quantity', type === 'Adjustment') };
    });
    return { type, contact: input.contact.trim(), scheduleDate: input.scheduleDate, responsible: user.id, warehouseRef: warehouse.id, fromLocation, toLocation, lines, operationType: type === 'Delivery' ? input.operationType.trim() : '', notes: String(input.notes || '') };
  }
  const api = {
    list(type) { return repo.all('documents').filter(d => d.type === type).map(enrich); },
    detail(type, id) { const doc = find('documents', id); ensure(doc.type === type, 'Document not found.', 404); return enrich(doc); },
    async create(type, input, user) {
      const values = validateDocument(type, input, user);
      return repo.transaction(async () => enrich(await repo.insert('documents', { ...values, reference: await reference.nextDocumentReference(find('warehouses', values.warehouseRef), type), status: 'Draft' })));
    },
    async update(type, id, input, user) {
      const doc = api.detail(type, id);
      ensure(doc.status === 'Draft', 'Only Draft documents can be edited.');
      ensure(input.warehouseRef === doc.warehouseRef, 'Warehouse cannot change after a reference is assigned.');
      const values = validateDocument(type, input, user);
      values.responsible = doc.responsible;
      return enrich(await repo.update('documents', id, values));
    },
    async transition(type, id, action) {
      return repo.transaction(async () => {
        const doc = find('documents', id);
        ensure(doc.type === type, 'Document not found.', 404);
        ensure(!['Done', 'Canceled'].includes(doc.status), 'Completed or canceled documents cannot be changed.');
        if (action === 'cancel') doc.status = 'Canceled';
        else if (action === 'todo') {
          ensure(doc.status === 'Draft', 'TODO is only available in Draft.');
          const insufficient = enrich(doc).lines.some(l => l.insufficientStock);
          if (doc.type === 'Transfer') ensure(!insufficient, 'Insufficient stock for transfer.');
          doc.status = doc.type === 'Delivery' && insufficient ? 'Waiting' : 'Ready';
        } else if (action === 'check') {
          ensure(doc.type === 'Delivery' && doc.status === 'Waiting', 'Availability check is only available for Waiting deliveries.');
          ensure(!enrich(doc).lines.some(l => l.insufficientStock), 'Still waiting for stock.');
          doc.status = 'Ready';
        } else if (action === 'validate') {
          ensure(doc.status === 'Ready', 'Validate is only available in Ready.');
          ensure(!enrich(doc).lines.some(l => l.insufficientStock), 'Insufficient stock. Receive stock before validating.');
          for (const line of doc.lines) {
            if (doc.type === 'Receipt') await mutations.writeStock(line.product, doc.toLocation, line.quantity, doc);
            if (doc.type === 'Delivery') await mutations.writeStock(line.product, doc.fromLocation, -line.quantity, doc);
            if (doc.type === 'Transfer') { await mutations.writeStock(line.product, doc.fromLocation, -line.quantity, doc); await mutations.writeStock(line.product, doc.toLocation, line.quantity, doc); }
            if (doc.type === 'Adjustment') {
              const old = stockAt(line.product, doc.toLocation);
              const delta = line.quantity - (old?.onHand || 0);
              await mutations.writeStock(line.product, doc.toLocation, delta, { ...doc, fromLocation: delta < 0 ? doc.toLocation : '', toLocation: delta > 0 ? doc.toLocation : '' });
            }
          }
          doc.status = 'Done';
          doc.completedAt = new Date().toISOString();
        } else ensure(false, 'Invalid action.');
        return enrich(doc);
      });
    },
    async manualStock(product, { locationRef, quantity }, user) {
      return repo.transaction(async () => {
        const location = find('locations', locationRef);
        const doc = await api.create('Adjustment', { warehouseRef: location.warehouseRef, toLocation: locationRef, contact: 'Manual Stock Update', scheduleDate: new Date().toLocaleDateString('en-CA'), lines: [{ product, quantity }] }, user);
        await api.transition('Adjustment', doc.id, 'todo');
        return api.transition('Adjustment', doc.id, 'validate');
      });
    },
  };
  return api;
}
