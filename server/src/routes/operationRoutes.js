import { Router } from 'express';
import * as receipts from '../controllers/receiptController.js';
import * as deliveries from '../controllers/deliveryController.js';
import * as transfers from '../controllers/transferController.js';
import * as adjustments from '../controllers/adjustmentController.js';
import { operationAccess } from '../middleware/authorize.js';
import { TYPES } from '../domain/flows.js';
export const operationRoutes = Router();
for (const [path, controller] of [['receipts', receipts], ['deliveries', deliveries], ['transfers', transfers], ['adjustments', adjustments]]) {
  operationRoutes.get(`/${path}`, controller.list);
  operationRoutes.post(`/${path}`, operationAccess(TYPES[path], 'create'), controller.create);
  operationRoutes.get(`/${path}/:id`, controller.detail);
  operationRoutes.put(`/${path}/:id`, operationAccess(TYPES[path], 'edit'), controller.update);
  operationRoutes.post(`/${path}/:id/transition`, operationAccess(TYPES[path]), controller.transition);
}
