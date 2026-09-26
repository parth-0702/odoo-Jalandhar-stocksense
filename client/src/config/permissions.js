export const isManager = user => user?.role === 'Inventory Manager';
export const canManageOperation = (user, module) => isManager(user) || ['transfers', 'adjustments'].includes(module);
