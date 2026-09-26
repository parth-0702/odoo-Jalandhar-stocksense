export function createDashboardService(repo, listProducts) {
  return {
    async dashboard(filters = {}) {
      const products = (await listProducts(filters)).filter(p => !filters.category || p.category === filters.category);
      const docs = repo.all('documents').filter(d => (!filters.type || d.type === filters.type) && (!filters.status || d.status === filters.status) && (!filters.warehouse || d.warehouseRef === filters.warehouse) && (!filters.location || [d.fromLocation, d.toLocation].includes(filters.location)) && (!filters.category || d.lines.some(l => products.some(p => p.id === l.product))));
      const pending = docs.filter(d => !['Done', 'Canceled'].includes(d.status));
      const today = new Date().toLocaleDateString('en-CA');
      const module = type => { const list = pending.filter(d => d.type === type); return { pending: list.length, late: list.filter(d => d.scheduleDate < today).length, operations: list.filter(d => d.scheduleDate > today).length, waiting: list.filter(d => d.status === 'Waiting').length }; };
      return { totalProducts: products.length, inStock: products.filter(p => p.onHand > p.reorderThreshold).length, lowStock: products.filter(p => p.stockStatus === 'Low Stock').length, outOfStock: products.filter(p => !p.onHand).length, receipts: module('Receipt'), deliveries: module('Delivery'), transfers: module('Transfer'), recent: [...docs].reverse().slice(0, 5), inventoryValue: products.reduce((n, p) => n + p.onHand * p.perUnitCost, 0) };
    },
  };
}
