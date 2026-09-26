import { Router } from 'express';
import * as auth from '../controllers/authController.js';
import * as products from '../controllers/productController.js';
import * as reports from '../controllers/reportController.js';
import { documentController } from '../controllers/documentController.js';
import { settingsController } from '../controllers/settingsController.js';
import { authenticate } from '../middleware/authenticate.js';
import { TYPES } from '../services/inventoryService.js';
export const api = Router();
api.post('/auth/signup', auth.signup); api.post('/auth/login', auth.login);
api.post('/auth/forgot-password', auth.requestOtp); api.post('/auth/verify-otp', auth.verifyOtp); api.post('/auth/reset-password', auth.resetPassword);
api.use(authenticate);
api.get('/auth/me', auth.me); api.put('/auth/me', auth.profile); api.post('/auth/logout', auth.logout);
api.get('/products', products.list); api.post('/products', products.create); api.get('/products/:id', products.detail); api.put('/products/:id', products.update); api.post('/products/:id/stock', products.stock);
for (const [path, type] of Object.entries(TYPES)) {
  const controller = documentController(type);
  api.get(`/${path}`, controller.list); api.post(`/${path}`, controller.create); api.get(`/${path}/:id`, controller.detail); api.put(`/${path}/:id`, controller.update); api.post(`/${path}/:id/transition`, controller.transition);
}
for (const collection of ['warehouses', 'locations']) {
  const controller = settingsController(collection); api.get(`/${collection}`, controller.list); api.post(`/${collection}`, controller.create); api.put(`/${collection}/:id`, controller.update);
}
api.get('/ledger', reports.ledger); api.get('/dashboard', reports.dashboard);
