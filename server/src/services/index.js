import { repository } from '../repositories/memoryRepository.js';
import { createAuthService } from './authService.js';
import { createInventoryService } from './inventoryService.js';
export const auth = createAuthService(repository);
export const inventory = createInventoryService(repository);
