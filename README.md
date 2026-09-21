# RoadPilot — GitHub Pages + Supabase conectado

Esta versión conecta el sitio con Supabase Auth y la tabla `driver_profiles`.

## Subir a GitHub Pages

1. Abre tu repositorio de RoadPilot.
2. Elimina los archivos antiguos si vas a reemplazarlos.
3. Sube **el contenido de esta carpeta**, no el ZIP.
4. `index.html` debe quedar en la raíz del repositorio.
5. Espera a que GitHub Pages publique los cambios.

## Supabase

La configuración pública ya está colocada en `supabase-config.js`:
- Project URL
- Publishable key

La publishable key está diseñada para aplicaciones de navegador. La seguridad de `driver_profiles` depende de RLS.

## Importante

No agregues al repositorio:
- `sb_secret_...`
- `service_role`
- contraseñas
- secretos de Uber

El registro usa confirmación de correo porque esa opción está activada en tu proyecto. Después de confirmar el correo, podrás iniciar sesión y guardar tu perfil.

## OAuth de Uber

La conexión real de Uber todavía requiere configurar OAuth y un backend/Edge Function para el intercambio seguro del código y los tokens. No pongas el `client_secret` de Uber en GitHub Pages.
