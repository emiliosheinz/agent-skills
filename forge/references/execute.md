# Execute

**Goal:** turn the plan into working, verified, committed code — **one phase at a time.**
Within a phase: implement its tasks (in parallel where the plan marks them `[P]`), then
verify the phase with independent subagents, fix the delta, and mark the phase done.

Load first: `state.md` (size, task table by phase, decisions, handoff), then the artifacts
the current phase touches — read selectively. Apply `.specs/<slug>/lessons.md`. Read
`references/verification.md` for the verifier contract.

## Modes

- **Feature mode** (default): source is `spec.md` / `design.md` / `plan.md` under
  `.specs/<slug>/`. Run the loop over the task table.
- **Bug-fix mode:** source is `.specs/bugs/<name>.md` from `forge fix`. Triggered by
  a path under `.specs/bugs/` or "fix the bug / apply the fix". See the deltas at the end.

If artifacts are missing (direct `forge execute` on a quick change), do a **quick,
focused** research pass — scan the codebase for patterns, test setup, entry points;
derive scope, architecture, constraints, and acceptance criteria from the request and
code; make the ACs explicit before writing code. Don't do a broad survey.

## Staying lean

Execute generates a lot of context (artifacts, test output, diffs, lint results). Be
deliberate:

- Read selectively — pull only the spec/design sections the current task touches.
- Extract then let go — once you have the AC IDs, contracts, and constraints, you don't
  need the raw document; re-read a section later if needed.
- Shed finished work — after a task verifies green, its diff and test output have served
  their purpose.
- Delegate heavy lifting — verifiers run as subagents (that's the point); also consider a
  subagent for a self-contained implementation chunk. Give subagents specific inputs, not
  open-ended instructions.

## Phase selection

Read the task table in `state.md`. Implement **exactly one phase per invocation** — the
first phase whose prerequisite phases are complete and that isn't done yet. If the user
names a phase, use that one. Do not roll on into the next phase; finish, report, and let
the user invoke `forge execute` again. For a quick change with no plan, the whole change is
a single implicit task — run the per-task loop once and skip the phase machinery.

## Run the phase

1. **Split the phase** into its `[P]` (parallel-safe) tasks and its sequential tasks, per
   the plan's parallelism assessment.
2. **Implement the tasks.** Run sequential tasks in order; run `[P]` tasks concurrently.
   To parallelize, hand each `[P]` task to an **implementer subagent** with everything it
   needs (file paths, the AC IDs, the task gate, constraints); the subagent returns the
   files it changed and does **not** commit — you run its gate and commit. (Workflow is a
   fine accelerator for the fan-out where available; sequential subagent calls are the
   universal fallback. One level of delegation.)
3. Each task follows the **per-task loop** below.
4. **Run the phase gate** once every task in the phase is green — the broader check (full
   test suite + lint, or build) that confirms the phase integrates.
5. **Verify the phase** with independent subagents, then fix the delta (below).
6. **Mark the phase `completed`** in `state.md` and write the Handoff section.

### Per-task loop

For each task:

1. **State intent.** Briefly: assumptions, files to touch, the AC IDs it satisfies, and
   what "done" means (the task's gate + done-when).
2. **Implement.** Write the code and its co-located tests. Test-first is encouraged. Derive
   tests from the spec's acceptance criteria (the expected *values*), not from the
   implementation. Write only what the task needs — no anticipatory code.
3. **Run the task gate.** The deterministic command from the plan. Non-zero = not done;
   fix and re-run. Never proceed on a failing gate.
4. **Commit atomically.** One task = one commit, only the files in the task definition.
   Conventional Commits, type matching the change (`feat`/`fix`/`refactor`/...), imperative
   mood, body when the "why" isn't obvious. (Skip Claude/AI co-author trailers.)
5. **Update `state.md`.** Mark the task `done` with evidence (commit sha, test count).

### Verify the phase (independent subagents)

Once all the phase's tasks are committed and the phase gate is green, dispatch the
size-gated verifiers from `references/verification.md` over the phase's changes (author ≠
verifier; fresh context; run in parallel). Collect their verdicts into an overall PASS/FAIL.

**Fix the delta — bounded loop.** If any verifier FAILs, collect the specific failures
(failing AC IDs, tests, lint issues, architecture violations, surviving mutants) into
`state.md`'s Validation delta, fix **only those**, re-commit, and re-run the failed
verifiers. **Max 3 fix→re-verify cycles per phase.** If still failing after 3, stop and
escalate to the user with the delta and what was tried — never loop forever or weaken a
check.

## Test integrity (non-negotiable)

- Don't weaken assertions to force a pass.
- Don't delete, skip, or disable tests to get green. Test counts must not silently drop.
- If a test is genuinely wrong per the spec, stop and ask before changing it.
- Don't fake a gate — a check that can't run is recorded as a gap (see verification.md).

## Scope guardrail

Resist refactoring or improving beyond the task. Surface bugs you find to the user;
record deferred improvements as open items; ask "is this in the task definition?" — if
no, don't touch it.

## When to stop and ask

Only when proceeding is impossible: genuinely ambiguous scope with materially different
outcomes, a missing dependency that can't be substituted, or existing code that makes the
planned approach unworkable. For everything else, note the unknown and continue; surface
all unknowns at the end.

## Finish

When the phase is done and green:

1. Confirm the phase is marked `completed` in `state.md` with the Handoff section written.
2. **Lessons:** if anything non-obvious came up (a hack, a gotcha, a wrong assumption you
   corrected, a skipped gate), append it to `.specs/<slug>/lessons.md` per
   `references/lessons.md`. Routine success writes nothing.
3. Summarize what was built, decisions made beyond the artifacts, and any unknowns.
4. Recommend next: more phases remain → `forge execute` again for the next phase; all
   phases done → suggest `verify`/review or shipping.

## Bug-fix mode deltas

- **Load** `.specs/bugs/<name>.md` instead of feature artifacts. Extract Root Cause
  (file:line), Reproduction (the loop/command), Fix Proposal (the steps), Regression Test.
  - Status `blocked` → stop; tell the user to re-run `forge fix` with more context.
  - Status already `resolved`, or recent commits show the fix landed → stop and say so.
  - No task table — the report is a single unit of work.
- **Implement:** first add the Regression Test and confirm it fails with the *reported*
  symptom (wrong symptom = wrong test). Then apply the Fix Proposal steps in order.
- **Verify:** re-run the report's reproduction loop and confirm it now passes; confirm the
  regression test is committed and green. Run verifiers 1–2 (plus 3 against the bug's
  expected behavior). Size is usually quick/standard.
- **Commit** with a `fix:` type referencing the bug name. Update the report: `Status:
  resolved` + a `Resolved: YYYY-MM-DD — <sha>` line.
