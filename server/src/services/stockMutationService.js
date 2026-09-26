import { ensure } from '../utils/errors.js';
export function createStockMutationService(repo, stock) {
  return {
    async writeStock(product, location, change, doc) {
      let row = stock.stockAt(product, location);
      if (!row) row = await repo.insert('stock', { productRef: product, locationRef: location, onHand: 0, freeToUse: 0 });
      ensure(row.onHand + change >= 0 && row.freeToUse + change >= 0, 'Insufficient stock. Refresh availability and try again.');
      row.onHand += change; row.freeToUse += change;
      if (change !== 0) await repo.insert('ledger', { timestamp: new Date().toISOString(), type: doc.type, product, quantityChange: change, fromLocation: doc.fromLocation || '', toLocation: doc.toLocation || '', relatedDocument: doc.id, direction: change > 0 ? 'IN' : 'OUT' });
    },
  };
}
