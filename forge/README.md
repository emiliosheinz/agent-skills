# forge

An agent skill that runs spec-driven development as five explicit phases — from
understanding a problem to shipping verified code. It merges what used to be six separate
skills (`contextualize`, `create-prd`, `create-technical-design`,
`create-implementation-plan`, `implement`, `diagnose`) into one auto-sizing workflow that
works in both Claude Code and OpenCode.

## When to use

Invoke a phase when you want to:

- Understand a problem and capture requirements (`specify`)
- Define architecture, contracts, and the gates that decide "done" (`design`)
- Group work into phases of atomic tasks, parallel where safe (`plan`)
- Implement and independently verify code (`execute`)
- Reproduce, root-cause, and fix a bug end to end (`fix`)

## Phases

```
/forge specify <name>   Understand the problem + capture requirements   → spec.md
/forge design           Architecture, contracts, verification gates      → design.md
/forge plan             Atomic tasks, dependencies, AC traces            → plan.md
/forge execute          Implement, then independent verifiers, then fix  → working code
/forge fix <bug>        Reproduce, root-cause, AND fix a bug end to end  → bugs/<name>.md + code
```

You drive each transition; a phase recommends the next verb but never auto-runs it. Start
at any phase — a verb with no prior artifacts derives just enough context to do its job.

## Auto-sizing

Forge adapts to the change. Each phase reads the recorded size and scales its depth, and
tells you which downstream phases are even needed:

- **quick** (one file/function) — inline spec, skip design and plan, go straight to execute.
- **standard** (one component) — full spec, light design, phased plan, execute.
- **complex** (crosses components/repos) — the full pipeline with every gate.

Size ratchets up only; a downgrade needs your confirmation.

## How it differs from the old pipeline

- **One spec, two passes.** `specify` merges context-gathering and requirements: a
  relentless interview + codebase scan + external-reference pass (Part A, understand),
  then requirements with acceptance criteria (Part B). ACs are authored once and
  referenced by ID everywhere downstream.
- **Phased plan.** `plan` groups atomic tasks into dependency-ordered **phases**; `execute`
  runs one phase at a time, and tasks within a phase run in parallel where a parallelism
  assessment says it's safe. Each task traces to an acceptance criterion.
- **Independent verifiers.** `execute` implements a phase, then dispatches **verifier
  subagents** (author ≠ verifier): tests, lint, spec coverage, architecture compliance, and
  a mutation/discrimination sensor — size-gated, with a bounded fix loop.
- **Lessons layer.** Each change keeps a slug-local `lessons.md` of what went wrong and the
  rule going forward, loaded at the start of each stage.

## Artifacts

```
.specs/<slug>/spec.md      design.md   plan.md
.specs/<slug>/state.md     lessons.md
.specs/bugs/<name>.md
```

`state.md` is the single source of truth (markdown — no JSON, harness-agnostic). The
skill's `references/` directory holds the per-phase playbooks; `templates/` holds the
document scaffolds.

## Harness notes

Subagents are the canonical mechanism for parallel/heavy work and run in both Claude Code
and OpenCode. The Workflow tool and `AskUserQuestion` are optional accelerators used when
available; nothing in forge requires them.

## Usage

```
/forge specify checkout-refund
/forge design
/forge plan
/forge execute
/forge fix flaky-logout
```

If you omit the verb, the skill infers the phase from your request and confirms it.
`/create-rfc` and `/create-adr` remain separate skills for proposing or recording a
significant decision at any point.
