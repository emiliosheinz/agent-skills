---
name: diagnose
description: >
  Root-causes complex bugs through a structured loop and saves a verified fix proposal —
  it diagnoses, it never fixes. Builds a fast deterministic feedback loop, reproduces,
  then probes ranked falsifiable hypotheses with parallel subagents and confirms the
  cause adversarially before writing the report. Use when a bug, error, crash, exception,
  failing or flaky test, regression, or unexplained behavior needs root-causing —
  especially when it is intermittent, subtle, cross-system, or resisted a first fix.
---

# Diagnose

**Goal:** find and verify the root cause of a bug, then save a concrete, actionable fix
proposal as a persistent artifact.

**Hard rule — you diagnose, you do not fix.** Never edit application code to make the
bug go away. The fix goes in the report as a proposal; applying it is a separate step,
taken only after the user has reviewed. Temporary instrumentation (tagged debug logs, a
throwaway harness) is allowed and gets cleaned up before you finish.

**When to reach for it:** when the cause is unknown and the bug is hard — intermittent,
subtle, cross-system, or it already survived one wrong fix. Diagnose goes deep (parallel
probes, adversarial confirmation) and stops at a reviewed proposal. For a bug you already
understand and just want to fix, skip this and fix it directly.

## Orchestration (subagent contract)

Diagnosis is where independent, parallel perspectives pay off most: an agent that
grades its own reasoning tends to pass it, and hypotheses probe faster in parallel than
one at a time. Use subagents under one contract:

- **One level of delegation.** Subagents do not spawn subagents.
- **Stateless.** Put everything a subagent needs in its prompt: the repro command, the
  one hypothesis it owns, the file:line evidence, what a pass/fail looks like. It shares
  none of your context.
- **Compact returns.** A subagent returns a structured verdict (below), not raw logs.
  Anything over ~100 lines goes to a file; it returns the path.
- **Isolate shared state.** Parallel probes are safe only when they do not fight over
  the same mutable resource (one dev server, one DB row, one port). Probes that need
  exclusive access run sequentially, or each in its own git worktree / fixture.
- **Workflow is an optional speed-up** for dispatching the fan-out where the runtime
  supports it. Plain sequential subagent calls always work as a fallback — never
  require Workflow.
- **`AskUserQuestion` for intake**, one question at a time, with a recommended default.
  Fall back to a single plain-text question. Never bundle unrelated questions.

Probe verdict format (Phase 5):

```markdown
### Probe H<n> — <hypothesis>: CONFIRMED | REFUTED | INCONCLUSIVE
Prediction: <the falsifiable prediction tested>
Result: <what the probe observed — file:line, log line, value>
```

## The loop

```text
1 Intake      adaptive interview — only what the code can't tell you
2 Feedback    a fast, deterministic, pass/fail signal for the bug   ← the skill
3 Reproduce   run the loop; confirm it's the user's bug
4 Hypothesize 3–5 ranked, falsifiable hypotheses, before testing any
5 Verify      5a probe them in parallel · 5b confirm the winner adversarially
6 Report      save the proposal to .specs/bugs/<name>.md for review
```

Loop back freely: refuted hypotheses feed Phase 4; a dry hypothesis well sends you to
Phase 2 to sharpen the loop. You leave this skill only with a confirmed cause or an
honest `blocked` report — never a guess.

## Calibrate depth

Match effort to the bug; don't pay fan-out ceremony for a typo.

- **Simple** (obvious once reproduced, deterministic) — run Phases 4–5 inline in the
  main agent. Parallel probes and adversarial confirmation are optional.
- **Hard** (intermittent, subtle, cross-system, or survived a prior fix) — the default
  this skill is built for. Use parallel probes (5a) and adversarial confirmation (5b).

## Phase 1 — Intake

No fixed question list. Interview until you have enough to attempt reproduction:

1. **One question at a time** (`AskUserQuestion`; never bundle).
2. **Walk the tree** — each answer closes a branch or opens new ones; follow new
   branches to resolution before returning to the parent.
3. **Codebase first** — don't ask what you can read. Save the user's attention for what
   only they know.
4. **Record, don't invent** — "unknown" is a valid answer; write it down.

Usually needed before reproduction: expected vs. actual behavior with the verbatim
error or stack trace; the trigger (inputs, sequence, environment); determinism (every
time / intermittent / rate); what recently changed (deploy, dependency bump, config
flip). Stop the moment you can attempt reproduction — anything still missing surfaces in
Phase 2; return here only for what only the user can answer.

## Phase 2 — Build a feedback loop

**This is the skill.** A fast, deterministic, pass/fail signal is what separates a fixed
bug from staring at code. Bisection, hypothesis-testing, and instrumentation all just
consume that signal — without one, no amount of reading saves you. Spend
disproportionate effort here. Be aggressive, be creative, refuse to give up.

**Strategies, roughly in order of preference** (jump to a later one only when an earlier
one is unworkable for this specific bug):

1. **Failing test** in the project's framework, at whatever seam reaches the bug. Try this first.
2. **curl / HTTP script** against a running dev server.
3. **CLI invocation** with a fixture, diffing output against known-good.
4. **Headless browser** (Playwright) driving the UI, asserting DOM / console / network.
5. **Replay a captured trace** — a real payload or event log through the code path in isolation.
6. **Throwaway harness** — minimal code with mocked deps that exercises the buggy path in one call.
7. **Property / fuzz loop** — for "sometimes wrong output", many random inputs.
8. **Bisection harness** — bug appeared between two known states → automate "boot at X, check" for `git bisect run`.
9. **Differential loop** — same input through old vs. new (or two configs), diff outputs.

