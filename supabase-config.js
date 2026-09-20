// RoadPilot — configuración pública.
// No coloques aquí una clave secret/service_role ni el client_secret de Uber.
window.ROADPILOT_SUPABASE = {
  url: "TU_SUPABASE_URL",
  publishableKey: "TU_SUPABASE_PUBLISHABLE_KEY"
};
window.ROADPILOT_UBER = {
  clientId: "TU_UBER_CLIENT_ID",
  redirectUri: window.location.origin + window.location.pathname
};
