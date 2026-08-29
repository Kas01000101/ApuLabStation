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

Familia oficial unica:

- Primary family: Poppins.
- Buttons: Poppins Bold 700.
- Headings: Poppins Bold 700.
- Body: Poppins Regular 400.
- Medium: Poppins Medium 500.
- Semibold: Poppins SemiBold 600.

Current implemented font:

- `Poppins` via `@fontsource/poppins`.
- Loaded weights: 400, 500, 600, 700.

Target visual font:

- Poppins Rounded.
- Status: future / pending asset. Do not use `"Poppins Rounded"` in CSS until the real legal font family/package is present in the project.

Escala base para `1280x720`:

- Display XL: 52 px, Bold.
- Display L: 40 px, Bold.
- Heading: 30 px, SemiBold/Bold.
- Button: 24 px, Bold.
- Body: 20 px, Regular/SemiBold.
- Small: 15 px, Regular.
- Modal title: 30 px, Bold 700.
- Modal labels: 17 px, SemiBold 600.
- Modal inputs/body: 18 px, Regular 400.
- Modal action buttons: 21 px, SemiBold 600.
- Modal support copy: 15 px, Regular 400.
- Future narrative/dialogue emphasis: Medium Italic 500.

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

- Width: 340 px.
- Height: 64 px.
- Radius: 28 px.
- Vertical gap: 14 px.
- Inner padding horizontal: 24 px.
- Text: Poppins Bold 700, 24 px, mayusculas, `#FFFFFF`.
- Construccion: `Container` con `shadow`, `body`, `highlight`, `label`.
- Sin PNG de boton.
- Sin texto en imagen.
- Sin iconos.

Paleta oficial del Main Menu:

- `primary`: body `#F4C75E`, shadow `#D5A43D`, border `#FFE5A3`, highlight `#FFF3C8`, text `#FFFFFF`.
- `secondary`: body `#49C9D7`, shadow `#269AAA`, border `#A8EDF1`, highlight `#C9F6F7`, text `#FFFFFF`.
- `utilityDark`: body `#6960B8`, shadow `#4E478F`, border `#A9A1DF`, highlight `#C6C0EC`, text `#FFFFFF`.
- `utilityLight`: body `#9284D2`, shadow `#7064AE`, border `#C7BEEF`, highlight `#DDD7F7`, text `#FFFFFF`.

Borde: 2 px, claro, suave y cromaticamente ligado a la variante.

Sombra/extrusion: offset inferior 4 px, usando el shadow semantico de cada variante. No usar sombra negra fuerte.

Highlight: capsule superior delgada dentro del boton, alpha bajo. No debe dominar visualmente.

Variantes:

- `primary`: INICIAR MISION.
- `secondary`: CONTINUAR.
- `utilityDark`: AJUSTES.
- `utilityLight`: CREDITOS.

Estados:

- Normal: escala `1`.
- Hover: escala `1.02`, color levemente mas luminoso.
- Pressed: escala `0.97`, `y + 2 px`, extrusion menor.
- Pointer out: regresar exactamente a normal.

## Challenge HUD

HUD superior para challenges dentro de misiones, como `MISSION 01 · VOLTAJE`.

Debe sentirse como UI de videojuego educativo pulido, no como dashboard web. Usar controles solidos, claros, con volumen amable, borde grueso y sombra inferior. Evitar paneles negros transparentes, neon como estructura principal, outlines finos y botones minimos.

Top left:

- Titulo compacto, por ejemplo `VOLTAJE`.
- Instruccion secundaria debajo, por ejemplo `Conecta las puntas para medir el voltaje`.
- No encerrar la instruccion en una card grande.

Top right:

- Orden exacto: `VER EXPLICACION`, boton de libro, badge de progreso.
- Los tres elementos comparten altura, baseline, radio y espaciado visual.
- Safe area aproximada en canvas `1672x941`: top `56px`, right `72px`, left `72px`.
- Gap recomendado: `20px`.

Game HUD Button:

- Construccion por capas visibles: `BottomDepth`, `OuterBorder`, `MainBody`, `TopHighlight`, `Content`.
- El boton no debe parecer una pill web ni depender de glassmorphism.
- Variante principal amarilla para `VER EXPLICACION`.
- Width para explicacion `264px`.
- Height de cuerpo `60px`.
- Depth inferior `7px`.
- Radius `18px`.
- Fondo solido amarillo/oro con variacion vertical sutil: top `#FFD84D`, body `#FFC928`, bottom `#F2A900`.
- Borde externo marron/dorado oscuro `#7A4B00` de `4px`.
- Profundidad inferior `#A96600`.
- Highlight superior `#FFF3A6`.
- Medallon circular naranja/dorado `34px` con icono play blanco.
- Texto Poppins Bold, `20px`, marron oscuro `#4A2E00`.

Boton icon-only:

- Size `62x62px` mas depth inferior.
- Reutiliza exactamente la construccion fisica del boton de explicacion.
- Variante secundaria violeta: top `#8E7CFF`, body `#705CF6`, bottom `#5943D7`, border `#31238A`, depth `#3929A3`.
- Iconografia por `Phaser.Graphics`, redondeada y gruesa.
- No usar emoji.

