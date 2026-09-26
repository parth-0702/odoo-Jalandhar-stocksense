# StockSense

A modular inventory workspace built with React, Vite, React Router, Redux Toolkit, Axios, Tailwind CSS, Express, and Mongoose schemas. The supplied Excalidraw defines fields and business flows; the supplied PNG guides the visual design. This is a working **mock-backed application**, with no JWT, real password hashing, email delivery, or MongoDB persistence enabled.

## Run locally

Use Node.js 22.15+ (Node 24 recommended).

```sh
npm install
npm run setup
npm run dev
```

Open http://localhost:5173. Demo login: **admin01** / **StockSense@123**.

Both applications run independently:

```sh
# Terminal 1
cd server
npm install
npm run dev

# Terminal 2
cd client
npm install
npm run dev
```

The API uses port 4000. Vite proxies `/api` to it. Copy `.env.example` to `.env` in either package for configuration; neither is required for the demo. For a separately hosted client, set `VITE_API_BASE_URL` and the API's `CLIENT_ORIGIN`.

```sh
npm test       # Service and real HTTP integration tests
npm run build # Production frontend bundle in client/dist
```

The server runs entirely in memory. Changes survive page navigation and reloads, but **reset when the API process restarts**. Development watch mode also restarts the API after a server source edit. Session tokens live in browser sessionStorage, so each browser tab has its own sign-in session. The OTP screen displays a generated demo code instead of sending email.

## Architecture and mock-data boundary

- `server/src/data/seed.js`: all initial users, products, warehouses, locations, stock, documents, and sequence counters. Dates are relative to the current day. Opening stock is fixture data; ledger entries begin with new validated actions.
- `server/src/repositories/memoryRepository.js`: data access, unique IDs, reference counters, synchronous transactions with rollback. Synchronous mock transactions prevent interleaving in a single Node process.
- `server/src/services/inventoryService.js`: authoritative document transitions, location-based availability, stock mutations, ledger entries, and dashboard aggregation.
- `server/src/services/authService.js`: exact mock validation, unique login/email/password rules, OTP lifecycle, and session lifecycle. Passwords are deliberately stored as `mock:<password>` per the prototype requirement.
- `server/src/controllers`: HTTP adapters, with a shared controller factory for the four operation modules and another for Warehouse/Location management.
- `server/src/models`: Mongoose schema definitions ready for the persistence implementation; **these schemas do not currently persist API data**.
- `client/src/api/client.js`: Axios base URL and session header. No screens use standalone mock datasets.
- `client/src/store/index.js`: Redux auth and shared product/location/warehouse catalog. API hooks handle page queries.
- `client/src/config/modules.js`: per-module labels and distinct status lists.

To switch to MongoDB, implement the repository interface using the included models, adapt service calls to await database operations, and wrap document validation, stock changes, and ledger inserts in a Mongo session transaction. Use conditional stock updates and an atomic `Counter.findOneAndUpdate` so multi-process workers cannot oversell or reuse references. Map ObjectIds to the existing `id` JSON contract. The current in-memory repository is synchronous; replacing it with Mongo requires an async server-side migration, not just setting `MONGODB_URI`. Frontend routes, components, and payloads stay unchanged.

To switch authentication, replace `authService` and the `authenticate` middleware behind the same endpoints with hashing, durable sessions or JWT verification, email delivery, rate limits, and OTP attempt limits. Production requirements should revisit the wireframe's cross-user password uniqueness rule: the prototype follows it literally; a real password system should not compare plaintext passwords across users. No real authentication hardening is claimed here.

## API contract

Responses return a record, array, or report directly. Failures return `{ "message": "..." }` with an appropriate HTTP status. Protected endpoints accept `Authorization: Bearer <mock-session-token>`.

