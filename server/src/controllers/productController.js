import { inventory } from '../services/index.js';
import { ensure } from '../utils/errors.js';
export const list = (req, res) => res.json(inventory.products(req.query));
export const detail = (req, res) => { const product = inventory.products().find(p => p.id === req.params.id); ensure(product, 'Product not found.', 404); res.json(product); };
export const create = (req, res) => res.status(201).json(inventory.saveProduct(req.body, undefined, req.user));
export const update = (req, res) => res.json(inventory.saveProduct(req.body, req.params.id, req.user));
export const stock = (req, res) => res.json(inventory.manualStock(req.params.id, req.body, req.user));
