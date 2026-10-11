# Execute

> **Phase prelude:** resolve `SPECS_ROOT` per SKILL.md → *Artifact root
> (session CWD)* before any read or write. Every `./.specs/...` path below is
> `$SPECS_ROOT/...`.

**Goal:** turn the plan into working, verified, committed code — **one phase at a
time.** Within a phase: implement its tasks (in parallel where the plan marks them
`[P]`), then verify the phase with independent subagents, fix what they flag, and mark
the phase done.

> **Terminology:** in this file, "phase" means a plan's group of tasks. "Delta" means
> the set of issues the verifiers found — the gap between current code and PASS.

Load first:

- `./.specs/<slug>/state.md` — size, task table by phase, decisions, handoff.
- `./.specs/<slug>/lessons.md` — Standing Rules plus tagged Log entries.
- The artifacts the current phase touches — read selectively.
- `references/verification.md` for the verifier contract.

## Source

Source is `spec.md` / `design.md` / `plan.md` under `./.specs/<slug>/`. Run the loop over
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

1. **Decide whether to delegate at all.** If the phase has only a couple of small
   tasks, or its tasks are tightly coupled, implement them in the main agent — don't
   pay subagent startup for a fan-out that barely parallelizes. Delegate only a
   self-contained chunk worth its own context (roughly: multiple files, or one
   substantial component). Fanning out one subagent per atomic task is the worst case:
   each cold-starts, reloads the spec and test setup, and its output pollutes your
   context for little real parallelism.
2. **Split the phase** into its `[P]` (parallel-safe) tasks and its sequential tasks,
   per the plan's parallelism assessment.
3. **Implement the tasks.** Run sequential tasks in order. Run `[P]` tasks
   concurrently.
   - **Batch, don't fan out per task.** Group the phase's `[P]` tasks into a small
     number of batches (aim ≤3) of related tasks — batch by locality, so tasks touching
     the same module or files go together. Hand each *batch* to one **implementer
     subagent** that works its tasks in its own context (sequentially within the batch,
     loading the shared files and setup once). One subagent per task only when the tasks
     are genuinely unrelated *and* each is substantial.
   - Give each subagent everything it needs: file paths, AC IDs, the task gates,
     constraints, and its `files` set.
   - **An implementer's prompt carries neither the catalogue nor a standards file.**
     `references/structural-standards.md` and any discovered `CODING_STANDARDS.md` go to
     **review-time agents only** (the three dispatches that file names). The only
     structural text an implementer's prompt carries is the scope/shape boundary in
     step 5.
   - The subagent returns the files it changed and does **not** commit; you run its
     gates and commit.
   - Use the Workflow tool to dispatch the fan-out if your runtime supports it;
     otherwise use sequential subagent calls.
   - **Set each implementer's model tier and effort** per SKILL.md Model & effort
     selection, which bounds the cheap end: economy needs a `reuses` pointer **and** a
     task that creates no new file and no new **exported type**, interface, or class.
   - The subagent returns a **compact summary**: paths changed, task-gate result
     (pass/fail), AC IDs satisfied, deviations/blockers/assumptions. No raw logs,
     diffs, or test dumps. Anything over ~100 lines goes to a file; the subagent
     returns the path.
4. Each task follows the **per-task loop** below.
5. **Run the phase gate** once every task in the phase is green — the broader check
   (full test suite + static analysis: typecheck + lint + format) that confirms the
   phase integrates.
6. **Verify the phase** with independent subagents, then fix the delta (below).
7. **Mark the phase `completed`** in `state.md` and write the Handoff section.

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
     cheap stand-in for verifier 5, which only runs on complex changes or a one-way door.
     The three ways it happens are **tautological**, **structure-sensitive** and
     **cannot-fail** — `references/plan.md` defines them and verifier 3 uses the same
     words. Mock at **system boundaries only**; never mock the change's own
     collaborators. An expected value must not reference a symbol **defined in the files
     the task changed**.
3. **Run the task gate.** The deterministic command from the plan. Non-zero = not
   done; fix and re-run. Never proceed on a failing gate.
