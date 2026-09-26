import { requireManager, requireOperationPermission } from '../domain/permissions.js';
export const managerOnly = (req, res, next) => { requireManager(req.user); next(); };
export const operationAccess = (type, action) => (req, res, next) => { requireOperationPermission(req.user, type, action || req.body.action); next(); };
