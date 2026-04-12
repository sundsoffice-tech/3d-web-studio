---
name: visual-qa
description: Automatische visuelle Qualitaetspruefung fuer 3D-Szenen via Puppeteer-Screenshots. MUSS vor Abschluss jeder 3D-Arbeit ausgefuehrt werden. Prueft ob Modelle korrekt zusammengesetzt sind, Positionierung stimmt, und die Szene visuell funktioniert.
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, Agent, WebSearch
---

# Visual QA -- Automatische 3D-Szenenpruefung

DIESEN SKILL VOR JEDER FERTIGMELDUNG VON 3D-ARBEIT AUSFUEHREN.

## Ablauf

### 0. PFLICHT: Referenzcode recherchieren BEVOR du selbst baust

Bevor du 3D-Modelle aus Primitiven zusammensetzt, IMMER erst Referenzcode suchen:

1. **Web-Recherche** nach mindestens 3 Beispielen:
   - `"Three.js CapsuleGeometry character"` / `"R3F human figure primitives"`
   - GitHub-Repos (mannequin.js, Codrops 3D character tutorials)
   - Three.js Forum Posts zu Koerper-Aufbau
2. **Geometrie-Parameter verifizieren** anhand der Three.js Docs:
   - CapsuleGeometry: `args=[radius, cylinderHeight, capSegments, radialSegments]`
   - Total height = cylinderHeight + 2 * radius
   - Default-Achse = Y (nach oben)
   - `rotation=[PI/2, 0, 0]` dreht auf Z-Achse (liegend)
3. **Positionen berechnen statt schaetzen**:
   - Jede Position muss aus den exakten Geometrie-Massen abgeleitet sein
   - Torso-Top = torsoCenter.z - (cylinderHeight/2 + radius)
   - Naechstes Teil startet DORT, nicht irgendwo daneben
4. **Ketten-Prinzip**: Jedes Koerperteil wird relativ zum vorherigen positioniert.
   Gelenk-Spheres muessen Radius >= Capsule-Radius der angrenzenden Teile haben.

### 1. Dev-Server pruefen
```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/ || echo "not running"
```
Falls nicht laeuft: `npm run dev` starten.

### 2. Screenshot nehmen
```bash
node scripts/screenshot.mjs http://localhost:PORT output.png 5000
```

### 3. Screenshot lesen und analysieren
Das Bild mit dem Read-Tool oeffnen und pruefen:

**Strukturelle Checks:**
- Sind alle 3D-Objekte sichtbar?
- Sind zusammengesetzte Modelle (Menschen, Maschinen) zusammenhaengend oder zerstueckelt?
- Durchschneiden sich Teile die nicht sollen?
- Stimmen die Proportionen?
- Liegen Objekte AUF Oberflaechen oder schweben sie darueber?

**Visuelle Checks:**
- Sind Materialien sichtbar (nicht schwarz/unsichtbar)?
- Funktioniert die Beleuchtung?
- Ist die Kameraposition sinnvoll?

### 4. Bei Problemen: Multi-Winkel-Debug
Falls ein Problem erkannt wird:
1. Isolierte Komponente in DebugView mit OrbitControls rendern
2. Screenshots aus 3/4, Seite, Front nehmen (Kamera in DebugDude.tsx aendern)
3. Problem identifizieren
4. **Referenzcode aus Schritt 0 konsultieren** -- nicht raten
5. Fix anwenden, erneut Screenshot nehmen
6. Wiederholen bis sauber

### 5. Erst bei sauberem Screenshot: Fertig melden
Nach jedem Fix erneut Screenshot nehmen und pruefen.
Mindestens 2 Winkel muessen sauber aussehen.

## Screenshot-Script Referenz
Liegt in `scripts/screenshot.mjs`. Braucht Puppeteer (`npm i -D puppeteer`).
Parameter: `node scripts/screenshot.mjs [URL] [OUTPUT] [WAIT_MS]`

## DebugView Referenz
`src/components/3d/automation/DebugDude.tsx` -- isolierte Debug-Ansicht.
In App.tsx temporaer einbinden: `import { DebugDude } from '...'`
Kamera-Position in DebugDude.tsx aendern fuer verschiedene Winkel.
Nach Debug App.tsx zurueck auf AutomationPage setzen.
