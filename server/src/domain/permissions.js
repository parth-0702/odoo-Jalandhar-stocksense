import { ensure } from '../utils/errors.js';
export const MANAGER = 'Inventory Manager';
export const STAFF = 'Warehouse Staff';
export const ROLES = [MANAGER, STAFF];
export function requireManager(user) {
  ensure(user?.role === MANAGER, 'This action is available to an Inventory Manager.', 403);
}
export function requireOperationPermission(user, type, action) {
  ensure(user && ROLES.includes(user.role), 'Your account does not have access to this action.', 403);
  if (user.role === MANAGER || ['Transfer', 'Adjustment'].includes(type)) return;
  ensure(type === 'Delivery' && ['pick', 'pack', 'check'].includes(action), 'Managers manage receipts and deliveries. Warehouse Staff can pick, pack, transfer, shelve, and count stock.', 403);
}
