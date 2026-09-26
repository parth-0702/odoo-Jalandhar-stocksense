import { inventory } from '../services/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
export const list = asyncHandler(async (req, res) => res.json(await inventory.list('Adjustment')));
export const detail = asyncHandler(async (req, res) => res.json(await inventory.detail('Adjustment', req.params.id)));
export const create = asyncHandler(async (req, res) => res.status(201).json(await inventory.create('Adjustment', req.body, req.user)));
export const update = asyncHandler(async (req, res) => res.json(await inventory.update('Adjustment', req.params.id, req.body, req.user)));
export const transition = asyncHandler(async (req, res) => res.json(await inventory.transition('Adjustment', req.params.id, req.body.action)));
