/**
 * Optimiert alle GLB-Dateien in src/models/ und public/models/
 * Verwendet gltf-transform fuer Draco-Komprimierung und WebP-Texturen
 *
 * Usage: npm run optimize
 */

import { execSync } from 'child_process'
import { readdirSync, statSync } from 'fs'
import { join, basename, extname } from 'path'

const MODEL_DIRS = ['src/models', 'public/models']

function findGlbFiles(dir) {
  try {
    return readdirSync(dir)
      .filter((f) => extname(f).toLowerCase() === '.glb')
      .map((f) => join(dir, f))
  } catch {
    return []
  }
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const files = MODEL_DIRS.flatMap(findGlbFiles)

if (files.length === 0) {
  console.log('Keine GLB-Dateien gefunden in:', MODEL_DIRS.join(', '))
  process.exit(0)
}

console.log(`\n${files.length} GLB-Datei(en) gefunden\n`)

for (const file of files) {
  const name = basename(file)
  const sizeBefore = statSync(file).size
  const optimized = file.replace('.glb', '-optimized.glb')

  console.log(`Optimiere: ${name} (${formatSize(sizeBefore)})`)

  try {
    execSync(
      `npx @gltf-transform/cli optimize "${file}" "${optimized}" --compress draco --texture-compress webp`,
      { stdio: 'pipe' }
    )

    const sizeAfter = statSync(optimized).size
    const reduction = ((1 - sizeAfter / sizeBefore) * 100).toFixed(1)
    console.log(
      `  -> ${basename(optimized)} (${formatSize(sizeAfter)}, -${reduction}%)\n`
    )
  } catch (error) {
    console.error(`  Fehler bei ${name}:`, error.message)
  }
}

console.log('Fertig!')
