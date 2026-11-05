# Plan

**Goal:** group the work into **phases** of atomic tasks that `execute` runs one phase
at a time. Output: `./.specs/<slug>/plan.md` plus the task table in `./.specs/<slug>/state.md`.
Skipped at `quick` size.

> Inside plan and execute, "phase" means a group of tasks run as a unit. This is a
> different concept from forge's outer phases (specify / design / plan / execute).
> Context makes which one is meant.

Load first:

- `./.specs/<slug>/spec.md` — requirements and AC IDs.
- `./.specs/<slug>/design.md` — components, contracts, verification gates.
- `./.specs/<slug>/state.md` — size, door and decisions.

If a design is missing, do a quick codebase scan to derive the architectural context
the plan needs; prefer running `/forge design` first for complex work.

## Before writing gates: learn the project's real test setup

A gate command must run; you cannot invent it. Before writing gates:

1. Sample 5–10 existing test files to derive the actual test runner command and the
   test location/naming patterns this repo uses.
2. Scan for testing standards: `CONTRIBUTING.md`, `AGENTS.md` or `CLAUDE.md`, coverage
   thresholds in test configs.
3. Align task test expectations to those standards.
4. Fall back to defaults only when no project standard exists (domain logic 1:1 to
   ACs; routes cover happy + edge + error).

Every gate command comes from one of those four sources, and the plan says which.

## Phases

A **phase** is a coherent checkpoint: a set of tasks that are implemented and verified
as a unit, its gate being the verifiers `execute` runs for this size, before the next
phase starts. **Phases run in sequence; tasks within a phase
run in parallel where it is safe to do so.** Order phases so each one builds on a
working result from the phase before it — data layer before the service that uses it,
the service before the endpoint that exposes it.

Each phase has:

- **Goal** — the capability or checkpoint this phase delivers.
- **Tasks** — atomic tasks (below), with `[P]` markers from the parallelism assessment.
- **Depends-on** — the earlier phase(s) that must complete first.

**How many phases (plan deliberately; do not pad):**

- **standard** — 1 to 3 phases.
- **complex** — several phases, ordered by dependency. Split a phase when its tasks
  form two clearly separable checkpoints (e.g. "persistence layer" then "API surface").

Heuristic: one phase per coherent integration boundary. If a task list crosses one
boundary, that is a new phase.

## Tasks

One task = **one cohesive unit**: one component, one function, one endpoint, or one
file's worth of change. "implement auth" is not a task — it splits into login form,
register form, token storage, API client, route guard.

| Field | Meaning |
|-------|---------|
| **id** | `PREFIX-PN-NN` — prefix = feature slug short code, `PN` = phase number, `NN` = task number (e.g. `ONBD-P1-01`). |
| **action** | One line a fresh agent can act on. |
| **depends-on** | Task IDs that must finish first. Keep minimal. Tasks in the same phase that depend on each other cannot both be `[P]`. |
| **AC-trace** | The acceptance-criterion ID(s) from `spec.md` this task satisfies, or the design element it serves — a named component, a seam, or a recorded convention. Enabling work traces to the task it unblocks. A task with no anchor is scope creep. |
| **files** | The paths this task is allowed to touch. `execute` batches by locality and scopes each task's commit with it. A glob is fine; a scope like "wherever it needs to" fails the plan gate. |
| **tests** | The tests written **within this task**, co-located with the code it creates — never deferred to a later task. Use the highest test level the task's layer requires (unit for logic, e2e for routes/controllers). A control the user operates is tested through its gesture. Must not be tautological, structure-sensitive, or cannot-fail: read `references/verification.md` → *How a test lies*, that section only. Name each test by the behaviour it pins, never by the AC ID it traces to (`references/execute.md` → *Per-task loop* holds the rule and the reason). |
| **gate** | A deterministic command that returns clean iff the task succeeded. Use the project's real runner (see "learn the project's real test setup" above), not an assumed one. |
| **done-when** | A pass/fail checklist, each item true or false, ending with "gate passes: `<command>`". |
| **reuses** | The precedent this task mirrors, from `design.md`'s code-reuse analysis — a `path`, a `path:line`, or the literal sentinel **`no-precedent`** ("none exists; needs a design decision"). Example: `src/auth/refresh.ts:40 (mirror its token-rotation shape)`. A **blank or absent** field fails the plan gate, since silence is indistinguishable from "I did not look". |

