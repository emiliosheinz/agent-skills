# create-adr

Agent skill that guides the creation of structured Architecture Decision Records (ADRs) to document significant architectural choices and their rationale.

## When to use

Invoke this skill when you want to:

- Document why a significant architectural or technical decision was made
- Preserve the reasoning behind a choice for future engineers
- Record a finalized decision so it is immutable and traceable over time

## How it works

The skill runs a five-step process:

1. **Gather context** — collects the decision, format preference, status, and whether it supersedes an existing ADR. Does not draft anything until mandatory fields are available.
2. **Validate mandatory fields** — ensures title, date, status, context, decision rationale, and consequences are present before proceeding.
3. **Assign ADR number** — scans the existing ADR directory for the next sequential number.
4. **Generate the ADR** — produces a structured document in the selected format (MADR, Nygard, or Y-Statement).
5. **Offer file placement** — asks where to save the file and follows the standard naming convention.

## Output

A `NNN-kebab-case-title.md` file at `docs/adr/` (or a user-specified directory) containing:

- Decision title, date, and status
- Context and problem statement
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

The agent will begin gathering context immediately. Provide as much detail as possible about the decision, the alternatives considered, and the forces that shaped the choice — the more context, the more useful the ADR will be to future engineers.

## Attribution

Based on [create-adr](https://github.com/tech-leads-club/agent-skills/blob/main/packages/skills-catalog/skills/(creation)/create-adr/SKILL.md) by [Tech Leads Club](https://github.com/tech-leads-club), licensed under [CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/). Changes have been made to the original.
