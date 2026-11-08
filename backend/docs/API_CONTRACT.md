# AssetFlow API Contract

Base URL (local): `http://localhost:8000/api`

The Vite dev server proxies `/api` to the backend, so the frontend calls relative URLs such as `/api/auth/login`.

## Conventions

- Requests and responses use JSON (`Accept: application/json`, `Content-Type: application/json`).
- Authenticated requests send `Authorization: Bearer <token>`.
- Timestamps use ISO 8601. Date-only values use `YYYY-MM-DD`.
- Database fields are `snake_case`; JSON fields exposed to the frontend are `camelCase`.
- Validation failures return HTTP `422` with a Laravel `errors` object.
- Successful deletes and action-only endpoints return HTTP `200` with a `message`.
- List endpoints will support `?page=`, `?per_page=`, `?search=`, and module-specific filters. Responses will use:

```json
{
  "data": [],
  "meta": { "current_page": 1, "per_page": 15, "total": 0, "last_page": 1 }
}
```

## Error format

```json
{
  "message": "Human readable message.",
  "errors": {
    "field": ["Validation message."]
  }
}
```

| Status | Meaning |
| ------ | ------- |
| 200 | OK |
| 201 | Created |
| 401 | Missing/invalid token or invalid credentials |
| 403 | Authenticated but not allowed, or inactive account |
| 404 | Resource not found |
| 422 | Validation failure |
| 429 | Too many requests |
| 500 | Server error |

---

## Auth (implemented)

### POST `/api/auth/login`

Request:

```json
{
  "email": "andi.pratama@assetflow.id",
  "password": "assetflow123",
  "device_name": "AssetFlow Web"
}
```

Response `200`:

```json
{
  "token": "1|plain-text-sanctum-token",
  "token_type": "Bearer",
  "user": {
    "id": "USR-001",
    "employeeId": "EMP-2021-001",
    "name": "Andi Pratama",
    "email": "andi.pratama@assetflow.id",
    "username": "andi.pratama",
    "role": "Super Admin",
    "position": "Super Administrator",
    "department": "Information Technology",
    "phone": "+62 812-1900-4411",
    "initials": "AP",
    "avatarColor": "#1B4B6B",
    "joinDate": "2021-01-12",
    "twoFA": "FIDO2 / Hardware Token",
    "status": "Aktif",
    "lastLogin": "Hari ini, 10:42 WIB",
    "lastActive": "Hari ini, 10:42 WIB",
    "device": "macOS • Chrome • 10.12.84.15",
    "modules": "Semua Modul (Full Access)"
  }
}
```

Errors: `401` invalid credentials, `403` inactive account, `422` validation, `429` throttled (10 attempts/minute).

### GET `/api/auth/me`

Requires Bearer token. Response `200`:

```json
{
  "user": { "...": "same user object as login" }
}
```

### POST `/api/auth/logout`

Requires Bearer token. Revokes the current token. Response `200`:

```json
{ "message": "Berhasil keluar." }
```

### PUT/PATCH `/api/auth/profile`

Requires Bearer token. Updates the authenticated user's own profile.

Accepted fields (all optional): `name`, `email`, `username`, `phone`, `position`, `department`, `initials`, `avatar_color`.

Response `200`:

```json
{
  "user": { "...": "updated user object" }
}
```

Role, status, and permissions are intentionally not self-editable through this endpoint.

---

## Module endpoints

### Employees — `/api/employees` (GET implemented)

Requires Bearer token.

| Method | Path | Purpose | Frontend method |
| ------ | ---- | ------- | --------------- |
| GET | `/api/employees` | List employees | `employeeService.all()` |
| GET | `/api/employees/{id}` | Employee detail | `employeeService.get(id)` |
| POST | `/api/employees` | Create employee | `employeeService.create(payload)` — planned |
| PUT | `/api/employees/{id}` | Update employee | `employeeService.update(id, payload)` — planned |
| DELETE | `/api/employees/{id}` | Delete employee | `employeeService.remove(id)` — planned |

List response:

```json
{
  "data": [
    {
      "id": "EMP-2022-094",
      "name": "Dimas Saputra",
      "email": "dimas.saputra@assetflow.id",
      "phone": "+62 812-8890-4412",
      "department": "Information Technology",
      "position": "Lead DevOps & Field Systems Engineer",
      "status": "Aktif",
      "joinDate": "2022-03-15",
      "manager": "Fajar Anugrah",
      "location": "Kantor Pusat Jakarta Lt. 3",
      "initials": "DS",
      "avatarColor": "#1B4B6B",
      "assets": 3,
      "grade": "Grade A",
      "notes": "..."
    }
  ]
}
```

Detail response: `{ "data": { "...employee object..." } }`.

### Users and access — `/api/users` (GET implemented)

Requires Bearer token.

| Method | Path | Purpose | Frontend method |
| ------ | ---- | ------- | --------------- |
| GET | `/api/users` | List accounts | `userService.all()` |
| GET | `/api/users/{id}` | Account detail | `userService.get(id)` |
| POST | `/api/users` | Create account | `userService.create(payload)` — planned |
| PUT | `/api/users/{id}` | Update account | `userService.update(id, payload)` — planned |
| POST | `/api/users/{id}/toggle-status` | Activate/deactivate | `userService.toggleStatus(id)` — planned |
| DELETE | `/api/users/{id}` | Delete account | `userService.remove(id)` — planned |

