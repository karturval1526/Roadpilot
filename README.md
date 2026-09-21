# RoadPilot — GitHub Pages + Supabase

## 1. Configurar Supabase

Abre `supabase-config.js` y reemplaza únicamente:

`PEGA_AQUI_TU_SUPABASE_PUBLISHABLE_KEY`

por la **Publishable key** de tu proyecto Supabase.

La URL ya está configurada para el proyecto RoadPilot:
`https://tzyiugtnysihashprfbg.supabase.co`

No pongas nunca `service_role`, `sb_secret_...`, contraseñas ni secretos de Uber en este archivo.

## 2. Subir a GitHub Pages

Los archivos deben quedar en la raíz del repositorio:

- `index.html`
- `supabase-config.js`
- `README.md`

Después de subirlos, espera a que GitHub Pages publique el cambio y recarga la página.

## 3. Supabase Auth

El formulario usa Email/Password mediante Supabase Auth. Si tienes activada la confirmación de correo, el usuario deberá confirmar su email antes de iniciar sesión.

## 4. Tabla de perfiles

El sitio utiliza la tabla `driver_profiles` con al menos estas columnas:

- `user_id` — uuid, primary key, referencia a `auth.users(id)`
- `display_name` — text
- `weekly_goal` — numeric/integer
- `updated_at` — timestamptz

RLS debe permitir que cada usuario consulte e inserte/actualice únicamente su propio perfil.

## 5. Importante

No agregues al repositorio:

- `sb_secret_...`
- `service_role`
- contraseñas
- secretos de OAuth de Uber
