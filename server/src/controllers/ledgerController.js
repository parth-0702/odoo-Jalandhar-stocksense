import { inventory } from '../services/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
export const ledger = asyncHandler(async (req, res) => res.json(await inventory.ledger()));
