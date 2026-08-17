# Phaser Editor 5 Compatibility Notes

ApuLab keeps the Vite + TypeScript project layout. Phaser Editor 5 can open projects without requiring a special layout, but its visual tools work best when assets and scene-editor files are organized explicitly.

Recommended next structure, when real assets are introduced:

```text
public/
  assets/
    boot/
      boot-asset-pack.json
    intro/
      intro-asset-pack.json
    level-1-rover-lab/
      level-1-rover-lab-pack.json
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
