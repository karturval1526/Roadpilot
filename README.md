# RoadPilot V4 — GitHub Pages

## Qué incluye
- Login y cuenta propia de RoadPilot (modo local/demo).
- Dashboard Smart Driver.
- Smart Radar para analizar y ordenar oportunidades.
- Score 0–100.
- Filtros de pago, millas y score.
- Plan semanal con horas y metas.
- Calculadora de rentabilidad.
- Vehículo y costos.
- Zonas y radios.
- Panel de plataformas: DoorDash, Uber Driver, Uber Eats y Veho.
- Alertas del navegador cuando el usuario las autoriza.
- Diseño responsive para Android.
- Manifest y caché para instalación tipo PWA.
- Sin fuentes externas ni imágenes remotas obligatorias.

## Importante sobre las credenciales
Esta versión NO almacena contraseñas de DoorDash, Uber, Uber Eats ni Veho. La cuenta local es una cuenta propia de RoadPilot y sus datos se guardan en localStorage del navegador.

Para una versión con cuentas reales y base de datos en la nube, se puede conectar Supabase/Firebase y usar únicamente OAuth/API oficial de cada plataforma cuando esté disponible. Nunca guardes contraseñas de terceros en una base de datos propia.

## Publicar en GitHub Pages
1. Crea un repositorio en GitHub.
2. Sube todos los archivos de esta carpeta a la raíz del repositorio.
3. Ve a Settings → Pages.
4. En "Build and deployment", selecciona "Deploy from a branch".
5. Elige `main` y `/ (root)`.
6. Guarda.
7. GitHub mostrará la dirección de tu sitio.

## Nota
El Smart Radar no acepta ni reclama órdenes automáticamente. Analiza los datos que llegan legítimamente a RoadPilot o que el conductor introduce.


## RoadPilot V5 Pro
- Diseño visual tipo aplicación premium de delivery.
- Tipografía grande y jerarquía comercial.
- Banner promocional y página RoadPilot Pro.
- Precio mostrado: **US$50/semana**.
- Botones de suscripción preparados para conectar posteriormente Stripe, Mercado Pago u otro proveedor.
- Esta versión no realiza cobros reales todavía.


## V6 Cloud
This package includes `config.js`, `supabase_schema.sql`, and `V6_SETUP.md` for Supabase cloud auth/database. Real recurring payments require a server-side Stripe/Mercado Pago webhook or Edge Function; the static GitHub Pages client never handles provider secret keys.
