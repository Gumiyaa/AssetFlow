# AssetFlow Frontend QA Report

- **Project:** AssetFlow — Asset & Inventory Management (frontend demo)
- **Working directory:** `D:\Program\Laragon\www\AssetFlow`
- **QA date:** 5 November 2026
- **Application version:** `3.4.1` (`package.json`)
- **Environment:** Windows, Node.js `v26.5.0`, Vite `8.3.5`, Microsoft Edge `156.0.4314.58`
- **Test target:** dev server `http://localhost:5173` + production preview `http://localhost:4173`
- **Test tooling:** Playwright via `playwright-core` (installed Edge, headless), Node scripts
- **Login account:** `andi.pratama@assetflow.id` / `assetflow123`
- **Architecture preserved:** React + Vite + Tailwind, mock data / `localStorage` only. No backend, Laravel, MySQL, or redesign was introduced.

---

## A. Executive Summary

**Overall result: PASS (with documented non-blocking gaps).**

All frontend routes, primary workflows, forms, business rules, responsive layouts, console/network behavior, security basics, and the production build were exercised against the running application. No failed check remains in the final test runs.

| Metric | Result |
|---|---|
| Route patterns exercised | 20 of 20 |
| Automated checks in final runs | **285 / 285 passed** |
| Console/page errors on tested routes | **0** |
| Failed network requests | **0** |
| Production build | **PASS** |
| Production preview smoke | **21 / 21 passed** |
| Real product defects found and fixed | **8** |
| Critical open defects | **0** |

Key fixes applied during QA:

1. Duplicate inventory SKU was accepted by the data layer.
2. User IDs could collide after deleting a non-last user (`USR-008` duplicate / React key warning).
3. Employee IDs could collide after deleting a non-last employee.
4. Borrowing requests could target unavailable or already-borrowed assets.
5. Assets with active borrowings/maintenance could be deleted, leaving orphaned records.
6. Seeded borrowings/maintenance referenced public asset codes while UI relations resolved by internal IDs, causing “Aset tidak ditemukan” and empty relation tabs.
7. Settings “Data Master” was read-only/static despite being part of the required scope.
8. Asset list had no location filter.

Two requirement items remain outside the implemented feature set and are documented honestly in Section L: report date-range/department filters, and pixel-level comparison against the large composite design reference. Neither is a regression introduced by QA.

---

## B. Scope and Methodology

### B.1 Scope tested

- All route definitions in `src/App.jsx`, including auth routes, redirect root, detail/edit routes, and catch-all 404.
- Authentication, session persistence, logout, protected-route redirect, invalid login, forgot-password states.
- Dashboard, global search, notifications, profile menu, sidebar and mobile drawer.
- Asset CRUD, asset filters/search/pagination, asset detail/edit, location filter, delete guards.
- Inventory CRUD, duplicate SKU validation, stock mutations, transactions, stock status, delete.
- Borrowing request → approval → handover → return lifecycle, return-condition form, asset availability restrictions.
- Maintenance ticket creation, progress update, checklist toggle, relation rendering.
- Employee and user CRUD, duplicate email guards, ID generation after deletions, status toggles.
- Reports preview, CSV downloads, print action.
- Settings: company profile, preferences, notifications, security, data-master CRUD, validation, persistence, backup, demo reset.
- Responsive behavior at 1440×900, 1280×800, 768×1024, and 375×812.
- Console errors, page errors, failed network requests, horizontal overflow, basic security hygiene, production build and preview.

### B.2 Method

