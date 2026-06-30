---
name: forge
description: >
  Spec-driven development workflow that takes any change from problem to shipped,
  verified code through five explicit phases. Use when asked to build or implement a
  feature, write a spec / PRD / requirements, design architecture or a technical
  design, create an implementation plan, execute or build code, or diagnose and fix a
  bug. Auto-sizes from one-line fixes to multi-repo refactors. Invoke a phase with
  `forge specify|design|plan|execute|fix`.
---

# Forge

Forge runs spec-driven development as five explicit phases. You invoke one phase at a
time; each phase does its work, updates shared state, and **recommends** the next phase
without running it. The depth of every phase auto-sizes to the change (see Sizing).

```
forge specify <name>   Understand the problem + capture requirements   → spec.md
forge design           Architecture, contracts, verification gates      → design.md
forge plan             Atomic tasks, dependencies, AC traces            → plan.md
forge execute          Implement, then independent verifiers, then fix  → working code
forge fix <bug>        Reproduce, root-cause, AND fix a bug end to end  → bugs/<name>.md + code
```

## Dispatch

Read the first argument as the verb. **Read the matching reference file fully before
acting** — it is the playbook for that phase:

| Verb | Read | Produces |
|------|------|----------|
| `specify` | `references/specify.md` | `.specs/<slug>/spec.md` |
| `design` | `references/design.md` | `.specs/<slug>/design.md` |
| `plan` | `references/plan.md` | `.specs/<slug>/plan.md` |
| `execute` | `references/execute.md` (+ `references/verification.md`) | code + commits |
| `fix` | `references/fix.md` (+ `references/execute.md`) | `.specs/bugs/<name>.md` + applied fix |

If no verb is given, infer the intended phase from the request and confirm it; never
error on a missing or unknown verb. `specify`/`fix` take a feature/bug name; if
absent, ask for one and derive a kebab-case slug.

`fix` is end to end: it diagnoses the bug **and** applies the fix (running the execute
bug-fix flow), so after `forge execute` you can verify the work yourself and `forge fix
<bug>` anything you find.

This is not a router: the user drives phase transitions. Flexible entry is fine — start
at any verb. A verb that finds no prior artifacts derives just enough context to do its
job (each reference describes its own fallback).

## Sizing (read `references/sizing.md` for the full rubric)

Every change is one of three sizes, which controls how deep each stage goes and which
stages are even needed:

| Size | Roughly | Pipeline |
|------|---------|----------|
| **quick** | one file/function, no new interface/schema/dep | inline spec → execute (skip design + plan) |
| **standard** | one component/module, a few files | full spec → light design → phased plan → execute |
| **complex** | crosses components/repos, new subsystem, ambiguous | full pipeline, all gates |

The first stage to run derives the size and records it in `state.md`. Size only ratchets
**up** (any later stage may promote it, with a reason logged); a **downgrade requires the
user's confirmation**. Each stage ends by naming which downstream verbs are needed or
skippable for the current size.

## Artifacts and state

All work for a change lives under `.specs/<slug>/` (create it if missing):

```
.specs/<slug>/spec.md       what & why (requirements, acceptance criteria, scope)
.specs/<slug>/design.md      how (architecture, contracts, verification gates)
.specs/<slug>/plan.md        tasks grouped into phases (parallel within a phase, AC-traced)
.specs/<slug>/state.md       size, decisions log, task status, handoff — the source of truth
.specs/<slug>/lessons.md     what went wrong here and the rule going forward
.specs/bugs/<name>.md        fix's diagnosis record (and the fix it applied)
```

Templates for each are in `templates/`. **`state.md` is the single source of truth**,
re-read at the start of every verb. Do not rely on any orchestration engine's own
journaling surviving between phases — if it isn't in `state.md`, it didn't happen.

Acceptance criteria are authored **once**, in `spec.md`, with stable IDs
(`PREFIX-NN`). Design, plan, and execute reference those IDs — they never restate the
criterion text.

## Lessons (read `references/lessons.md`)

Each change keeps a slug-local `.specs/<slug>/lessons.md`: `## Standing Rules` (short
imperatives, always loaded) + `## Log` (tagged, append-only). Load it at the start of
specify/design/execute/fix. Append **only when something non-obvious was learned**
— a hack, a gotcha, a corrected wrong assumption. Routine success writes nothing.

## Orchestration (applies to every phase)

- **Subagents are the canonical mechanism for parallel/heavy work** — available in both
  Claude Code and OpenCode. Use them to keep the main context lean and to get
  independent perspectives (the execute verifiers depend on this).
- **The Workflow tool is an optional accelerator** for large fan-out when running in a
  harness that has it. Sequential subagent calls are the universal fallback; never
  require Workflow.
- **One level of delegation.** Subagents do not spawn subagents.
- **Subagents are stateless.** Put everything they need in the prompt (file paths,
  section refs, constraints). Outputs over ~100 lines go to a file; return the path, not
  the payload.
- **Prefer `AskUserQuestion` when available**, with a recommended default per question;
  degrade to a single plain-text question otherwise. Never bundle unrelated questions.

## Universal rules

1. Re-read `state.md` at the start of every verb; write size/decisions/status changes
   there as they happen, not at the end. **Write surgically:** edit only the target
   section (replace the content between its `##` header and the next `##`/EOF); never
   regenerate the whole file or reorder sections — that silently clobbers the append-only
   `## Decisions` log or the `## Tasks` table while you meant to touch `## Handoff`.
2. Never claim a task or gate passed without actually running it. No vibes-based done.
3. Each phase finishes, reports, and **recommends the next verb** — it never auto-runs
   the next phase.
4. Record honestly: open questions, skipped gates, and assumptions stay visible; never
   paper a gap over with an invented answer.
5. `create-rfc` and `create-adr` are separate skills — reach for them whenever a
   significant decision needs proposing or recording, at any point in the flow.