User list/detail objects use the same shape as the auth `user` object. List response is `{ "data": [...] }`; detail response is `{ "data": { "...user object..." } }`.

## Planned module endpoints

Assets, inventory, borrowings, maintenance, reports, and dashboard endpoints are not implemented yet. They are listed so the frontend service layer and the backend can be built against one contract.

### Assets — `/api/assets`

| Method | Path | Purpose | Frontend method |
| ------ | ---- | ------- | --------------- |
| GET | `/api/assets` | List assets | `assetService.all()` |
| GET | `/api/assets/{id}` | Asset detail | `assetService.get(id)` |
| POST | `/api/assets` | Create asset | `assetService.create(payload)` |
| PUT | `/api/assets/{id}` | Update asset | `assetService.update(id, payload)` |
| DELETE | `/api/assets/{id}` | Delete asset | `assetService.remove(id)` |

Planned asset fields: `assetCode`, `name`, `category`, `brand`, `model`, `serialNumber`, `purchaseDate`, `purchasePrice`, `condition`, `status`, `location`, `department`, `assignedTo`, `supplier`, `warrantyUntil`, `notes`.

### Inventory — `/api/inventory`

| Method | Path | Purpose | Frontend method |
| ------ | ---- | ------- | --------------- |
| GET | `/api/inventory` | List stock items | `inventoryService.all()` |
| GET | `/api/inventory/{id}` | Item detail | `inventoryService.get(id)` |
| POST | `/api/inventory` | Create item | `inventoryService.create(payload)` |
| PUT | `/api/inventory/{id}` | Update item | `inventoryService.update(id, payload)` |
| DELETE | `/api/inventory/{id}` | Delete item | `inventoryService.remove(id)` |
| GET | `/api/inventory/transactions` | Stock movement history | `inventoryService.transactions()` |
| POST | `/api/inventory/transactions` | Record stock in/out | `inventoryService.createTransaction(payload)` |

Planned transaction fields: `itemId`, `type` (`in`/`out`/`adjustment`), `quantity`, `reference`, `notes`, `date`.

### Borrowings — `/api/borrowings`

| Method | Path | Purpose | Frontend method |
| ------ | ---- | ------- | --------------- |
| GET | `/api/borrowings` | List requests | `borrowingService.all()` |
| GET | `/api/borrowings/{id}` | Request detail | `borrowingService.get(id)` |
| POST | `/api/borrowings` | Create request | `borrowingService.create(payload)` |
| POST | `/api/borrowings/{id}/approve` | Approve | `borrowingService.approve(id)` |
| POST | `/api/borrowings/{id}/reject` | Reject with reason | `borrowingService.reject(id, reason)` |
| POST | `/api/borrowings/{id}/handover` | Mark handed over | `borrowingService.handOver(id)` |
| POST | `/api/borrowings/{id}/return` | Mark returned | `borrowingService.returnAsset(id, condition)` |

Statuses: `Menunggu Persetujuan`, `Disetujui`, `Ditolak`, `Dipinjam`, `Dikembalikan`, `Terlambat`.

### Maintenance — `/api/maintenance`

| Method | Path | Purpose | Frontend method |
| ------ | ---- | ------- | --------------- |
| GET | `/api/maintenance` | List work orders | `maintenanceService.all()` |
| GET | `/api/maintenance/{id}` | Work order detail | `maintenanceService.get(id)` |
| POST | `/api/maintenance` | Create work order | `maintenanceService.create(payload)` |
| PUT | `/api/maintenance/{id}` | Update work order | `maintenanceService.update(id, payload)` |
| POST | `/api/maintenance/{id}/progress` | Update progress | `maintenanceService.updateProgress(id, payload)` |
| POST | `/api/maintenance/{id}/checklist/{index}/toggle` | Toggle checklist item | `maintenanceService.toggleChecklist(id, index)` |

### Reports — `/api/reports`

| Method | Path | Purpose | Frontend method |
| ------ | ---- | ------- | --------------- |
| GET | `/api/reports` | List report definitions/history | `reportService.all()` |
| GET | `/api/reports/category/{category}` | Reports by category | `reportService.byCategory(category)` |
| GET | `/api/reports/{code}/download` | Download report file | `reportService.download(code)` |

### Dashboard

Planned: `GET /api/dashboard/summary` returning asset totals by status/category, low-stock counts, pending borrowings, and maintenance due counts. This endpoint will replace the derived values currently computed from local mock data.

---

## Frontend integration notes

- `src/services/api.js` is the single Axios instance. It reads the stored session and attaches the Bearer token.
- `src/services/authService.js` owns session persistence. A remembered session uses `localStorage`; an unremembered session uses `sessionStorage`.
- The user object returned by auth endpoints must keep the camelCase shape above so existing pages (dashboard, profile, users) do not need changes.
- Users and employees lists/details are loaded from the API by `DataContext` after login. If the API is unavailable, the frontend falls back to the local mock directory.
- Write actions for users and employees are intentionally disabled until their POST/PUT/DELETE endpoints are implemented.
- Module services will be switched from localStorage to this API one module at a time, keeping their existing method signatures.
