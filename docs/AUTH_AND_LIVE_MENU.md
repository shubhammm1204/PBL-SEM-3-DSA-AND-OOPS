# Campus Bites authentication and live menu integration

## URLs
- `/` redirects to `/login`.
- `/login` is student sign-in.
- `/signup` creates a student account after checking the College ID against `backend/data/students.txt`.
- `/dashboard` is the student canteen homepage.
- `/admin-login` is the separate administrator sign-in.
- `/admin` is the protected admin portal.

## Supabase setup
1. Copy `.env.example` to `.env` in the project root. Keep the URL and publishable key in `.env`; do not add a secret/service-role key.
2. In Supabase SQL Editor, run the complete `supabase/schema.sql`. If you ran an earlier version, run this updated script too.
3. The auth trigger creates student profiles with role `student`. It deliberately ignores any role sent by the browser.
4. Create an administrator user in Supabase Authentication → Users → Add user. Copy that user's UID, then run this in SQL Editor (replace the values):
   ```sql
   insert into public.profiles (user_id, college_id, full_name, role)
   values ('PASTE-AUTH-USER-UID', 'ADMIN001', 'Campus Bites Admin', 'admin');
   ```
   Never expose admin signup or allow the browser to select the admin role.
5. Email confirmation can be left enabled. If enabled, students must confirm their email before signing in.

## Existing canteen records
Student signup is limited to College IDs already present in `backend/data/students.txt`. Add genuine students to that file through your trusted admin workflow before they register. Faculty members can be recharged when their real College IDs are present in the same file (one record per line: `COLLEGE_ID|Full Name|Balance`). Faculty/admin accounts are provisioned manually; do not add sample or invented identities.

## Live menu behavior
Admin menu CRUD writes to Supabase. After every menu mutation, Node.js writes the complete catalogue to `backend/data/menu.txt`. The student homepage reads the same Supabase catalogue, while the C++ canteen system loads the latest menu snapshot on each bridge invocation. The order calculation and balance deduction algorithm remain the existing C++ logic.

## Compile the updated C++ bridge (required once)
The source file `backend/services/canteenSystem.h` now reads the menu snapshot. Rebuild the bridge with your MinGW g++ toolchain from the project root:

```powershell
g++ -x c++ -std=c++17 backend/api_bridge.cPP -o backend/api_bridge.exe
```

This preserves the existing C++ order calculation and balance-deduction logic, but rebuilds the executable so it can read `backend/data/menu.txt`.

## Local run
```powershell
npm.cmd install
node backend/server.js
```
Open `http://localhost:5000`. Do not use VS Code Live Server for protected routes; use the Express URL.


## Menu storage: TXT file (current implementation)

The live menu is stored in `backend/data/menu.txt`, not in Supabase.
Each line uses this format:

`ID|Name|Category|Price|Available(1/0)|Emoji`

The Node.js API (`GET /api/menu` and the protected `/api/admin/menu` routes) reads and writes this file. Admin add/edit/availability/delete operations therefore update the same file that the C++ `CanteenSystem` loads when processing an order. Supabase remains responsible for authentication and profiles; no `public.menu_items` table is required.

After replacing the project files, restart Node.js. If you changed `backend/services/canteenSystem.h` locally in the future, rebuild `backend/api_bridge.exe` from `backend/api_bridge.cPP`; the current menu integration already reads `backend/data/menu.txt`.
