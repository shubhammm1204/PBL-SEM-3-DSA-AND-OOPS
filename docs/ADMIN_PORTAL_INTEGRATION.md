# Admin portal integration status

- `frontend/admin.html`, `frontend/admin.css`, and `frontend/admin.js` are added alongside the existing student-facing pages.
- The existing Express server serves the `frontend` directory with `express.static`, so the UI can be opened at `http://localhost:5000/admin.html` when the current server is running.
- The admin portal currently uses illustrative in-browser sample data. Menu edits, order actions, and token recharge are not persisted to the C++ backend or a database yet.
- Do not treat the sample College IDs or balances as real accounts.
- Real token crediting must be implemented on a protected server endpoint. It must verify the admin's Supabase session and role, validate the College ID against the real account store, and record a transaction/audit entry. Never let the browser directly change balances or expose a Supabase service-role secret.
- Menu updates likewise need protected backend endpoints and persistent storage. The student homepage must then fetch the updated menu from the same source.

## Local preview

1. Open a terminal in the repository root.
2. Run `npm install` if dependencies are not installed.
3. Run `node backend/server.js`.
4. Open `http://localhost:5000/admin.html`.

This preview does not require deployment. The existing C++ bridge is not modified by adding these frontend files.
