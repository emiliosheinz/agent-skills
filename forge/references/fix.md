# Fix

**Goal:** find the root cause of a bug **and apply the fix**, end-to-end. One command:
diagnose → confirm → implement → verify. Output: `.specs/<slug>/bugs/<name>.md` (the
diagnosis record) plus the committed code change.

`fix` is the bug counterpart to the full pipeline. The common use: after
`/forge execute` you verify the work yourself, find something wrong, and run
`/forge fix <description of the bug>` to both diagnose and repair it without
re-running specify/design/plan.

**Discipline:** reproduce before you change code. The point of the diagnosis steps
below is to avoid fixing blind — never edit application code until the bug reproduces
and a root cause is confirmed.

> `fix` is the one phase that is end-to-end by design. It runs the implement step
> itself and does not hand off to another phase on success. SKILL.md's "recommend the
> next verb" rule names this as the documented exception.

---

## Step 0 — Bind the bug to a parent spec

Every bug lives under a parent spec at `.specs/<slug>/bugs/<name>.md`. Bind the slug
before intake.

**Invocation forms.**

- `/forge fix <bug-description>` — infer the slug (default).
- `/forge fix <slug> <bug-name>` — user pinned the slug explicitly; use it verbatim
  and skip inference.

**Inference order (default form).**

1. **Recent execute context.** If the current session shows a recent `/forge execute`
   invocation, prefer that slug.
2. **Keyword scan of `.specs/*/spec.md`.** Match the bug description against each
   spec's title, acceptance criteria, and scope. Rank by keyword hits.
3. **Ask** when inference is ambiguous.

**Candidate resolution.**

- Exactly one candidate — proceed with it and state the slug you picked before
  intake.
- Zero or two-or-more candidates — ask the user to choose. Use `AskUserQuestion` with
  the candidates as options (plus "none of these") when available; fall back to a
  single plain-text question listing available slugs.

**Refuse when no spec exists (canonical rule).** If no matching spec exists after
inference and asking, **stop**. Do **not** create the bug file. Do **not** auto-create
a placeholder spec. Report the situation and offer two options:

- list the available slugs under `.specs/` so the user can pick one, or
- recommend running `/forge specify <slug>` first to capture the parent context, then
  re-run `/forge fix`.

**Once the slug is bound**, load the parent context:

- `.specs/<slug>/spec.md` — requirements and AC IDs the bug may violate.
- `.specs/<slug>/design.md` — architecture, contracts, verification gates.
- `.specs/<slug>/state.md` — size, Decisions log, task status.
- `.specs/<slug>/lessons.md` — Standing Rules plus tagged Log entries; past gotchas
  often explain the bug.

Derive a kebab-case bug name; if `.specs/<slug>/bugs/<name>.md` exists, append `-2`,
`-3`. Create `.specs/<slug>/bugs/` if missing.

---

## Part 1 — Diagnose

### Calibrate depth

Match effort to the bug; the parent spec's Sizing does not decide this. Bug difficulty is
a local Part 1 judgment, orthogonal to the ratcheted size in `state.md` — a quick-sized
spec can host a hard bug.

- **Simple** (obvious once reproduced, deterministic) — run Steps 4–5 inline in the main
  agent. Parallel scouting, parallel probes, and a separate refuter are optional.
- **Hard** (intermittent, subtle, cross-system, or the bug already survived a prior
  `/forge fix`) — unlock parallel loop-scouting (Step 2), parallel probes (Step 5a), and
  adversarial confirmation (Step 5b).

On the hard path, probes run as subagents under the contract in `SKILL.md` Orchestration
(cite, don't restate). Isolate shared state: a probe that mutates a shared resource (one
dev server, one DB row, one port) runs alone or in its own worktree/fixture.

### Step 1 — Intake

No fixed question list. Interview until you have enough to attempt reproduction:

1. One question at a time (`AskUserQuestion` when available; never bundle).
2. Walk the tree — follow each new branch to resolution before returning.
3. Codebase first — don't ask what you can read.
4. Record, don't invent — "unknown" is a valid answer; write it down.

Usually needed before reproduction:

- expected vs. actual behavior with the verbatim error or stack trace;
- the trigger (inputs, sequence, environment);
- determinism (every time / intermittent / rate);
- what recently changed (deploy, dependency bump, config flip).

Stop intake the moment you can attempt reproduction. When called right after
`/forge execute`, much of this is already in context — don't re-ask it.

### Step 2 — Build a feedback loop

**This is the skill.** A fast, deterministic, pass/fail signal is what separates a
fixed bug from staring at code. Spend disproportionate effort here.

Strategies (try in order; jump to a later one only when an earlier one is unworkable
for this specific bug):

1. **Failing test** in the project's framework, at whatever seam reaches the bug. Try
   this first.
2. **curl / HTTP script** against a running dev server.
3. **CLI invocation** with a fixture, diffing output against known-good.
4. **Headless browser** (Playwright) driving the UI, asserting DOM/console/network.
5. **Replay a captured trace** — real payload/event log through the code path in
   isolation.
6. **Throwaway test harness** — a minimal piece of code with mocked dependencies that
   exercises the buggy path in one call.
7. **Property / fuzz loop** — for "sometimes wrong output", many random inputs.
8. **Bisection harness** — if the bug appeared between two states, automate "boot at
   X, check".
9. **Differential loop** — same input through old vs. new, diff outputs.

**Scout in parallel when the reachable seam is unclear (hard path).** Dispatch one
subagent per candidate strategy, each tasked only to stand up the loop and report whether
it yields a fast deterministic signal — not to debug. Keep the first loop that works;
discard the rest. Skip scouting when strategy 1 obviously reaches the bug — just write the
test (the common case right after `/forge execute`, where context is already loaded).

Then **sharpen the loop**: faster (cache setup, skip unrelated init), more
deterministic (pin time, seed RNG, freeze network), sharper signal (assert the
specific symptom). A 2-second deterministic loop is a superpower; a 30-second flaky
one barely helps. For non-deterministic bugs, the goal is a high-enough reproduction
rate to debug against — loop, parallelize, stress, narrow timing windows.

**If you cannot build a loop:** stop. Write the report with status `blocked` (list
every strategy tried and why it failed, plus what would unblock you — environment
access, a captured artifact, permission to instrument). Tell the user. **Do not apply
a fix.** Never fix blind.

### Step 3 — Reproduce

Run the loop. Confirm three things:

- the failure is the one **the user described** (not a nearby failure);
- it reproduces across runs (or at a high enough rate);
- you've captured the exact symptom.

Do not proceed until it reproduces.

### Step 4 — Hypothesize

Produce **3–5 ranked, falsifiable hypotheses** before testing any. Each states a
prediction: *"If X is the cause, then changing Y makes the bug disappear (or Z makes
it worse)."* Cite the specific evidence (file:line, log line, error text) for each.
No prediction = not a hypothesis; discard or sharpen it.

### Step 5 — Verify the cause

**Simple default (inline).** Work highest-confidence first. For each hypothesis:

1. **Restate the prediction.**
2. **Run the smallest probe** that confirms or refutes it. Prefer a debugger/REPL
   over logs. If you must add logs, tag them with a unique prefix like `[DEBUG-xyz]`
   so you can grep-clean them later.
3. **Change one variable at a time.**
4. **Decide:** confirmed by the probe → hand to 5b before accepting it; refuted → mark
   it, try the next hypothesis.

#### 5a — Probe in parallel (hard path)

Give each ranked hypothesis its own probe subagent, dispatched concurrently. Each is
stateless: the reproduction command, its one hypothesis and prediction, and the file:line
evidence — nothing else. Each runs the smallest probe that settles its prediction and
returns this verdict (distinct from the verifier verdicts in `references/verification.md`):

```markdown
### Probe H<n> — <hypothesis>: CONFIRMED | REFUTED | INCONCLUSIVE
Prediction: <the falsifiable prediction tested>
Result: <what the probe observed — file:line, log line, value>
```

Collect the verdicts. A probe that mutates shared state runs alone (see Calibrate depth).

#### 5b — Confirm adversarially