- Every feature was interacted with through the real UI using Playwright; no feature was assumed to work from source inspection.
- Assertions checked both UI state and `localStorage` data to catch silent data-integrity failures.
- Regression scripts were created for every bug fixed, then re-run against a fresh browser context.
- Tests ran against the dev server first; the final production bundle was served through `vite preview` and re-tested.
- Out-of-tree test scripts are stored at `C:\Users\lovan\AppData\Local\Temp\assetflow-test\` (no production dependency or test framework added to the project).

### B.3 Status legend

`PASS` works as expected · `FIXED` defect found, corrected, retested · `FAIL` uncovered defect · `BLOCKED` cannot be completed in current scope · `NOT TESTED` deliberately not executed

---

## C. Environment and Test Assets

| Item | Value |
|---|---|
| OS | Windows (win32) |
| Browser | Microsoft Edge 156.0.4314.58 (headless) |
| Node | v26.5.0 |
| Dev server | Vite 8.3.5, `http://localhost:5173` |
| Production preview | `http://localhost:4173` |
| Storage keys | `assetflow:db:v1`, `assetflow:master:v1`, `assetflow:session:v1`, `assetflow:settings:v1`, `assetflow:preferences:v1` |
| Design reference | `Asset.png` — 20150×3250 composite design board |
| Test directory | `C:\Users\lovan\AppData\Local\Temp\assetflow-test\` |

No project dependency was reinstalled or replaced. Existing source architecture was preserved.

---

## D. Route-by-Route Results

All routes were loaded directly (deep link), not only through in-app navigation.

| # | Route | Page / behavior | Status |
|---|---|---|---|
| 1 | `/login` | Login form, invalid credentials, success, redirect back to requested route | PASS |
| 2 | `/forgot-password` | Email validation, success confirmation state | PASS |
| 3 | `/` | Redirects to `/dashboard` | PASS |
| 4 | `/dashboard` | KPI cards, charts, recent activity, pending queues | PASS |
| 5 | `/assets` | List, stats, search, filters, location filter, pagination, delete guard | PASS |
| 6 | `/assets/create` | Create form, validation, auto asset code, success | PASS |
| 7 | `/assets/:id` | Detail, identity, finance, relationships, barcode/label actions | PASS |
| 8 | `/assets/:id/edit` | Pre-filled edit form, save, detail refresh | PASS |
| 9 | `/inventory` | Stock catalog, filters, create/edit/delete, stock movement | PASS |
| 10 | `/inventory/transactions` | Transaction list, filters, detail, CSV export | PASS |
| 11 | `/borrowings` | List, filters, request form, approval queue | PASS |
| 12 | `/borrowings/:id` | Detail, approval, handover, return, relation resolution | PASS |
| 13 | `/maintenance` | Ticket list, filters, create | PASS |
| 14 | `/maintenance/:id` | Detail, progress, checklist, asset relation | PASS |
| 15 | `/employees` | Directory, filters, CRUD, duplicate email, distribution stats | PASS |
| 16 | `/employees/:id` | Employee profile and assigned assets | PASS |
| 17 | `/reports` | Report library, preview, CSV, print | PASS |
| 18 | `/users` | User management, CRUD, role/status, duplicate email | PASS |
| 19 | `/settings` | All five tabs incl. Data Master CRUD, persistence, reset | PASS |
| 20 | `*` (unknown URL) | Branded 404 page, no crash | PASS |

Route sweep evidence: every route returned a matching `h1`, the correct document title, and zero console errors. `/tidak-ada` correctly rendered the not-found page; it was the only route expected to report “tidak tersedia”.

---

## E. Functional Test Results by Suite

| Suite | Checks | Result | Coverage summary |
|---|---:|---|---|
| `functional-ui-auth.mjs` | 38 / 38 | PASS | Login/logout, protected route, global search (Ctrl+K, Enter), notifications, profile, asset filters/pagination, mobile drawer/search, 375px overflow |
| `functional-assets-inventory.mjs` | 22 / 22 | PASS | Asset create/read/search/edit/delete, validation, inventory create/edit/delete, insufficient stock, mutation, transaction detail |
| `functional-borrowings-maintenance.mjs` | 21 / 21 | PASS | Full borrowing lifecycle, maintenance create/progress/checklist, validation, detail pages |
| `functional-employees-users-reports-settings.mjs` | 36 / 36 | PASS | Employee/user CRUD + guards, report preview/download/print, settings save/discard/validation/backup/reset |
| `functional-charts-responsive.mjs` | 16 / 16 | PASS | Dashboard/report charts render, print invoked, 1280px and 768px overflow |
| `regression.mjs` | 38 / 38 | PASS | Every fixed defect and new feature: SKU, IDs, email guards, borrowing availability, delete guards, relations, location filter, master data CRUD/persistence/propagation |
| `responsive.mjs` | 68 / 68 | PASS | 17 authenticated routes × 4 viewports; no document/main horizontal overflow |
| `smoke2.mjs` route sweep | 17 / 17 | PASS | All authenticated routes + 404: title, heading, no error, no overflow |
| `prod-smoke.mjs` | 21 / 21 | PASS | Production login, 16 routes, relations, master-data write, clean console |
| `security-audit.mjs` | 7 / 7 | PASS | Auth guard, redirect-back, storage namespace, no secrets, XSS escaping, no 4xx/5xx, no failed requests |
| `encoding-check.mjs` | 1 / 1 | PASS | No Unicode replacement glyphs rendered |
| **Total** | **285 / 285** | **PASS** | |

Earlier iterations exposed failures that were fixed and then re-run to green. Those failures were not suppressed or skipped.

---

## F. Forms and Validation

| Form | Validation tested | Result |
|---|---|---|
| Login | Empty/invalid credentials show “Email atau kata sandi tidak sesuai…” | PASS |
| Forgot password | Invalid email blocked; valid email reaches success state | PASS |
| Asset create/edit | Required fields, numeric price/warranty, duplicate serial guard, auto code generation | PASS |
| Inventory item | Required fields, duplicate SKU inline error, unique SKU accepted, stock/min stock numeric | PASS |
| Stock mutation | Quantity validation; outgoing quantity cannot exceed stock | PASS |
| Borrowing request | Employee/asset/date/purpose required; only available assets listed; unavailable asset rejected at service layer | PASS |
| Return form | Condition required; return recorded and asset restored | PASS |
| Maintenance ticket | Asset, type, priority, description, estimate validation; progress and checklist updates | PASS |
| Employee | Required fields, email format, duplicate email (client + service), ID collision prevention | PASS |
| User | Required fields, email format, duplicate email, role/status, ID collision prevention | PASS |
| Settings company | Required name, valid email, save/discard, persistence after reload | PASS |
| Data Master | Required name, duplicate name/code, in-use rename/delete guard, last-item delete guard | PASS |

Representative messages verified: `Kode SKU sudah digunakan oleh barang lain.`, `Email sudah digunakan karyawan lain.`, `Email sudah terdaftar pada pengguna lain.`, `Aset masih terkait peminjaman aktif…`, `Nama sudah digunakan`, `Tidak dapat menghapus… masih digunakan`.

---

## G. Business Logic and Data Integrity

| Area | Expected rule | Result |
|---|---|---|
| Borrowing lifecycle | Request → approval → handover → return, status and timestamps update | FIXED / PASS |
| Asset availability | Only `Tersedia`/`Aktif` assets without active borrowing can be requested | FIXED / PASS |
| Duplicate active borrowing | Service rejects a second active borrowing for the same asset | FIXED / PASS |
| Asset deletion | Blocked if active borrowing or non-complete maintenance exists; records remain intact | FIXED / PASS |
| Relation integrity | Borrowing/maintenance → asset lookups resolve in lists, details, dashboard, and asset relation tabs | FIXED / PASS |
| Seed/legacy data | Asset-code references normalized to internal asset IDs on read and seed | FIXED / PASS |
| Inventory SKU | Case-insensitive uniqueness enforced in UI and service | FIXED / PASS |
| User/employee IDs | Collision-safe ID generation after deletion (max numeric suffix + 1) | FIXED / PASS |
| Master data | Add/edit/delete categories, departments, locations, units; persisted and propagated to forms/filters | FIXED / PASS |
| Master data safety | Items in use cannot be deleted or renamed; duplicates blocked; last item protected | PASS |
| Stock status | `Habis` at 0, `Menipis` below minimum, `Aman` otherwise | PASS |
| Settings persistence | Saved values survive reload; discard restores saved state; reset restores demo seed | PASS |
| CSV/print | Report and table exports generate downloadable CSV; print action invoked | PASS |

---

## H. Responsive and Visual Checks

### H.1 Responsive results

| Viewport | Routes checked | Horizontal overflow | Result |
|---|---:|---|---|
| 1440×900 | 17 | None | PASS |
| 1280×800 | 17 | None | PASS |
| 768×1024 | 17 | None | PASS |
| 375×812 | 17 | None | PASS |

- Wide tables scroll inside their own wrapper instead of forcing page-level overflow.
- Mobile drawer opens/closes, nav links navigate, and mobile search returns grouped results.
- Charts render on dashboard and reports at desktop/tablet widths.
- Settings tabs and the new Data Master tab remain usable at 375px without page overflow.

### H.2 Visual/design fidelity

- No redesign was performed. Existing Google Stitch design system, typography, color tokens, navigation, cards, badges, and spacing were left intact.
- Structural checks confirmed the expected page hierarchy, headings, cards, tables, and chart surfaces on every route.
- **Pixel-level comparison against `Asset.png`: NOT TESTED.** The reference is a 20150×3250 composite design board; the available tooling/model could not perform a meaningful automated pixel diff or visual inspection. This is a tooling gap, not a detected visual defect.

---

## I. Console, Network, and Performance

| Check | Result |
|---|---|
| Console errors across route sweep | 0 |
| Page/uncaught errors across functional suites | 0 |
| Failed network requests | 0 |
| HTTP 4xx/5xx for application assets | 0 |
| React duplicate-key warning after ID fixes | Not reproduced |
| Dashboard/report chart containers | Render correctly (3 surfaces each) |
| Encoding / mojibake | No replacement glyphs in rendered UI |

One transient `ERR_INSUFFICIENT_RESOURCES` occurred only when four headless browsers were run in parallel and was reproduced as an environment resource limit; sequential re-runs of the same suites passed with zero console/network errors.

### Build performance

- Modules transformed: `2499`
- Build time: `877 ms`
- JS bundle: `1,184.74 kB` (gzip `327.07 kB`)
- CSS bundle: `92.35 kB` (gzip `14.56 kB`)
- Vite reports only the standard “chunk larger than 500 kB” warning. This is non-blocking but noted in Section L.

---

## J. Security Review (Frontend Demo Scope)

| Check | Result |
|---|---|
| Anonymous access to protected route redirects to `/login` | PASS |
| Successful login returns to originally requested route (`/settings`) | PASS |
| Logout clears session and returns to login | PASS |
| Only namespaced `assetflow:*` keys are persisted | PASS |
| No bearer tokens, API keys, or plaintext passwords stored | PASS |
| User-supplied markup is escaped by React (XSS probe did not execute) | PASS |
| No failed/4xx/5xx network responses during route sweep | PASS |

Scope note: this is a client-side demo with fixed demo credentials and browser-local data. It is not a production authentication boundary and was not assessed for server-side authorization, CSRF, or multi-tenant isolation.

---

## K. Build and Production Verification

### Build

```text
npm run build
✓ 2499 modules transformed
✓ built in 877ms
dist/index.html                     0.58 kB
dist/assets/index-RSqid1yE.css    92.35 kB │ gzip: 14.56 kB
dist/assets/index-JRzC5Maz.js  1,184.74 kB │ gzip: 327.07 kB
```

Result: **PASS** (single chunk-size warning only).

### Production preview

`npx vite preview --port 4173` served the built bundle and was tested independently:

- Production login: PASS
- 16 deep-linked routes (dashboard, assets, create/edit/detail, inventory, transactions, borrowings/detail, maintenance/detail, employees/profile, reports, users, settings, 404): PASS
- Borrowing and maintenance asset relations resolve: PASS
- Data Master write persists in production build: PASS
- Console errors: 0
- Result: **21 / 21 passed**

Dev server startup and HTTP response were also verified (`HTTP 200`).

---

## L. Defects, Remaining Issues, and Recommendations

### L.1 Defects found and fixed

| ID | Severity | Defect | Fix | Retest |
|---|---|---|---|---|
| BUG-01 | High | Duplicate inventory SKU could be saved, corrupting stock identity | Case-insensitive SKU uniqueness in `ItemFormModal` and `inventoryService` (create/update) | FIXED |
| BUG-02 | High | User ID collision after deleting a non-last user (`USR-008` duplicate; React key warning) | Generate next numeric ID from the highest existing suffix in `userService` | FIXED |
| BUG-03 | High | Employee ID collision after deleting a non-last employee | Same collision-safe sequence logic in `employeeService` | FIXED |
| BUG-04 | High | Borrowing form listed assets that were unavailable or already actively borrowed | UI filters by status and active borrowing; service rejects unavailable/duplicate active borrowing | FIXED |
| BUG-05 | High | Asset with active borrowing/maintenance could be deleted, orphaning related records | `assetService.remove` guards active borrowings and incomplete maintenance; accepts id or code | FIXED |
| BUG-06 | Critical | Seeded borrowings/maintenance stored asset codes while UI resolved internal IDs → “Aset tidak ditemukan”, 0 relation counts | `normalizeAssetReferences` in `db.js` normalizes seed and legacy stored references; guards accept id/code | FIXED |
| BUG-07 | Medium | Settings “Data Master” had no editing capability | Added tab with CRUD for categories, departments, locations, units; persistence, validation, in-use guards, delete confirmation | FIXED |
| BUG-08 | Medium | Asset list lacked location filter | Added location select driven by master data, reset support, active-filter count | FIXED |

### L.2 Remaining issues and gaps

| Item | Status | Detail / recommendation |
|---|---|---|
| Report date-range and department filters | **BLOCKED / NOT IMPLEMENTED** | The current report library has report selection, preview, CSV, and print, but no date-range or department filter controls. Implementing them would require a feature addition beyond the approved UI; documented rather than invented. |
| Pixel-level design comparison to `Asset.png` | **NOT TESTED** | Reference is a 20150×3250 composite board; automated pixel diff/visual inspection was not feasible with the available tooling. Layout, tokens, and responsiveness were verified structurally; no redesign was made. |
| JS bundle >500 kB | **PASS (non-blocking)** | `1,184.74 kB` minified. Recommend route-level `React.lazy`/dynamic imports and manual vendor chunking if production performance becomes a requirement. |
| Browser-local persistence | **BY DESIGN** | Data lives in `localStorage`; clearing site data or resetting the demo restores seed data. No backend/multi-user consistency is expected. |
| Stale pre-fix browser data | **NOTE** | A browser that already contained duplicate IDs from before this QA session may retain them until “Reset data demo” is used or site data is cleared. Fresh sessions and newly generated records are collision-safe. |
| Demo authentication | **BY DESIGN** | Credentials are fixed and client-side; this is not a production auth implementation. |

### L.3 Recommendations (non-blocking)

1. Use Settings → **Reset data demo** or clear `assetflow:*` keys in a browser that was used before this QA session.
2. Add route-level code splitting to reduce the initial bundle.
3. If report filtering is required, implement date-range/department filters as a separate, approved feature with tests.
4. Keep the out-of-tree Playwright regression scripts as a local smoke suite until a project test framework is adopted.

---

## Final Verdict

**PASS** for the tested frontend scope.

- All 20 route patterns render and are reachable.
- All 285 automated checks pass in the final runs.
- All 8 discovered product defects are fixed and covered by regression checks.
- Production build and preview pass with a clean console and no failed network requests.
- No critical or high-severity defect remains open.
- The only requirement gaps are explicitly documented: report date/department filters are not part of the current implementation, and pixel-level visual diffing against the composite `Asset.png` was not possible with the available tooling.

Report path: `D:\Program\Laragon\www\AssetFlow\ASSETFLOW_QA_REPORT.md`
