#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

function parseFrontmatter(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  if (!content.startsWith("---")) return {};
  const end = content.indexOf("---", 3);
  if (end === -1) return {};
  const fm = content.slice(3, end);
  const result = {};
  for (const line of fm.split("\n")) {
    const colon = line.indexOf(":");
    if (colon === -1) continue;
    const key = line.slice(0, colon).trim();
    const value = line.slice(colon + 1).trim();
    result[key] = value;
  }
  return result;
}

const root = process.cwd();
const skills = [];

for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const skillMd = path.join(root, entry.name, "SKILL.md");
  if (!fs.existsSync(skillMd)) continue;
  const fm = parseFrontmatter(skillMd);
  if (!fm.name) {
    console.error(`ERROR: ${entry.name}/SKILL.md is missing the required 'name' field`);
    process.exit(1);
  }
  skills.push({ name: fm.name, description: fm.description ?? "" });
}

skills.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));

const tableLines = [
  "| Skill | Description |",
  "|-------|-------------|",
  ...skills.map((s) => `| <nobr>\`${s.name}\`</nobr> | ${s.description} |`),
];
const newTable = tableLines.join("\n") + "\n";

const readmePath = path.join(root, "README.md");
const readme = fs.readFileSync(readmePath, "utf-8");

const pattern = /(## Available Skills\n+)(\|.*\n(?:\|.*\n)*)/;
const match = readme.match(pattern);
if (!match) {
  console.error("ERROR: Could not locate the 'Available Skills' table in README.md");
  process.exit(1);
}

const start = readme.indexOf(match[2], readme.indexOf(match[1]));
const updated = readme.slice(0, start) + newTable + readme.slice(start + match[2].length);
fs.writeFileSync(readmePath, updated, "utf-8");

console.log("README.md updated successfully.");
