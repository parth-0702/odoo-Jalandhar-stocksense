export function createStockService(repo) {
  function stockAt(product, location) {
    return repo.all('stock').find(s => s.productRef === product && s.locationRef === location);
  }
  function totals(productId, filters = {}) {
    const stock = repo.all('stock').filter(s => s.productRef === productId && (!filters.location || s.locationRef === filters.location) && (!filters.warehouse || repo.get('locations', s.locationRef)?.warehouseRef === filters.warehouse));
    return { stock, onHand: stock.reduce((n, s) => n + s.onHand, 0), freeToUse: stock.reduce((n, s) => n + s.freeToUse, 0) };
  }
  return { stockAt, totals };
}
