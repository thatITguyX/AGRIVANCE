# AGRIVANCE Functional Audit

**Audit date:** 2026-10-22  
**Scope:** Repository at the time of audit and the deployed homepage at `https://agrivance-ruby.vercel.app/`. The deployed URL was reachable and rendered the public homepage; its admin workspace was not authenticated or backed by a verified service.

## Executive summary

The repository contains a React 18/Vite single-page frontend (`src/App.jsx`, `src/main.jsx`, `src/styles.css`) and a static Vite build. There are no server/API routes, database client or schema, migrations, authentication provider, authorization checks, or project-owned automated tests. `package.json` contains only React and Vite dependencies. The README explicitly describes the records as fictional and browser-session-only.

The admin screens are an interactive demonstration, not an operational application. Participant registration updates React state and disappears on reload. Other module lists and dashboard figures are hardcoded fixtures. Many module “Add” buttons create fictional in-memory rows, and CSV export serializes those rows from the browser. The public homepage and dashboard are useful as a design prototype, but the system must not collect real participant data or be described as production-ready.

## Program Operations inventory

All eight items are defined in the `PROGRAM OPERATIONS` group in `src/App.jsx` (`navigation`). They currently route through the same `RecordsPage` component; navigation changes component state rather than the URL. `moduleRows` supplies static rows for several screens; other screens have no rows but still get a generic local “Add demo record” action.

| Menu item | Existing UI and actions | Audit classification | Required work |
|---|---|---|---|
| Participants | `RecordsPage`, `ParticipantTable`, `ParticipantModal`, and `ParticipantDetail`; name/location form validation; search, country/status filters, detail modal, and browser-generated CSV. Registration appends a fabricated ID and profile to React state. The list starts with seven hardcoded records and displays a hardcoded total. | **Mock/demo only**; no persistence, server validation, authorization, duplicate workflow, history, pagination, or tests. | Authenticated persistent list/create/update/archive; UUID-backed ID; RLS country scoping; validation, duplicate review, audit history, server-filtered pagination, and permission-checked export. |
| Applications | `moduleRows.Applications`, generic table, status/search filters, detail notice, browser CSV, fake “Add demo record.” | **Mock/demo only**; no application model, screening decision, persistence, permissions, or tests. | Persistent application lifecycle, configurable eligibility, review/override audit, scoped queries, validation, and tests. |
| Enterprises | `moduleRows.Enterprises`, generic table, filters, browser CSV, fake “Add demo record.” | **Mock/demo only**; records and participant totals are fabricated. No relationships or persistence. | Persistent enterprise records, ownership/participant relationships, lifecycle, scoped access, validation, and tests. |
| Workforce | Generic table with a page title but no `moduleRows` data; fake “Add demo record” changes local component state. | **Frontend only / simulated operation**; no workforce data model, persistence, permissions, or tests. | Define actual workforce requirements and persist profiles, skills, training, placements, and history with scoped authorization. |
| Service delivery | `moduleRows['Service delivery']`, generic table, filters, browser CSV, fake “Add demo record.” | **Mock/demo only**; no service form, participant/program relationship, evidence, persistence, permissions, or tests. | Persistent service records, validation, duplicate protection, correction/cancellation history, scoped access, and tests. |
| Assessments | `moduleRows.Assessments`, generic table, fake “Add demo record.” | **Mock/demo only**; no assessment configuration, responses, validation, scoring, persistence, permissions, or tests. | Configurable templates, assignments, validated responses, review, history, scoring rules, and tests. |
| Outcomes & follow-ups | `moduleRows['Outcomes & follow-ups']`, generic table, fake “Add demo record.” | **Mock/demo only**; no indicator-linked observations, evidence, persistence, permissions, or tests. | Defined indicators and measurement periods, persistent observations/history, evidence review, scoped reports, and tests. |
| Partners | `moduleRows.Partners`, generic table, fake “Add demo record.” | **Mock/demo only**; no partner model, assignment, persistence, permissions, or tests. | Persistent organizations and programme/country assignments with partner-level scope and tests. |

### Other visible workspaces and controls

The sidebar additionally advertises overview, MERL, data quality, analytics, reporting, geographic coverage, offline/sync operations, administration, integrations, and audit logs. These route to `RecordsPage` and are either hardcoded fixture tables or generic empty pages with the same fake-record action. Dashboard KPIs, charts, country totals, activity, and notifications are constants in `Dashboard`, `EnrollmentChart`, `CountryCoverage`, `ActivityFeed`, and `Topbar`. The profile is a hardcoded “Sarah Mensah” identity, not a session. The selected-country filter is frontend-only. There are no route-level permissions, pagination, API error/loading states, or persisted audit events.

## Security and deployment findings

- No application authentication or authorization was found. Hiding a control would not secure an API; there is no API to enforce access.
- No database, migration, serverless function, or Vercel backend configuration was found. A Vercel frontend deployment does not create these services.
- The participant form has only basic client-side required-field checks. It has no consent capture, server validation, duplicate check, or secure data destination.
- Real personal information must not be entered. No production credentials or verified backend configuration were found in the inspected repository.
- No automated project tests were found. `npm run build` succeeded before implementation.

## Implementation plan and status

Work is being delivered as complete vertical slices, rather than falsely marking every screen complete:

1. **Audit and safe baseline — complete.** The exact current module inventory and evidence are recorded here. Fictional fixtures remain confined to Vite development mode; configured deployments do not render those rows or metrics.
2. **Identity and database foundation — implemented, external setup pending.** Added Supabase Auth sign-in, role/country access mapping, RLS policies, audit events, constrained stage-history records, SQL migration, and an environment-variable contract. The project owner must create/configure the Supabase project and provision users.
3. **Participant registration/read slice — initial implementation.** The live path reads RLS-scoped participant rows/counts and calls an atomic database function to register consent-confirmed records with generated IDs. Exact name/country/location matches create a persistent review request and do not create a participant. RLS enforces country scope and writable roles; status transitions and stage history are constrained in SQL. Review resolution UI, edit/archive UI, participant-history UI, server-side pagination, exports, and live integration tests remain incomplete.
4. **Remaining Program Operations — not implemented.** Build each workflow against approved data definitions and scoped database access; do not reuse static fixture rows.
5. **Dashboard, search, reports, notifications, field operations — not implemented.** Derive from persisted authorized data; do not display fixture metrics or simulated events as live.
6. **Production readiness — blocked.** Configure Supabase and Vercel environment variables, create a real administrator using the documented provisioning procedure, apply migrations, run integration/end-to-end tests against a non-production project, and verify deployed routes and policies.

## Implementation and verification status

`npm test` passed five unit tests for participant form validation, country codes, country-aware phone validation, and database-record mapping. `npm run build` passed after the integration. Browser checks confirmed that the development demo consent warning appears, and that a production build without Supabase configuration blocks admin access without showing demo participant counts. The repository does not contain Supabase project credentials or an authenticated test environment, and the SQL migration has not been applied to a live database. Database connectivity, authentication, RLS behavior against a live project, SQL migration execution, and production deployment therefore remain unverified. Do not enter real participant information in the current unconfigured local or deployed demo.

**Known implementation gaps:** the registration form currently records a user-confirmed consent timestamp but has no consent wording/version management; duplicate requests persist but have no review/resolve workflow; module workflows beyond participant list/registration are unavailable in configured deployments; the participant list loads at most 100 records; there is no edit/archive/detail history workflow; role administration and administrator provisioning remain manual; no cross-country integration/E2E tests, Vercel environment setup, or legal/privacy assessment has been completed.
