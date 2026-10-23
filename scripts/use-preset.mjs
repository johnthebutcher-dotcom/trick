#!/usr/bin/env node
/**
 * Switch the active style preset.
 *   npm run preset -- bold-dark
 * Rewrites src/styles/presets/active.css and reminds you of the two manual
 * values that live outside CSS (manifest theme_color and the <meta theme-color>).
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const presetsDir = join(root, 'src', 'styles', 'presets')
const index = JSON.parse(readFileSync(join(presetsDir, 'presets.json'), 'utf8'))

const name = process.argv[2]
const preset = index.presets.find((p) => p.name === name)

if (!preset) {
  console.error(
    `Unknown preset "${name ?? ''}". Available: ${index.presets.map((p) => p.name).join(', ')}`,
  )
  process.exit(1)
}
if (!existsSync(join(presetsDir, preset.file))) {
  console.error(`Preset file missing: ${preset.file}`)
  process.exit(1)
}

writeFileSync(
  join(presetsDir, 'active.css'),
  `/* Managed by \`npm run preset -- <name>\`. Do not add anything else here. */\n@import './${preset.file}';\n`,
)

console.log(`Active preset: ${preset.name}`)
console.log(
  `Now set theme_color in vite.config.ts and <meta name="theme-color"> in index.html to ${preset.themeColor}.`,
)
console.log(`Read ${preset.rules} before building UI.`)