## Parallelism assessment (per phase)

For each phase, decide which tasks carry `[P]` (order-free — `execute` may run them
concurrently). A task earns `[P]` **only when all three hold:**

1. It has **no dependency on another unfinished task in the same phase** — it can
   start the moment the phase begins.
2. Its **tests are parallel-safe** — they don't share a backing store, global
   setup/teardown, a fixed port, or a snapshot file with a sibling task's tests. Unit
   tests with per-test mocks are usually safe; e2e tests against a shared database
   that truncates globally are not — those run sequentially.
3. It shares **no mutable state** with the other `[P]` tasks in the phase.

A task that fails any of these runs **sequentially** within its phase, even if its
code is independent. State the reason and **cite the evidence** — the test file or
fixture that proves the parallelism risk, not an unverifiable assertion. Example
cites:

- `[P] — per-test in-memory DB, see src/auth/login.test.ts:beforeEach`
- `seq — integration tests share the test DB, see src/.../user.e2e-spec.ts truncates globally`

## Gates

- **Per-task gate:** the one-line check `execute` runs to call a task done. It must
  exercise the surface the task changes and tie to the task's AC — a gate that cannot
  fail is useless. Name exact commands, never "tests should pass". Shapes:
  - exit-zero: `npm test -- src/auth/token.test.ts`
  - grep-zero: `grep -rn "deprecatedApi" src | wc -l | grep -qx 0`
  - typecheck: `tsc --noEmit`
  - proves the test ran, where an exit code cannot show a new test was selected and the
    runner prints one line per test:
    `out=$(cmd) && printf '%s' "$out" | grep -q '<pass line>'`

Plan writes no phase-level gate. A phase's gate is its verifiers, per `SKILL.md` →
*Sizing*, and `execute` discovers the project's own commands for them.

## Execution plan

Close `plan.md` with the execution order: phases in sequence, and within each phase
the sequential tasks (run in order) plus the `[P]` tasks grouped into **implementer
batches** — a small number of batches (aim ≤3), each a set of related `[P]` tasks
(grouped by locality: same module or files) that one subagent implements together.
Don't emit a batch per task: that fragments context and inflates cost for little
parallelism. A phase with only a couple of small or tightly-coupled tasks gets no
batches — `execute` runs it in the main agent. This is exactly what `execute` consumes.

## Validate before presenting

- Every task is atomic (one component / function / endpoint / file).
- Every task declares its **files**.
- Every task's **reuses** holds a path, a `path:line`, or `no-precedent` — never blank.
- Every spec AC ID is claimed by at least one task's AC-trace, excluding retired IDs.
- The dependency graph is acyclic and every `depends-on` ID exists.
- No `[P]` task depends on another task in the same phase.
- Every task has co-located tests, a real gate (a project-real command), and an anchor:
  an AC ID, a **design element** — a named component, a seam, or a recorded convention — or
  the task it unblocks. A task with no anchor is scope creep; drop it or find its anchor.
- Every `[P]` / seq call cites its parallelism evidence.
- Each phase has a goal.

A failing item goes back to the task list, for **at most 3 cycles** (`SKILL.md` →
*Retries*). Then stop and report the failing items; do not present the plan as validated.

## Risks

Capture **execution / sequencing risks** here (architectural risks live in
`design.md`): external/team dependencies, ordering hazards, and rollout/rollback for
production deploys (strategy, triggers + thresholds, steps).

## Write and route

Write `./.specs/<slug>/plan.md` from `templates/plan.md` and populate the **task status
table in `state.md`**, grouped by phase, new tasks `pending`. On a re-run, keep unaffected
rows as they are and reopen affected ones per `references/fix.md`. Update `state.md` with
any size promotion (and its reason).

Recommend `/forge execute` next.
