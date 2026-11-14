(() => {
  const client = () => window.cbSupabase;
  async function requireAdmin() {
    if (!client()) throw new Error("Supabase is not configured.");
    const { data: { session }, error } = await client().auth.getSession();
    if (error || !session) { window.location.replace("admin-login.html"); return null; }
    const response = await fetch("/api/admin/me", { headers: { Authorization: `Bearer ${session.access_token}` } });
    if (response.status === 401 || response.status === 403) { await client().auth.signOut(); window.location.replace("admin-login.html"); return null; }
    if (!response.ok) throw new Error("Could not verify admin access.");
    const profile = await response.json();
    const name = document.querySelector(".profile-copy strong");
    if (name) name.textContent = profile.full_name || session.user.email || "Admin";
    return session;
  }
  async function getToken() { const { data } = await client().auth.getSession(); return data.session?.access_token || null; }
  window.CBAdminAuth = { requireAdmin, getToken, signOut: async () => { await client().auth.signOut(); window.location.replace("admin-login.html"); } };
})();
