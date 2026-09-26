import { inventory } from '../services/index.js';
export function documentController(type) {
  return {
    list: (req, res) => res.json(inventory.list(type)),
    detail: (req, res) => res.json(inventory.detail(type, req.params.id)),
    create: (req, res) => res.status(201).json(inventory.create(type, req.body, req.user)),
    update: (req, res) => res.json(inventory.update(type, req.params.id, req.body, req.user)),
    transition: (req, res) => res.json(inventory.transition(type, req.params.id, req.body.action)),
  };
}
