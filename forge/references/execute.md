# Execute

**Goal:** turn the plan into working, verified, committed code — **one phase at a
time.** Within a phase: implement its tasks (in parallel where the plan marks them
`[P]`), then verify the phase with independent subagents, fix what they flag, and mark
the phase done.

> **Terminology:** in this file, "phase" means a plan's group of tasks. "Delta" means
> the set of issues the verifiers found — the gap between current code and PASS.

Load first:

- `.specs/<slug>/state.md` — size, task table by phase, decisions, handoff.
- `.specs/<slug>/lessons.md` — Standing Rules plus tagged Log entries.
- The artifacts the current phase touches — read selectively.
- `references/verification.md` for the verifier contract.

## Source

Source is `spec.md` / `design.md` / `plan.md` under `.specs/<slug>/`. Run the loop over
the task table.

If artifacts are missing (direct `/forge execute` on a quick change), do a **quick,
focused** research pass: scan the codebase for patterns, test setup, entry points.
Derive scope, architecture, constraints, and acceptance criteria from the request and
code. Make the ACs explicit before writing code. Don't do a broad survey.

## Staying lean

Execute generates a lot of context (artifacts, test output, diffs, lint results). Be
deliberate:

- **Read selectively** — pull only the spec/design sections the current task touches.
- **Extract then let go** — once you have the AC IDs, contracts, and constraints, you
  don't need the raw document; re-read a section later if needed.
- **Shed finished work** — after a task verifies green, its diff and test output have
  served their purpose.
