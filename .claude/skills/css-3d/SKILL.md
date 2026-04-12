---
name: css-3d
description: Erstellt CSS-basierte 3D-Transformationen und Animationen. Card Flips, Parallax, Perspektive-Effekte, 3D-Karussells. Kein WebGL noetig. Trigger bei "CSS 3D", "Card Flip", "CSS Perspektive", "CSS Transform 3D", "leichtgewichtiger 3D-Effekt".
allowed-tools: Read, Write, Edit, Glob, Grep
---

# CSS 3D-Effekte

Erstelle einen CSS 3D-Effekt fuer: $ARGUMENTS

## Wann CSS 3D statt WebGL

CSS 3D verwenden wenn:
- Weniger als ~50 transformierte Elemente
- DOM-Integration noetig (Text, Links, Formulare)
- Einfache 3D-Effekte (Flip, Rotate, Parallax)
- Kein Lighting/Shading erforderlich
- Maximale Browser-Kompatibilitaet gewuenscht

WebGL/Three.js verwenden wenn:
- 3D-Modelle, komplexe Geometrie
- Beleuchtung, Schatten, Reflektionen
- Tausende von Objekten
- Shader-Effekte, Partikel

## Patterns

### Card Flip

```css
.card-container {
  perspective: 1000px;
  width: 300px;
  height: 400px;
}

.card {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-container:hover .card,
.card-container:focus-within .card {
  transform: rotateY(180deg);
}

.card-front,
.card-back {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  border-radius: 12px;
}

.card-back {
  transform: rotateY(180deg);
}
```

### Parallax Layers

```css
.parallax-container {
  perspective: 1px;
  height: 100vh;
  overflow-x: hidden;
  overflow-y: auto;
}

.parallax-layer {
  position: absolute;
  inset: 0;
}

.parallax-layer--back {
  transform: translateZ(-2px) scale(3);
}

.parallax-layer--mid {
  transform: translateZ(-1px) scale(2);
}

.parallax-layer--front {
  transform: translateZ(0);
}
```

### 3D Tilt auf Hover (mit JS)

```tsx
function TiltCard({ children }: { children: React.ReactNode }) {
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent) => {
    const card = cardRef.current!
    const rect = card.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5

    card.style.transform = `
      perspective(1000px)
      rotateX(${y * -10}deg)
      rotateY(${x * 10}deg)
      scale3d(1.02, 1.02, 1.02)
    `
  }

  const handleMouseLeave = () => {
    cardRef.current!.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1,1,1)'
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transition: 'transform 0.1s ease-out',
        transformStyle: 'preserve-3d',
        willChange: 'transform',
      }}
    >
      {children}
    </div>
  )
}
```

## Performance-Tipps

- `will-change: transform` sparsam einsetzen (nur auf animierten Elementen)
- `transform: translateZ(0)` oder `translate3d(0,0,0)` erzwingt GPU-Compositing
- `backface-visibility: hidden` reduziert Rendering-Aufwand
- `contain: layout style paint` auf Container
- GSAP oder Motion fuer komplexe Sequenzen statt CSS Keyframes
