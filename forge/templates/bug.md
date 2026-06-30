<!-- Use the CONFIRMED template when a root cause is verified; the BLOCKED template when
reproduction or root-cause failed. Delete the one you don't use. -->

<!-- ============ CONFIRMED ============ -->
# Bug: <bug-name>

**Date:** YYYY-MM-DD
**Status:** confirmed
**Confidence:** High / Medium / Low — one-sentence justification.

## Root Cause
Plain-language explanation of what broke and why. Cite file:line, log line, error text.

## Reproduction
The feedback loop that confirms the bug: the exact command and what a failing run looks
like. If a test was written, give its path and run command.

## Hypotheses Tested
| # | Hypothesis | Prediction | Result |
|---|---|---|---|
| 1 | ... | ... | Confirmed / Refuted |

## Fix Proposal
Numbered, concrete steps for `/forge fix` to apply. Each actionable, cite file:line.
No vague phrases like "handle the error appropriately".
1. ...

## Regression Test
The test that locks this down: path, framework, what it asserts. If no correct seam
exists, say so — that itself is a finding.

## Prevention
Optional (required for regressions): what stops this recurring — a test, alert, guard,
refactor, or doc.

<!-- ============ BLOCKED ============ -->
# Bug: <bug-name>

**Date:** YYYY-MM-DD
**Status:** blocked

## What We Know
What was reported, the verbatim error/symptom, and any partial reproduction signal.

## Attempts
| # | Strategy | Outcome | Why it failed |
|---|---|---|---|

## Hypotheses Considered
Generated but not testable — with prediction and what would be needed to test.

## What Would Unblock This
Specific asks: environment access, captured artifact (HAR, log dump, recording with
timestamps), permission to instrument, knowledge only the user has.
