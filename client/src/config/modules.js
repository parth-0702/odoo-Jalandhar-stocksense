export const modules = {
  receipts: { type: 'Receipt', title: 'Receipts', singular: 'Receipt', description: 'Manage incoming stock from your vendors.', contact: 'Receive From', statuses: ['Draft', 'Ready', 'Done', 'Canceled'] },
  deliveries: { type: 'Delivery', title: 'Delivery Orders', singular: 'Delivery Order', description: 'Keep customer shipments moving, from pick to delivery.', contact: 'Delivery Address', statuses: ['Draft', 'Waiting', 'Ready', 'Done', 'Canceled'] },
  transfers: { type: 'Transfer', title: 'Internal Transfers', singular: 'Transfer', description: 'Move stock between warehouses, rooms, and racks.', contact: 'Vendor', statuses: ['Draft', 'Ready', 'Done', 'Canceled'] },
  adjustments: { type: 'Adjustment', title: 'Stock Adjustments', singular: 'Adjustment', description: 'Bring your recorded stock in line with the physical count.', contact: 'Contact', statuses: ['Draft', 'Ready', 'Done', 'Canceled'] },
};
