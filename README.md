# RoadPilot V10 — Uber Edition

Aplicación web estática lista para GitHub Pages.

## Incluye
- 🚗 Uber Driver
- 🍔 Uber Eats
- 🔥 High Value Radar
- 📍 Radar por ubicación/zona
- 💰 Filtros de valor
- ⭐ Score 0–100
- 📅 Planificador semanal
- 📊 Ingresos y gastos
- ⛽ Ganancia neta
- 📈 Estadísticas
- 👤 Perfil del conductor
- 💾 Persistencia local con localStorage
- ☁️ Estructura preparada para conectar Supabase

## Publicar en GitHub Pages
1. Sube el contenido de esta carpeta a tu repositorio.
2. En GitHub entra a **Settings → Pages**.
3. Selecciona **Deploy from a branch**.
4. Selecciona la rama donde subiste los archivos y la carpeta `/ (root)`.
5. Guarda y espera el despliegue.

## Supabase
La aplicación funciona sin Supabase. Para una versión con cuentas, sincronización y datos en la nube, usa `supabase-config.example.js` como plantilla y añade la integración de Supabase.

## Nota
RoadPilot es un proyecto independiente y no es una aplicación oficial de Uber. No automatiza la aceptación de viajes o pedidos; presenta información para que el conductor tome su propia decisión.


## V11 — Conexión Uber + OAuth + Supabase

La interfaz V11 incorpora **Conectar Uber**, estado de cuenta conectada y una estructura OAuth 2.0 preparada.

Uber usa OAuth 2.0 para que el conductor inicie sesión en la página oficial de Uber y autorice a la aplicación sin entregar su contraseña a RoadPilot.

### Configuración
1. Crea/configura tu aplicación en Uber Developers.
2. Configura el Redirect URI exacto de tu GitHub Pages.
3. Copia el Client ID en `supabase-config.js`.
4. **No coloques el Client Secret en GitHub Pages.**
5. Configura una Supabase Edge Function para intercambiar el `code` por tokens.
6. Guarda los secretos usando Supabase Secrets.
7. Ejecuta `supabase-schema.sql` en tu proyecto.

### Importante sobre la API de Uber
El acceso a la Driver API está actualmente limitado y los scopes `partner.accounts`, `partner.trips` y `partner.payments` requieren aprobación de Uber para uso público. La V11 deja preparada la arquitectura, pero la conexión real de datos depende de que Uber apruebe y habilite tu aplicación.

### GitHub Pages
GitHub Pages sirve el frontend estático. El intercambio OAuth que utiliza `client_secret` debe ejecutarse en un backend/Edge Function, no en el navegador.


## V13 — precios y marca
- Logo original de RoadPilot incluido en `assets/roadpilot-logo.png`.
- Eslogan principal: “Consigue las mejores órdenes de alto valor y con pocas millas de viaje.”
- Plan semanal: $40.
- Plan mensual: $100.
- Promoción 3 meses: Precio original $300 → $210 con 30% de descuento con distintivo de 30% de descuento.
- Los botones de planes son demostrativos hasta conectar un sistema de pagos.
- No se incluye ninguna clave secreta de Supabase ni Client Secret de Uber.
