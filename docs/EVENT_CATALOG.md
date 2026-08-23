# ApuLab Event Catalog

Solo registrar eventos relevantes para investigacion. No registrar mousemove, frames, pixeles, hovers, tweens ni cambios visuales irrelevantes.

Campos comunes obligatorios para cada evento: `event_id`, `session_id`, `session_mode`, `scene_id`, `event_type`, `schema_version`, `client_timestamp` o `timestamp`, `payload`.

Payload prohibido: PII, credenciales, screenshots, imagenes, audio, video, HTML, estado completo Phaser, logs enormes y stack traces completos.

| event_type | Cuando ocurre | challenge_id | Payload permitido | Obligatorio | Opcional | Analisis |
|---|---|---|---|---|---|:---:|
| session_started | Sesion validada o demo iniciada | null | `session_mode`, version info | `session_mode` | `entry_point` | Si |
| checkpoint_reached | Checkpoint importante | segun escena | `checkpoint`, `level` | `checkpoint` | `duration_seconds` | Si |
| opportunity_intro_completed | Termina intro narrativa | `INTRO_STORY` | `steps_seen`, `duration_seconds` | `steps_seen` | none | Si |
| assessment_response | Evento heredado de evaluaciones existentes | null | `phase`, `item_id`, `value`, `duration_seconds` | `phase`, `item_id` | `value` | Transitorio |
| challenge_started | Inicia reto | reto actual | `attempt_number` | none | `source` | Si |
| choice_selected | Seleccion de opcion relevante | reto actual | `choice_id` | `choice_id` | `previous_choice_id` | Si |
| measurement_taken | Medicion STEM/logica | reto actual | `measurement_type`, `value`, `unit` | `measurement_type` | `unit` | Si |
| answer_submitted | Respuesta enviada | reto actual | `answer`, `attempt_number` | `attempt_number` | `answer` estructurado | Si |
| attempt_completed | Intento termina | reto actual | `result`, `duration_seconds` | `result` | `error_code` | Si |
| hint_requested | Participante pide pista | reto actual | `hint_id` | `hint_id` | `attempt_number` | Si |
| configuration_changed | Cambio relevante de configuracion del reto | reto actual | `field`, `value_summary` | `field` | `change_count` | Si |
| challenge_completed | Reto completado | reto actual | `attempts`, `duration_seconds`, `hints_used` | `attempts` | `score` | Si |
| challenge_failed | Reto fallido o abandonado | reto actual | `reason`, `attempts` | `reason` | `duration_seconds` | Si |
| posttest_started | POST interno inicia | null | `questionnaire_version` | `questionnaire_version` | none | Si |
| posttest_answered | Respuesta POST guardada | null | `questionnaire_version`, `question_id`, `duration_seconds` | `question_id` | `answer_summary` | Si |
| posttest_completed | POST interno termina | null | `questionnaire_version`, `answered_count` | `questionnaire_version` | `duration_seconds` | Si |
| game_completed | Flujo completo termina | null | `completed_at`, `pending_sync_count` | `completed_at` | none | Si |
| sync_success | Cola local sincronizada | null | `count` | `count` | `batch_id` | Monitoreo |
| sync_failed | Intento de sync falla | null | `count`, `error` no sensible | `count` | `retry_after_ms` | Monitoreo |

Nuevos retos deben registrar su contrato de payload aqui antes de emitir eventos nuevos.
