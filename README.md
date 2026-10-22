# AGRIVANCE Program Workspace

A React interface for agriculture and youth program measurement and learning. Without Supabase configuration, the Vite development server shows an explicitly fictional design demo. A configured environment uses Supabase Auth and Row Level Security for the participant registration/read slice; other operational modules are intentionally unavailable there until implemented.

## Run locally

Requirements: Node.js 18 or newer and npm.

```sh
npm install
npm run dev
```

Open **http://localhost:5173/**. The development server prints its local address in the terminal; use Ctrl+C there to stop it.

Create a production frontend bundle with `npm run build`; Vite writes the generated site files to `dist\`. Run focused tests with `npm test`.

## Enable authenticated participant operations

The live workspace requires a Supabase project. The browser uses the project's publishable/anon key and authenticated user session; database Row Level Security policies enforce record-country and role scope. Never put a Supabase service-role key in a `VITE_*` variable or frontend code.

1. Create a Supabase project and copy `.env.example` to `.env.local`.
2. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to that project's URL and publishable/anon key.
3. Apply `supabase\migrations\20261022000100_participant_foundation.sql` using the Supabase SQL editor or Supabase CLI.
4. Create the initial administrator using the Supabase Auth dashboard. Copy that user's UUID, then assign access through the SQL editor:

   ```sql
   insert into public.user_access (user_id, role, country_codes)
   values ('AUTH_USER_UUID', 'system_admin', array['NG', 'GH', 'KE']);
   ```

   Replace `AUTH_USER_UUID` with the UUID of the Auth user you created. Do not expose a service-role key to the browser. Create additional users through Supabase Auth, then provision the least-privilege role and country codes using an administrator-controlled process.
5. Restart Vite after changing environment variables. The dashboard and Participants module then require a valid provisioned account. When the variables are absent, no participant details are sent or saved to a backend.

The migration creates the participant table, country/role access records, row-level security policies, restricted audit events, constrained stage history, and an atomic exact-match duplicate check that creates a review request instead of a second participant. Registration requires a recorded-consent confirmation. Participant IDs are database-generated and are not derived from a person's name or phone number.

For Vercel, set the same public Supabase values in the project's environment-variable settings for each intended deployment environment, and apply migrations to the matching Supabase project separately. These frontend variables do not create a Supabase project, user, or database. The deployed service has not been verified until those external steps are complete.

The current implementation is an initial vertical slice, not a production-complete participant system. It does not yet include participant edits, archival UI, participant history, reviewable duplicate resolution, server-side pagination, nor live service delivery, eligibility, programme, cohort, outcome, or reporting workflows. Do not use it for real personal data until organizational approval, applicable data-protection review, retention, and operational controls are in place.

## Included screens

- Public AGRIVANCE homepage.
- Explicitly fictional development-only dashboard and module screens.
- Authenticated live participant directory and registration when Supabase is configured.
- Country-scoped participant access and audit events enforced by PostgreSQL Row Level Security.
- Focused validation tests with `npm test`.

## Demo data and limitations

Without Supabase configuration, the local development build contains fictional fixture records and browser-memory interactions, all explicitly presented as a demo. Never enter real participant information in demo mode. Configured deployments do not fall back to those fixtures: unimplemented modules display an unavailable state rather than fictional operational data.

The Supabase migration and frontend integration have not been tested against a live project because no project credentials or database are configured in this repository. `npm test` covers pure input validation and record mapping only; it does not substitute for integration tests of authentication, policies, migrations, or persistence. The admin account and all external Vercel/Supabase services require owner configuration.