| Endpoint | Methods / behavior |
| --- | --- |
| `/api/auth/signup`, `/login` | POST sign up / sign in |
| `/api/auth/forgot-password`, `/verify-otp`, `/reset-password` | POST three-step OTP reset |
| `/api/auth/me`, `/logout` | GET/PUT profile; POST logout |
| `/api/products`, `/api/products/:id` | GET/POST list/create; GET/PUT detail/update |
| `/api/products/:id/stock` | POST `{ locationRef, quantity }`; creates and validates a ledger-backed adjustment |
| `/api/warehouses`, `/api/locations` | GET/POST; PUT `/:id` |
| `/api/receipts`, `/api/deliveries`, `/api/transfers`, `/api/adjustments` | GET/POST; GET/PUT `/:id`; POST `/:id/transition` with `{ action }` |
| `/api/ledger` | GET one row per product movement and direction |
| `/api/dashboard` | GET filters: `type`, `status`, `warehouse`, `location`, `category` |

Transition actions: `todo`, `check` (Waiting deliveries only), `validate`, `cancel`. Status cannot be assigned through create/update payloads. Only Draft documents can be edited; assigned warehouse/reference and responsible user remain fixed. Done and Canceled are terminal.

## Source reconciliation

The PDF, Excalidraw, and image overlap but differ in detail. The implementation uses these explicit decisions:

- Login uses **Login ID**, rather than the image's email login. Signup includes password confirmation and password uniqueness from the Excalidraw.
- References use `<Warehouse shortCode>/<Operation>/<4-digit minimum sequence>`, e.g. `WH/IN/0003`. The wireframe has both 3- and 4-digit examples; the explicit request selects four digits. Transfers use `INT`, adjustments `ADJ`.
- Receipt flow: Draft → Ready → Done. Delivery flow: Draft → Waiting → Ready → Done, with Draft → Ready when stock is available. The latter reconciles the wireframe's TODO → Ready note with Waiting's explicit purpose (out-of-stock products). Check Availability moves a Waiting delivery to Ready once stock exists.
- Receipt and delivery tables include Reference, **From, To**, Contact, Schedule Date, Status. From/To come from the Excalidraw's added columns.
- Move History includes all requested common fields plus Product, From, To, Quantity, Date. Only completed stock-affecting operations produce ledger rows; its Kanban groups by status, including empty pre-Done columns for a consistent view.
- Transfers and adjustments use Draft → Ready → Done as a documented convention; their sources do not specify a separate flow.
- Dashboard Late/Operations compare the schedule's calendar date against today in the API's local timezone. Today is neither Late nor a future Operation. Counts exclude Done/Canceled documents. Waiting counts only stock-blocked deliveries.
- Free to Use changes alongside On Hand for this prototype. There is no allocation/reservation workflow specified, so Ready orders do not reserve stock; Validate always rechecks current availability.
- Quantity on an adjustment is the final physical count, including zero. The ledger records only the signed change. A transfer records paired OUT/IN entries; global stock is unchanged.
- A stray manufacturing-order annotation in the receipt wireframe has no corresponding module or fields in the inventory request. It is treated as a wireframe annotation, not an added manufacturing subsystem.

See [docs/REQUIREMENTS.md](docs/REQUIREMENTS.md) for the field/action coverage checklist and [docs/OWNERSHIP.md](docs/OWNERSHIP.md) for proposed teammate modules. [docs/FOLDER_TREE.md](docs/FOLDER_TREE.md) contains the complete authored folder tree.

## Verification

- Service tests cover status guards, one-time validation, insufficient stock, transaction rollback, conservation across transfers, signed adjustment deltas, unique references, document/location validation, dashboard filters, auth rules, and OTP consumption.
- HTTP integration tests exercise every route group, sign-in protection, create → TODO → Validate, product balance, ledger output, and logout invalidation.
- Browser checks cover login, dashboard, list/Kanban receipts, TODO → Validate, Print gating, ledger updates, and responsive rendering. Detailed results are in `docs/VERIFICATION.md`.
