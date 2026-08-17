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
