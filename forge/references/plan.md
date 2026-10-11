# Plan

> **Phase prelude:** resolve `SPECS_ROOT` per SKILL.md → *Artifact root
> (session CWD)* before any read or write. Every `./.specs/...` path below is
> `$SPECS_ROOT/...`.

**Goal:** group the work into **phases** of atomic tasks that `execute` runs one phase
at a time. Output: `./.specs/<slug>/plan.md` plus the task table in `./.specs/<slug>/state.md`.
Skipped at `quick` size.

> Inside plan and execute, "phase" means a group of tasks run as a unit. This is a
> different concept from forge's outer phases (specify / design / plan / execute).
> Context makes which one is meant.

Load first:

- `./.specs/<slug>/spec.md` — requirements and AC IDs.
- `./.specs/<slug>/design.md` — components, contracts, verification gates.
- `./.specs/<slug>/state.md` — size and decisions.
- `./.specs/<slug>/lessons.md` — Standing Rules plus tagged Log entries.

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

Never assume a command.

## Phases

A **phase** is a coherent checkpoint: a set of tasks that are implemented and verified
as a unit before the next phase starts. **Phases run in sequence; tasks within a phase
run in parallel where it is safe to do so.** Order phases so each one builds on a
working result from the phase before it — data layer before the service that uses it,
the service before the endpoint that exposes it.

Each phase has:

- **Goal** — the capability or checkpoint this phase delivers.
- **Tasks** — atomic tasks (below), with `[P]` markers from the parallelism assessment.
- **Depends-on** — the earlier phase(s) that must complete first.
- **Phase gate** — the command run once all the phase's tasks are done, to confirm the
  phase as a whole is sound (typically the project's full test + static analysis —
  typecheck + lint + format).

**How many phases (plan deliberately; do not pad):**

- **standard** — usually ~3 phases.
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
| **AC-trace** | The acceptance-criterion ID(s) from `spec.md` this task satisfies. Every task traces to at least one AC. (Enabling work traces to the task it unblocks.) |
| **files** | The paths this task is allowed to touch. Three mechanisms need it: the structural axis attributes findings per task, the tamper check scopes its revert, and `execute` batches by locality (its commit step already assumes it). A glob is fine; "wherever it needs to" is not. |
| **tests** | The tests written **within this task**, co-located with the code it creates — never deferred to a later task. Use the highest test level the task's layer requires (unit for logic, e2e for routes/controllers). Must not be tautological, structure-sensitive, or cannot-fail — see *How a test lies* below. |
| **gate** | A deterministic command that returns clean iff the task succeeded. Use the project's real runner (see "learn the project's real test setup" above), not an assumed one. |
| **done-when** | A pass/fail checklist, each item true or false, ending with "gate passes: `<command>`". |
| **reuses** *(required at `standard`+, optional at `quick`)* | The precedent this task mirrors, from `design.md`'s code-reuse analysis — a `path`, a `path:line`, or the literal sentinel **`no-precedent`** ("none exists; needs a design decision"). Example: `src/auth/refresh.ts:40 (mirror its token-rotation shape)`. A **blank or absent** field fails the plan gate, since silence is indistinguishable from "I did not look". |

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

## How a test lies

A task's `tests` field is where its strength is decided. Verifier 5 catches a weak test
but runs only at `complex` or on a one-way door, so these three names are the brake that
runs at every size; verifier 3 uses the same words, so a planned and a rejected test share
one vocabulary.

- **tautological** — the assertion restates the implementation, comparing the code's
  output to its own expression or to a constant the code also reads, so it passes for any
  implementation including a wrong one.
- **structure-sensitive** — it checks *shape* rather than *outcome*: that a method was
  called, how often, in what order. It breaks on a harmless refactor and survives a
  behavioural bug, which is backwards.
- **cannot-fail** — no input makes the assertion false: an empty loop body, a `try` that
  swallows, `expect(result).toBeDefined()`, a snapshot written from current output.

**The mocking boundary.** Mock at **system boundaries only** — external services, time,
randomness, and where unavoidable the datastore and filesystem. Never the change's own
collaborators: a test stubbing the unit next to the one under test asserts on the stub.

**The independent-expected-value rule.** An expected value's expression must not reference
any symbol **defined in the files the task changed** — write the value the acceptance
criterion names. A value computed by the code under test cannot disagree with it.

## Gates

- **Per-task gate:** the one-line check `execute` runs to call a task done. It must
  exercise the surface the task changes and tie to the task's AC — a gate that cannot
  fail is useless. Name exact commands, never "tests should pass". Shapes:
  - exit-zero: `npm test -- src/auth/token.test.ts`
  - grep-zero: `grep -rn "deprecatedApi" src | wc -l | grep -qx 0`
  - typecheck: `tsc --noEmit`
- **Phase gate:** once every task in a phase is green, run the broader check (full
  test suite + static analysis — typecheck + lint + format) so cross-task integration
  is confirmed before the next phase.

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
- At `standard`+, every task's **reuses** holds a path, a `path:line`, or `no-precedent`
  — never blank.
- The dependency graph is acyclic and every `depends-on` ID exists.
- No `[P]` task depends on another task in the same phase.
- Every task has co-located tests, a real gate (a project-real command), and an anchor:
  an AC ID **or** a **design element** — a named component, a seam, or a recorded
  convention. A task anchored to neither is scope creep; drop it or find its anchor.
- Every `[P]` / seq call cites its parallelism evidence.
- Each phase has a goal and a phase gate.

## Risks

Capture **execution / sequencing risks** here (architectural risks live in
`design.md`): external/team dependencies, ordering hazards, and rollout/rollback for
production deploys (strategy, triggers + thresholds, steps).

## Write and route

Write `./.specs/<slug>/plan.md` from `templates/plan.md` and populate the **task table
in `state.md`**, grouped by phase, all tasks `pending`. Update `state.md` with any
size promotion (and its reason).

Recommend `/forge execute` next.
