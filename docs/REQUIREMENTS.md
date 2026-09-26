# Requirements coverage

Checked against the full text of StockSense.pdf, all non-deleted text elements in StockSense - 8 hours.excalidraw, and the supplied image. Text requirements take precedence over decorative example counts, placeholder contacts, or the image's alternative labels.

| Area | Implemented fields, controls, and rules | Files |
| --- | --- | --- |
| Login | Login ID, Password, Sign In, Forgot Password, Sign Up; exact invalid-credentials message | AuthPage; authService |
| Signup | Full Name, Login ID (unique, 6–12), Email (unique), Password (>8, lowercase/uppercase/special, unique), Re-Enter Password; creates user | AuthPage; authService; User |
| OTP reset | Email → six-digit OTP → verification → new/confirmed password; resend, expiry, single-use token, invalidation of old sessions | AuthPage; authService |
| Navigation | Dashboard; Products/Stock; Operations: Receipts, Delivery Orders, Internal Transfers, Stock Adjustments; Move History; Settings: Warehouses, Locations; avatar A: My Profile, Logout | Layout; App |
| Dashboard | Total products, Low Stock, Out of Stock, receipts to receive/late/operations, deliveries to deliver/late/waiting/operations, scheduled transfers, inventory value, recent operations, stock chart | DashboardPage; reportController |
| Dashboard filters | Document Type, Status, Warehouse, Location, Category; strict date comparison for Late/Operations | DashboardPage; inventoryService |
| Product list | Product, Per Unit Cost, On Hand, Free to Use; supplementary SKU, Category, stock Status, Update Stock action; product/SKU/category search, category/warehouse/location/status filters | ProductsPage; productController |
| Product detail | Product Name, SKU/Code, Category, Unit of Measure, Per Unit Cost, Initial Stock and Location, Reordering Rule, Description; per-location stock | ProductDetailPage; Product |
| Receipt list | New Receipt; Reference, From, To, Contact, Schedule Date, Status; reference/contact search; List/Kanban by status; warehouse/date filters | DocumentListPage(receipts) |
| Receipt detail | Auto Reference, Receive From, Schedule Date, auto Responsible, Warehouse, To location, status stepper, Product/Quantity lines, New Product, Notes | DocumentDetailPage(receipts) |
| Receipt buttons/flow | Draft: TODO; Ready: Validate; Done: Print enabled; Print disabled otherwise; Cancel pre-Done; Draft → Ready → Done; Canceled terminal | DocumentDetailPage; inventoryService |
| Delivery list | New Delivery Order; Reference, From, To, Contact, Schedule Date, Status; search; List/Kanban; warehouse/date filters | DocumentListPage(deliveries) |
| Delivery detail | Auto Reference, Delivery Address, Schedule Date, auto Responsible, Operation Type, Warehouse, From location, stepper, Product/Quantity, New Product, Notes | DocumentDetailPage(deliveries) |
| Delivery flow/alerts | Draft → Waiting → Ready → Done; TODO can go directly Ready if available; Waiting: Check Availability; Validate/Print/Cancel gates; insufficient row red plus alert | DocumentDetailPage; inventoryService |
| Internal transfer | From location, To location, Vendor, Product, Quantity, schedule, warehouse, reference, responsible; paired ledger movements | DocumentDetailPage(transfers); inventoryService |
| Adjustment | Product, Location, counted Quantity (overwrite), signed delta in ledger, same documented shared action pattern | DocumentDetailPage(adjustments); inventoryService |
| Move History | Reference, Contact, Schedule Date, Status, Product, From, To, Quantity, Date; IN green / OUT red; separate product rows; search and List/Kanban; type/location/date filters; New Movement | LedgerPage; reportController |
| Warehouse | Name, Short Code, Address; create/edit/list/search | SettingsPage(warehouses); settingsController; Warehouse |
| Location | Name, Short Code, parent Warehouse; multiple locations per warehouse; create/edit/list/search | SettingsPage(locations); settingsController; Location |
| Profile | A avatar, My Profile, full name/email edit, read-only Login ID/Role, Save Changes, Logout | ProfilePage; Layout; authController |
| Stock integrity | Location-aware checks; duplicate lines rejected; no negative resulting stock; rollback on failure; Done cannot replay; each stock-affecting action writes ledger | inventoryService; memoryRepository |
| Reference | Auto-generated `<Warehouse>/<Operation>/<ID>` with separate sequences; IN/OUT/INT/ADJ; canceled reference never reused in current repository lifetime | inventoryService; memoryRepository; Counter |

Mongoose schema files: `User.js`, `Product.js`, `Warehouse.js`, `Location.js`, `StockQuantity.js`, `Document.js`, `Ledger.js`, plus `Counter.js` for durable reference sequences. Schema files are under `server/src/models/`.

All requested inventory fields, statuses, and actions are represented. Intentional interpretation decisions and prototype limitations are listed in the README; this checklist is not a claim of production readiness or a pixel-identical reproduction of the low-resolution collage.
