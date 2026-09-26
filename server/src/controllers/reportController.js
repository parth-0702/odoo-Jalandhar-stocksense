import { inventory } from '../services/index.js';
export const ledger = (req, res) => res.json(inventory.ledger());
export const dashboard = (req, res) => res.json(inventory.dashboard(req.query));
