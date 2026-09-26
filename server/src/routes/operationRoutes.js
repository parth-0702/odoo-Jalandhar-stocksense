import { Router } from 'express';
import * as receipts from '../controllers/receiptController.js';
import * as deliveries from '../controllers/deliveryController.js';
import * as transfers from '../controllers/transferController.js';
import * as adjustments from '../controllers/adjustmentController.js';
export const operationRoutes = Router();
for (const [path, controller] of [['receipts', receipts], ['deliveries', deliveries], ['transfers', transfers], ['adjustments', adjustments]]) {
  operationRoutes.get(`/${path}`, controller.list);
  operationRoutes.post(`/${path}`, controller.create);
  operationRoutes.get(`/${path}/:id`, controller.detail);
  operationRoutes.put(`/${path}/:id`, controller.update);
  operationRoutes.post(`/${path}/:id/transition`, controller.transition);
}
