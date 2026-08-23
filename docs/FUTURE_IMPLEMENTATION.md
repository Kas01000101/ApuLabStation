# Future Implementation Roadmap

Este es el roadmap tecnico oficial de integraciones deliberadamente aplazadas. Solo registra funcionalidades ya decididas con punto concreto de integracion en ApuLab.

## Official Future Order

AHORA:

UI -> historia -> escenarios -> gameplay -> telemetria mock -> POST -> ending

DESPUES:

estabilizar contratos de datos -> Supabase Research -> autenticacion real -> 50 credenciales -> seguridad / RLS / Edge Functions -> pruebas de investigacion -> Supabase Impact -> demo analytics -> Pandas / Colab -> agregacion Research -> Looker Studio -> dashboard de impacto

No adelantar backend mientras todavia estamos construyendo escenarios, salvo que aparezca una dependencia tecnica que realmente impida continuar.

## Poppins Rounded

STATUS:
NOT IMPLEMENTED

CURRENT PHASE:
Access Modal visual polish using real loaded Poppins.

IMPLEMENT WHEN:
Se disponga legalmente del archivo, paquete o familia exacta de Poppins Rounded y sus pesos necesarios para UI.

DO NOT IMPLEMENT BEFORE:
No usar `"Poppins Rounded"` como nombre CSS si la fuente no existe realmente en el proyecto. No descargar desde mirrors o sitios dudosos.

CURRENT PLACEHOLDER:
`Poppins` desde `@fontsource/poppins`, con pesos UI cargados 400, 500, 600 y 700.

FILES INVOLVED:
`src/main.ts`, `src/ui/tokens.ts`, `src/styles.css`, `DESIGN.md`.

FUTURE FILES:
Font package import or local `@font-face` with the real internal family name.

DEPENDENCIES:
Legal source for Poppins Rounded and confirmed weights.

DATA IMPACT:
None.

SECURITY IMPACT:
Avoid untrusted font downloads and unknown third-party assets.

ACCEPTANCE CRITERIA:
`document.fonts.check(...)` recognizes the real Poppins Rounded family, computed styles report it, build passes, and `DESIGN.md` is updated from pending to implemented.

MIGRATION NOTES:
Change `uiTokens.typography.family.primary` only after the real font is loaded reproducibly. Preserve the modal hierarchy: title 700, labels 600, inputs/support 400, buttons 600, and narrative Medium Italic 500.

## Supabase Research

STATUS:
NOT IMPLEMENTED

CURRENT PHASE:
Main menu, architecture hardening, scenario mapping, mock telemetry.

IMPLEMENT WHEN:
Todos los escenarios principales esten funcionales, el POST este implementado, el contrato de telemetria este estable y estemos preparando la version de investigacion.

DO NOT IMPLEMENT BEFORE:
No implementar mientras todavia estemos iterando fuertemente sobre escenas y gameplay.

CURRENT PLACEHOLDER:
`MockResearchRepository`.

FILES INVOLVED:
`src/systems/research/ResearchRepository.ts`, `src/systems/research/MockResearchRepository.ts`, `src/systems/research/ResearchRepositoryProvider.ts`, `src/systems/SyncService.ts`, `src/systems/TelemetryService.ts`, `src/systems/GameState.ts`.

FUTURE FILES:
`src/systems/research/SupabaseResearchRepository.ts`, Supabase Edge Functions, Supabase migrations.

DEPENDENCIES:
Supabase project, Edge Function URL, validated schema, research data policy.

DATA IMPACT:
Participants, study sessions, research events, posttest responses.

SECURITY IMPACT:
Edge Functions, RLS, credential hashing, rate limiting, no `service_role` in frontend.

ACCEPTANCE CRITERIA:
Las escenas siguen sin importar Supabase. Los mismos metodos de `ResearchRepository` funcionan. Una sesion STUDY real puede persistirse completamente.

MIGRATION NOTES:
Cambiar `VITE_DATA_MODE=supabase` y resolver TODO `RESEARCH-BACKEND` sin reescribir escenas.

