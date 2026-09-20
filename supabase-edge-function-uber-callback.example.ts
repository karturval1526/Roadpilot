// EJEMPLO DE ARQUITECTURA — no es un endpoint de producción todavía.
// Esta función debe recibir el authorization code, validarlo y hacer el
// POST server-side a https://auth.uber.com/oauth/v2/token.
// Guarda UBER_CLIENT_SECRET en Supabase Secrets, nunca en el frontend.
//
// Flujo:
// 1. Frontend redirige a Uber.
// 2. Uber vuelve con ?code=...&state=...
// 3. Frontend envía el code a esta Edge Function autenticada.
// 4. Edge Function intercambia code + client_secret por tokens.
// 5. Guarda los tokens de forma segura y devuelve únicamente el estado
//    de conexión / perfil mínimo al frontend.
//
// IMPORTANTE: implementar validación de state, usuario autenticado,
// redirect_uri exacto, scopes mínimos y cifrado/secret management.
