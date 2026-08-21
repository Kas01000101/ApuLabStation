# ApuLab Data Dictionary

Ejemplos tecnicos son no reales y no representan codigos o credenciales validas.

| Tabla | Campo | Tipo | Nullable | Descripcion | Ejemplo tecnico | Analisis |
|---|---|---:|:---:|---|---|:---:|
| apulab_participants | participant_id | UUID | No | Identificador interno principal | `00000000-0000-4000-8000-000000000001` | Si |
| apulab_participants | participant_code_hash | TEXT | No | Hash del codigo de participante | `hash_codigo_no_real_...` | Si, para join controlado |
| apulab_participants | credential_hash | TEXT | No | Hash seguro de credencial individual | `hash_credencial_no_real_...` | No |
| apulab_participants | is_active | BOOLEAN | No | Participante habilitada | `true` | Administrativo |
| apulab_participants | created_at | TIMESTAMPTZ | No | Creacion del registro | `2026-08-17T00:00:00Z` | Si |
| apulab_participants | updated_at | TIMESTAMPTZ | No | Ultima actualizacion administrativa | `2026-08-17T00:00:00Z` | No |
| apulab_auth_attempts | attempt_id | UUID | No | Intento de autenticacion | `00000000-0000-4000-8000-000000000010` | No |
| apulab_auth_attempts | participant_code_hash | TEXT | Si | Hash del codigo intentado | `hash_codigo_no_real_...` | No |
| apulab_auth_attempts | success | BOOLEAN | No | Resultado del intento | `false` | Monitoreo |
| apulab_auth_attempts | attempted_at | TIMESTAMPTZ | No | Momento del intento | `2026-08-17T00:00:00Z` | Monitoreo |
| apulab_auth_attempts | cooldown_until | TIMESTAMPTZ | Si | Espera temporal si aplica | `2026-08-17T00:05:00Z` | No |
| apulab_sessions | session_id | TEXT | No | Identificador de sesion | `session-uuid-tecnico` | Si |
| apulab_sessions | participant_id | UUID | Si | Participante; requerido en study y null en demo | `00000000-0000-4000-8000-000000000001` | Si |
| apulab_sessions | participant_code | VARCHAR(32) | Si | Campo heredado; no usar para nuevos study | `NULL` | No |
| apulab_sessions | session_mode | ENUM | No | `study` o `demo` | `study` | Si |
| apulab_sessions | build_version | VARCHAR(32) | No | Version cliente heredada | `0.1.0-web-pilot` | Si |
| apulab_sessions | game_version | VARCHAR(32) | Si | Version del juego para analisis | `0.1.0-web-pilot` | Si |
| apulab_sessions | schema_version | VARCHAR(32) | No | Version del contrato de datos | `2026-08-sprint0` | Si |
| apulab_sessions | status | VARCHAR(32) | No | Estado: active/completed/abandoned/completed_pending_sync | `active` | Si |
| apulab_sessions | started_at | TIMESTAMPTZ | No | Inicio de sesion | `2026-08-17T00:00:00Z` | Si |
| apulab_sessions | completed_at | TIMESTAMPTZ | Si | Fin confirmado | `2026-08-17T00:30:00Z` | Si |
| apulab_sessions | last_checkpoint | TEXT | Si | Ultimo checkpoint | `level1_completed` | Si |
| apulab_sessions | questionnaire_version | TEXT | Si | Version POST esperada | `post-v1` | Si |
| apulab_events | event_id | TEXT | No | Idempotency key del evento | `event-uuid-tecnico` | Si |
| apulab_events | session_id | TEXT | No | FK a sesion | `session-uuid-tecnico` | Si |
| apulab_events | participant_id | UUID | Si | Copia analitica para study | `00000000-0000-4000-8000-000000000001` | Si |
| apulab_events | session_mode | ENUM | No | `study` o `demo` | `study` | Si |
| apulab_events | scene_id | VARCHAR(64) | No | Escena Phaser | `Level1RoverLabScene` | Si |
| apulab_events | challenge_id | VARCHAR(64) | Si | Reto/logica asociada | `LEVEL1_GLOBAL` | Si |
| apulab_events | event_type | VARCHAR(64) | No | Tipo registrado en catalogo | `challenge_started` | Si |
| apulab_events | attempt_number | INT | Si | Numero de intento | `1` | Si |
| apulab_events | payload | JSONB | Si | Datos minimos del evento | `{"result":"correct"}` | Si |
| apulab_events | result | VARCHAR(32) | Si | Resultado normalizado | `success` | Si |
| apulab_events | error_code | VARCHAR(64) | Si | Error no sensible | `payload_invalid` | Si |
| apulab_events | hint_used | BOOLEAN | Si | Si uso pista | `false` | Si |
| apulab_events | duration_seconds | INT | Si | Duracion estimada | `42` | Si |
| apulab_events | timestamp | TIMESTAMPTZ | No | Campo cliente heredado | `2026-08-17T00:00:00Z` | Si |
| apulab_events | client_timestamp | TIMESTAMPTZ | Si | Momento cliente oficial | `2026-08-17T00:00:00Z` | Si |
| apulab_events | received_at | TIMESTAMPTZ | No | Momento backend | `2026-08-17T00:00:01Z` | Si |
| apulab_events | sync_status | VARCHAR(32) | No | Estado de sync cliente/heredado | `pending` | Monitoreo |
| apulab_posttest_responses | response_id | UUID | No | Respuesta POST | `00000000-0000-4000-8000-000000000020` | Si |
| apulab_posttest_responses | participant_id | UUID | No | FK participante | `00000000-0000-4000-8000-000000000001` | Si |
| apulab_posttest_responses | session_id | TEXT | No | FK sesion | `session-uuid-tecnico` | Si |
| apulab_posttest_responses | questionnaire_version | TEXT | No | Version POST | `post-v1` | Si |
| apulab_posttest_responses | question_id | TEXT | No | Pregunta | `post_q1` | Si |
| apulab_posttest_responses | answer | JSONB | No | Respuesta estructurada | `{"option_id":"option_a"}` | Si |
| apulab_posttest_responses | answered_at | TIMESTAMPTZ | No | Momento respuesta | `2026-08-17T00:30:00Z` | Si |

Campos excluidos del analisis ordinario: `credential_hash`, cooldowns, contextos administrativos, secretos, user agent cuando no sea metodologicamente necesario.