4. **Review the batch structurally, before the commit** *(`standard`+, or a one-way door
   at any size)*. The gate proves the code behaves; nothing yet proves it is arranged
   well, and the implementer cannot prove that about its own work.

   **Once per batch.** Batching is by locality, so a per-task working-tree slice does
   not exist inside a batch. The axis runs once **per batch**, with the batch's changed
   hunks as its subject. Attribute each finding to a task through that task's `files`. A
   batch of one task is the ordinary case.

   Dispatch it per `references/structural-standards.md`, which holds the checks, the
   selection rule, the firing discipline and the verdict shape; this file holds only the
   loop mechanics. It is a **review-time agent**, so its prompt carries the catalogue and
   any discovered standards file. Tier: standard/high, frontier at `complex`, never
   economy.

   **The reviewer does not edit.** Findings go back to **the batch's own implementer**,
   which applies them and re-runs the gate — already a different agent, so no third role
   is needed — and the fixes land in the **same single task commit**.

   **Snapshot and restore.** Before dispatching, **snapshot** the batch's declared paths
   (the union of its tasks' `files`). If applying a finding breaks the gate, restore that
   snapshot **scoped to those paths only** — there is no commit boundary between implement
   and review, so an unscoped revert would discard the implementation.

   **Tamper detection.** Snapshot the **whole tree's** dirty paths around the dispatch,
   excluding the paths of concurrently in-flight sibling tasks. The declared set alone
   would miss the dangerous edits: a test file, a gate's config, a shared barrel. Revert a
   delta **inside** the declared set and still use the verdict. Record a delta **outside**
   it as a gap, and do **not** commit the task.

   **Two cycles, their own budget.** Review → apply → re-run the gate, at most **two
   cycles** per batch. These cycles are separate from the phase's three fix cycles below.
   Record a gate failure the fix did not cause — the same failure as before the review
   step, or one in a path the finding never touched — and do **not** count it against the
   two.

   **Record each finding's disposition** — `applied`, `rejected(reason)`, or `parked` — in
   `state.md`. A rejection with **no reason is a gap**. This is the detector for a finding
   that is raised in a verdict and then vanishes from the commit.

   **The scope/shape boundary governs a valid rejection** — step 5 states it, and it binds
   here, where a finding is accepted or dropped. Relocating a rule or replacing a
   primitive is **the same scope**, so a rejection may not cite "unrequested
   abstraction". A rejection that cites it carries no reason, and a rejection with no
   reason is a gap. A finding that genuinely cannot be applied without new scope — a port,
   layer, second implementation or extension point — is a **DESIGN-GAP** instead. Record
   it against the design element, spend no cycle on it, and route it back to `design.md`
   the way `references/verification.md` routes a `SPEC-GAP`.

   **Escalation.** If two cycles do not clear the findings: the task is **not committed**,
   the tree is left as-is, its status becomes **`blocked`**, and `state.md` records the
   remaining findings plus the snapshot reference. Stop and report; do not start the next
   task behind a `blocked` one. **A re-invocation picks a `blocked` task up first.** It
   re-reads the recorded findings instead of reviewing from scratch, and restarts the
   cycle counter.

5. **Self-check before committing.** Would a senior engineer call this overcomplicated,
   or badly arranged? **Scope** governs *whether* something is built. **Shape** governs
   *how* what is built is arranged. Moving a rule to the unit that owns its data, or
   giving a repeated-validation primitive a domain type, is **the same scope**: keep it.
   Adding a port, a layer, or a config flag is **new scope**: leave it out. Confirm the
   tests aren't shallow and nothing beyond the task crept in.
6. **Commit atomically.** One task = one commit, only the files in the task
   definition (its `files` set). Conventional Commits, type matching the change
   (`feat`/`fix`/`refactor`/...), imperative mood, body when the "why" isn't obvious.
   (Skip Claude/AI co-author trailers.)
7. **Update `state.md`.** Mark the task `done` with evidence (commit sha, test count, and
   each structural finding's disposition).

### When subagents are unavailable (degrade, never fake)

General rules: `references/review.md` → *Graceful degradation*. The structural axis adds
these, because its value comes from the dispatch boundary:

- **Run it inline after a verbatim re-read** of the batch's changed files. Read the
  current bytes from disk.
- **Edits are forbidden during the review step.** Collect findings, then apply them.
- **Snapshot the declared paths before the step** and re-run the gate after, as above.
- **Report the tamper comparison as `inoperative`.** One context gives a tree delta no
  boundary to straddle, so the comparison cannot run at all.
- **The reviewer and the implementer are now the same agent.** Record those tasks as
  reviewed **inline**; never as independently reviewed.
- **A lens skipped for any reason is `recorded as a gap`**, never reported as reviewed.

### Verify the phase (independent subagents)

Once all the phase's tasks are committed and the phase gate is green, dispatch the
applicable verifiers over the phase's changes. Author ≠ verifier; fresh context; run
in parallel.

**Which verifiers run is gated by size, and the size table lives in
`references/verification.md` — read it there.**

**Override:** a change classified a **one-way door** in `state.md` runs verifier 5
regardless of size, scoped to the branches reachable from its `[critical]` ACs
(`references/specify.md` for the door test, `references/verification.md` for the
targeting rule).

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
   you corrected, a skipped gate), append it to `./.specs/<slug>/lessons.md` per
   `references/lessons.md`. Routine success writes nothing.
3. Summarize what was built, decisions made beyond the artifacts, and any unknowns.
4. Recommend next: more phases remain → `/forge execute` again for the next phase;
   all phases done → suggest review or shipping.
