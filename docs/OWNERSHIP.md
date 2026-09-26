# Proposed teammate ownership

No teammate names were supplied. These are suggested assignments, not claims that people or agents have accepted them.

| Owner | Frontend pages | Backend controller pairing | Shared responsibility |
| --- | --- | --- | --- |
| Teammate A — Identity & shell | AuthPage, ProfilePage, Layout | authController | authService, User, Redux auth, routing |
| Teammate B — Catalog & settings | ProductsPage, ProductDetailPage, SettingsPage | productController, settingsController | Product, Warehouse, Location, StockQuantity |
| Teammate C — Operations | DocumentListPage, DocumentDetailPage (four module configurations) | documentController(Receipt/Delivery/Transfer/Adjustment) | inventoryService transitions, Document, Counter, line validation |
| Teammate D — Reporting & QA | DashboardPage, LedgerPage | reportController | Ledger, dashboard filters, tests, integration acceptance |

Changes to stock posting and its repository transaction boundary should be reviewed jointly by B and C; D owns regression checks. Keep the shared operation factory and `modules.js` consistent rather than copying four subtly different forms/controllers.
