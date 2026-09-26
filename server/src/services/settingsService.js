import { ensure } from '../utils/errors.js';
import { findRecord } from '../utils/records.js';
export function createSettingsService(repo) {
  const find = (collection, id) => findRecord(repo, collection, id);
  return {
    settings(collection) { return repo.all(collection); },
    async saveSetting(collection, input, id) {
      ensure(['warehouses', 'locations'].includes(collection), 'Invalid setting.');
      ensure(input.name?.trim() && /^[A-Za-z0-9-]+$/.test(input.shortCode || ''), 'Name and an alphanumeric Short Code are required.');
      const data = { name: input.name.trim(), shortCode: input.shortCode.toUpperCase() };
      if (collection === 'warehouses') { ensure(input.address?.trim(), 'Address is required.'); data.address = input.address.trim(); }
      else { find('warehouses', input.warehouseRef); data.warehouseRef = input.warehouseRef; }
      ensure(!repo.all(collection).some(x => x.id !== id && x.shortCode === data.shortCode && (collection === 'warehouses' || x.warehouseRef === data.warehouseRef)), 'Short Code already exists.');
      if (id) {
        const previous = find(collection, id);
        if (collection === 'locations' && previous.warehouseRef !== data.warehouseRef) ensure(!repo.all('stock').some(s => s.locationRef === id) && !repo.all('documents').some(d => d.fromLocation === id || d.toLocation === id), 'An active location cannot be moved to another warehouse.');
        return repo.update(collection, id, data);
      }
      return repo.insert(collection, data);
    },
  };
}
