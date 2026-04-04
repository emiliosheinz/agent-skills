# Agent Skills

A collection of reusable agent skills, tools, and workflows designed to extend LLM capabilities and enable autonomous task execution.

## Installation

Skills are installed using the [`skills` CLI](https://github.com/vercel-labs/skills).

**Install all skills:**

```bash
npx skills add emiliosheinz/agent-skills
```

**Install a single skill:**

```bash
npx skills add emiliosheinz/agent-skills --skill <skill-name>
```

By default, skills are installed locally to the current project. Use `--global` to install them to your user directory instead, making them available across all projects.

```bash
# Local (current project only)
npx skills add emiliosheinz/agent-skills

# Global (all projects)
npx skills add emiliosheinz/agent-skills --global
```

## Available Skills

| Skill | Description |
|-------|-------------|
| <nobr>`create-adr`</nobr> | Creates Architecture Decision Records (ADRs) to document significant architectural choices and their rationale for future team members. Use when the user ask to "write an ADR", "document a decision", "record why we chose X", "add an architecture decision record", "create an ADR for", or wants to capture the reasoning behind a technical choice so the team understands it later. |
| <nobr>`create-prd`</nobr> | Guides creation of structured, explicit, and detailed Product Requirement Documents (PRDs). Use when the user wants to write a PRD, define a feature, or plan what to build before implementation begins. |
