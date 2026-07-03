# 🪨 Forge

An agent skill that runs spec-driven development in four phases — plus a `fix` command to
correct course mid-stream — from understanding a problem to shipping verified code. Works
in Claude Code and OpenCode.

> SKILL.md is the canonical entry point for the agent. This README is for humans
> browsing the repo — read SKILL.md if you want the rules the agent follows.

## Phases

```text
/forge specify <name>   Understand the problem + capture requirements   → spec.md
/forge design           Architecture, contracts, verification gates     → design.md
/forge plan             Atomic tasks, dependencies, AC traces            → plan.md
/forge execute          Implement, then run independent verifiers        → working code
/forge fix <change>     Correct course mid-stream, keep the chain aligned → aligned artifacts + code
```

You drive each transition. A phase recommends the next verb but never runs it for you.
Start at any phase — a phase that finds no earlier artifacts gathers the minimum
context it needs.

## Correcting course

When something needs to change after a phase is done — a misstated requirement, a design
or implementation detail you're unhappy with, a bug found while testing — `/forge fix
<change>` folds it in without breaking the chain. It routes the correction to the layer
it truly belongs to (a code complaint is often really a spec gap), re-aligns every layer
below, keeps the acceptance-criteria trace intact, and runs the code delta right away
when the change is contained. See `references/fix.md`.

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
- **Adversarial review of the spec and design.** Before finalizing, `specify` and
  `design` hand their draft to independent reviewer subagents that attack it from lenses
  the author is blind to — completeness, testability, scope leak; coverage, failure
  modes, over-engineering. Size-gated, and the fixes land in the artifact. Catches a
  vague AC or an orphaned requirement at authoring time instead of at execute time.
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
└── lessons.md      what went wrong, with the rule for next time
```

`state.md` is the single source of truth. It is plain markdown, not JSON, so it works
in any agent runtime. `references/` holds the per-phase playbooks; `templates/` holds
the document scaffolds.

## Try it

```bash
/forge specify checkout-refund   # start a feature from scratch
```

If you omit the verb, the skill infers the phase from your request and confirms it.
`/create-rfc` and `/create-adr` remain separate skills for proposing or recording
significant decisions at any point.
