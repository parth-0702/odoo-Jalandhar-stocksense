import { createStockService } from './stockService.js';
import { createReferenceService } from './referenceService.js';
import { createStockMutationService } from './stockMutationService.js';
import { createSettingsService } from './settingsService.js';
import { createProductService } from './productService.js';
import { createLedgerService } from './ledgerService.js';
import { createDashboardService } from './dashboardService.js';
import { createOperationService } from './operationService.js';
export { TYPES, FLOWS, OPS } from '../domain/flows.js';

export function createInventoryService(repo) {
  const stock = createStockService(repo);
  const reference = createReferenceService(repo);
  const mutations = createStockMutationService(repo, stock);
  const settings = createSettingsService(repo);
  const operations = createOperationService(repo, { stock, reference, mutations });
  const products = createProductService(repo, stock, operations.manualStock);
  const ledger = createLedgerService(repo);
  const dashboard = createDashboardService(repo, products.products);
  return { ...settings, ...products, ...operations, ...ledger, ...dashboard };
}
