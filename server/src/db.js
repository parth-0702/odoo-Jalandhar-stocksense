import mongoose from 'mongoose';
import User from './models/User.js';
import Warehouse from './models/Warehouse.js';
import Location from './models/Location.js';
import Product from './models/Product.js';
import StockQuantity from './models/StockQuantity.js';
import Document from './models/Document.js';
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
    await seedAtlasIfEmpty();
  } catch (err) {
    console.error('❌ MongoDB Atlas connection error:', err.message);
  }
}

async function seedAtlasIfEmpty() {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('📊 MongoDB Atlas already has data. Skipping initial seeding.');
      return;
    }

    console.log('🌱 Seeding initial collections to MongoDB Atlas...');

    // 1. Create Default User
    const user = await User.create({
      loginId: 'admin01',
      email: 'admin@stocksense.local',
      name: 'Alex Morgan',
      role: 'Inventory Manager',
      passwordHash: 'StockSense@123',
    });

    // 2. Create Warehouses
    const wh1 = await Warehouse.create({
      name: 'Main Warehouse',
      shortCode: 'WH',
      address: 'Industrial Area, Jalandhar, Punjab',
    });

    const wh2 = await Warehouse.create({
      name: 'Production Hub',
      shortCode: 'PH',
      address: 'Focal Point, Jalandhar, Punjab',
    });

    // 3. Create Locations
    const loc1 = await Location.create({
      name: 'Main Stock',
      shortCode: 'STOCK',
      warehouseRef: wh1._id,
    });

    const loc2 = await Location.create({
      name: 'Rack A',
      shortCode: 'RACK-A',
      warehouseRef: wh1._id,
    });

    const loc3 = await Location.create({
      name: 'Production Floor',
      shortCode: 'FLOOR',
      warehouseRef: wh2._id,
    });

    // 4. Create Products
    const productsData = [
      { name: 'Steel Rods', sku: 'SR-001', category: 'Raw Material', unitOfMeasure: 'Kg', perUnitCost: 85, reorderThreshold: 100 },
      { name: 'Office Chair', sku: 'CH-002', category: 'Furniture', unitOfMeasure: 'Pcs', perUnitCost: 3500, reorderThreshold: 25 },
      { name: 'Cement Bag', sku: 'CB-003', category: 'Raw Material', unitOfMeasure: 'Bag', perUnitCost: 420, reorderThreshold: 30 },
      { name: 'Table Frame', sku: 'TF-004', category: 'Finished Goods', unitOfMeasure: 'Pcs', perUnitCost: 2200, reorderThreshold: 20 },
      { name: 'Wooden Plank', sku: 'WP-005', category: 'Raw Material', unitOfMeasure: 'Pcs', perUnitCost: 650, reorderThreshold: 50 },
      { name: 'Standing Desk', sku: 'DS-006', category: 'Furniture', unitOfMeasure: 'Pcs', perUnitCost: 12500, reorderThreshold: 10 },
    ];

    const products = await Product.insertMany(productsData);

    // 5. Create Initial Stock Quantities
    const quantities = [1250, 20, 0, 85, 340, 42];
    const stockDocs = products.map((p, idx) => ({
      productRef: p._id,
      locationRef: loc1._id,
      onHand: quantities[idx],
      freeToUse: quantities[idx],
    }));
    await StockQuantity.insertMany(stockDocs);

    // 6. Create Initial Documents
    await Document.create([
      {
        type: 'Receipt',
        reference: 'WH/IN/0001',
        status: 'Ready',
        contact: 'Shree Steel Ltd.',
        scheduleDate: new Date(day(-2)),
        responsible: user._id,
        warehouseRef: wh1._id,
        toLocation: loc1._id,
        lines: [{ product: products[0]._id, quantity: 500 }],
        operationType: '',
      },
      {
        type: 'Receipt',
        reference: 'WH/IN/0002',
        status: 'Draft',
        contact: 'BuildMart Supplies',
        scheduleDate: new Date(day(2)),
        responsible: user._id,
        warehouseRef: wh1._id,
        toLocation: loc1._id,
        lines: [{ product: products[2]._id, quantity: 100 }],
        operationType: '',
      },
      {
        type: 'Delivery',
        reference: 'WH/OUT/0001',
        status: 'Ready',
        contact: 'Azure Interior',
        scheduleDate: new Date(day(1)),
        responsible: user._id,
        warehouseRef: wh1._id,
        fromLocation: loc1._id,
        lines: [{ product: products[5]._id, quantity: 6 }],
        operationType: 'Customer Delivery',
      },
      {
        type: 'Delivery',
        reference: 'WH/OUT/0002',
        status: 'Waiting',
        contact: 'Metro Builders',
        scheduleDate: new Date(day(-1)),
        responsible: user._id,
        warehouseRef: wh1._id,
        fromLocation: loc1._id,
        lines: [{ product: products[2]._id, quantity: 50 }],
        operationType: 'Customer Delivery',
      },
      {
        type: 'Transfer',
        reference: 'WH/INT/0001',
        status: 'Draft',
        contact: 'Internal Operations',
        scheduleDate: new Date(day(3)),
        responsible: user._id,
        warehouseRef: wh1._id,
        fromLocation: loc1._id,
        toLocation: loc3._id,
        lines: [{ product: products[0]._id, quantity: 75 }],
      },
    ]);

    // 7. Initialize Sequence Counters
    await Counter.create([
      { key: 'WH/IN', sequence: 2 },
      { key: 'WH/OUT', sequence: 2 },
      { key: 'WH/INT', sequence: 1 },
      { key: 'WH/ADJ', sequence: 0 },
    ]);

    console.log('✅ MongoDB Atlas seeded successfully! Collections are now visible in Data Explorer.');
  } catch (error) {
    console.error('❌ Failed to seed MongoDB Atlas:', error.message);
  }
}
