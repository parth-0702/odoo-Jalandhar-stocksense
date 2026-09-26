export const TYPES = { receipts: 'Receipt', deliveries: 'Delivery', transfers: 'Transfer', adjustments: 'Adjustment' };
export const FLOWS = { Receipt: ['Draft', 'Ready', 'Done'], Delivery: ['Draft', 'Waiting', 'Ready', 'Done'], Transfer: ['Draft', 'Ready', 'Done'], Adjustment: ['Draft', 'Ready', 'Done'] };
export const OPS = { Receipt: 'IN', Delivery: 'OUT', Transfer: 'INT', Adjustment: 'ADJ' };
