import { inventory } from '../services/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
export const list = asyncHandler(async (req, res) => res.json(await inventory.settings('warehouses')));
export const create = asyncHandler(async (req, res) => res.status(201).json(await inventory.saveSetting('warehouses', req.body)));
export const update = asyncHandler(async (req, res) => res.json(await inventory.saveSetting('warehouses', req.body, req.params.id)));
