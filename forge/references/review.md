# Review

How `specify` and `design` prove their artifact is sound *before* it ships downstream.
Correctness is enforced by **independent reviewer subagents**: the author drafts the
spec or design; separate agents, each with a fresh context, attack it from one lens.
Author ≠ reviewer — an agent grading its own work tends to pass it, so the check must
come from outside the author. The closure gates each phase already runs are the author's
self-check; this review is the external one. It supplements them, never replaces them.

## Why independent review

The spec and design are the two artifacts everything downstream inherits — a vague AC
or an orphaned requirement costs a full round-trip when `execute`'s verifiers finally
catch it as a `SPEC-GAP` (`verification.md`), long after implementation started. Pulling
that scrutiny forward to authoring time is the whole point. A reviewer that only saw the
author's reasoning would rubber-stamp it; so each reviewer gets **only the drafted
artifact, the source it is checked against, and its one lens** — never the author's
justification for a choice.

A typical run looks like:

```text
draft artifact → spawn N reviewers in parallel (size-gated)
             → each returns a verdict (PASS / REVISE)
             → author aggregates → ranked delta → fold objective fixes (≤2 cycles)
             → escalate any judgment call via AskUserQuestion
             → write final artifact + route
```

## The reviewers

Run by independent, stateless subagents. Give each only what it needs — the drafted
artifact, the specific source section it checks against, its one lens, and the verdict
format. They share none of the author's context. Each finding must carry: **where** in
the artifact, **what** is wrong, **why it matters downstream**, and a **suggested fix**.
A vague "could be clearer" is not a finding — name the defect and its cost.

### Spec reviewers (run in `specify`)

1. **Completeness** — hunt what the spec *omits*: missing requirements, unhandled
   edge / error / first-run / empty states, dimension-sweep items marked `N/A` without a
   real reason, stakeholders or workflows the problem implies but the spec never names,
   assumptions the work rests on that were never written down. Ask: *"what would a user
   reasonably expect this to cover that it doesn't?"* Given: the drafted `spec.md` plus
   the Part A problem statement and codebase findings.
2. **Testability** — every AC falsifiable, single interpretation, precise expected
   value, well-formed `WHEN/THEN/SHALL`. Reject "no error thrown" where a state/value is
   the real outcome, ACs with two readings, and outcomes with no measurable target. This
   is execute's spec-coverage verifier (`verification.md`) pulled forward — an AC that
   can't anchor a test here becomes a `SPEC-GAP` there. Given: the `spec.md` Requirements
   & Acceptance Criteria section.
3. **Scope & implementation-leak** — requirements that embed *how* (a stack, data store,
   protocol, or algorithm choice), capabilities that crept in past the fixed feature
   boundary, things a reader would assume are in-scope but aren't and that the
   out-of-scope table never lists, and assumptions that would invalidate the spec if
   wrong yet aren't flagged. Given: the `spec.md` scope, requirements, and assumptions
   sections.

### Design reviewers (run in `design`)

1. **Requirement coverage** — forward: every spec AC ID maps to a verification gate that
   actually *proves* it, not a gate that merely names it. Reverse: every component, data
   model, and decision traces back to a requirement — an element anchored to nothing is
   scope creep. No AC orphaned in either direction. Reference AC IDs; never restate the
   criterion text. Given: the drafted `design.md` plus the spec's AC IDs and gates.
2. **Failure-mode / risk** — attack the design where it breaks in production: security
   holes (unvalidated input, auth gaps, exposed secrets), performance cliffs (N+1,
   unbounded work, missing indexes), concurrency / idempotency gaps, error-matrix
   omissions, and architectural risks left without a mitigation. Ask: *"what's the first
   thing that fails under load, attack, or partial failure?"* Given: the `design.md` plus
   the spec's critical and edge-condition requirements.
3. **Simplicity / reuse** — over-engineering (an abstraction with one caller, a factory
   for one product, flexibility nothing needs), code reinvented that the spec's codebase
   findings show already exists, and implementation detail leaked into the design. Apply
   the design's own test: *"would this survive a framework swap?"* — if not, it's an
   implementation detail that doesn't belong. Given: the `design.md` plus the spec's
   codebase findings.

## What runs when (size-gated)

| Size | Reviewers | Override |
|------|-----------|----------|
| quick | none — closure gate only | — |
| standard | 1, 2 | any `critical` AC also runs 3 |
| complex | 1, 2, 3 | — |

A `quick` change carries an inline spec of a few lines and no design — the author's
closure gate is proportionate; do not dispatch reviewers for it. Standard runs the two
highest-value lenses; complex runs the full panel.

**Criticality overrides the size gate.** Any AC marked `critical` in the spec (auth,
payments, data integrity) forces reviewer 3 regardless of size — the same principle as
execute's mutation-sensor override (`verification.md`). A standard-sized auth change must
not ship a spec whose scope leaks or a design whose reuse went unchecked.

## Model tier per reviewer

Adversarial review is judgment work, not a mechanical pass/fail — run it at **standard,
or frontier with high effort for a complex change**, per SKILL.md's Model & effort
selection (the "adversarial judgment / ambiguous synthesis" row). Never send these lenses
to the economy tier, and never fan the whole panel to frontier by default: complex earns
frontier for its reviewers; standard runs them at standard/high. Dispatch the applicable
reviewers as concurrent subagents per SKILL.md's Orchestration rules — Workflow when the
runtime supports it, sequential subagent calls otherwise. Reviewers spawn nothing.

## Verdict format

Each reviewer returns a compact structured verdict:

```markdown
### Reviewer <lens>: PASS | REVISE
<findings — each: artifact location · what's wrong · downstream cost · suggested fix,
or "clean">
```

## Resolve findings (bounded loop)

The author aggregates the verdicts into one delta ranked by severity: Blocker → Major →
Minor (severity is the finding's downstream cost — a wrong AC outranks a phrasing nit).
Then work the list top-down:

- **Apply objective fixes to the draft directly** — tighten an ambiguous AC, add a
  missing edge-condition requirement, delete a speculative abstraction, name the gate an
  AC was missing. Re-run only the lenses whose sections changed. **Cap at 2 cycles.**
- **Escalate judgment calls.** A finding that turns on a real requirement, scope, or
  architecture decision — not a mechanical tightening — goes to the user via
  `AskUserQuestion` with a recommended default. Do not silently pick a side on something
  only the user can decide.
- **Never loop forever or weaken a check to pass.** Widening an AC or deleting a
  requirement just to clear a finding defeats the review — if a finding can't be resolved
  cleanly, record it and surface it.

A spec defect the review surfaces is logged to `state.md` Decisions; a skipped lens or a
gap that recurs across changes is a `lessons.md` candidate — the same gap-handling every
other phase uses. Fixes land in the artifact itself; the review leaves no separate file.

## Graceful degradation (never fake a review)

- **No subagents available:** the author runs each applicable lens inline, sequentially,
  with fresh framing per lens — same discipline, one context. Working inline is fine for
  a small change.
- **No spec (design run without one):** reviewer 1 traces coverage against the acceptance
  criteria gathered inline at design time, same structure.

A lens that was skipped is recorded as a gap in `state.md`, never reported as reviewed.