## Supabase Impact

STATUS:
NOT IMPLEMENTED

CURRENT PHASE:
Demo/local analytics only.

IMPLEMENT WHEN:
La experiencia DEMO este estable y exista un contrato de metricas agregadas que no mezcle datos de investigacion crudos.

DO NOT IMPLEMENT BEFORE:
No conectar Impact antes de separar claramente Research e Impact.

CURRENT PLACEHOLDER:
Datos DEMO en `MockResearchRepository`/`localStorage`.

FILES INVOLVED:
`src/systems/research/MockResearchRepository.ts`, `docs/DATA_GOVERNANCE.md`.

FUTURE FILES:
`src/systems/impact/ImpactRepository.ts`, `src/systems/impact/SupabaseImpactRepository.ts`.

DEPENDENCIES:
Supabase Impact schema, agregaciones anonimas, dashboard publico.

DATA IMPACT:
Metricas agregadas DEMO e impacto publico.

SECURITY IMPACT:
No exponer Research. No publicar datos individuales.

ACCEPTANCE CRITERIA:
Impact recibe solo metricas anonimas/agregadas. Looker o dashboard publico nunca consultan Research directamente.

MIGRATION NOTES:
Crear adaptador Impact separado; no reutilizar tablas Research para datos publicos.

## Real Code + Password Authentication

STATUS:
NOT IMPLEMENTED

CURRENT PHASE:
Contrato UI/Repository creado; autenticacion falla cerrada.

IMPLEMENT WHEN:
Supabase Research este listo y se vaya a preparar la validacion previa al estudio.

DO NOT IMPLEMENT BEFORE:
No crear autenticacion falsa en frontend ni hardcodear credenciales.

CURRENT PLACEHOLDER:
`MockResearchRepository.authenticateParticipant()` devuelve error; `/authenticate` devuelve `participant_auth_not_configured`.

FILES INVOLVED:
`src/game/scenes/ParticipantCodeScene.ts`, `src/systems/research/ResearchRepository.ts`, `supabase/functions/ingest-telemetry/index.ts`.

FUTURE FILES:
Server-side auth helper inside Edge Function, seed script for participant hashes.

DEPENDENCIES:
Hashing server-side, rate limiting, `apulab_participants`, `apulab_auth_attempts`.

DATA IMPACT:
Maps `participant_code + credential` to `participant_id`.

SECURITY IMPACT:
Generic errors, no raw credential storage, no frontend secrets.

ACCEPTANCE CRITERIA:
Valid credential returns `participant_id`; invalid credential returns generic failure; rate limiting works.

MIGRATION NOTES:
Keep `ParticipantCodeScene` calling `ResearchRepository`; implement only backend/auth adapter.

## 50 Study Participants

STATUS:
NOT IMPLEMENTED

CURRENT PHASE:
Schema supports participants; no production roster.

IMPLEMENT WHEN:
Before the study dry run, after real auth and Supabase Research are validated.

DO NOT IMPLEMENT BEFORE:
Do not create real participant records during UI/gameplay iteration.

CURRENT PLACEHOLDER:
No real participant roster in repo.

FILES INVOLVED:
`supabase/schema.sql`, `docs/DATA_DICTIONARY.md`, `docs/DATA_GOVERNANCE.md`.

FUTURE FILES:
Private seed/import script outside public frontend, protected codebook.

DEPENDENCIES:
Approved participant list, secure credential generation, storage procedure.

DATA IMPACT:
`apulab_participants`, auth attempts, study sessions.

SECURITY IMPACT:
Protect codebook, hash credentials, avoid committing real records.

ACCEPTANCE CRITERIA:
50 active participants can authenticate in staging; no raw credentials in repo.

MIGRATION NOTES:
Seed only via protected admin process; do not put real values in migrations committed to Git.

## Edge Functions

STATUS:
NOT IMPLEMENTED

CURRENT PHASE:
Contract and validation shell exist; production auth not active.

IMPLEMENT WHEN:
Supabase Research is selected as the persistence backend for study validation.

