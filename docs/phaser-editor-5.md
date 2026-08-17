# Phaser Editor 5 Compatibility Notes

ApuLab keeps the Vite + TypeScript project layout. Phaser Editor 5 can open projects without requiring a special layout, but its visual tools work best when assets and scene-editor files are organized explicitly.

Recommended next structure, when real assets are introduced:

```text
public/
  assets/
    boot/
    common/
      ui/
      characters/
      backgrounds/
    intro/
    level1/
      energy/
        level1-energy-pack.json
src/
  game/
    scenes/
      editor/
        Level1A_Energy.scene
```

Notes:

- Put browser-served art/audio under `public/assets/` so Vite copies it directly to `dist`.
- Use Phaser Editor Asset Pack files for image/audio/font declarations before creating visual `.scene` files.
- Keep generated `.scene` files separate from hand-authored gameplay systems and evaluators.
- Do not move telemetry, persistence, or challenge evaluation into Phaser Editor generated files.
- The first candidate Scene Editor file should be `Level1A_Energy.scene` after the architecture is frozen.

## Level 1A Visual Pipeline

The Level 1A asset pack lives at:

```text
public/assets/level1/energy/level1-energy-pack.json
```

It starts with an empty `level1_energy` section so Phaser Editor can register future image entries without introducing temporary PNGs. Planned stable keys:

```text
background_lab
scientist
rover
battery_a
battery_b
battery_c
multimeter
icon_hint
panel_dialogue
panel_feedback
```

Create the first Scene Editor file from Phaser Editor 5, not by hand:

1. Open this repository folder in Phaser Editor 5.
2. In `Files`, select `src/game/scenes/editor`.
3. Choose `New File`.
4. Choose `Scene File`.
5. Name it `Level1A_Energy.scene`.
6. Set the scene display size to the project reference resolution: `1280 x 720`.
7. Add images by first placing PNGs under `public/assets/level1/energy/`, then registering them in `level1-energy-pack.json`.

Keep the `.scene` responsible for presentation only: position, scale, origin, rotation, depth, containers, layers, and texture references. Gameplay interaction, scientific evaluation, telemetry, and persistence stay in TypeScript systems/controllers.
