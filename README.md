# RoadPilot V14 — Neon Uber Driver + Eats

Versión visual renovada de RoadPilot para GitHub Pages/PWA.

## Cambios principales
- Diseño neon/cyber inspirado en una experiencia premium de Uber Driver + Uber Eats.
- Tipografía grande y luminosa para el mensaje principal.
- Eslogan: **OBTÉN LAS MEJORES ÓRDENES DE ALTO VALOR $$$ Y EN POCAS MILLAS DE VIAJE.**
- Radar, filtros, Score 0–100, planificador, finanzas y estadísticas.
- Plan semanal $40, mensual $100 y promoción 3 meses: ~~$300~~ **$210 (30% OFF)**.
- PWA instalable con manifest y service worker.
- Mantiene la integración preparada para Supabase y OAuth de Uber.

## Seguridad
`supabase-config.js` no debe contener claves secretas. La publishable key de Supabase puede usarse en frontend con RLS; las secret keys deben permanecer en backend/Edge Functions.

RoadPilot no es una aplicación oficial de Uber y no acepta viajes automáticamente.
