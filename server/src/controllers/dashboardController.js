import { inventory } from '../services/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
export const dashboard = asyncHandler(async (req, res) => res.json(await inventory.dashboard(req.query)));