DO NOT IMPLEMENT BEFORE:
Do not deploy production Edge Functions while contracts are still changing.

CURRENT PLACEHOLDER:
`supabase/functions/ingest-telemetry/index.ts` validates and ingests known routes; auth route fails closed.

FILES INVOLVED:
`supabase/functions/ingest-telemetry/index.ts`, `src/systems/SupabaseClient.ts`.

FUTURE FILES:
Separated Edge Functions or route modules for auth, telemetry, posttest, impact aggregation.

DEPENDENCIES:
Supabase CLI, project secrets, staging project.

DATA IMPACT:
All Research writes and future Impact aggregation.

SECURITY IMPACT:
Service role remains server-side only; validate payloads and auth.

ACCEPTANCE CRITERIA:
Routes pass integration tests in staging and reject invalid payloads/secrets.

MIGRATION NOTES:
Keep client URL contract stable where possible; evolve route internals server-side.

## Row Level Security

STATUS:
READY FOR IMPLEMENTATION

CURRENT PHASE:
Schema/migration enables RLS; production policies still need live validation.

IMPLEMENT WHEN:
Supabase project is available for staging tests.

DO NOT IMPLEMENT BEFORE:
Do not loosen RLS to make frontend direct writes work.

CURRENT PLACEHOLDER:
RLS SQL exists in schema/migration; Edge Function expected to write with server privileges.

FILES INVOLVED:
`supabase/schema.sql`, `supabase/migrations/20260817023000_research_data_governance.sql`.

FUTURE FILES:
Supabase policy tests and deployment notes.

DEPENDENCIES:
Supabase CLI/psql, staging database.

DATA IMPACT:
Research tables and analysis views.

SECURITY IMPACT:
Prevents anon reads/writes to sensitive research tables.

ACCEPTANCE CRITERIA:
Anon cannot read/write Research tables; Edge Function can write validated records.

MIGRATION NOTES:
Validate policies in staging before study; do not bypass with frontend SDK.

## Persistent LocalQueue

STATUS:
NOT IMPLEMENTED

CURRENT PHASE:
Simple localStorage queue.

IMPLEMENT WHEN:
Before research validation and offline testing.

DO NOT IMPLEMENT BEFORE:
Do not optimize queue storage before event contract stabilizes.

CURRENT PLACEHOLDER:
`LocalQueueService` stores telemetry in `localStorage`.

FILES INVOLVED:
`src/systems/LocalQueueService.ts`, `src/systems/SyncService.ts`, `src/systems/TelemetryService.ts`.

FUTURE FILES:
`src/systems/queue/PersistentLocalQueue.ts` or IndexedDB adapter.

DEPENDENCIES:
Browser storage policy, retry requirements.

DATA IMPACT:
Pending events, sync status, local recovery.

SECURITY IMPACT:
No PII in local queue; safe cleanup rules.

ACCEPTANCE CRITERIA:
Events survive reload/offline, preserve idempotency, and sync once online.

MIGRATION NOTES:
Keep `TelemetryService` API stable; replace storage behind queue service.

## Offline To Online Sync

STATUS:
NOT IMPLEMENTED

CURRENT PHASE:
Immediate best-effort queue processing.

IMPLEMENT WHEN:
Before study dry run and network-loss QA.

DO NOT IMPLEMENT BEFORE:
Do not build complex retry while gameplay events are changing heavily.

CURRENT PLACEHOLDER:
`SyncService.processQueue()` sends current pending events.

FILES INVOLVED:
`src/systems/SyncService.ts`, `src/systems/LocalQueueService.ts`, `src/systems/research/ResearchRepository.ts`.

FUTURE FILES:
Retry scheduler, visibility/pagehide handler, network status listener.

DEPENDENCIES:
Stable event contract, Supabase Research staging endpoint.

DATA IMPACT:
Telemetry delivery guarantees and sync status.

SECURITY IMPACT:
No duplicate logical rows; no leaking sensitive payloads in retry logs.

