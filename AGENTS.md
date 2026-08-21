# Agent Guidelines

## UI / Design System

Antes de modificar cualquier interfaz de ApuLab:

1. Leer `DESIGN.md`.
2. Reutilizar `src/ui/tokens.ts`.
3. No inventar nuevos colores si existe un token adecuado.
4. No inventar nuevas familias tipograficas.
5. No crear nuevos tamanos de boton arbitrariamente.
6. Reutilizar `ApuButton` para botones de menu y acciones equivalentes.
7. No introducir iconos en botones sin aprobacion explicita.
8. No crear botones completos como PNG.
9. No usar emojis como iconos de produccion.
10. No instalar librerias UI sin justificar previamente una limitacion real de Phaser.
11. Mantener compatibilidad con `1280x720`.
12. Respetar legibilidad para ninas de 8 a 12 anos.

`DESIGN.md` y `src/ui/tokens.ts` son la fuente oficial de verdad visual de ApuLab.

## Data Safety Rules

Antes de modificar cualquier flujo de datos, telemetria, schema o exportacion:

1. Leer `docs/DATA_GOVERNANCE.md`.
2. Leer `docs/DATA_DICTIONARY.md`.
3. Leer `docs/EVENT_CATALOG.md`.
4. No cambiar schema sin migracion versionada.
5. No renombrar `event_type` arbitrariamente.
6. No almacenar PII.
7. No almacenar credenciales en texto plano.
8. No eliminar idempotencia por `event_id`.
9. No eliminar separacion STUDY/DEMO.
10. No cambiar el mapeo `participant_code` / `participant_id` sin actualizar la documentacion.
11. No introducir `service_role` ni secretos en frontend.
12. No borrar datos para resolver errores.
13. No cambiar `questionnaire_version` silenciosamente.
14. Usar `ResearchRepository` para persistencia; las escenas no deben llamar Supabase, `fetch` o SQL directamente.
15. Mantener `VITE_DATA_MODE=mock` como modo seguro de desarrollo; mock no puede crear sesiones `study`.

`docs/DATA_GOVERNANCE.md`, `docs/DATA_DICTIONARY.md` y `docs/EVENT_CATALOG.md` son las fuentes oficiales para toda modificacion futura de datos.

## Future Implementation Rules

Antes de implementar una integracion futura:

1. Leer `docs/FUTURE_IMPLEMENTATION.md`.
2. Buscar `TODO(APULAB-FUTURE:<ID>)`.
3. Comprobar `IMPLEMENT WHEN`.
4. Comprobar `DO NOT IMPLEMENT BEFORE`.
5. No adelantarse a una integracion si las condiciones no se cumplen.
6. Actualizar `STATUS` al terminar.
7. Eliminar unicamente los TODOs realmente resueltos.
8. No cambiar la interfaz de escenas para conectar backend.
9. Preservar separacion Research / Impact.
10. Ejecutar build y tests.

Antes de declarar una funcionalidad futura como necesaria, explicar por que se alcanzo su condicion `IMPLEMENT WHEN`.

Documentos maestros que deben mantenerse coherentes:

1. `DESIGN.md`
2. `docs/ARCHITECTURE.md`
3. `docs/SCENE_MAP.md`
4. `docs/DATA_GOVERNANCE.md`
5. `docs/FUTURE_IMPLEMENTATION.md`
