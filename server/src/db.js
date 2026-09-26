import mongoose from 'mongoose';
import User from './models/User.js';
import Warehouse from './models/Warehouse.js';
import Location from './models/Location.js';
import Product from './models/Product.js';
import StockQuantity from './models/StockQuantity.js';
import Document from './models/Document.js';
import Ledger from './models/Ledger.js';
import Counter from './models/Counter.js';

const day = (offset) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toLocaleDateString('en-CA');
};

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('⚠️ MONGODB_URI not found in environment. Running in mock memory mode.');
    return;
  }

  try {
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB Atlas successfully.');
    await seedAtlas(false);
  } catch (err) {
    console.error('❌ MongoDB Atlas connection error:', err.message);
  }
}

export async function seedAtlas(force = false) {
  try {
    const productCount = await Product.countDocuments();
    if (productCount >= 10 && !force) {
      console.log('📊 MongoDB Atlas already has comprehensive test data. Skipping re-seed.');
      return;
    }

    console.log('🌱 Seeding fresh comprehensive dummy datasets into MongoDB Atlas...');

    // Clear existing collections if force or low count
    await Promise.all([
      User.deleteMany({}),
      Warehouse.deleteMany({}),
      Location.deleteMany({}),
      Product.deleteMany({}),
      StockQuantity.deleteMany({}),
      Document.deleteMany({}),
      Ledger.deleteMany({}),
      Counter.deleteMany({}),
    ]);

    // 1. Users
    const user = await User.create({
      loginId: 'admin01',
      email: 'admin@stocksense.local',
      name: 'Alex Morgan',
      role: 'Inventory Manager',
      passwordHash: 'StockSense@123',
    });

    // 2. Warehouses
    const wh1 = await Warehouse.create({
      name: 'Main Central Warehouse',
      shortCode: 'WH',
      address: 'Industrial Area, GT Road, Jalandhar, Punjab',
    });
    const wh2 = await Warehouse.create({
      name: 'Production & Assembly Hub',
      shortCode: 'PH',
      address: 'Focal Point Phase II, Jalandhar, Punjab',
    });
    const wh3 = await Warehouse.create({
      name: 'North Regional Depot',
      shortCode: 'ND',
      address: 'Transport Nagar, Jalandhar Bypass, Punjab',
    });

    // 3. Locations
    const loc1 = await Location.create({ name: 'Main Stock Area', shortCode: 'STOCK', warehouseRef: wh1._id });
    const loc2 = await Location.create({ name: 'Rack A (High Bay)', shortCode: 'RACK-A', warehouseRef: wh1._id });
    const loc3 = await Location.create({ name: 'Rack B (Small Parts)', shortCode: 'RACK-B', warehouseRef: wh1._id });
    const loc4 = await Location.create({ name: 'Production Assembly Floor', shortCode: 'FLOOR', warehouseRef: wh2._id });
    const loc5 = await Location.create({ name: 'Sub-Assembly Bay 1', shortCode: 'BAY-1', warehouseRef: wh2._id });
    const loc6 = await Location.create({ name: 'Depot Storage Bin 1', shortCode: 'BIN-1', warehouseRef: wh3._id });

    // 4. Products (10 items covering In Stock, Low Stock, Out of Stock, across multiple categories)
    const productsData = [
      { name: 'Steel Rods 12mm', sku: 'SR-001', category: 'Raw Material', unitOfMeasure: 'Kg', perUnitCost: 85, reorderThreshold: 150, description: 'High-tensile structural steel rods for reinforcement.' },
      { name: 'Ergonomic Office Chair', sku: 'CH-002', category: 'Furniture', unitOfMeasure: 'Pcs', perUnitCost: 3500, reorderThreshold: 25, description: 'Adjustable mesh back office chair with lumbar support.' },
      { name: 'Portland Cement 50kg', sku: 'CB-003', category: 'Raw Material', unitOfMeasure: 'Bag', perUnitCost: 420, reorderThreshold: 50, description: 'Grade 53 rapid-hardening Portland cement.' },
      { name: 'Modular Table Frame', sku: 'TF-004', category: 'Finished Goods', unitOfMeasure: 'Pcs', perUnitCost: 2200, reorderThreshold: 30, description: 'Powder-coated dual motor adjustable desk frame.' },
      { name: 'Teak Wood Plank 6ft', sku: 'WP-005', category: 'Raw Material', unitOfMeasure: 'Pcs', perUnitCost: 650, reorderThreshold: 40, description: 'Seasoned teak timber plank for premium furniture.' },
      { name: 'Motorized Standing Desk', sku: 'DS-006', category: 'Furniture', unitOfMeasure: 'Pcs', perUnitCost: 12500, reorderThreshold: 10, description: 'Electric dual-motor sit-stand desk with memory keypad.' },
      { name: 'Cardboard Shipping Box M', sku: 'BX-007', category: 'Packaging', unitOfMeasure: 'Box', perUnitCost: 45, reorderThreshold: 200, description: 'Heavy-duty 3-ply corrugated shipping carton.' },
      { name: 'Industrial Epoxy Adhesive', sku: 'EP-008', category: 'Hardware', unitOfMeasure: 'Litre', perUnitCost: 850, reorderThreshold: 20, description: 'Two-part chemical bonding epoxy resin.' },
      { name: 'Stainless Steel Screws M4', sku: 'SC-009', category: 'Hardware', unitOfMeasure: 'Pcs', perUnitCost: 4.5, reorderThreshold: 500, description: 'Corrosion-resistant cross-recessed pan head screws.' },
      { name: 'Tempered Glass Top 4x2ft', sku: 'GL-010', category: 'Finished Goods', unitOfMeasure: 'Pcs', perUnitCost: 2800, reorderThreshold: 15, description: '8mm shatter-resistant beveled tempered glass top.' },
    ];

    const products = await Product.insertMany(productsData);

    // 5. Stock Quantities per location
    await StockQuantity.insertMany([
      { productRef: products[0]._id, locationRef: loc1._id, onHand: 1450, freeToUse: 1450 },
      { productRef: products[0]._id, locationRef: loc4._id, onHand: 320, freeToUse: 320 },
      { productRef: products[1]._id, locationRef: loc1._id, onHand: 18, freeToUse: 18 }, // Low Stock
      { productRef: products[2]._id, locationRef: loc1._id, onHand: 0, freeToUse: 0 },   // Out of Stock
      { productRef: products[3]._id, locationRef: loc1._id, onHand: 85, freeToUse: 85 },
      { productRef: products[4]._id, locationRef: loc1._id, onHand: 32, freeToUse: 32 }, // Low Stock
      { productRef: products[5]._id, locationRef: loc1._id, onHand: 42, freeToUse: 42 },
      { productRef: products[6]._id, locationRef: loc3._id, onHand: 1200, freeToUse: 1200 },
      { productRef: products[7]._id, locationRef: loc3._id, onHand: 12, freeToUse: 12 }, // Low Stock
      { productRef: products[8]._id, locationRef: loc3._id, onHand: 3500, freeToUse: 3500 },
      { productRef: products[9]._id, locationRef: loc1._id, onHand: 0, freeToUse: 0 },   // Out of Stock
    ]);

    // 6. Documents across all operational modules & statuses
    const docRecords = await Document.create([
      // Receipts
      { type: 'Receipt', reference: 'WH/IN/0001', status: 'Ready', contact: 'Shree Steel Rolling Mills', scheduleDate: new Date(day(-1)), responsible: user._id, warehouseRef: wh1._id, toLocation: loc1._id, lines: [{ product: products[0]._id, quantity: 500 }], notes: 'Incoming raw material shipment.' },
      { type: 'Receipt', reference: 'WH/IN/0002', status: 'Draft', contact: 'BuildMart Supply Depot', scheduleDate: new Date(day(2)), responsible: user._id, warehouseRef: wh1._id, toLocation: loc1._id, lines: [{ product: products[2]._id, quantity: 200 }], notes: 'Urgent restocking for cement shortage.' },
      { type: 'Receipt', reference: 'WH/IN/0003', status: 'Done', contact: 'Apex Fasteners Corp', scheduleDate: new Date(day(-5)), responsible: user._id, warehouseRef: wh1._id, toLocation: loc3._id, lines: [{ product: products[8]._id, quantity: 2000 }], notes: 'Batch received and inspected.' },
      
      // Deliveries
      { type: 'Delivery', reference: 'WH/OUT/0001', status: 'Ready', contact: 'Azure Interior Solutions', scheduleDate: new Date(day(1)), responsible: user._id, warehouseRef: wh1._id, fromLocation: loc1._id, lines: [{ product: products[5]._id, quantity: 5 }], operationType: 'Customer Delivery', notes: 'Priority client order for corporate office.' },
      { type: 'Delivery', reference: 'WH/OUT/0002', status: 'Waiting', contact: 'Metro Builders Infrastructure', scheduleDate: new Date(day(-1)), responsible: user._id, warehouseRef: wh1._id, fromLocation: loc1._id, lines: [{ product: products[2]._id, quantity: 50 }], operationType: 'Customer Delivery', notes: 'Awaiting cement shipment validation.' },
      { type: 'Delivery', reference: 'WH/OUT/0003', status: 'Draft', contact: 'Urban Workspace Co.', scheduleDate: new Date(day(4)), responsible: user._id, warehouseRef: wh1._id, fromLocation: loc1._id, lines: [{ product: products[1]._id, quantity: 10 }, { product: products[3]._id, quantity: 10 }], operationType: 'Customer Delivery', notes: 'Scheduled for next week delivery.' },
      { type: 'Delivery', reference: 'WH/OUT/0004', status: 'Done', contact: 'Elite Architecture Studio', scheduleDate: new Date(day(-3)), responsible: user._id, warehouseRef: wh1._id, fromLocation: loc1._id, lines: [{ product: products[4]._id, quantity: 20 }], operationType: 'Customer Delivery', notes: 'Signed POD received on delivery.' },

      // Transfers
      { type: 'Transfer', reference: 'WH/INT/0001', status: 'Draft', contact: 'Internal Production Line', scheduleDate: new Date(day(2)), responsible: user._id, warehouseRef: wh1._id, fromLocation: loc1._id, toLocation: loc4._id, lines: [{ product: products[0]._id, quantity: 150 }], notes: 'Transfer steel rods for batch fabrication.' },
      { type: 'Transfer', reference: 'WH/INT/0002', status: 'Ready', contact: 'Depot Replenishment', scheduleDate: new Date(day(1)), responsible: user._id, warehouseRef: wh1._id, fromLocation: loc1._id, toLocation: loc6._id, lines: [{ product: products[3]._id, quantity: 15 }], notes: 'Rebalance stock to North Depot.' },
      { type: 'Transfer', reference: 'WH/INT/0003', status: 'Done', contact: 'Assembly Shift A', scheduleDate: new Date(day(-4)), responsible: user._id, warehouseRef: wh1._id, fromLocation: loc3._id, toLocation: loc5._id, lines: [{ product: products[8]._id, quantity: 500 }], notes: 'Internal issue for assembly line.' },

      // Adjustments
      { type: 'Adjustment', reference: 'WH/ADJ/0001', status: 'Done', contact: 'Annual Physical Audit', scheduleDate: new Date(day(-2)), responsible: user._id, warehouseRef: wh1._id, toLocation: loc1._id, lines: [{ product: products[1]._id, quantity: 18 }], notes: 'Adjusted after end-of-month physical count.' },
    ]);

    // 7. Ledger Movements (Move History)
    await Ledger.create([
      { timestamp: new Date(Date.now() - 5 * 86400000), type: 'Receipt', product: products[8]._id, quantityChange: 2000, toLocation: loc3._id, relatedDocument: docRecords[2]._id, direction: 'IN' },
      { timestamp: new Date(Date.now() - 4 * 86400000), type: 'Transfer', product: products[8]._id, quantityChange: -500, fromLocation: loc3._id, toLocation: loc5._id, relatedDocument: docRecords[9]._id, direction: 'OUT' },
      { timestamp: new Date(Date.now() - 4 * 86400000), type: 'Transfer', product: products[8]._id, quantityChange: 500, fromLocation: loc3._id, toLocation: loc5._id, relatedDocument: docRecords[9]._id, direction: 'IN' },
      { timestamp: new Date(Date.now() - 3 * 86400000), type: 'Delivery', product: products[4]._id, quantityChange: -20, fromLocation: loc1._id, relatedDocument: docRecords[6]._id, direction: 'OUT' },
      { timestamp: new Date(Date.now() - 2 * 86400000), type: 'Adjustment', product: products[1]._id, quantityChange: -2, fromLocation: loc1._id, toLocation: loc1._id, relatedDocument: docRecords[10]._id, direction: 'OUT' },
    ]);

    // 8. Counter Sequences
    await Counter.create([
      { prefix: 'WH/IN', sequence: 3 },
      { prefix: 'WH/OUT', sequence: 4 },
      { prefix: 'WH/INT', sequence: 3 },
      { prefix: 'WH/ADJ', sequence: 1 },
    ]);

    console.log('✅ MongoDB Atlas rich dummy dataset seeded successfully!');
  } catch (error) {
    console.error('❌ Failed to seed MongoDB Atlas:', error.message);
  }
}
