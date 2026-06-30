# Fix

**Goal:** find the root cause of a bug **and apply the fix**, end to end. One command:
diagnose → confirm → implement → verify. Output: `.specs/bugs/<name>.md` (the diagnosis
record) plus the committed code change.

`fix` is the bug counterpart to the full pipeline. The common use: after `forge execute`
you verify the work yourself, find something wrong, and run `forge fix <description of the
bug>` to both diagnose and repair it without re-running specify/design/plan.

**Discipline:** reproduce before you change code. The point of the diagnosis phases below
is to avoid fixing blind — never edit application code until the bug reproduces and a root
cause is confirmed. This is the one verb that is end-to-end by design (it runs the
implement step itself); it does not hand off to another verb on success.

Load `.specs/<slug>/lessons.md` if a related slug exists — past gotchas often explain the
bug. Derive a kebab-case bug name; if `.specs/bugs/<name>.md` exists, append `-2`, `-3`.

---

## Part 1 — Diagnose

### Phase 1 — Intake

No fixed question list. Interview until you have enough to attempt reproduction:

1. One question at a time (`AskUserQuestion` when available; never bundle).
2. Walk the tree — follow each new branch to resolution before returning.
3. Codebase first — don't ask what you can read.
4. Record, don't invent — "unknown" is a valid answer; write it down.

Usually needed before reproduction: expected vs. actual behavior with the verbatim error
or stack trace; the trigger (inputs, sequence, environment); determinism (every time /
intermittent / rate); what recently changed (deploy, dependency bump, config flip). Stop
intake the moment you can attempt reproduction. (When called right after `forge execute`,
much of this is already in context — don't re-ask it.)

### Phase 2 — Build a feedback loop

**This is the skill.** A fast, deterministic, pass/fail signal is what separates a fixed
bug from staring at code. Spend disproportionate effort here.

Strategies, roughly in order of preference:

1. **Failing test** in the project's framework, at whatever seam reaches the bug. Try
   this first.
2. **curl / HTTP script** against a running dev server.
3. **CLI invocation** with a fixture, diffing output against known-good.
4. **Headless browser** (Playwright) driving the UI, asserting DOM/console/network.
5. **Replay a captured trace** — real payload/event log through the code path in isolation.
6. **Throwaway harness** — minimal subset, mocked deps, exercises the path in one call.
7. **Property/fuzz loop** — for "sometimes wrong output", many random inputs.
8. **Bisection harness** — if it appeared between two states, automate "boot at X, check".
9. **Differential loop** — same input through old vs. new, diff outputs.

Then **sharpen the loop**: faster (cache setup, skip unrelated init), more deterministic
(pin time, seed RNG, freeze network), sharper signal (assert the specific symptom). A
2-second deterministic loop is a superpower; a 30-second flaky one barely helps. For
non-deterministic bugs, the goal is a high-enough reproduction rate to debug against —
loop, parallelize, stress, narrow timing windows.

**If you genuinely cannot build a loop:** stop. Write the report with status `blocked`
(list every strategy tried and why it failed, and what would unblock you — environment
access, a captured artifact, permission to instrument), tell the user, and **do not apply
a fix**. Never fix blind.

### Phase 3 — Reproduce

Run the loop. Confirm the failure is the one **the user described** (not a nearby
failure), that it reproduces across runs (or at a high enough rate), and that you've
captured the exact symptom. Do not proceed until it reproduces.

### Phase 4 — Hypothesize

Produce **3–5 ranked, falsifiable hypotheses** before testing any. Each states a
prediction: *"If X is the cause, then changing Y makes the bug disappear (or Z makes it
worse)."* Cite the specific evidence (file:line, log line, error text) for each. No
prediction = it's a vibe; discard or sharpen it.

### Phase 5 — Verify the cause

Work highest-confidence first. For each: restate the prediction; run the **smallest** probe
that confirms or refutes (prefer debugger/REPL over logs; tag temporary logs with a
unique prefix like `[DEBUG-xyz]` for one-grep cleanup); **change one variable at a time**.
Confirmed → write the report and go to Part 2. Refuted → mark it, next. If none confirm,
use the negative evidence to generate new hypotheses (back to Phase 4); if the well runs
dry, sharpen the loop (back to Phase 2). Loop until confirmed or genuinely exhausted.

### Write the diagnosis record

Write `.specs/bugs/<name>.md` from `templates/bug.md` (confirmed variant) with the root
cause, reproduction loop, hypotheses tested, fix proposal, and regression test. This
record is the input to Part 2 — write the Fix Proposal as concrete, actionable steps.

---

## Part 2 — Apply the fix

Once the root cause is confirmed, **apply it immediately** by running the bug-fix flow
described in `references/execute.md` ("Bug-fix mode deltas"). In short:

1. Add the **regression test** from the report and confirm it fails with the *reported*
   symptom (wrong symptom = wrong test).
2. Apply the **fix proposal** steps in order. Make the minimal change that fixes the root
   cause — resist scope creep; surface unrelated issues separately.
3. **Verify:** re-run the report's reproduction loop and confirm it now passes; run
   verifiers 1–2 from `references/verification.md` (tests, lint), plus verifier 3 against
   the bug's expected behavior. Bounded fix loop (≤3 cycles) then escalate, same as execute.
4. **Commit** atomically with a `fix:` type referencing the bug name.
5. Update the report: `Status: resolved` + a `Resolved: YYYY-MM-DD — <sha>` line.

If the diagnosis came back `blocked`, do **not** enter Part 2 — stop with the blocked
report and ask the user for what would unblock it.

---

## Finish

- Clean up any `[DEBUG-...]` instrumentation (one grep).
- If something non-obvious was learned, append to `.specs/<slug>/lessons.md` per
  `references/lessons.md`.
- Report: root cause, the fix applied, the commit, and that the regression test is green.

## Gotchas

- Reproduce before you fix. No code change before the bug reproduces and the cause is
  confirmed — a `blocked` diagnosis stops here, it does not get a guessed fix.
- Falsifiable or it's a vibe. One variable at a time. The loop is the skill — when stuck,
  sharpen it before generating more hypotheses.
- The regression test must fail for the reported reason before the fix, and pass after.
- Absences are evidence: a missing log line, a silent failure, an unreachable branch.
