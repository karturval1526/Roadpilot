# RoadPilot V7 — activación segura de pagos

## Qué añade V7
- Estructura de Edge Functions para iniciar checkout y recibir webhooks.
- Secretos fuera de GitHub Pages.
- Preparación para activar US$50/semana con el proveedor que elijas.
- Base de datos V6 y RLS conservadas.

## Antes de cobrar de verdad
1. Crea/configura tu cuenta del proveedor de pagos.
2. Define el producto/plan semanal de RoadPilot a US$50.
3. En Supabase abre Edge Functions / Secrets.
4. Configura `PAYMENT_SECRET_KEY` y `PAYMENT_WEBHOOK_SECRET`.
5. Implementa la creación de checkout y la verificación de firma del proveedor.
6. Configura el webhook para llamar a `payment-webhook`.
7. Solo después de verificar el evento, actualiza `public.subscriptions`.

## Seguridad
- No pongas claves secretas en `config.js`, `app.js` ni GitHub Pages.
- No marques una suscripción como pagada desde JavaScript del navegador.
- No almacenes contraseñas de DoorDash, Uber, Uber Eats, Veho u otras plataformas.
- Las conexiones de terceros deben usar OAuth/API oficial cuando exista.

## Prueba
Usa primero claves/eventos de prueba del proveedor. Confirma que un pago confirmado cambia el estado de la suscripción y que un pago fallido/no confirmado no lo hace.
