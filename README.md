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
| <nobr>`plan-prd`</nobr> | Transforms a Product Requirement Document (PRD) into a phased execution plan using vertical slice methodology. Use when the user has a PRD and wants to plan implementation, convert requirements into actionable phases, or generate an execution plan. |
| <nobr>`write-prd`</nobr> | Guides creation of structured, explicit, and detailed Product Requirement Documents (PRDs). Use when the user wants to write a PRD, define a feature, or plan what to build before implementation begins. |
