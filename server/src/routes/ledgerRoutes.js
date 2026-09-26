import { Router } from 'express';
import * as ledger from '../controllers/ledgerController.js';
export const ledgerRoutes = Router();
ledgerRoutes.get('/', ledger.ledger);
