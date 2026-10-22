# AGRIVANCE Program Workspace

A JavaScript and React interface for agriculture and youth program measurement and learning. The public homepage links to an admin-style workspace with fictional demonstration records.

## Run locally

Requirements: Node.js 18 or newer and npm.

```sh
npm install
npm run dev
```

Open the local preview in your browser at **http://localhost:5173/**. The development server prints its local address in the terminal; use Ctrl+C there to stop it.

Create a production frontend bundle with `npm run build`; Vite writes the generated site files to `dist\`. Open the site through a local static web server rather than opening `index.html` directly.

## Included screens

- Public AGRIVANCE homepage with working section links and an admin dashboard entry.
- Admin dashboard with country selection and program overview.
- Navigation workspaces for participants, applications, enterprises, workforce, services, assessments, outcomes, partners, indicators, data quality, analytics, reporting, geography, field operations, synchronization, administration, integrations, and audit history.
- Fictional demo participant registration, detail views, status filtering, and CSV export.

## Demo data and limitations

All dashboard figures and records are fictional and labeled as demonstration data. New records exist only in the current browser session; there is no API, database, authentication, authorization, or production persistence configured yet. The admin view is a demonstration and does not provide real access control.

Do not enter real participant information. Before production use, connect an appropriately secured backend and database, configure identity and access controls, establish approved data governance and retention rules, and replace demonstration records with authorized data. The module screens are interactive frontend workspaces, not a claim that the workflows or integrations are production-ready.
