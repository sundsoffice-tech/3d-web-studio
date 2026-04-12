# 3D Web Animation Studio

Dieses Projekt erstellt produktionsreife 3D-Animationen und interaktive 3D-Szenen fuer Websites.

## Tech Stack

| Kategorie | Primaer | Alternativ |
|-----------|---------|------------|
| 3D Engine | Three.js (r183+) | Babylon.js 9 |
| React Binding | @react-three/fiber v9 + drei v10 | Vanilla Three.js |
| Animation | GSAP 3.14 (ScrollTrigger, ScrollSmoother) | Motion 12 |
| Shader | TSL (Three.js Shading Language) | GLSL (nur WebGL) |
| Post-Processing | @react-three/postprocessing v3 | pmndrs/postprocessing |
| 3D Formate | GLB/glTF mit Draco + KTX2 | MeshOpt |
| Renderer | WebGPURenderer (Fallback: WebGLRenderer) | - |

## Code-Stil

- TypeScript mit striktem Modus
- ES Modules (`import`/`export`), kein CommonJS
- Funktionale React-Komponenten mit Hooks
- Keine `any`-Types -- explizite Typisierung fuer Three.js Objekte
- Alle 3D-Komponenten als separate Dateien unter `src/components/3d/`
- Shader-Code in eigenen `.ts`-Dateien mit TSL, nicht als Inline-Strings
- WICHTIG: `renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))` -- niemals unbegrenzt
- WICHTIG: Immer `dispose()` aufrufen fuer Geometrien, Materialien und Texturen bei Cleanup

## Projektstruktur

```
src/
  components/
    3d/           # R3F 3D-Komponenten (Szenen, Modelle, Effekte)
    ui/           # 2D UI-Overlays ueber 3D-Szenen
  shaders/        # TSL Shader-Module
  hooks/          # Custom React Hooks (useAnimation, useScroll3D, etc.)
  models/         # GLB/glTF Modell-Dateien (komprimiert)
  utils/          # Hilfsfunktionen (Loader, Performance-Utils)
  types/          # TypeScript Type-Definitionen
public/
  models/         # Statische 3D-Assets
  textures/       # Texturen (WebP/KTX2)
```

## Performance-Regeln

- Maximale initiale Bundle-Groesse fuer 3D: 200KB (gzip), Rest lazy-loaden
- GLB-Modelle immer mit Draco komprimieren, Texturen als WebP oder KTX2
- `InstancedMesh` fuer wiederholte Geometrien (>3 gleiche Objekte)
- `BatchedMesh` fuer verschiedene Geometrien die zusammen gerendert werden
- LOD (`<Detailed />` aus drei) fuer Modelle >50K Triangles
- `<Suspense>` mit Fallback fuer alle 3D-Komponenten
- `prefers-reduced-motion` respektieren -- Animationen deaktivieren oder vereinfachen
- OffscreenCanvas fuer rechenintensive Szenen evaluieren

## Befehle

```bash
npm run dev          # Entwicklungsserver starten
npm run build        # Produktions-Build
npm run lint         # ESLint + TypeScript Check
npm run optimize     # GLB-Modelle optimieren (gltf-transform)
```

## Wichtige Hinweise

- WebGPU als Standard-Renderer verwenden, WebGL als Fallback
- TSL (Three.js Shading Language) fuer neue Shader, kein rohes GLSL
- GSAP ist seit Mai 2025 komplett kostenlos (Webflow-Uebernahme)
- R3F v9 benoetigt React 19+
- `@react-three/postprocessing` v3 ist ESM-only und braucht React 19+
- Timer statt Clock (Clock ist deprecated seit r183)
