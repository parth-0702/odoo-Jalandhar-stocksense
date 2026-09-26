import { repository } from '../repositories/memoryRepository.js';
import { createAuthService } from './authService.js';
import { createInventoryService } from './inventoryService.js';
export let auth = createAuthService(repository);
export let inventory = createInventoryService(repository);
export function useRepository(repo) {
  auth = createAuthService(repo);
  inventory = createInventoryService(repo);
}
