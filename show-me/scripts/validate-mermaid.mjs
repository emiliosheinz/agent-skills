#!/usr/bin/env node
// Validates Mermaid sources with Mermaid's own parser, with no browser.
//
//   node validate-mermaid.mjs file.md [more.md ...]
//   cat view.mmd | node validate-mermaid.mjs
//
// Input may be raw Mermaid or Markdown containing ```mermaid fences; every
// fence is checked.
//
// Requires node and npm. Mermaid and jsdom install once into a cache directory
// outside the project; nothing is added to the project itself.
//
// Exit codes: 0 every diagram parsed, 1 at least one did not,
// 2 validation could not run — fall back to checking the silent-failure list
// in references/diagrams.md by hand, and say validation was skipped.

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

/** Exits 2 with an actionable message rather than letting a stack escape. */
function unavailable(reason) {
  console.error(`cannot validate: ${reason}`)
  console.error(
    "Check the diagram against the silent-failure list in " +
      "references/diagrams.md by hand, and say validation was skipped.",
  )
  process.exit(2)
}

function ensureDeps() {
  if (existsSync(join(CACHE, "node_modules", "mermaid"))) return
  try {
    mkdirSync(CACHE, { recursive: true })
    writeFileSync(
      join(CACHE, "package.json"),
      JSON.stringify({ name: "show-me-mermaid-validator", private: true, type: "module" }),
    )
  } catch (error) {
    unavailable(`could not write the cache directory ${CACHE} (${error.code ?? error.message})`)
  }
  process.stderr.write("installing the Mermaid parser (one time)\n")
  try {
    execFileSync("npm", ["install", "--no-audit", "--no-fund", "--silent", "mermaid", "jsdom"], {
      cwd: CACHE,
      stdio: ["ignore", "ignore", "inherit"],
    })
  } catch (error) {
    unavailable(
      error.code === "ENOENT"
        ? "npm is not on PATH"
        : `npm install failed in ${CACHE} (${error.message})`,
    )
  }
}

const resolve = (name) =>
  pathToFileURL(join(CACHE, "node_modules", name, "package.json")).href.replace(
    /package\.json$/,
    "",
  )

async function loadMermaid() {
  try {
    // Mermaid's parser touches the DOM even though it renders nothing here,
    // so a minimal jsdom window stands in for a browser.
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
  } catch (error) {
    unavailable(`the cached Mermaid parser would not load (${error.message})`)
  }
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

function read(path) {
  try {
    return readFileSync(path === "-" ? 0 : path, "utf8")
  } catch (error) {
    unavailable(
      error.code === "ENOENT" ? `no such file: ${path}` : `cannot read ${path} (${error.code})`,
    )
  }
}

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
    // 300 characters keeps the caret line and the full "Expecting ..." token
    // list, which is the part that makes the error repairable, while cutting
    // the echoed diagram source that follows it.
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
