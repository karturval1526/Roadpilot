// RoadPilot V11 — configuración pública del frontend.
// NO pongas aquí client_secret de Uber.
// El intercambio code -> token debe hacerse en una Edge Function/backend seguro.
window.ROADPILOT_UBER = {
  clientId: "TU_UBER_CLIENT_ID",
  redirectUri: window.location.origin + window.location.pathname,
  scopes: ["partner.accounts", "partner.trips", "partner.payments"]
};

window.ROADPILOT_SUPABASE = {
  url: "TU_SUPABASE_URL",
  publishableKey: "TU_SUPABASE_PUBLISHABLE_KEY"
};
