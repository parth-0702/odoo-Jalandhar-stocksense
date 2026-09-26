import { inventory } from '../services/index.js';
import { ensure } from '../utils/errors.js';
import { asyncHandler } from '../utils/asyncHandler.js';
export const list = asyncHandler(async (req, res) => res.json(await inventory.products(req.query)));
export const detail = asyncHandler(async (req, res) => { const product = (await inventory.products()).find(p => p.id === req.params.id); ensure(product, 'Product not found.', 404); res.json(product); });
export const create = asyncHandler(async (req, res) => res.status(201).json(await inventory.saveProduct(req.body, undefined, req.user)));
export const update = asyncHandler(async (req, res) => res.json(await inventory.saveProduct(req.body, req.params.id, req.user)));
export const stock = asyncHandler(async (req, res) => res.json(await inventory.manualStock(req.params.id, req.body, req.user)));
