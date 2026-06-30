# Plan

**Goal:** group the work into **phases** of atomic tasks that `execute` runs one phase at a
time. Output: `.specs/<slug>/plan.md` plus the task table in `.specs/<slug>/state.md`.
Skipped at `quick` size.

Load first: `spec.md` (requirements + AC IDs), `design.md` (components, contracts,
verification gates), `state.md` (size + decisions), `lessons.md`. If a design is missing,
do a quick codebase scan to derive the architectural context the plan needs; prefer
running `/forge design` first for complex work.

**Before writing gates, learn the project's real test setup** (so a gate command isn't
invented): sample 5–10 existing test files to derive the *actual* test runner command(s)
and the test location/naming patterns this repo uses, and scan for testing standards
(`CONTRIBUTING.md`, `AGENTS.md`/`CLAUDE.md`, coverage thresholds in test configs). Align
task test expectations to those standards; fall back to defaults only when none exist
(domain logic 1:1 to ACs; routes cover happy + edge + error). Never assume a command.

## Phases

A **phase** is a coherent checkpoint: a set of tasks that are implemented and verified as a
unit before the next phase starts. **Phases run in sequence; tasks within a phase run in
parallel where it is safe to do so.** Order phases so each one builds on a working result
from the phase before it — data layer before the service that uses it, the service before
the endpoint that exposes it.

Each phase has:

- **Goal** — the capability or checkpoint this phase delivers.
- **Tasks** — atomic tasks (below), with `[P]` markers from the parallelism assessment.
- **Depends-on** — the earlier phase(s) that must complete first.
- **Phase gate** — the command run once all the phase's tasks are done, to confirm the
  phase as a whole is sound (typically the project's full test + lint, or build for
  config-only phases).

**How many phases (be deliberate, not ceremonial):**

- **standard** — usually ~3 phases.
- **complex** — several phases, ordered by dependency. Split a phase when its tasks form
  two clearly separable checkpoints (e.g. "persistence layer" then "API surface").

## Tasks

One task = **one cohesive unit**: one component, one function, one endpoint, or one file's
worth of change. "implement auth" is not a task — it splits into login form, register
form, token storage, API client, route guard.

| Field | Meaning |
|-------|---------|
| **id** | `PREFIX-PN-NN` — prefix = feature slug short code, `PN` = phase number, `NN` = task number (e.g. `ONBD-P1-01`). |
| **action** | One line a fresh agent can act on. |
| **depends-on** | Task ids that must finish first. Keep minimal. Tasks in the same phase that depend on each other cannot both be `[P]`. |
| **AC-trace** | The acceptance-criterion ID(s) from `spec.md` this task satisfies. Every task traces to at least one AC (enabling work traces to the task it unblocks). |
| **tests** | The tests written **within this task**, co-located with the code it creates — never deferred to a later task. Use the highest test level the task's layer requires (unit for logic, e2e for routes/controllers). |
| **gate** | A deterministic command that returns clean iff the task succeeded. Use the project's real runner (see Load), not an assumed one. |
| **done-when** | A binary checklist, each item true/false, ending with "gate passes: `<command>`". |
| **reuses** *(optional)* | Path of an existing component/pattern this task should mirror, from `design.md`'s code-reuse analysis. The fresh implementer subagent acts on the task line, not the whole design — this points it at the right precedent. |

## Parallelism assessment (per phase)

For each phase, decide which tasks carry `[P]` (order-free — `execute` may run them
concurrently). A task earns `[P]` **only when all three hold:**

1. It has **no dependency on another unfinished task in the same phase** — it can start the
   moment the phase begins.
2. Its **tests are parallel-safe** — they don't share a backing store, global
   setup/teardown, a fixed port, or a snapshot file with a sibling task's tests. (Unit
   tests with per-test mocks are usually safe; e2e tests against a shared database that
   truncates globally are not — those run sequentially.)
3. It shares **no mutable state** with the other `[P]` tasks in the phase.

A task that fails any of these runs **sequentially** within its phase, even if its code is
independent. State the reason and **cite the evidence** — the test file/fixture that
establishes the isolation model (e.g. "seq — integration tests share the test DB, see
`src/.../user.e2e-spec.ts` truncates globally"), not an unverifiable assertion.

## Gates

- **Per-task gate:** the one-line check `execute` runs to call a task done. It must
  exercise the surface the task changes and tie to the task's AC — a gate that can't fail
  is decoration. Name exact commands, never "tests should pass". Shapes:
  exit-zero (`npm test -- src/auth/token.test.ts`), grep-zero
  (`grep -rn "deprecatedApi" src | wc -l | grep -qx 0`), typecheck/build (`tsc --noEmit`).
- **Phase gate:** once every task in a phase is green, run the broader check (full test
  suite + lint, or build) so cross-task integration is confirmed before the next phase.

## Execution plan

Close `plan.md` with the execution order: phases in sequence, and within each phase the
`[P]` batch (run together) and the sequential tasks (run in order). This is exactly what
`execute` consumes.

## Validate before presenting

- Every task is atomic (one component/function/endpoint/file).
- The dependency graph is acyclic and every `depends-on` id exists.
- No `[P]` task depends on another task in the same phase.
- Every task has co-located tests, an AC trace, and a real gate (a project-real command).
- Every `[P]`/seq call cites its isolation-model evidence.
- Each phase has a goal and a phase gate.

## Risks

Capture **execution/sequencing risks** here (architectural risks live in `design.md`):
external/team dependencies, ordering hazards, and rollout/rollback for production deploys
(strategy, triggers + thresholds, steps).

## Write and route

Write `.specs/<slug>/plan.md` from `templates/plan.md` and populate the **task table in
`state.md`**, grouped by phase, all tasks `pending`. Update `state.md` with any size
promotion (and its reason). Recommend `/forge execute` next.
