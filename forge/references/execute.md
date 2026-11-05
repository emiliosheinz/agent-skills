# Execute

**Goal:** turn the plan into working, verified, committed code — **one phase at a
time.** Within a phase: implement its tasks (in parallel where the plan marks them
`[P]`), then run the phase's gate, which is its independent verifiers, fix what they flag,
and mark the phase done.

> **Terminology:** in this file, "phase" means a plan's group of tasks. "Delta" means
> the set of issues the verifiers found — the gap between current code and PASS.

Load first:

- `./.specs/<slug>/state.md` — size, door, task status by phase, decisions, handoff.
- `./.specs/<slug>/plan.md` — the current phase's tasks and gates.
- The artifacts the current phase touches — read selectively.
- `references/verification.md` for the verifier contract.

## Source

Source is `spec.md` / `design.md` / `plan.md` under `./.specs/<slug>/`. Run the loop over
the plan's tasks.

If the change is above `quick` with no plan, stop and recommend `/forge plan`, or `/forge
specify` if it has no spec. If artifacts are missing on a quick change (a direct `/forge
execute`), do a **quick, focused** research pass: scan the codebase for patterns, test
setup, entry points. Derive scope, architecture, constraints, and acceptance criteria from
the request and code. Write a quick `spec.md` before any code: Problem, the six
`Conventions observed` categories per `references/specify.md`, the verbatim Request, and
explicit ACs, with each sentence of the request traced to an AC or a stated exclusion.
Classify the door per `references/specify.md` and record it in `state.md`, because the
door decides this change's gate. A one-way door needs reviews this path does not run, so
stop and recommend `/forge specify`. Don't do a broad survey.

## Phase selection

Read `state.md`'s task status. Implement **exactly one phase per invocation** — the first
phase whose prerequisite phases are complete and that isn't done yet. A phase with every
task `done` or `unverified`, no `Verifying:` line, and only `gap-open` rows open counts as
complete. If the user names a phase, use that one. Do not continue into the next phase;
finish, report, and let the user invoke `/forge execute` again.

**Resume comes first.** On a user's re-invocation, a `blocked` task is picked up before
anything else, from its recorded failure, with its counter restarted. A phase whose
`Verifying:` line is set re-runs verifiers 1 and 2, resumes at the recorded stage, and
restarts that stage's counter. A compaction restarts nothing: the recorded cycle count
stands.

**A quick change is one implicit phase with one implicit task.** Write that task's row in
`## Tasks` and its `Base:` line first. Its task gate is a real discovered command from the
Baseline step, run against the surface the change touches. Run the per-task loop once and
go to the gate. Its evidence row, when verifier 4 does not run, is labelled an author check.
On a screen phase at `quick`, the look's rows go into Verification evidence as the look
wrote them, with `sensor` set to `look`, and a visible AC the look did not see is a
`gap-open` row.

### Stop before the change sprawls

On the quick path, before writing code, list the atomic steps. **Stop if any of these are
true:**

- more than ~5 steps;
- cross-file or ordering dependencies;
- requires a new public interface.

The change was mis-sized. Promote the size, log the reason in `state.md` Decisions, and
recommend `/forge plan` (or `/forge design` if a contract emerged). Recommend — do not run
it for the user.

## Baseline

After the sprawl check and before a change's first task, once, fill `state.md`'s `##
Baseline`:

1. Discover the project's test, type-check, lint and format commands, per
   `references/verification.md`.
2. Run them and record the commands, the result, and the test count. Verifiers 1 and 2 use
   these.

A repo already red, or whose checks cannot run here, continues only on the user's
decision, with the failing names or the reason recorded, so old failures cost no fix
cycles. A run that cannot ask continues as the type-check row of
`references/verification.md` → *Gaps* says. Verifiers 1 and 2 compare against these
recorded results.

## Run the phase

1. **Record the phase's start.** If the phase has no `Base:` line, write `Base: <HEAD sha>`
   under its heading in `## Tasks`. Verifier 3 reviews from there.
2. **Decide whether to delegate at all.** If the phase has only a couple of small
   tasks, or its tasks are tightly coupled, implement them in the main agent. Delegate only
   a self-contained chunk worth its own context (roughly: multiple files, or one
   substantial component). Read selectively, and pull only the spec and design sections the
   current task touches.
3. **Split the phase** into its `[P]` (parallel-safe) tasks and its sequential tasks,
   per the plan's parallelism assessment.
