# RoadPilot — Uber + WhatsApp

Esta versión elimina por completo el registro independiente y los pagos integrados.

## Lo que hace
- El usuario solo ve **Iniciar con Uber**.
- No existe formulario de correo/contraseña ni botón de crear cuenta independiente.
- El inicio de sesión se hace mediante el OAuth oficial de Uber.
- Cada plan tiene únicamente un botón de WhatsApp.
- Al tocar un plan, WhatsApp abre un mensaje indicando el plan elegido y que el usuario quiere recibir las especificaciones y las instrucciones para realizar el pago.
- Se mantiene el mapa GPS del dispositivo y el planificador semanal.

## WhatsApp
Número configurado: +1 7066312845

## GitHub Pages
Sube a la raíz del repositorio:
- `index.html`
- `supabase-config.js`
- `privacy.html`

No subas secretos.

## Uber + Supabase
Esta versión incluye las funciones:
- `supabase/functions/uber-start/index.ts`
- `supabase/functions/uber-callback/index.ts`

Despliega ambas en tu proyecto Supabase.

### Secrets que ya debes tener en Supabase
- `UBER_CLIENT_ID`
- `UBER_CLIENT_SECRET`
- `UBER_REDIRECT_URI`
- `OAUTH_STATE_SECRET`
- `ROADPILOT_SITE_URL`

Para `uber-callback` también necesita la clave secreta de Supabase en el entorno de la Edge Function (`SUPABASE_SECRET_KEY` o `SUPABASE_SERVICE_ROLE_KEY`). Nunca la pongas en GitHub ni en `supabase-config.js`.

### Redirect URI de Uber
Debe coincidir exactamente con:
`https://dnzyqvqsnhwjlrcefxsx.supabase.co/functions/v1/uber-callback`

### Importante sobre los permisos de Uber
La aplicación Roadpilot necesita que Uber apruebe/allowliste los scopes de Driver API usados por la función:
- `partner.accounts`
- `partner.trips`

Si Uber todavía muestra que la aplicación no tiene acceso a Authorization Code scopes, el botón de Uber seguirá devolviendo el error de autorización hasta que Uber habilite esos permisos.

## Seguridad
- Los secretos de Uber y Supabase se usan solo en Edge Functions.
- El frontend nunca contiene el Uber Client Secret ni la clave secreta de Supabase.
- La identidad interna de Supabase se crea a partir del identificador de Uber; el usuario no recibe ni escribe una contraseña de RoadPilot.

## Nota sobre el mapa
El mapa de esta versión usa el GPS del teléfono. No se debe interpretar como ubicación en tiempo real proveniente de Uber.
