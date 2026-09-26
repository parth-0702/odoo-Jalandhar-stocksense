import { Router } from 'express';
import * as dashboard from '../controllers/dashboardController.js';
export const dashboardRoutes = Router();
dashboardRoutes.get('/', dashboard.dashboard);
