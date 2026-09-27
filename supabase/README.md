# ESN Accounts Backend

The website-side account experience is built around Supabase Auth + PostgreSQL.

## Required build variables

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

The Supabase anon/publishable key is intended for browser clients. Never expose a Supabase service-role key in GitHub Pages or Vite.

## Account model

- Native ESN email/password account
- Email confirmation and password recovery
- ESN Member ID
- Display name
- Role: member / staff / admin / owner
- Status: active / suspended / banned
- ESN Credits balance
- Credit transaction history foundation

## Security

- Raw passwords are handled only by Supabase Auth.
- RLS limits members to their own profile/history.
- Browser clients may update only `display_name`.
- `role`, `status`, and `credits` stay server-controlled.
- ES Tools remains public and account-free.

Apply `supabase/schema.sql` after the Supabase project is connected.
