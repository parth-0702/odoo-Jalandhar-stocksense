# Verification results

Verified locally on September 26, 2026 using Node 24.19 and the Codex in-app browser.

## Automated

- `npm test`: **13 passed**, including 12 inventory/auth service tests and one HTTP integration test that exercises every route group.
- `npm run build`: Vite production build completed successfully.
- `git diff --check`: no whitespace errors.
- Installation audit: no known vulnerabilities reported for the installed root, server, or client dependency sets at installation time. Lockfiles are included.

## Browser checks performed

- Login renders correctly and the supplied demo credentials reach Dashboard.
- Dashboard data loads through the API; all five filters, operation counters, and stock health are visible.
- Receipts list has Reference, From, To, Contact, Schedule Date, Status and opens a working Kanban grouped by status.
- Opened seed receipt WH/IN/0002 in Draft: TODO visible; Print disabled; editable Product/Quantity and New Product controls present.
- TODO moved the receipt to Ready and exposed Validate. Validate moved it to Done, enabled Print, and posted +100 Cement Bag IN to Move History.
- Created a test delivery for 30 Office Chairs while 20 were available. The alert and insufficient-stock line appeared; TODO moved it to Waiting and exposed Check Availability. The test order was then canceled through the normal Cancel action.
- Product list showed the updated Cement Bag balance of 100.
- At a 390 × 844 viewport, the dashboard has two-column metrics, wrapping filters, and an operable navigation drawer. The page did not overflow horizontally. The temporary viewport override was reset after testing.
- Browser diagnostics reported no errors or warnings during the checked workflows.

These are smoke checks, not exhaustive browser automation. The browser Print dialog and every edit permutation were not exercised. Auth reset, transfer conservation, adjustment overwrite, reference uniqueness, and rollback are covered by automated tests. Production MongoDB concurrency and real email/auth are out of scope for the requested mock build.

Browser verification intentionally changed the running mock data: WH/IN/0002 is now Done and a canceled Browser QA Customer delivery exists. These disappear when the API restarts, along with all other in-memory changes. No user data was reset to clean up the verification.