ACCEPTANCE CRITERIA:
Offline play queues data; online recovery syncs once; duplicate `event_id` remains one row.

MIGRATION NOTES:
Preserve `event_id` and `sync_status` fields.

## Real POST Storage In Research

STATUS:
NOT IMPLEMENTED

CURRENT PHASE:
POST scene can call repository; mock stores locally.

IMPLEMENT WHEN:
POST content is finalized and Supabase Research is enabled.

DO NOT IMPLEMENT BEFORE:
Do not lock POST persistence while questions/versions are still changing.

CURRENT PLACEHOLDER:
`MockResearchRepository.savePosttestResponse()`.

FILES INVOLVED:
`src/game/scenes/PosttestScene.ts`, `src/systems/research/ResearchRepository.ts`, `supabase/schema.sql`.

FUTURE FILES:
Posttest validation tests, versioned questionnaire config.

DEPENDENCIES:
Final POST questions, `participant_id`, Supabase Research.

DATA IMPACT:
`apulab_posttest_responses`.

SECURITY IMPACT:
POST links by `participant_id` and `session_id`; no re-entry of credentials.

ACCEPTANCE CRITERIA:
Each POST answer persists once per session/question/version and appears in analysis view.

MIGRATION NOTES:
Keep scene repository-only; do not import Supabase into scene.

## Google Forms PRE Mapping

STATUS:
NOT IMPLEMENTED

CURRENT PHASE:
PRE remains external.

IMPLEMENT WHEN:
After participant roster and code hashing procedure are approved.

DO NOT IMPLEMENT BEFORE:
Do not ingest PRE into ApuLab during gameplay development.

CURRENT PLACEHOLDER:
Manual external Google Forms workflow.

FILES INVOLVED:
`docs/DATA_GOVERNANCE.md`, `docs/DATA_DICTIONARY.md`.

FUTURE FILES:
Private Colab/Pandas mapping notebook, protected codebook.

DEPENDENCIES:
Google Forms export, controlled hash/codebook procedure.

DATA IMPACT:
PRE dataset joined to Research by participant code hash or protected mapping.

SECURITY IMPACT:
Protect codebook; avoid direct identifiers in analysis exports.

ACCEPTANCE CRITERIA:
PRE can be joined to `participant_id` without exposing raw credentials.

MIGRATION NOTES:
Keep PRE outside the game unless governance changes.

## Google Colab / Pandas

STATUS:
NOT IMPLEMENTED

CURRENT PHASE:
Analysis views defined; notebooks not created.

IMPLEMENT WHEN:
After study data schema is validated and sample records exist.

DO NOT IMPLEMENT BEFORE:
Do not build analysis notebooks on unstable event names.

CURRENT PLACEHOLDER:
`apulab_*_analysis` views and docs.

FILES INVOLVED:
`supabase/schema.sql`, `docs/DATA_DICTIONARY.md`, `docs/EVENT_CATALOG.md`.

FUTURE FILES:
Private Colab notebook, export scripts.

DEPENDENCIES:
CSV export, Pandas, approved metrics.

DATA IMPACT:
Research analysis extracts.

SECURITY IMPACT:
No credential hashes, secrets, or raw PII in notebooks.

ACCEPTANCE CRITERIA:
Notebook loads exported views and computes approved research metrics reproducibly.

MIGRATION NOTES:
Export from analysis views, not raw admin tables.

## Looker Studio

STATUS:
NOT IMPLEMENTED

CURRENT PHASE:
No BI connection.

IMPLEMENT WHEN:
After Impact aggregation exists and public metrics are approved.

DO NOT IMPLEMENT BEFORE:
Never connect Looker directly to Research.

CURRENT PLACEHOLDER:
No dashboard.

FILES INVOLVED:
`docs/DATA_GOVERNANCE.md`, future Impact schema.

FUTURE FILES:
Looker data source docs, Impact export/view definitions.

DEPENDENCIES:
Supabase Impact, approved aggregate metrics.

DATA IMPACT:
Aggregated public impact metrics only.

