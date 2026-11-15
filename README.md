# Bluegrid frontend

React (JavaScript) · Vite · Tailwind CSS v4 · Zustand · React Router. Runs on dummy data (persisted to localStorage).

```bash
npm install
npm run dev
```

Demo logins (password `password123`): `admin@example.test` (Admin console) · `zack@example.test` (BDE workspace).

## Routes
- `/login`
- `/admin/*` Company admin: dashboard, nppes-data, lead-management, sales-team, transfers, appointments, clients-finance, reports, activity, settings
- `/platform/*` Platform admin (switch via the header dropdown): companies, plans, subscription-ledger, health, imports, settings
- `/bde/*` BDE workspace: dashboard, lead-pool, my-leads, incoming-transfers, transferred-leads, follow-ups, appointments, achieved-clients

## Structure
- `components/shared` reusable UI (Button, Modal/FormModal, Table, Panel, Form fields, AnalyticsCard, Tabs, …) — import from `components/shared`
- `components/Admin`, `components/Bde` feature components + one modal host each (`useAdminModals`, `useLeadModals`)
- `panel/*` one folder per page
- `store/features/*/use*Store.js` Zustand stores; `*Fns.js` hold the business logic — **replace these with `http()` calls when the Node/Mongo API exists**
- `utils/data.js` dummy seed data, `utils/utils.js` helpers
