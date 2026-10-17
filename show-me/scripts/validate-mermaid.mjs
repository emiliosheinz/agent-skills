#!/usr/bin/env node
// Validates Mermaid sources with Mermaid's own parser, with no browser.
//
//   node validate-mermaid.mjs file.md [more.md ...]
//   cat view.mmd | node validate-mermaid.mjs
//
// Input may be raw Mermaid or Markdown containing ```mermaid fences; every
// fence is checked. Prints OK, or one `line N: message` per failure and exits
// 1. Dependencies install once into a cache directory outside the project.

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const CACHE = join(
  process.env.XDG_CACHE_HOME || join(homedir(), ".cache"),
  "show-me",
  "mermaid-validator",
)

function ensureDeps() {
  if (existsSync(join(CACHE, "node_modules", "mermaid"))) return
  mkdirSync(CACHE, { recursive: true })
  writeFileSync(
    join(CACHE, "package.json"),
    JSON.stringify({ name: "show-me-mermaid-validator", private: true, type: "module" }),
  )
  process.stderr.write("installing the Mermaid parser (one time)\n")
  execFileSync("npm", ["install", "--no-audit", "--no-fund", "--silent", "mermaid", "jsdom"], {
    cwd: CACHE,
    stdio: ["ignore", "ignore", "inherit"],
  })
}

const resolve = (name) =>
  pathToFileURL(join(CACHE, "node_modules", name, "package.json")).href.replace(
    /package\.json$/,
    "",
  )

async function loadMermaid() {
  const { JSDOM } = await import(join(CACHE, "node_modules", "jsdom", "lib", "api.js"))
  const dom = new JSDOM("<!doctype html><body></body>")
  globalThis.window = dom.window
  globalThis.document = dom.window.document
  globalThis.Element = dom.window.Element
  globalThis.HTMLElement = dom.window.HTMLElement
  const entry = JSON.parse(
    readFileSync(join(CACHE, "node_modules", "mermaid", "package.json"), "utf8"),
  )
  const main = entry.exports?.["."]?.import?.default ?? entry.module ?? entry.main
  return (await import(join(CACHE, "node_modules", "mermaid", main))).default
}

/**
 * Every ```mermaid fence in the text. Text carrying no fence at all is treated
 * as one raw diagram; text with fences but none of them Mermaid has nothing to
 * check, which is not a failure.
 */
function diagrams(text, source) {
  const found = []
  const fence = /^([ \t]*)```+[ \t]*mermaid[^\n]*\n([\s\S]*?)^\1```+[ \t]*$/gm
  for (const match of text.matchAll(fence)) {
    found.push({
      source,
      body: match[2],
      offset: text.slice(0, match.index).split("\n").length,
    })
  }
  const fenced = /^[ \t]*```/m.test(text)
  if (found.length === 0 && !fenced && text.trim()) {
    found.push({ source, body: text, offset: 0 })
  }
  return found
}

const read = (path) => readFileSync(path === "-" ? 0 : path, "utf8")

const inputs = process.argv.slice(2)
const texts = inputs.length
  ? inputs.map((path) => [path, read(path)])
  : [["stdin", read("-")]]

const all = texts.flatMap(([source, text]) => diagrams(text, source))
if (all.length === 0) {
  console.log("no Mermaid found")
  process.exit(0)
}

ensureDeps()
const mermaid = await loadMermaid()

let failed = 0
for (const [index, diagram] of all.entries()) {
  try {
    await mermaid.parse(diagram.body)
  } catch (error) {
    failed++
    const message = String(error?.message ?? error).replace(/\s+/g, " ").trim().slice(0, 300)
    const line = Number(message.match(/line (\d+)/)?.[1] ?? 1) + diagram.offset
    console.error(`${diagram.source}:${line}: diagram ${index + 1}: ${message}`)
  }
}

if (failed) {
  console.error(
    `\n${failed} of ${all.length} failed. Fix the named construct and re-run; ` +
      "the parser lists the tokens it will accept at that position.",
  )
  process.exit(1)
}
console.log(`OK, ${all.length} diagram${all.length === 1 ? "" : "s"}`)