`fix` commits the moment it confirms a cause — it removes the human review that the
standalone `diagnose` skill leaves before a fix is applied. **The adversarial pass is
that review.** Before accepting a cause, hand it to a fresh, independent subagent whose
only job is to refute it — given only the claimed cause, the repro loop, and the evidence,
never the author's reasoning. It hunts for a counterexample, an alternative cause that
fits the same evidence, or an input where the predicted fix would not remove the symptom.

- **Refutation fails** (the cause holds) → write the diagnosis record and go to Part 2.
- **Refutation succeeds** → the cause is wrong or incomplete; fold the counter-evidence
  into Step 4 and probe again.

5b is **mandatory when the bug survived a prior fix**; an inline red-team (same context)
is acceptable for a Simple bug, a separate refuter subagent for a Hard one.

**If none survive:** use the negative evidence to generate new hypotheses (back to Step
4). Exhausted your hypotheses → sharpen the loop (back to Step 2). When genuinely
exhausted — no hypothesis survives both probing and refutation — **stop and write the
report with status `blocked`; do not enter Part 2.** Never auto-apply a guess.

### Write the diagnosis record

Write the record **only after 5b's refutation fails** — a refuted cause never gets written
as the confirmed variant; it loops back to Step 4. Write `.specs/<slug>/bugs/<name>.md`
from `templates/bug.md` (confirmed variant) with the parent slug, root cause, reproduction
loop, hypotheses tested, related AC IDs, fix proposal, and regression test. Note how the
cause survived refutation in the Root Cause / Hypotheses Tested sections; if 5b surfaced a
surviving counter-case (an input the fix must still hold for), fold it into the Regression
Test / Prevention field so Part 2 checks against it. This record is the input to Part 2 —
write the Fix Proposal as concrete, actionable steps.

---

## Part 2 — Apply the fix

Once the root cause is confirmed, **apply it immediately** by running the bug-fix
flow in `references/execute.md` ("Bug-fix mode deltas"). In short:

1. Add the **regression test** from the report and confirm it fails with the
   *reported* symptom (wrong symptom = wrong test). Place it alongside the parent
   spec's existing verification gates so the same test infrastructure covers it.
2. Apply the **fix proposal** steps in order. Make the minimal change that fixes the
   root cause — resist scope creep; surface unrelated issues separately.
3. **Verify:** re-run the report's reproduction loop and confirm it now passes; run
   verifiers 1–2 from `references/verification.md` (tests, lint), plus verifier 3
   against the bug's expected behavior and the parent spec's Related AC IDs.
   Bounded fix loop (≤3 cycles), then escalate, same as execute.
4. **Commit** atomically with a `fix:` type referencing the bug name.
5. Update the report: `Status: resolved` plus a `Resolved: YYYY-MM-DD — <sha>` line.
6. Append a Decisions row to `.specs/<slug>/state.md`:
   `AD-NN | Fix <bug-name> for <AC-ID(s) or —> | <root cause summary> | active | date`.
   The bug file remains the diagnosis record; the Decisions row is the trail from the
   parent spec back to it.

If the diagnosis came back `blocked`, do **not** enter Part 2 — stop with the blocked
report and ask the user for what would unblock it.

---

## Finish

- Clean up any `[DEBUG-...]` instrumentation (one grep).
- If something non-obvious was learned, append to `.specs/<slug>/lessons.md` per
  `references/lessons.md`.
- Report: root cause, the fix applied, the commit, and that the regression test is
  green.

## Gotchas

- **Reproduce before you fix.** No code change before the bug reproduces and the
  cause is confirmed. A `blocked` diagnosis stops here; it does not get a guessed
  fix.
- **Author ≠ confirmer.** A cause isn't confirmed until an independent probe tried and
  failed to refute it — and because `fix` commits the moment it confirms, a self-graded
  wrong cause ships as a wrong fix.
- **Exhausted is `blocked`, never a guess.** No hypothesis survives probing and
  refutation → stop at a `blocked` report; do not enter Part 2.
- **Falsifiable or it isn't a hypothesis.** One variable at a time. The loop is the
  skill — when stuck, sharpen it before generating more hypotheses.
- **The regression test must fail for the reported reason before the fix, and pass
  after.**
- **Absences are evidence:** a missing log line, a silent failure, an unreachable
  branch.
