# ApuLab UI Design System

Este documento es la fuente oficial de verdad visual para ApuLab Station junto con `src/ui/tokens.ts`.

## Principios Visuales

ApuLab debe sentirse amigable, espacial, STEM, infantil sin ser infantilizado, pastel, moderno, limpio, ligeramente futurista, accesible y coherente.

Evitar neon excesivo, bordes agresivos, interfaces arcade genericas, UI oscura pesada, elementos visuales que parezcan de otro juego, demasiados colores compitiendo, fuentes diferentes entre escenas, botones con dimensiones arbitrarias y texto convertido en PNG.

## Paleta

La paleta usa nombres semanticos, no nombres numerados. Reutiliza estos grupos antes de introducir cualquier color nuevo.

- Brand Purple: violeta espacial para identidad, paneles y UI de soporte.
- Brand Lavender: lavanda pastel para superficies suaves y elementos secundarios.
- Brand Cyan: turquesa/cian suave para acentos, datos y estados de foco.
- Brand Cream: crema calido para texto sobre oscuro y highlights suaves.
- Action Primary: amarillo mantequilla/dorado pastel para acciones principales.
- Action Secondary: turquesa pastel para acciones de continuacion.
- Utility Dark: violeta profundo para acciones funcionales.
- Utility Light: lavanda para acciones neutrales.
- Text Primary: navy/violeta muy oscuro.
- Text On Dark: blanco crema.
- Success: verde suave.
- Warning: amarillo calido.
- Error: coral suave.

## Tipografia

Maximo dos familias:

- Display y botones: Fredoka SemiBold/Bold.
- Body y dialogos: Nunito Sans Regular/SemiBold.

Escala base para `1280x720`:

- Display XL: 52 px, Bold.
- Display L: 40 px, Bold.
- Heading: 30 px, SemiBold/Bold.
- Button: 26 px, SemiBold.
- Body: 20 px, Regular/SemiBold.
- Small: 15 px, Regular.

Los botones no usan cursiva. La cursiva se reserva para narrativa o enfasis de dialogo.

## Spacing

Usar la escala `4, 8, 12, 16, 24, 32, 48`. No introducir valores arbitrarios si existe un token equivalente.

## Border Radius

- Small: 8 px.
- Medium: 16 px.
- Large: 28 px.
- Pill: 999 px.

## Elevation

Usar elevacion suave:

- shadowSmall para paneles chicos.
- shadowMedium para tarjetas y dialogos.
- shadowButton para botones con extrusion inferior ligera.

La UI debe tener volumen amable, no una estetica arcade dura.

## Motion

Duraciones:

- Fast: 120 ms.
- Normal: 180 ms.
- Slow: 260 ms.

Easing recomendado: `Sine.easeOut`. Evitar vibraciones, destellos rapidos y movimientos exagerados.

## ApuButton v1

Boton oficial de menu y acciones principales:

- Width: 360 px.
- Height: 72 px.
- Radius: 28 px.
- Vertical gap: 16 px.
- Text: Fredoka SemiBold, 26 px, mayusculas.
- Construccion: `Container` con `shadow`, `body`, `highlight`, `label`.
- Sin PNG de boton.
- Sin texto en imagen.
- Sin iconos en v1.

Variantes:

- `primary`: INICIAR MISION.
- `secondary`: CONTINUAR.
- `utilityDark`: AJUSTES.
- `utilityLight`: CREDITOS.

Estados:

- Normal: escala `1`.
- Hover: escala `1.025`, color levemente mas luminoso.
- Pressed: escala `0.97`, `y + 2 px`, extrusion menor.
- Pointer out: regresar exactamente a normal.

## Responsabilidades

- `MainMenuLayout.scene`: arte editable en Phaser Editor, como `menu_background`, `hopper_menu`, `apulab_logo`.
- `MainMenuScene.ts`: UI funcional, navegacion y estado.
- `ApuButton.ts`: componente visual/interactivo reutilizable.
- `GameState`: decide si `CONTINUAR` existe.

Antes de crear componentes como `DialoguePanel`, `ChallengeHeader`, `HintButton`, `FeedbackPanel` o `ProgressIndicator`, leer este documento y usar `src/ui/tokens.ts`.
