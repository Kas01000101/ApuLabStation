# ApuLab Research Data Test Plan

Este plan complementa `supabase/tests/research_data_governance.sql`. No usa datos reales.

| Caso | Estado | Verificacion |
|---|---|---|
| A. login valido | Pendiente de conectar cliente auth | Edge/auth debe devolver `participant_id` para codigo+credencial validos |
| B. login invalido | Pendiente de conectar cliente auth | Error generico: "El codigo o la contrasena no son correctos." |
| C. session study | Cubierto por SQL | `session_mode='study'` con `participant_id` |
| D. session demo | Cubierto por SQL | `session_mode='demo'` con `participant_id IS NULL` |
| E. evento valido | Cubierto por SQL | Insert de evento con `event_type` catalogado |
| F. evento duplicado | Cubierto por SQL | Mismo `event_id` enviado 5 veces -> 1 fila |
| G. batch duplicado | Cubierto por SQL | Batch reenviado -> 1 fila por `event_id` |
| H. payload invalido | Cubierto por Edge validation | Rechazar payload grande o campos prohibidos |
| I. session_id invalido | Cubierto por FK | FK impide evento sin sesion valida |
| J. retry | Cubierto por SQL/idempotencia | Reintentos con mismo `event_id` no duplican |
| K. offline -> online | Pendiente de test de navegador | LocalQueue conserva eventos hasta confirmacion |
| L. POST asociado automaticamente | Cubierto por SQL para FK; cliente pendiente | POST se guarda con `participant_id` y `session_id` |
| M. game_completed | Pendiente de flujo final | Debe emitirse despues de sync POST |
| N. completed_pending_sync | Cubierto por schema; flujo pendiente | Estado permitido cuando Internet falla |
| O. separacion study/demo | Cubierto por SQL | Constraint impide demo con `participant_id` |

## Test de Duplicacion

Ejecutar `supabase/tests/research_data_governance.sql`. La columna `event_id_idempotent` debe ser `true`.

## Test Offline Manual

1. Iniciar sesion de prueba.
2. Desactivar red.
3. Generar acciones que llamen a `TelemetryService.recordEvent`.
4. Confirmar eventos en `localStorage.apulab_telemetry_events` con estado `pending` o `failed`.
5. Restaurar red.
6. Ejecutar sync.
7. Confirmar que cada `event_id` existe una sola vez en Supabase.

## Test POST Manual

1. Autenticar participante de prueba.
2. Crear sesion STUDY.
3. Completar flujo hasta POST.
4. Enviar respuestas a `/posttest`.
5. Confirmar `participant_id`, `session_id`, `questionnaire_version` y `question_id` en `apulab_posttest_responses`.