Progress badge:

- No es interactivo y no debe tener cursor ni estados hover/pressed.
- Width `88px`.
- Height `60px`.
- Fondo cyan informativo: top `#72E7F2`, body `#45D7E8`, bottom `#20B4C8`.
- Borde `#126879`, depth menor `4px`.
- Texto Poppins Bold `24px`, `#073D48`, formato dinamico `current / total`.

Estados interactivos:

- Normal: elevado.
- Hover: escala maxima `1.015`, mover la cara como maximo `-1px`, cuerpo levemente mas brillante.
- Pressed: mover solo la cara del boton `5px` hacia abajo y reducir la profundidad visible.
- Duracion: `120ms`, easing `Sine.easeOut`.

Implementacion:

- Usar `src/ui/tokens.ts` como fuente de medidas y colores.
- Usar componentes Phaser reutilizables para no duplicar construccion por capas.
- No instalar librerias UI para esta familia de controles.

## Access Modal

Modal oficial para `INICIAR MISION` desde el Main Menu.

Visual language:

- Casual-game layered modal.
- No formulario SaaS.
- Construccion por capas: backdrop, extrusion, outer frame, inner border, light body, header plate, content, buttons.

Backdrop:

- Fondo del Main Menu visible: `menu_background`, `hopper_menu`, `apulab_logo`.
- Blur suave: `5px`.
- Dim violeta/neutral: `rgba(30, 23, 62, 0.32)`.
- No reemplazar el fondo por pantalla azul/navy completa.

Body:

- Width: `490px`.
- Min height: `410px`.
- Radius: `32px`.
- Body: `#F4EEFF`.
- Body highlight: `#FFFDFB`.
- Outer frame: `#8E7DCE`.
- Inner border: `#EEE7FF`.
- Shadow / extrusion: `#4E478F`, offset visual inferior `11px`.

Header:

- Plate superior en forma de capsule, sobresale del body.
- Width: `315px`.
- Height: `68px`.
- Body: `#6960B8`.
- Border: `#C7BEEF`.
- Highlight: `#DDD7F7`.
- Text: `#FFFFFF`.
- Size: `30px`.
- Weight: `700`.

Typography:

- Font target futuro: Poppins Rounded.
- Estado actual: Poppins normal mediante `@fontsource/poppins`.
- Pesos cargados para el modal: 400, 500, 600, 700.
- Titulo: Bold 700, `30px`, blanco, sin tracking agresivo.
- Labels: SemiBold 600, `17px`, violeta profundo.
- Inputs y placeholders: Regular 400, `18px`.
- Botones: SemiBold 600.
- Texto de soporte: Regular 400, `15px`.
- Narrativa futura: Medium Italic 500.
- No fingir disponibilidad de Poppins Rounded si no esta instalada.

Inputs:

- Width: `360px`.
- Height: `54px`.
- Radius: `18px`.
- Background: `#FFFDFB`.
- Text: `#302A52`.
- Placeholder: `#8F86A8`.
- Border: `#C7BEEF`.
- Focus border: `#49C9D7`.
- Labels: deep violet, semibold, `17px`, alineadas a izquierda.

Primary action:

- Text: `Continuar`.
- Width: `320px`.
- Height: `60px`.
- Body: `#F4C75E`.
- Highlight: `#FFF3C8`.
- Border: `#FFE5A3`.
- Shadow: `#D5A43D`.
- Text: `#FFFFFF`.

Demo action:

- Text helper: `¿No tienes credenciales?`.
- Text: `Modo demo`.
- Width: `238px`.
- Height: `54px`.
- Body: `#9284D2`.
- Highlight: `#DDD7F7`.
- Border: `#C7BEEF`.
- Shadow: `#7064AE`.
- Text: `#FFFFFF`.
- No usar rojo para DEMO.

Close button:

- Size: `42px`.
- Round capsule.
- Body/header lavender-purple.
- Text: `#FFFFFF`.
- Hover scale: `1.04`.
- Pressed scale: `0.95`.

Motion:

- Entry: backdrop fade, modal `opacity 0 -> 1`, `scale 0.96 -> 1`, `190ms`.
- Exit: modal `scale 1 -> 0.97`, `opacity 1 -> 0`, `140ms`; backdrop fade out.

Responsabilidades:

- `MainMenuLayout.scene`: arte del menu.
- `MainMenuScene.ts`: abrir/cerrar modal y flujo.
- `AccessModal.ts`: estructura DOM visual e interaccion del modal.
- Repository: mock/futuro backend.

## Responsabilidades

- `MainMenuLayout.scene`: arte editable en Phaser Editor, como `menu_background`, `hopper_menu`, `apulab_logo`.
- `MainMenuScene.ts`: UI funcional, navegacion y estado.
- `ApuButton.ts`: componente visual/interactivo reutilizable.
- `GameState`: decide si `CONTINUAR` existe.

Antes de crear componentes como `DialoguePanel`, `ChallengeHeader`, `HintButton`, `FeedbackPanel` o `ProgressIndicator`, leer este documento y usar `src/ui/tokens.ts`.