**Scout in parallel when the reachable seam is unclear.** Instead of trying strategies
one at a time, dispatch a subagent per candidate strategy, each tasked to *stand up the
loop and report whether it yields a fast deterministic signal* — not to debug. Keep the
first loop that works; discard the rest. Skip scouting when strategy 1 obviously reaches
the bug — just write the test.

**Then sharpen the loop — treat it as the product:**

- **Faster** — cache setup, skip unrelated init. A 2-second loop is a superpower; a 30-second flaky one barely helps.
- **More deterministic** — pin time, seed RNG, freeze network, fix fixtures.
- **Sharper signal** — assert the *specific* symptom the user reported, not "didn't crash".

**Non-deterministic bugs:** the goal isn't a clean repro, it's a *high enough*
reproduction rate to debug against. Loop the trigger, parallelize, stress, narrow timing
windows. A 50%-flake bug is debuggable; 1% is not — keep raising the rate.

**If you genuinely cannot build a loop:** stop. Skip to Phase 6 with status `blocked` —
list every strategy tried and why each failed, and ask for what would unblock you
(environment access, a captured artifact, permission to instrument). Do not hypothesize
without a loop.

## Phase 3 — Reproduce

Run the loop. Confirm three things before going further:

- the failure is the one **the user described** — not a nearby failure (wrong bug → wrong fix);
- it reproduces across runs (or, for flaky bugs, at a high enough rate);
- you've **captured the exact symptom** (error text, wrong value, slow timing) so the fix can be verified against it.

Do not proceed until the bug reproduces.

## Phase 4 — Hypothesize

Produce **3–5 ranked, falsifiable hypotheses before testing any of them** —
single-hypothesis generation anchors on the first plausible idea. Each must state a
prediction:

> *"If X is the cause, then changing Y makes the bug disappear (or changing Z makes it worse)."*

No prediction = a vibe, not a hypothesis — discard or sharpen it. For each, cite the
specific evidence from Phase 2–3 that supports it (file:line, log line, error text).
Rank highest to lowest confidence.

## Phase 5 — Verify

### 5a — Probe in parallel

Give each hypothesis its own probe subagent, dispatched concurrently. Each subagent
gets: the reproduction command, the one hypothesis and its prediction, the file:line
evidence, and the verdict format from Orchestration. Each runs **the smallest probe**
that confirms or refutes its prediction — prefer debugger/REPL inspection over logs;
targeted logs over "log everything". Tag any temporary log with a unique prefix
(`[DEBUG-xyz]`) so cleanup is one grep. Each probe **changes one variable only** —
isolated contexts make this natural, but a probe that mutates shared state must run
alone (see Orchestration).

Collect the verdicts. Working inline instead of fanning out is fine for a simple bug —
same discipline, one context.

### 5b — Confirm adversarially

A hypothesis that its own author's probe "confirmed" is a suspect, not a verdict — an
agent grades its own work generously. Before accepting a root cause, hand it to a
**fresh, independent subagent whose job is to refute it**: find a counterexample, an
alternative cause that fits the same evidence, or a case where the predicted fix would
*not* remove the symptom. Give it only the claimed cause, the repro loop, and the
evidence — not your reasoning.

- **Refutation fails** (the cause holds) → confirmed. Record how it held; go to Phase 6.
- **Refutation succeeds** → the cause is wrong or incomplete. Fold the counter-evidence
  into Phase 4 and probe again.

### If no hypothesis survives

Use the negative evidence from refuted hypotheses to generate new ones (back to Phase 4).
If the hypothesis well runs dry, return to Phase 2: sharpen the loop or try a different
strategy. **Loop until you confirm a cause or have genuinely exhausted every strategy.**
When exhausted, stop and save a `blocked` report — never dress a guess as a finding.

## Phase 6 — Report and save

1. Derive a kebab-case bug name (e.g. `auth-token-expiry-not-refreshing`).
2. Target `.specs/bugs/<bug-name>.md`; if it exists, append `-2`, `-3`. Create `.specs/bugs/` if missing.
3. Write the report from `templates/report.md` — the **confirmed** variant, or **blocked** if you never reproduced or nothing survived 5b.
4. Remove any `[DEBUG-...]` instrumentation you added (one grep) and delete throwaway harnesses.
5. Tell the user the file path and summarize the root cause and the proposed fix.

Write the **Fix Proposal** so whoever applies it can execute it verbatim — concrete
numbered steps, each citing file:line. No "handle the error appropriately".

## Gotchas

- **You diagnose, you do not fix.** The proposal goes in the report; applying it is a separate step.
- **No artifact before reproduction.** Can't reproduce → `blocked` report, not a guess dressed up as a finding.
- **The loop is the skill.** When stuck, sharpen the loop before generating more hypotheses.
- **Falsifiable or it's a vibe.** A hypothesis without a prediction isn't one.
- **One variable at a time during probing.** Otherwise the result isn't attributable.
- **Author ≠ confirmer.** A cause isn't confirmed until an independent probe tried and failed to refute it.
- **Tag debug logs, clean them up.** Untagged logs survive; tagged logs die in one grep.
- **Absences are evidence.** A missing log line, a silent failure, an unreachable branch can be as diagnostic as an error.
- **Refuse to give up.** Loop until confirmed or honestly exhausted — there is no middle state where speculation is acceptable.
