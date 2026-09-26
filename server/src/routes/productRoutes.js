import { Router } from 'express';
import * as products from '../controllers/productController.js';
export const productRoutes = Router();
productRoutes.get('/', products.list);
productRoutes.post('/', products.create);
productRoutes.get('/:id', products.detail);
productRoutes.put('/:id', products.update);
productRoutes.post('/:id/stock', products.stock);
