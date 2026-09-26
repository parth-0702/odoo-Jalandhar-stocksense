import { OPS } from '../domain/flows.js';
export function createReferenceService(repo) {
  return {
    nextDocumentReference(warehouse, type) {
      return repo.nextReference(`${warehouse.shortCode}/${OPS[type]}`);
    },
  };
}