4. **Implement the tasks.** Run sequential tasks in order. Run `[P]` tasks
   concurrently.
   - **Batch, don't fan out per task.** Group `[P]` tasks into at most about 3 batches by
     locality, one implementer subagent per batch; use one per task only when tasks are
     genuinely unrelated *and* each is substantial.
   - Give each subagent everything it needs: file paths, AC IDs, the task gates,
     constraints, and its `files` set.
   - **An implementer's prompt carries neither the catalogue nor a standards file.**
     `references/structural-standards.md` and any discovered `CODING_STANDARDS.md` go to
     **review-time agents only**. The only structural text an implementer's prompt carries
     is the scope/shape boundary in the self-check below.
   - A task in a screen phase that touches what the screen shows also carries the UI brief
     from `references/ui.md`, which the main agent reads first when it implements the task
     itself. On `Surface: none`, promote the surface first, as in *Run the verifiers*.
   - The subagent returns the files it changed and does **not** commit; you run its
     gates and commit.
   - Use the Workflow tool to dispatch the fan-out if your runtime supports it;
     otherwise use sequential subagent calls.
   - **Set each implementer's model tier and effort.** See `SKILL.md` → *Model & effort
     selection*.
   - The subagent returns a **compact summary**: paths changed, task-gate result
     (pass/fail), AC IDs satisfied, deviations/blockers/assumptions. No raw logs,
     diffs, or test dumps.
5. Each task follows the **per-task loop** below.
6. **Run the phase's gate:** its verifiers, then fix the delta (below).
7. **Mark the phase `completed`** in `state.md` and write the Handoff section.

### Per-task loop

For each task:

1. **State intent, and mark the task `in-progress`.** Briefly: assumptions, files to
   touch, the AC IDs it satisfies, and what "done" means (the task's gate + done-when).
2. **Implement, simply.**
   - Write the code and its co-located tests.
   - Test-first is encouraged. Derive tests from the spec's acceptance criteria (the
     expected *values*), not from the implementation.
   - **Forge's own identifiers stay out of everything durable.** This is the only
     statement of the rule; `plan.md` and `verification.md` point here. An AC ID
     (`ONBD-03`), a task ID, a decision ID (`AD-07`), a slug, a `./.specs/...` path, or a
     verdict name like `SPEC-GAP` belongs in no source file, comment, test name or
     description, fixture, or commit message. `.specs/` is a working directory the
     repository need not carry, so a reader a year from now has the code and nothing to
     resolve the reference against: the comment points at nothing and the test name names
     nothing.

     State the thing itself instead. `// A declared pair cannot change the verdict, so
     holding these in a contributor-editable file would be a knob that does nothing`,
     rather than `// EVAL-04 forbids declared pairs from changing the verdict`. A test
     says what behaviour it pins — `it("rejects a session whose IdP token was revoked")`,
     rather than `it("AUTH-02")`. **The trace lives in `state.md`'s evidence rows**
     (`AC ID → file:line`), which is precisely why the code does not have to carry it.
   - Write only what the task needs: no anticipatory code, no single-use abstractions,
     no unrequested configurability, no error handling for impossible states.
   - **Quick test-strength check.** If a plausible *wrong* implementation would still
     pass the test, the test is too weak. Strengthen it before moving on. This is the
     cheap stand-in for verifier 5, which only runs on complex changes or a one-way door.
     Read `references/verification.md` → *How a test lies* for the rules that apply here.
3. **Run the task gate.** The deterministic command from the plan, or the discovered one on
   a quick change. Non-zero = not done; fix and re-run. Never proceed on a failing gate.

   **At most 3 cycles** (`SKILL.md` → *Retries*), counted as `gate cycle <n>` in the task's
   evidence cell so a compaction keeps it. If it is still red: the task is **not
   committed**, the tree is left as-is, its status becomes **`blocked`**, and `## Open
   findings` records the failure. Stop and report. Tasks already in flight may finish and
   commit, but start no new task behind a `blocked` one, and do not run the phase's gate.

   **A gate that cannot run here** (its command needs what the environment lacks) is not
   red. Go on to steps 4 and 5; in step 6 the task's status is **`unverified`**, not
   `done`, with a `gap-open` row saying why. It spends no cycle and blocks nothing, unless
   `references/verification.md` → *Gaps* makes that check `gap-blocking`.
4. **Self-check before committing.** Would a senior engineer call this overcomplicated,
   or badly arranged? **Scope** governs *whether* something is built. **Shape** governs
   *how* what is built is arranged. Moving a rule to the unit that owns its data, or
   giving a repeated-validation primitive a domain type, is **the same scope**: keep it.
   Adding a port, a layer, a second implementation, a flag or an extension point is
   **new scope**: leave it out. Confirm the tests aren't shallow and nothing beyond the
   task crept in.

   **Then grep the changed files and the commit message for forge's identifiers**: the
   spec's AC prefix, task IDs, `AD-` numbers, `.specs/`, and verdict names, plus the slug
   when it is distinctive enough not to match ordinary words. Clear every hit.
