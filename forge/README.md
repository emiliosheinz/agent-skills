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
context it needs, except where `execute` or `fix` stops and routes you.

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
| **quick** | one-file fix, no new interface | inline spec, skip design and plan, go straight to execute (verifiers 1–2, plus the conventions check as verifier 3) |
| **standard** | one component, a few files | full spec, light design, phased plan, execute with verifiers 1–4 |
| **complex** | crosses components or repos, new subsystem | full pipeline plus the dimension sweep, alternatives, and verifier 5 |

Size can only increase. A downgrade requires your confirmation. See *Sizing* in `SKILL.md`
for the full rubric.

**Reversibility overrides size.** Every change is also classified a **one-way door** or a
two-way door — one-way meaning reverting the commit does not undo the effect (destructive
migration, bulk delete, mass communication, money movement, an auth boundary, a broken
contract, no revert path). A one-way door runs the heavier reviewers and the mutation
sensor at any size, so its gate is all five verifiers: a two-line change that emails every
user deserves more scrutiny than a sixty-file rename.

## What you get out of forge

- **One spec, two passes.** `specify` understands the world as it is (Part A), then
  turns that into requirements with acceptance criteria (Part B). Acceptance criteria
  are written once, with stable IDs, and referenced by ID everywhere downstream.
- **Adversarial review of the spec and design.** Before finalizing, `specify` and
  `design` hand their draft to independent reviewer subagents that attack it from lenses
  the author is blind to — completeness, testability, scope leak; coverage, failure
  modes, over-engineering, **under-design**. Size-gated, and the fixes land in the
  artifact. Catches a vague AC or an orphaned requirement at authoring time instead of at
  execute time.
- **A structural baseline.** Three of forge's voices argue for less code; a fourth design
  lens asks whether what *is* built is arranged well — where
  a rule lives, which way a dependency points, whether a domain concept is a bare
  primitive, whether one body mixes abstraction levels. Its criteria live in one sourced
  file, `references/structural-standards.md`, extensible per project via
  `CODING_STANDARDS.md`. It prefers silence: no trigger in the diff, no finding.
- **The conventions your code already shows become an input.** `specify` records them with
  a `file:line` per entry, `design` states a verdict per convention, and `execute` checks
  the diff against them at **every** size, `quick` included.
- **Phased plan.** `plan` groups small tasks into dependency-ordered phases. Tasks
  within a phase run in parallel when a safety check approves. Each task traces to an
  acceptance criterion.
- **Independent verifiers are the phase gate.** `execute` implements a phase, then runs
  verifier subagents that did not write the code, always in number order: (1) tests,
  (2) static analysis — typecheck, lint and format, (3) structure, (4) spec coverage and
  (for complex changes or a one-way door) (5) mutation testing. Each stage gets at most
  three fix cycles, then the work stops and escalates rather than looping.
- **UI changes get looked at.** On a change that alters a screen, `execute` adds
  **the look**: a fresh subagent drives the running app against a reference screen and
  grades what it sees. With no design to follow, `specify` first builds a few
  native-looking prototypes and lets you pick one as that reference.
- **Structural review after commit.** Verifier 3 reviews the phase's commits for structure
  and fixes land as follow-up commits. Each finding's disposition — applied, rejected with a
  reason, or reported — is recorded, so a finding cannot quietly vanish.
- **Lessons layer.** Each change keeps its own `lessons.md` listing what went wrong and
  the rule for next time. Each phase loads it at start.

## Artifacts

```text
./.specs/<slug>/
├── spec.md         what & why
├── design.md       how
├── plan.md         atomic tasks grouped into phases
├── state.md        single source of truth (size, decisions, tasks, handoff)
└── lessons.md      what went wrong, with the rule for next time
```

`state.md` is the single source of truth. It is plain markdown, not JSON, so it works
in any agent runtime. `references/` holds the per-phase playbooks; `templates/` holds
the document scaffolds. `references/glossary.md` indexes forge's terms; a change that adds,
moves or redefines one updates its row.

## Installation

Install to the current project:

```bash
npx skills add emiliosheinz/agent-skills --skill forge
```

Install globally (available across all projects):

```bash
npx skills add emiliosheinz/agent-skills --skill forge --global
```

See the [root README](../README.md) for installing all skills at once.

## Try it

```bash
/forge specify checkout-refund   # start a feature from scratch
```

If you omit the verb, the skill infers the phase from your request and confirms it.
`/create-rfc` and `/create-adr` remain separate skills for proposing or recording
significant decisions at any point.
