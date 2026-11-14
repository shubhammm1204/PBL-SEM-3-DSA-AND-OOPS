# Campus Bites: Supabase setup (local development)

## What is connected in this build
- Supabase email/password sign-in for the admin portal.
- Server-side validation of the Supabase access token and `profiles.role = admin`.
- Token lookup and recharge against `backend/data/students.txt`, preserving the existing C++ storage format.
- Recharge audit history in Supabase.
- Admin menu CRUD endpoints and a Supabase `menu_items` table.

## Important menu limitation
The current C++ `CanteenSystem::initMenu()` still hardcodes the prices and menu items used when orders are placed. The new admin menu table is persisted in Supabase, but it does NOT yet change the authoritative C++ order prices or student homepage menu. To make menu edits live end-to-end, the C++ bridge/order system and student homepage need a small menu-sync integration. The C++ source files were intentionally not modified in this build, as requested. Do not treat menu CRUD as live ordering integration yet.

## 1. Install dependencies
Run from the repository root:

```bash
npm install
```

## 2. Configure server environment
Copy `.env.example` to `.env`. The values are already filled with the project URL and publishable key supplied in this conversation. Keep `.env` out of Git. A publishable key is safe for browser use; never add a `sb_secret_...` key or service-role key to frontend code.

## 3. Create database tables and policies
In Supabase Dashboard → SQL Editor, run `supabase/schema.sql`.

## 4. Create an admin login
1. Supabase Dashboard → Authentication → Users → Add user. Create an email/password account for the administrator.
2. Copy that user's UUID.
3. In SQL Editor, run this after replacing the placeholders:

```sql
insert into public.profiles (user_id, college_id, full_name, role)
values ('AUTH-USER-UUID', 'ADMIN001', 'Campus Bites Admin', 'admin');
```

Never let users choose their own `admin` role during public signup. Only trusted project owners should provision admin profiles.

## 5. Start locally

```bash
node backend/server.js
```

Open `http://localhost:5000/admin-login.html`. Sign in with the admin email/password you created.

## 6. Token recharge behavior
- Lookup reads the real records from `backend/data/students.txt`. Current IDs in the supplied repository are GEU101–GEU104. Faculty IDs can be recharged only after the faculty record exists in that file in `COLLEGEID|Name|Balance` format.
- Recharge updates that file, so the existing C++ storage system can read the updated balance. It also writes a Supabase audit row.
- If the audit insert fails, the route attempts to roll back the file update. This is intended for local single-instance project use, not concurrent multi-server production use.

## 7. Security notes
- The publishable key is not a secret. Database access is controlled by RLS and the server checks the signed-in user's profile role.
- Keep database passwords, secret keys and service-role keys private.
- Do not deploy until the remaining menu sync, order API authorization, and production concurrency controls are implemented and tested.

## 8. Existing backend preservation
The C++ source files and existing order flow were not changed. `backend/server.js` only gained the admin route mount, dotenv loading and Authorization header allowance.
