---
name: diagnose
description: >
  Diagnoses bugs through a structured loop: adaptive intake, a fast feedback
  loop, reproduction, falsifiable hypotheses, and a saved fix proposal. Use
  when reporting a bug, error, crash, broken or unexpected behavior, exception,
  failing test, or anything that is not working as expected.
---

# Diagnose

**Goal:** find and verify the root cause of an issue, then save a concrete fix proposal as a persistent artifact.

**Hard rule:** you diagnose, you do not fix. Never edit application code to "make the bug go away." The fix proposal goes in the report; `/implement` executes it once the user has reviewed.

## Routing

- Execute the proposed fix → `/implement`
- Building a new feature → `/create-prd`
- Proposing a significant change → `/create-rfc`
- Documenting an architectural decision → `/create-adr`

## Phase 1 — Intake

There is no fixed question list. Interview the user until you have enough to attempt reproduction. Apply these rules:

1. **One question at a time.** Use `AskUserQuestion`. Never bundle topics.
2. **Walk the tree.** Each answer either closes a branch or opens new ones. Follow new branches to resolution before returning to the parent.
3. **Codebase first.** Do not ask what you can read. Save the user's attention for things only they know.
4. **Record, do not invent.** "Unknown" is a valid answer — write it down rather than guessing.

**Topics that usually need to be resolved before reproduction is possible:**

- Expected vs. actual behavior, with the verbatim error or stack trace
- Reproduction trigger: inputs, sequence of actions, environment
- Determinism: every time, intermittent, or a specific rate
- What recently changed: deploy, dependency upgrade, config flip

Stop the intake the moment you have enough to attempt reproduction. Anything still missing will surface in Phase 2 — return here only if it turns out to be something only the user can answer.

## Phase 2 — Build a feedback loop

**This is the skill.** A fast, deterministic, pass/fail signal is what separates a fixed bug from staring at code. Bisection, hypothesis-testing, and instrumentation all just consume that signal — without one, no amount of reading the code will save you.

Spend disproportionate effort here. Be aggressive. Be creative. Refuse to give up.

### Strategies, roughly in order of preference

1. **Failing test in the project's existing testing framework** — at whatever seam reaches the bug (unit, integration, e2e). Always try this first. Follow the project's conventions for test structure, fixtures, and assertions.
2. **Curl / HTTP script** against a running dev server.
3. **CLI invocation** with a fixture input, diffing stdout against a known-good snapshot.
4. **Headless browser script** Playwright — drives the UI, asserts on DOM, console, or network.
5. **Replay a captured trace** — save a real payload or event log, replay it through the code path in isolation.
6. **Throwaway harness** — minimal subset of the system (one service, mocked deps) that exercises the bug code path with a single call.
7. **Property / fuzz loop** — for "sometimes wrong output" bugs, run many random inputs and look for the failure mode.
8. **Bisection harness** — if the bug appeared between two known states (commit, dataset, version), automate "boot at state X, check, repeat" so `git bisect run` can drive it.
9. **Differential loop** — same input through old vs. new (or two configs), diff outputs.

### Iterate on the loop itself

Treat the loop as a product. Once you have a loop, sharpen it: faster (cache setup, skip unrelated init), more deterministic (pin time, seed RNG, freeze network), sharper signal (assert on the specific symptom, not "didn't crash"). A 2-second deterministic loop is a debugging superpower; a 30-second flaky loop is barely better than nothing.

### Non-deterministic bugs

The goal isn't a clean repro — it's a high enough reproduction rate to debug against. Loop the trigger, parallelize, stress, narrow timing windows. A 50%-flake bug is debuggable; 1% is not — keep raising the rate.

### When you genuinely cannot build a loop

Stop. Skip to Phase 6 with status `blocked`. List every strategy tried and why each failed. Ask the user for whatever would unblock you: environment access, a captured artifact (HAR, log dump, core dump, screen recording with timestamps), or permission to add temporary instrumentation. Do not proceed to hypothesize without a loop.

## Phase 3 — Reproduce

Run the loop. Confirm:

- The failure mode is the one **the user described** — not a different failure nearby. Wrong bug means wrong fix.
- The failure reproduces across runs (or, for flaky bugs, at a high enough rate).
- You have captured the exact symptom (error message, wrong output, slow timing) so the fix can be verified against it.

Do not proceed until the bug reproduces.

## Phase 4 — Hypothesize

Produce **3–5 ranked, falsifiable hypotheses** before testing any of them. Single-hypothesis generation anchors on the first plausible idea.

Each hypothesis must state a prediction:

