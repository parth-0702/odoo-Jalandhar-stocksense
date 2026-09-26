import { inventory } from '../services/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
export const list = asyncHandler(async (req, res) => res.json(await inventory.list('Transfer')));
export const detail = asyncHandler(async (req, res) => res.json(await inventory.detail('Transfer', req.params.id)));
export const create = asyncHandler(async (req, res) => res.status(201).json(await inventory.create('Transfer', req.body, req.user)));
export const update = asyncHandler(async (req, res) => res.json(await inventory.update('Transfer', req.params.id, req.body, req.user)));
export const transition = asyncHandler(async (req, res) => res.json(await inventory.transition('Transfer', req.params.id, req.body.action)));
