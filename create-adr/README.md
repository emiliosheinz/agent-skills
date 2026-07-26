# create-adr

Agent skill that produces one Architecture Decision Record per invocation —
concise, durable documents that capture the context, decision, and
consequences of significant architectural choices so future team members
understand *why* things are the way they are.

## When to use

Invoke this skill when you want to:

- Document why a significant architectural or technical decision was made.
- Preserve the reasoning behind a choice for future engineers.
- Record a finalized decision so it is immutable and traceable over time.
- Supersede an older ADR with a newer one and preserve the historical trail.

Reach for **`/create-rfc`** instead when the decision has *not* been made
yet — ADR records; RFC decides.

## Requirements

- Any agent runtime that can read markdown skills (Claude Code, OpenCode,
  Cursor, etc.).
- No language-specific tooling, no scripts.

## How it works

Five sequential steps, each guided by a small reference file loaded on
demand:

1. **Gather context** — asks for the decision, format preference, status,
   and whether it supersedes an existing ADR. Does not draft anything until
   the mandatory fields are available.
2. **Validate mandatory fields** — ensures title, date, status, context,
   decision, and consequences are present before proceeding.
3. **Pick a format** — MADR (default, structured with options), Nygard
   (minimal), or Y-Statement (single paragraph). See
   `references/formats.md` for the selection heuristics.
4. **Assign an ADR number** — scans the existing ADR directory
   (`docs/adr/`, `docs/decisions/`, `adr/`, or `.adr/`) and picks the next
   sequential number.
5. **Generate and place the file** — fills the matching template, runs the
   quality checklist (`references/quality.md`), and confirms the file
   location with you before writing.

The skill loads only the reference and template it needs for the current
step, which keeps per-invocation context small even though the skill
supports three ADR formats.

## Output

A `NNN-kebab-case-title.md` file at `docs/adr/` (or a user-specified
directory) containing:

- Decision title, date, and status
- Context and problem statement — the forces that made this decision
  necessary
- Decision outcome with rationale
- Consequences — including honest trade-offs
- Options considered with pros and cons (MADR format)
- Links to related ADRs, RFCs, or tickets

## Installation

Install to the current project:

```bash
npx skills add emiliosheinz/agent-skills --skill create-adr
```

Install globally (available across all projects):

```bash
npx skills add emiliosheinz/agent-skills --skill create-adr --global
```

See the [root README](../README.md) for installing all skills at once.

## Usage

```
/create-adr
```

Or with a starter phrase:

```
/create-adr use Redis for session storage
```

Provide as much detail as possible about the decision, the alternatives
considered, and the forces that shaped the choice — the more context, the
more useful the ADR will be to future engineers.

## Related skills

- **`/create-rfc`** — propose and drive a decision *before* it is made.
- **`/forge`** — spec-driven implementation once an ADR is decided.

## Attribution

Based on [create-adr](https://github.com/tech-leads-club/agent-skills/blob/main/packages/skills-catalog/skills/(creation)/create-adr/SKILL.md)
by [Tech Leads Club](https://github.com/tech-leads-club), licensed under
[CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/). Changes have been
made to the original.