> *"If `<X>` is the cause, then `<changing Y>` will make the bug disappear, or `<changing Z>` will make it worse."*

If you cannot state the prediction, the hypothesis is a vibe — discard it or sharpen it. For each, cite the specific evidence from Phase 2 or 3 that supports it (file:line, log line, error text).

Rank from highest to lowest confidence.

## Phase 5 — Verify

Work hypotheses from highest to lowest confidence. For each:

1. Restate the prediction from Phase 4.
2. Run the smallest probe that would confirm or refute it. Prefer debugger or REPL inspection over logs; targeted logs over "log everything." Tag any temporary logs with a unique prefix (e.g. `[DEBUG-...]`) so cleanup is one grep.
3. **Change one variable at a time** — otherwise you cannot attribute the result.
4. **Confirmed** → proceed to Phase 6.
5. **Refuted** → mark it and move to the next hypothesis.

### If no hypothesis is confirmed

Use the negative evidence from refuted hypotheses to generate new ones, then return to Phase 4. If the hypothesis well runs dry, return to Phase 2: sharpen the loop, try a different strategy. **Loop until you confirm a hypothesis or have genuinely exhausted strategies.**

### When you have genuinely exhausted everything

Stop. Save the report with status `blocked` (see Phase 6). List every hypothesis considered, every probe run, what each result told you, and what would unblock the next attempt.

## Phase 6 — Propose and save

1. Derive a kebab-case bug name from the issue (e.g. `auth-token-expiry-not-refreshing`).
2. If `.specs/bugs/[bug-name].md` already exists, append `-2`, `-3`, etc.
3. Create `.specs/bugs/` if missing.
4. Write the report using the matching template below.
5. Remove any `[DEBUG-...]` instrumentation you added — single grep cleanup.
6. Tell the user the file path and route them to `/implement`.

### Template — confirmed root cause

```markdown
# Bug: [bug-name]

**Date:** YYYY-MM-DD
**Status:** confirmed
**Confidence:** [High / Medium / Low] — one-sentence justification.

## Root Cause

Plain-language explanation of what broke and why. Cite specific evidence: file:line, log line, error message.

## Reproduction

The feedback loop that confirms the bug. Include the exact command to run it and what a failing run looks like. If a test was written, give the file path and the command to run it.

## Hypotheses Tested

| # | Hypothesis | Prediction | Result |
|---|------------|------------|--------|
| 1 | ... | ... | Confirmed / Refuted |

## Fix Proposal

Numbered, concrete steps. Each step actionable and consistent with project conventions. Cite file:line. This section is what `/implement` will execute — write it for that consumer. No vague phrases like "handle the error appropriately."

1. ...
2. ...

## Regression Test

The test that should lock this down: file path, framework, what it asserts. If no correct seam exists for the test, say so — that itself is the finding.

## Prevention

Optional. What would stop this from recurring: a test to add, a monitoring alert, a config guard, a refactor, a doc update. Required for regressions.
```

### Template — blocked

```markdown
# Bug: [bug-name]

**Date:** YYYY-MM-DD
**Status:** blocked

## What We Know

What the user reported, verbatim error or symptom, and any partial reproduction signal observed.

## Attempts

| # | Strategy | Outcome | Why it failed |
|---|----------|---------|---------------|
| 1 | Failing unit test in `vitest` | Could not reach the seam | Bug requires production database state |

## Hypotheses Considered

Hypotheses generated but not testable. Include the prediction and what would be needed to test it.

## What Would Unblock This

Specific asks: environment access, captured artifact (HAR, log dump, screen recording with timestamps), permission to add temporary instrumentation, knowledge only the user has.

## Suggested Next Steps

Concrete actions for the user or another agent to try.
```

## Gotchas

- **You diagnose, you do not fix.** The proposal goes in the report. `/implement` runs it.
- **No artifact before reproduction.** A confirmed report is an artifact of a confirmed diagnosis. If you cannot reproduce, write the `blocked` template — not a guess dressed up as a finding.
- **Falsifiable or it is a vibe.** A hypothesis without a prediction is not a hypothesis.
- **One variable at a time during verification.** Otherwise the result is not attributable.
- **The loop is the skill.** When stuck, sharpen the loop before generating more hypotheses.
- **Tag debug logs, clean them up.** Untagged logs survive; tagged logs die in one grep.
- **Absences are evidence.** A missing log line, a silent failure, an unreachable branch can be as diagnostic as an error.
- **One question at a time during intake.** Multiple questions at once slow resolution.
- **Refuse to give up.** Loop until you have a confirmed root cause or have honestly exhausted every strategy — there is no middle state where speculation is acceptable.
