import { inventory } from '../services/index.js';
export function settingsController(collection) {
  return { list: (req, res) => res.json(inventory.settings(collection)), create: (req, res) => res.status(201).json(inventory.saveSetting(collection, req.body)), update: (req, res) => res.json(inventory.saveSetting(collection, req.body, req.params.id)) };
}
