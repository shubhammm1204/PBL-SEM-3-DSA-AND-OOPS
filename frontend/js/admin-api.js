
(() => {
  async function request(path, options = {}) {
    const token = await window.CBAdminAuth.getToken();

    if (!token) {
      window.location.replace("admin-login.html");
      throw new Error("Your session has expired. Please sign in again.");
    }

    const response = await fetch(path, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.headers || {})
      }
    });

    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(body.error || `Request failed (${response.status})`);
    }

    return body;
  }

  window.CBAdminApi = {
    findMember: id =>
      request(`/api/admin/members/${encodeURIComponent(id)}`),

    recharge: (id, amount, note) =>
      request("/api/admin/token-recharges", {
        method: "POST",
        body: JSON.stringify({ collegeId: id, amount, note })
      }),

    history: () => request("/api/admin/token-recharges"),

    listMenu: () => request("/api/admin/menu"),

    listOrders: () => request("/api/admin/orders"),

    addMenu: item =>
      request("/api/admin/menu", {
        method: "POST",
        body: JSON.stringify(item)
      }),

    updateMenu: (id, patch) =>
      request(`/api/admin/menu/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify(patch)
      }),

    deleteMenu: id =>
      request(`/api/admin/menu/${encodeURIComponent(id)}`, {
        method: "DELETE"
      })
  };
})();
