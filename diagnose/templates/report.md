<!-- Two variants in one file: CONFIRMED (root cause verified and survived refutation)
     and BLOCKED (could not reproduce, or no hypothesis survived). Keep the variant that
     matches your outcome and delete the other (between the matching ====== fences). The
     variant's H1 stays as the file's single H1. -->

<!-- ===================== CONFIRMED ===================== -->
# Bug: <bug-name>

**Date:** YYYY-MM-DD
**Status:** confirmed

## Root Cause
Plain-language explanation of what broke and why. Cite file:line, log line, error
text. This is the claim that survived Phase 5b refutation — state it as one thing, not
a list of maybes.

## Reproduction
The feedback loop that confirms the bug: the exact command and what a failing run looks
like. If a test was written, give its path and run command. State the loop's health:
runtime, determinism (every run / rate), and the specific symptom it asserts.

## Hypotheses Tested
One row per hypothesis probed in Phase 5a. Refuted rows are kept — the negative
evidence is part of the proof.

| # | Hypothesis | Prediction | Result | Evidence (file:line / log) |
|---|---|---|---|---|
| 1 | ... | ... | Confirmed / Refuted | ... |

## Refutation
How the confirmed cause survived Phase 5b: the counter-attack an independent probe ran
to break it, and why it held. `—` only if the bug was too simple to warrant one.

## Fix Proposal
Numbered, concrete steps for whoever applies the fix. Each actionable; cite file:line.
No vague phrases like "handle the error appropriately".

1. ...

## Regression Test
The test that locks this down: path, framework, what it asserts. It must fail for the
*reported* symptom before the fix and pass after. If no correct seam exists, say so —
that itself is a finding.

## Prevention
Optional (required for regressions): what stops this recurring — a test, alert, guard,
refactor, or doc.

<!-- ===================== /CONFIRMED ===================== -->


<!-- ===================== BLOCKED ===================== -->
# Bug: <bug-name>

**Date:** YYYY-MM-DD
**Status:** blocked

## What We Know
What was reported, the verbatim error/symptom, and any partial reproduction signal.

## Attempts
Every feedback-loop strategy and probe tried, and why each failed. This is the value of
a blocked report — the next attempt starts here instead of from zero.

| # | Strategy / Probe | Outcome | Why it failed |
|---|---|---|---|
| 1 | ... | ... | ... |

## Hypotheses Considered
Generated but not testable — with prediction and what would be needed to test each.

## What Would Unblock This
Specific asks: environment access, captured artifact (HAR, log dump, recording with
timestamps), permission to instrument, knowledge only the user has.

<!-- ===================== /BLOCKED ===================== -->
