import { ensure } from '../utils/errors.js';
import { numeric } from '../utils/numbers.js';
import { findRecord } from '../utils/records.js';
export function createProductService(repo, stock, manualStock) {
  return {
    products(filters = {}) {
      return repo.all('products').map(p => {
        const { stock: rows, onHand, freeToUse } = stock.totals(p.id, filters);
        return { ...p, onHand, freeToUse, stock: rows, stockStatus: onHand === 0 ? 'Out of Stock' : onHand <= p.reorderThreshold ? 'Low Stock' : 'In Stock' };
      });
    },
    async saveProduct(input, id, user) {
      const name = input.name?.trim(), sku = input.sku?.trim();
      ensure(name && sku && input.category?.trim() && input.unitOfMeasure?.trim(), 'Name, SKU, Category, and Unit of Measure are required.');
      ensure(!repo.all('products').some(p => p.id !== id && p.sku.toLowerCase() === sku.toLowerCase()), 'SKU already exists.');
      const data = { name, sku, category: input.category.trim(), unitOfMeasure: input.unitOfMeasure.trim(), perUnitCost: numeric(input.perUnitCost, 'Per Unit Cost'), reorderThreshold: numeric(input.reorderThreshold, 'Reordering Rule'), description: String(input.description || '') };
      return repo.transaction(async () => {
        if (id) { findRecord(repo, 'products', id); return repo.update('products', id, data); }
        const product = await repo.insert('products', data);
        const quantity = numeric(input.initialStock ?? 0, 'Initial Stock');
        if (quantity > 0) await manualStock(product.id, { locationRef: input.locationRef, quantity }, user);
        return product;
      });
    },
    async removeProduct(id) {
      findRecord(repo, 'products', id);
      return repo.transaction(async () => {
        repo.deleteWhere('products', p => p.id === id);
        repo.deleteWhere('stock', s => s.productRef === id);
        return { message: 'Product removed successfully.' };
      });
    },
  };
}
