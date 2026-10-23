#!/usr/bin/env node
/**
 * Enforce the effects checklist: every effect utility used in src/ must be
 * ticked in docs/SPEC.md under "## Effects". Runs as part of `npm run check`.
 *
 * - Skips with a notice when SPEC.md has no filled-in Effects section
 *   (the starter template itself, or a non-UI change).
 * - The styleguide page is exempt: it exists to show everything.
 * - A line containing `effects-allow: name, name` in a file exempts those
 *   utilities for that file (use sparingly, say why in the build log).
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const root = join(new URL('.', import.meta.url).pathname, '..')
const specPath = join(root, 'docs', 'SPEC.md')
const menuPath = join(root, 'docs', 'effects-menu.md')

// utility -> menu item label, built from the menu's parenthesised names
const menu = readFileSync(menuPath, 'utf8')
const itemRe = /^- \[( |x|X)\] (.+?) \((.+?)\)\s*$/gm
const utilityToItem = new Map()
for (const m of menu.matchAll(itemRe)) {
  const label = m[2]
  for (const raw of m[3].split(',')) {
    const name = raw.trim().replace(/^`|`$/g, '')
    if (!name || name.includes(' ') || name.startsWith('--')) continue
    utilityToItem.set(name, label)
  }
}

// What the spec allows
let spec = ''
try {
  spec = readFileSync(specPath, 'utf8')
} catch {
  console.log('check-effects: no docs/SPEC.md, skipping')
  process.exit(0)
}
const section = spec.split(/^## Effects.*$/m)[1]?.split(/^## /m)[0] ?? ''
const ticked = [...section.matchAll(/^- \[(x|X)\] (.+?) \((.+?)\)/gm)]
if (!/\[(x|X)\]/.test(section)) {
  console.log(
    'check-effects: no effects ticked in docs/SPEC.md (template or non-UI change), skipping',
  )
  process.exit(0)
}
const allowed = new Set()
for (const t of ticked) {
  for (const raw of t[3].split(',')) {
    const name = raw.trim().replace(/^`|`$/g, '')
    if (name) allowed.add(name)
  }
}
allowed.add('animate-fade-up').add('skeleton') // on by default in the shell

// Scan source
function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) walk(full, out)
    else if (/\.(tsx|ts|css)$/.test(entry)) out.push(full)
  }
  return out
}
const files = walk(join(root, 'src')).filter(
  (f) => !/StyleguidePage\.tsx$/.test(f) && !/\/styles\//.test(f) && !/\.test\.tsx?$/.test(f),
)

const patternNames = [...utilityToItem.keys()].filter((n) => !n.endsWith(':') && !n.endsWith('*'))
const prefixNames = [...utilityToItem.keys()].filter((n) => n.endsWith(':') || n.endsWith('*'))
const violations = []
for (const file of files) {
  const raw = readFileSync(file, 'utf8')
  const fileAllow = new Set(
    [...raw.matchAll(/effects-allow:\s*([^\n(*]+)/g)].flatMap((m) =>
      m[1].split(',').map((s) => s.trim()),
    ),
  )
  // Only code counts: strip block and line comments so prose never trips the check.
  const text = raw.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1')
  const used = new Set()
  for (const name of patternNames) {
    const re = new RegExp(
      `(^|[\\s"'\`])${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}($|[\\s"'\`])`,
    )
    if (re.test(text)) used.add(name)
  }
  for (const name of prefixNames) {
    const base = name.replace(/[:*]$/, '')
    const re = new RegExp(`(^|[\\s"'\`])${base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\w-]*:`)
    if (name.endsWith(':') ? re.test(text) : new RegExp(`(^|[\\s"'\`])${base}[\\w-]+`).test(text))
      used.add(name)
  }
  for (const name of used) {
    if (allowed.has(name) || fileAllow.has(name)) continue
    violations.push({ file: relative(root, file), name, item: utilityToItem.get(name) })
  }
}

if (violations.length === 0) {
  console.log(`check-effects: ok (${allowed.size} effects allowed by docs/SPEC.md)`)
  process.exit(0)
}
console.error('check-effects: effects used that were not ticked in docs/SPEC.md → Effects:')
for (const v of violations) console.error(`  ${v.file}: ${v.name}  (menu item: ${v.item})`)
console.error('Tick them in the spec after the owner agrees, or remove them.')
process.exit(1)
