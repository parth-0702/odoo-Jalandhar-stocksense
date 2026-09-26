import { hashPassword } from '../services/authService.js';
const day = (offset) => { const d = new Date(); d.setDate(d.getDate() + offset); return d.toLocaleDateString('en-CA'); };
const adminPasswordHash = hashPassword('StockSense@123');
export function seedData() {
  const products = [
    ['p1', 'Steel Rods', 'SR-001', 'Raw Material', 'Kg', 85, 100],
    ['p2', 'Office Chair', 'CH-002', 'Furniture', 'Pcs', 3500, 25],
    ['p3', 'Cement Bag', 'CB-003', 'Raw Material', 'Bag', 420, 30],
    ['p4', 'Table Frame', 'TF-004', 'Finished Goods', 'Pcs', 2200, 20],
    ['p5', 'Wooden Plank', 'WP-005', 'Raw Material', 'Pcs', 650, 50],
    ['p6', 'Standing Desk', 'DS-006', 'Furniture', 'Pcs', 12500, 10],
  ].map(([id, name, sku, category, unitOfMeasure, perUnitCost, reorderThreshold]) => ({ id, name, sku, category, unitOfMeasure, perUnitCost, reorderThreshold, description: '' }));
  return {
    users: [{ id: 'u1', loginId: 'admin01', email: 'admin@stocksense.local', name: 'Alex Morgan', role: 'Inventory Manager', passwordHash: adminPasswordHash }],
    sessions: [], resets: [], products,
    warehouses: [{ id: 'w1', name: 'Main Warehouse', shortCode: 'WH', address: 'Industrial Area, Jalandhar, Punjab' }, { id: 'w2', name: 'Production Hub', shortCode: 'PH', address: 'Focal Point, Jalandhar, Punjab' }],
    locations: [{ id: 'l1', name: 'Main Stock', shortCode: 'STOCK', warehouseRef: 'w1' }, { id: 'l2', name: 'Rack A', shortCode: 'RACK-A', warehouseRef: 'w1' }, { id: 'l3', name: 'Production Floor', shortCode: 'FLOOR', warehouseRef: 'w2' }],
    stock: products.map((p, i) => ({ id: `s${i}`, productRef: p.id, locationRef: 'l1', onHand: [1250, 20, 0, 85, 340, 42][i], freeToUse: [1250, 20, 0, 85, 340, 42][i] })),
    documents: [
      { id: 'd1', type: 'Receipt', reference: 'WH/IN/0001', status: 'Ready', contact: 'Shree Steel Ltd.', scheduleDate: day(-2), responsible: 'u1', warehouseRef: 'w1', fromLocation: '', toLocation: 'l1', lines: [{ product: 'p1', quantity: 500 }], operationType: '', notes: '' },
      { id: 'd2', type: 'Receipt', reference: 'WH/IN/0002', status: 'Draft', contact: 'BuildMart Supplies', scheduleDate: day(2), responsible: 'u1', warehouseRef: 'w1', fromLocation: '', toLocation: 'l1', lines: [{ product: 'p3', quantity: 100 }], operationType: '', notes: '' },
      { id: 'd3', type: 'Delivery', reference: 'WH/OUT/0001', status: 'Ready', contact: 'Azure Interior', scheduleDate: day(1), responsible: 'u1', warehouseRef: 'w1', fromLocation: 'l1', toLocation: '', lines: [{ product: 'p6', quantity: 6 }], operationType: 'Customer Delivery', notes: '' },
      { id: 'd4', type: 'Delivery', reference: 'WH/OUT/0002', status: 'Waiting', contact: 'Metro Builders', scheduleDate: day(-1), responsible: 'u1', warehouseRef: 'w1', fromLocation: 'l1', toLocation: '', lines: [{ product: 'p3', quantity: 50 }], operationType: 'Customer Delivery', notes: '' },
      { id: 'd5', type: 'Transfer', reference: 'WH/INT/0001', status: 'Draft', contact: 'Internal Operations', scheduleDate: day(3), responsible: 'u1', warehouseRef: 'w1', fromLocation: 'l1', toLocation: 'l3', lines: [{ product: 'p1', quantity: 75 }], operationType: '', notes: '' },
    ],
    ledger: [], counters: { 'WH/IN': 2, 'WH/OUT': 2, 'WH/INT': 1 },
  };
}
