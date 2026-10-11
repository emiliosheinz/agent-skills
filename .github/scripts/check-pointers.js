#!/usr/bin/env node

// Fails when a skill points at something that is not there: a `references/x.md`
// path with no file, or a glossary row naming a heading its target does not have.

const fs = require("fs");
const path = require("path");

const errors = [];

function skillDirs() {
  return fs
    .readdirSync(process.cwd(), { withFileTypes: true })
    .filter((e) => e.isDirectory() && fs.existsSync(path.join(e.name, "SKILL.md")))
    .map((e) => e.name);
}

function markdownFiles(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true, recursive: true })) {
    if (entry.isFile() && entry.name.endsWith(".md")) {
      out.push(path.join(entry.parentPath ?? entry.path, entry.name));
    }
  }
  return out;
}

// A reference path is only resolvable relative to its own skill, so check it there.
function checkReferencePaths(skill) {
  for (const file of markdownFiles(skill)) {
    const lines = fs.readFileSync(file, "utf-8").split("\n");
    lines.forEach((line, i) => {
      for (const [, target] of line.matchAll(/`((?:references|templates|scripts)\/[\w.-]+)`/g)) {
        if (!fs.existsSync(path.join(skill, target))) {
          errors.push(`${file}:${i + 1} points at \`${target}\`, which does not exist`);
        }
      }
    });
  }
}

// Glossary rows claim a term is defined in a named file, under a named heading.
function checkGlossaryPointers(skill) {
  const glossary = path.join(skill, "references", "glossary.md");
  if (!fs.existsSync(glossary)) return;

  const lines = fs.readFileSync(glossary, "utf-8").split("\n");
  lines.forEach((line, i) => {
    if (!line.startsWith("| **")) return;
    const cells = line.replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
    const [term, gloss, home] = cells;
    if (!home || gloss.includes("(defined here)")) return;

    const headings = [...home.matchAll(/→ \*(.+?)\*/g)].map((m) => m[1]);
    for (const [, name] of home.matchAll(/`([\w.-]+\.md)`/g)) {
      const target =
        name === "SKILL.md"
          ? path.join(skill, "SKILL.md")
          : path.join(skill, "references", name);
      if (!fs.existsSync(target)) {
        errors.push(`${glossary}:${i + 1} ${term} names \`${name}\`, which does not exist`);
        continue;
      }
      const body = fs.readFileSync(target, "utf-8");
      for (const heading of headings) {
        const found = body
          .split("\n")
          .some((l) => l.startsWith("#") && l.toLowerCase().includes(heading.toLowerCase()));
        if (!found) {
          errors.push(
            `${glossary}:${i + 1} ${term} names heading "${heading}" in ${name}, which has no such heading`,
          );
        }
      }
    }
  });
}

for (const skill of skillDirs()) {
  checkReferencePaths(skill);
  checkGlossaryPointers(skill);
}

if (errors.length > 0) {
  console.error(`${errors.length} broken pointer(s):\n`);
  for (const e of errors) console.error(`  ${e}`);
  process.exit(1);
}

console.log("All reference and glossary pointers resolve.");