SECURITY IMPACT:
No row-level research data exposed publicly.

ACCEPTANCE CRITERIA:
Looker reads only Impact aggregates and cannot reconstruct participant sessions.

MIGRATION NOTES:
Route Research -> aggregation -> Impact -> Looker.

## Research To Impact Aggregation

STATUS:
NOT IMPLEMENTED

CURRENT PHASE:
Research and Impact separation documented.

IMPLEMENT WHEN:
After Research schema and public metric definitions are stable.

DO NOT IMPLEMENT BEFORE:
Do not aggregate from unstable gameplay metrics.

CURRENT PLACEHOLDER:
No aggregation pipeline.

FILES INVOLVED:
`docs/DATA_GOVERNANCE.md`, future Impact repository.

FUTURE FILES:
Aggregation Edge Function or scheduled job, Impact tables/views.

DEPENDENCIES:
Supabase Research, Supabase Impact, metric approval.

DATA IMPACT:
Transforms individual research rows into anonymous aggregates.

SECURITY IMPACT:
Minimum group thresholds and no public participant-level rows.

ACCEPTANCE CRITERIA:
Impact tables contain only approved aggregates and pass privacy review.

MIGRATION NOTES:
Do not let frontend write Research rows directly to public dashboard.

## Public Impact Dashboard

STATUS:
NOT IMPLEMENTED

CURRENT PHASE:
No public dashboard.

IMPLEMENT WHEN:
After Impact aggregation and Looker/source policy are approved.

DO NOT IMPLEMENT BEFORE:
Do not publish any dashboard from Research.

CURRENT PLACEHOLDER:
None.

FILES INVOLVED:
Future Impact schema, Looker Studio configuration, deployment docs.

FUTURE FILES:
Dashboard embed/config, public metrics page if needed.

DEPENDENCIES:
Supabase Impact, Looker Studio or hosted dashboard, approved copy.

DATA IMPACT:
Public aggregate metrics.

SECURITY IMPACT:
No participant-level or small-cell disclosure.

ACCEPTANCE CRITERIA:
Dashboard shows only public aggregate metrics and can be reviewed without credentials.

MIGRATION NOTES:
Keep public dashboard independent from the game runtime.

## Backups

STATUS:
NOT IMPLEMENTED

CURRENT PHASE:
Backup policy documented only.

IMPLEMENT WHEN:
Before staging with real study-like data.

DO NOT IMPLEMENT BEFORE:
Do not create manual backup rituals without clear ownership.

CURRENT PLACEHOLDER:
Governance notes.

FILES INVOLVED:
`docs/DATA_GOVERNANCE.md`.

FUTURE FILES:
Backup runbook, export scripts.

DEPENDENCIES:
Supabase project, storage location, responsible owner.

DATA IMPACT:
Research and Impact tables.

SECURITY IMPACT:
Encrypted storage, controlled access, no public backups.

ACCEPTANCE CRITERIA:
Backup and restore procedure is tested before study launch.

MIGRATION NOTES:
Backups must not alter live schema or delete rows.

## Supabase Capacity Monitoring

STATUS:
NOT IMPLEMENTED

CURRENT PHASE:
Threshold policy documented.

IMPLEMENT WHEN:
Before production/study dry run.

DO NOT IMPLEMENT BEFORE:
Do not block current local development on capacity tooling.

CURRENT PLACEHOLDER:
Manual capacity policy in docs.

FILES INVOLVED:
`docs/DATA_GOVERNANCE.md`.

FUTURE FILES:
Monitoring runbook, SQL capacity queries, alert checklist.

DEPENDENCIES:
Supabase dashboard access, project limits, owner.

DATA IMPACT:
Operational metadata and storage/event volume.

SECURITY IMPACT:
Monitoring access should not expose participant data unnecessarily.

ACCEPTANCE CRITERIA:
Team can detect 60%, 75%, 85%, 90% thresholds before sessions are affected.

MIGRATION NOTES:
Monitoring must be read-only.

## Demo Retention Policy

