import { inventory } from '../services/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
export const list = asyncHandler(async (req, res) => res.json(await inventory.settings('locations')));
export const create = asyncHandler(async (req, res) => res.status(201).json(await inventory.saveSetting('locations', req.body)));
export const update = asyncHandler(async (req, res) => res.json(await inventory.saveSetting('locations', req.body, req.params.id)));
