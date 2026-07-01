# forge

An agent skill that runs spec-driven development in five phases, from understanding a
problem to shipping verified code. Works in Claude Code and OpenCode.

> SKILL.md is the canonical entry point for the agent. This README is for humans
> browsing the repo — read SKILL.md if you want the rules the agent follows.

## Phases

```text
/forge specify <name>   Understand the problem + capture requirements   → spec.md
/forge design           Architecture, contracts, verification gates     → design.md
/forge plan             Atomic tasks, dependencies, AC traces            → plan.md
/forge execute          Implement, then run independent verifiers        → working code
/forge fix <bug>        Reproduce, root-cause, AND fix a bug end-to-end  → <slug>/bugs/<name>.md + code
```

You drive each transition. A phase recommends the next verb but never runs it for you.
Start at any phase — a phase that finds no earlier artifacts gathers the minimum
context it needs.

## Auto-sizing

Forge adapts to the change. Each phase reads the recorded size, scales its depth, and
tells you which later phases you still need.

| Size | Example | What you get |
|------|---------|--------------|
| **quick** | one-file fix, no new interface | inline spec, skip design and plan, go straight to execute (verifiers 1–2) |
| **standard** | one component, a few files | full spec, light design, phased plan, execute with verifiers 1–4 |
| **complex** | crosses components or repos, new subsystem | full pipeline plus the dimension sweep, alternatives, and verifier 5 |

Size can only increase. A downgrade requires your confirmation. See
`references/sizing.md` for the full rubric.

## What you get out of forge

- **One spec, two passes.** `specify` understands the world as it is (Part A), then
  turns that into requirements with acceptance criteria (Part B). Acceptance criteria
  are written once, with stable IDs, and referenced by ID everywhere downstream.
- **Phased plan.** `plan` groups small tasks into dependency-ordered phases. Tasks
  within a phase run in parallel when a safety check approves. Each task traces to an
  acceptance criterion.
- **Independent verifiers.** `execute` implements a phase, then dispatches verifier
  subagents written by a different agent than the one that wrote the code. They check
  tests, lint, spec coverage, architecture, and (for complex changes) mutation testing.
  A bounded fix loop addresses what they find.
- **Lessons layer.** Each change keeps its own `lessons.md` listing what went wrong and
  the rule for next time. Each phase loads it at start.

## Artifacts

```text
.specs/<slug>/
├── spec.md         what & why
├── design.md       how
├── plan.md         atomic tasks grouped into phases
├── state.md        single source of truth (size, decisions, tasks, handoff)
├── lessons.md      what went wrong, with the rule for next time
└── bugs/<name>.md  fix's diagnosis record + the applied fix, scoped to this spec
```

`state.md` is the single source of truth. It is plain markdown, not JSON, so it works
in any agent runtime. `references/` holds the per-phase playbooks; `templates/` holds
the document scaffolds.

## Try it

```bash
/forge specify checkout-refund   # start a feature from scratch
/forge fix flaky-logout          # reproduce, root-cause, and fix a bug in one command
```

If you omit the verb, the skill infers the phase from your request and confirms it.
`/create-rfc` and `/create-adr` remain separate skills for proposing or recording
significant decisions at any point.