STATUS:
NOT IMPLEMENTED

CURRENT PHASE:
DEMO remains local/mock.

IMPLEMENT WHEN:
When demo analytics start feeding Impact or shared deployments.

DO NOT IMPLEMENT BEFORE:
Do not design retention for data we are not yet collecting remotely.

CURRENT PLACEHOLDER:
Local browser storage.

FILES INVOLVED:
`src/systems/research/MockResearchRepository.ts`, future Impact repository.

FUTURE FILES:
Retention SQL/job, Impact cleanup policy.

DEPENDENCIES:
Supabase Impact, legal/operational retention decision.

DATA IMPACT:
DEMO sessions and aggregated demo events.

SECURITY IMPACT:
Prevent long-lived unnecessary demo data.

ACCEPTANCE CRITERIA:
DEMO data has clear TTL or aggregate-only storage.

MIGRATION NOTES:
Do not delete Research data under the DEMO retention job.

## Aggregate Metrics

STATUS:
NOT IMPLEMENTED

CURRENT PHASE:
Event catalog exists; aggregate definitions pending.

IMPLEMENT WHEN:
After gameplay and learning metrics are stable.

DO NOT IMPLEMENT BEFORE:
Do not lock metrics before scenarios are mapped.

CURRENT PLACEHOLDER:
Raw/mock telemetry and event catalog.

FILES INVOLVED:
`docs/EVENT_CATALOG.md`, `docs/DATA_DICTIONARY.md`.

FUTURE FILES:
Metric definitions, aggregation SQL/views.

DEPENDENCIES:
Stable events, research questions, Impact schema.

DATA IMPACT:
Derived Research and Impact metrics.

SECURITY IMPACT:
Small-cell suppression for public metrics.

ACCEPTANCE CRITERIA:
Metrics are reproducible from event catalog and documented with denominators.

MIGRATION NOTES:
Add derived metrics without renaming raw events.

## Production Deployment

STATUS:
NOT IMPLEMENTED

CURRENT PHASE:
Local Vite/Phaser development.

IMPLEMENT WHEN:
After build, runtime QA, Supabase mode policy, and study readiness checks pass.

DO NOT IMPLEMENT BEFORE:
Do not deploy production backend or study mode during scenario construction.

CURRENT PLACEHOLDER:
Local dev server and GitHub branch workflow.

FILES INVOLVED:
`package.json`, `vite.config.ts`, `.env.example`, future deployment docs.

FUTURE FILES:
Deployment runbook, environment variable checklist.

DEPENDENCIES:
Hosting provider, environment variables, production asset checks.

DATA IMPACT:
May enable public access and real data collection if configured.

SECURITY IMPACT:
Correct environment separation, no secrets in frontend, HTTPS.

ACCEPTANCE CRITERIA:
Production loads without 404/console errors and cannot collect STUDY data unless Research backend is active.

MIGRATION NOTES:
Use separate environment configs for mock/demo and research/study.

## Study Pre-Validation

STATUS:
NOT IMPLEMENTED

CURRENT PHASE:
Architecture hardening.

IMPLEMENT WHEN:
Immediately before any real participant pilot.

DO NOT IMPLEMENT BEFORE:
Do not run study validation until scenarios, POST, telemetry, auth, RLS, backups and monitoring are ready.

CURRENT PLACEHOLDER:
`npm run build`, local/manual QA, SQL test files not run locally.

FILES INVOLVED:
`docs/DATA_TEST_PLAN.md`, `supabase/tests/research_data_governance.sql`, `src/systems/research/*`.

FUTURE FILES:
End-to-end study checklist, staging QA script.

DEPENDENCIES:
Supabase CLI/psql, staging project, test participants.

DATA IMPACT:
Full study pipeline.

SECURITY IMPACT:
Final check for PII, credentials, RLS, auth and backups.

ACCEPTANCE CRITERIA:
Dry run proves login, session, gameplay events, POST, sync, export and dashboard boundaries.

MIGRATION NOTES:
Validation should certify the architecture; it should not redesign gameplay.
