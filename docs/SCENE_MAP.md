# Scene Map

Este mapa resume el estado funcional de escenas y sus dependencias futuras. Las escenas pueden avanzar usando mocks cuando una integracion futura esta documentada.

| Scene | Status | Current Data | Future Dependencies |
| --- | --- | --- | --- |
| `BootScene` | ACTIVE | Asset packs / preload | none |
| `MainMenuScene` | ACTIVE | `GameState.hasRecoverableSession()` | PRODUCTION-DEPLOY |
| `ParticipantCodeScene` | ACTIVE | `ResearchRepository`, `MockResearchRepository` for DEMO | RESEARCH-BACKEND, AUTH-REAL, STUDY-CREDENTIALS |
| `OpportunityIntroScene` | ACTIVE | `TelemetryService` | none |
| `Level1RoverLabScene` | ACTIVE / PLACEHOLDER GAMEPLAY | `TelemetryService`, `LocalQueueService` through sync | OFFLINE-SYNC |
| `Level2HubbleScene` | ACTIVE / PLACEHOLDER GAMEPLAY | `TelemetryService`, `LocalQueueService` through sync | OFFLINE-SYNC |
| `Level3ProgrammingScene` | ACTIVE / PLACEHOLDER GAMEPLAY | `TelemetryService`, `LocalQueueService` through sync | OFFLINE-SYNC |
| `PosttestScene` | ACTIVE / MOCK DATA | `ResearchRepository`, `MockResearchRepository`, `TelemetryService` | RESEARCH-BACKEND, POST-PERSISTENCE |
| `FinalScene` | ACTIVE | `ResearchRepository.completeSession()`, `ExportService` | RESEARCH-BACKEND, OFFLINE-SYNC |
| `PretestScene` | LEGACY / NOT OFFICIAL FLOW | `TelemetryService` | PRE-MAPPING only if PRE ever returns in-game |

Future dependencies must use IDs from `docs/FUTURE_IMPLEMENTATION.md` and `src/config/futureImplementation.ts`.