- **Delegate heavy lifting** — verifiers run as subagents (that's the point); also
  consider a subagent for a self-contained implementation chunk. Give subagents
  specific inputs, not open-ended instructions. See SKILL.md Orchestration for the
  subagent contract.

## Phase selection

Read the task table in `state.md`. Implement **exactly one phase per invocation** —
the first phase whose prerequisite phases are complete and that isn't done yet. If the
user names a phase, use that one. Do not continue into the next phase; finish,
report, and let the user invoke `/forge execute` again.

For a quick change with no plan, the whole change is a single implicit task — run the
per-task loop once and skip the phase structure.

### Stop before the change sprawls

On the quick / no-plan path, before writing code, list the atomic steps. **Stop if any
of these are true:**

- more than ~5 steps;
- cross-file or ordering dependencies;
- requires a new public interface.

The change was mis-sized. Promote the size, log the reason in `state.md` Decisions
(see `references/sizing.md`), and recommend `/forge plan` (or `/forge design` if a
contract emerged). Recommend — do not run it for the user.

## Run the phase

1. **Split the phase** into its `[P]` (parallel-safe) tasks and its sequential tasks,
   per the plan's parallelism assessment.
2. **Implement the tasks.** Run sequential tasks in order. Run `[P]` tasks
   concurrently.
   - To parallelize, hand each `[P]` task to an **implementer subagent** with
     everything it needs: file paths, AC IDs, the task gate, constraints.
   - The subagent returns the files it changed and does **not** commit; you run its
     gate and commit.
   - Use the Workflow tool to dispatch the fan-out if your runtime supports it;
     otherwise use sequential subagent calls.
   - **Set each implementer's model tier and effort** per SKILL.md Model & effort
     selection: a mechanical task or one with a `reuses` precedent goes to economy/low;
     reserve standard/frontier for tasks that actually need the reasoning.
   - The subagent returns a **compact summary**: paths changed, task-gate result
     (pass/fail), AC IDs satisfied, deviations/blockers/assumptions. No raw logs,
     diffs, or test dumps. Anything over ~100 lines goes to a file; the subagent
     returns the path.
3. Each task follows the **per-task loop** below.
4. **Run the phase gate** once every task in the phase is green — the broader check
   (full test suite + lint, or build) that confirms the phase integrates.
5. **Verify the phase** with independent subagents, then fix the delta (below).
6. **Mark the phase `completed`** in `state.md` and write the Handoff section.

### Per-task loop

For each task:

1. **State intent.** Briefly: assumptions, files to touch, the AC IDs it satisfies,
   and what "done" means (the task's gate + done-when).
2. **Implement, simply.**
   - Write the code and its co-located tests.
   - Test-first is encouraged. Derive tests from the spec's acceptance criteria (the
     expected *values*), not from the implementation.
   - Write only what the task needs: no anticipatory code, no single-use abstractions,
     no unrequested configurability, no error handling for impossible states.
   - **Quick test-strength check.** If a plausible *wrong* implementation would still
     pass the test, the test is too weak. Strengthen it before moving on. This is the
     cheap stand-in for verifier 5, which only runs on complex changes.
3. **Run the task gate.** The deterministic command from the plan. Non-zero = not
   done; fix and re-run. Never proceed on a failing gate.
4. **Self-check before committing.** Would a senior engineer call this overcomplicated?
   If so, simplify. Confirm the tests aren't shallow and nothing beyond the task crept
   in.
5. **Commit atomically.** One task = one commit, only the files in the task
   definition. Conventional Commits, type matching the change
   (`feat`/`fix`/`refactor`/...), imperative mood, body when the "why" isn't obvious.
   (Skip Claude/AI co-author trailers.)
6. **Update `state.md`.** Mark the task `done` with evidence (commit sha, test count).

### Verify the phase (independent subagents)

Once all the phase's tasks are committed and the phase gate is green, dispatch the
applicable verifiers over the phase's changes. Author ≠ verifier; fresh context; run
in parallel.

Which verifiers run is gated by size (see `references/verification.md` for the
contract):

| Size | Verifiers |
|------|-----------|
| quick | 1, 2 |
| standard | 1, 2, 3, 4 |
| complex | 1, 2, 3, 4, 5 |

**Override:** any AC marked `critical` in the spec runs verifier 5 regardless of size.

Collect the verifiers' verdicts into an overall PASS/FAIL plus a single
severity-ranked gap list (Blocker → Major → Minor → Cosmetic).

### Fix the delta (bounded loop)

If any verifier FAILs:

1. Collect the specific failures into `state.md`'s Validation delta.
2. Fix **top-down by severity** (blockers first, so you spend your retries on the
   issues that matter).
3. Re-commit.
4. Re-run the failed verifiers.

**Max 3 fix → re-verify cycles per phase.** If still failing after 3, stop and
escalate to the user with the delta and what was tried. Never loop forever or weaken
a check.

A `SPEC-GAP` verdict is not an implementer failure: record it against the AC ID and
route it back to `spec.md` rather than spending a fix cycle on it.

**On PASS**, append a compact **Verification evidence** subsection in `state.md` —
one row per AC (`AC ID → file:line → spec-defined expected value → covered`) plus the
sensor result. No prose, no logs. This preserves the AC-to-code proof that would
otherwise be lost once tests are green.

## Test integrity (non-negotiable)

- Don't weaken assertions to force a pass.
- Don't delete, skip, or disable tests to get green. Test counts must not silently
  drop.
- Every test you write must map to an AC, edge case, or done-when criterion — no
  speculative what-if tests, no tests of framework/library behavior (verifier 3
  removes orphans).
- If a test is genuinely wrong per the spec, stop and ask before changing it.
- Don't fake a gate — a check that can't run is recorded as a gap (see
  `references/verification.md`).

## Scope guardrail

Resist refactoring or improving beyond the task. Concretely:

- **Match existing style**, even where you'd personally do it differently.
- **Remove only what your change orphaned** — never pre-existing dead code. Note
  unrelated dead code as a deferred open item instead of deleting it.
- **Don't reformat or "improve" adjacent code** you didn't need to touch.
- Surface bugs you find to the user; ask "is this in the task definition?" — if no,
  don't touch it.

## When to stop and ask

Stop and ask when proceeding is impossible:

- ambiguous scope with materially different outcomes;
- a missing dependency that can't be substituted;
- existing code that makes the planned approach unworkable.

Also **speak up (don't silently proceed)** when:

- a materially simpler valid approach emerges mid-implementation; or
- an AC genuinely reads two ways — surface it against the AC ID rather than guessing.

For everything else, note the unknown and continue; surface all unknowns at the end.

## Finish

When the phase is done and green:

1. Confirm the phase is marked `completed` in `state.md` with the Handoff section
   written.
2. **Lessons:** if anything non-obvious came up (a hack, a gotcha, a wrong assumption
   you corrected, a skipped gate), append it to `.specs/<slug>/lessons.md` per
   `references/lessons.md`. Routine success writes nothing.
3. Summarize what was built, decisions made beyond the artifacts, and any unknowns.
4. Recommend next: more phases remain → `/forge execute` again for the next phase;
   all phases done → suggest review or shipping.