5. **Commit atomically.** One task = one commit, only the files in the task
   definition (its `files` set). Conventional Commits, type matching the change
   (`feat`/`fix`/`refactor`/...), imperative mood, body when the "why" isn't obvious.
   (Skip Claude/AI co-author trailers.)
6. **Update `state.md`.** Mark the task `done` with evidence (commit sha and test count).

### Run the verifiers

Once all the phase's tasks are committed, dispatch the phase's verifiers over its changes.
`references/verification.md` holds the run order, and `SKILL.md` → *Sizing* says which run,
including what a one-way door adds. Author ≠ verifier; fresh context.

If `Surface` is `none` and a task or the phase's diff would make a screen phase
(`SKILL.md` → *Sizing*), set it to `ui`, log the reason in Decisions, and read
`references/ui.md` before dispatching. On a screen phase, verifier 3's prompt also carries
the reference and the UI rows, per that file.

Write `Verifying: <stage>, cycle <n>` under the phase's heading in `## Tasks` as each stage
and cycle starts, so a compaction or a re-invocation keeps the position. Before a long
dispatch, verifier 5 above all, also note it in Handoff.

Collect the verdicts into an overall PASS/FAIL plus a single severity-ranked list
(Blocker → Major → Minor → Cosmetic).

### Fix the delta (bounded loop)

If a verifier FAILs:

1. Collect the specific failures into `state.md`'s `## Open findings`, one row each:
   `source · finding · disposition`.
2. Fix **top-down by severity**. Blocker and Major findings must clear before the next
   verifier starts; Minor and Cosmetic ones become `reported`.
3. Commit the fix. A fix commit touches only the files its finding cites, and their tests.
4. Re-run verifiers 1 and 2 and the verifier or stage that failed, then go on to the next.
   Earlier stages that passed do not re-run. If that fix turns 1 or 2 red, repairing it
   spends the same stage's budget and `Verifying:` keeps that stage.

**At most 3 fix → re-verify cycles per stage.** Each stage has its own budget. If a stage is
still failing after 3, stop there and escalate to the user with the delta and what was
tried. Never loop forever or weaken a check.

**Record each finding's disposition** — `applied`, `rejected(reason)`, or `reported`. A
rejection with **no reason is a gap**. This is the detector for a finding that is raised in
a verdict and then vanishes from the commit. Pass prior dispositions to a re-run, so a
rejected finding burns no cycle.

**The scope/shape boundary governs a valid rejection.** Relocating a rule or replacing a
primitive is **the same scope**, so a rejection may not cite "unrequested abstraction". A
rejection that cites it carries no reason. A finding that genuinely cannot be applied
without new scope — a port, a layer, a second implementation, a flag or an extension point
— is a **DESIGN-GAP** instead. Record it against the design element and spend no cycle on
it.

`references/verification.md` → *Gaps* holds the outcome of a SPEC-GAP, a DESIGN-GAP and
every other gap. **On a `gap-blocking` row, stop:** finish what does not depend on it,
write Handoff with `Next: /forge fix` for a SPEC-GAP or the decision needed otherwise, and
report. On a later invocation, a SPEC-GAP row whose AC now has its expected value in
`spec.md`, or is retired, becomes `applied`.

**On PASS**, append a compact **Verification evidence** subsection in `state.md` —
one row per AC (`AC ID → file:line → spec-defined expected value → covered`) plus the
sensor result. No prose, no logs. This preserves the AC-to-code proof that would
otherwise be lost once tests are green. Clear the `Verifying:` and `Fix-base:` lines.

## Test integrity (non-negotiable)

- Don't weaken assertions to force a pass.
- Don't delete, skip, or disable tests to get green. Test counts must not silently
  drop.
- Every test you write must map to an AC, edge case, or done-when criterion — no
  speculative what-if tests, no tests of framework/library behavior (verifier 4
  flags orphans, and the fix loop removes them).
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
   `SKILL.md` → *Lessons*. Routine success writes nothing.
3. **Report what no phase will act on:** every `reported` finding; any lesson a command
   could enforce, proposed as a concrete check; and any judgement lesson, naming the
   project's `CODING_STANDARDS.md` as its destination when one exists. On a screen phase,
   include the look list per `references/ui.md`.
4. Summarize what was built, decisions made beyond the artifacts, and any unknowns.
5. Recommend next: more phases remain → `/forge execute` again for the next phase;
   all phases done → suggest review or shipping.
