(() => {
  const config = window.CAMPUS_BITES_SUPABASE;
  if (!window.supabase || !config?.url || !config?.publishableKey) {
    console.error("Supabase SDK/configuration is missing.");
    return;
  }
  window.cbSupabase = window.supabase.createClient(config.url, config.publishableKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });
})();
