# Review

How `specify` and `design` prove their artifact is sound *before* it ships downstream:
**independent reviewer subagents**, each with a fresh context, attacking the draft from one
lens. Author ≠ reviewer — an agent grading its own work tends to pass it. The closure gates
each phase already runs are the author's self-check; this review is the external one. It
supplements them, never replaces them.

Each reviewer gets **only the drafted artifact, the source it is checked against, and its
one lens** — never the author's justification for a choice, because a reviewer that saw the
reasoning would rubber-stamp it.

## The reviewers

Run by independent, stateless subagents, whose prompts name `references/glossary.md` for
forge's terms. Each finding must carry: **where** in the
artifact, **what** is wrong, **why it matters downstream**, and a **suggested fix**. A vague
"could be clearer" is not a finding — name the defect and its cost.

`SKILL.md` → *Sizing* says which run at each size. A one-way door at `quick` has no design,
so `specify`'s review step runs lens 4 and it reads the acceptance criteria gathered inline.

### Spec reviewers (run in `specify`)

1. **Completeness** — hunt what the spec *omits*: missing requirements, unhandled
   edge / error / first-run / empty states, dimension-sweep items marked `N/A` without a
   real reason, stakeholders or workflows the problem implies but the spec never names,
   assumptions the work rests on that were never written down, and any sentence of the
   request no AC or exclusion covers. Ask: *"what would a user reasonably expect this to
   cover that it doesn't?"* Given: the drafted `spec.md`, including its verbatim Request
   block, plus the Part A problem statement and codebase findings.
2. **Testability** — every AC falsifiable, single interpretation, precise expected
   value, in a well-formed form such as `WHEN/THEN/SHALL`, and settled by one run. Reject
   "no error thrown" where a state/value is the real outcome, ACs with two readings, and
   outcomes with no measurable target. An enumerated set must let each member be proved.
   This is execute's spec-coverage verifier (`verification.md`) pulled forward — an AC that
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
   model, and decision traces back to a requirement **or to a design element** — a named
   component, a seam, or a recorded convention. Both are legitimate anchors; an element
   with **neither** is scope creep. No AC orphaned in either direction. Reference
   AC IDs; never restate the criterion text. Given: the drafted `design.md` plus the
   spec's AC IDs and gates.
2. **Failure-mode / risk** — attack the design where it breaks in production: security
   holes (unvalidated input, auth gaps, exposed secrets), performance cliffs (N+1,
   unbounded work, missing indexes), concurrency / idempotency gaps, error-matrix
   omissions, and architectural risks left without a mitigation. Ask: *"what's the first
   thing that fails under load, attack, or partial failure?"* Given: the `design.md` plus
   `state.md`'s door verdict, the spec's `[critical]` ACs, and its edge-condition
   requirements.
3. **Simplicity / reuse** — over-engineering (an abstraction with one caller, a factory
   for one product, flexibility nothing needs), code reinvented that the spec's codebase
   findings show already exists, and implementation detail leaked into the design. Apply
   the design's own test: *"would this survive a framework swap?"* — if not, it's an
   implementation detail that doesn't belong. Relocating a rule, or giving a primitive whose
   validation is already repeated a domain type, is the same scope: never report it as an
   unrequested abstraction.

   **The deletion test, and a two-sided verdict.** For each abstraction, ask what deleting
   it would cost and return one of two values **citing the caller count**: `pass-through`
   (deleting removes code, no caller grows — recommend the deletion) or `earns-keep`
   (deleting duplicates code across two or more callers — say so and move on).
   Given: the `design.md` plus the spec's codebase findings.
4. **Under-design** — the symmetric lens: is what the design *does* build arranged well?
   Read `references/structural-standards.md` for the checks, selection, firing discipline,
   do-not-flag list and scope/shape boundary, and report the verdict delta it defines.
   That file holds the criteria; this one never repeats them. At minimum the verdict
   covers: one responsibility per component nameable without "and"; dependency direction
   across each named boundary; domain concepts carried by primitives; consistency
   boundaries; where rules live relative to transport; and units mixing abstraction
   levels. Given: the drafted `design.md`, the spec's `Conventions observed` section, and
   any discovered standards file.

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
  AC was missing. Re-run only the lenses whose sections changed. **At most 3 cycles**
  (`SKILL.md` → *Retries*); then record the unresolved findings and surface them to the
  user.
- **Escalate judgment calls.** A finding that turns on a real requirement, scope, or
  architecture decision — not a mechanical tightening — goes to the user via
  `AskUserQuestion` with a recommended default. Do not silently pick a side on something
  only the user can decide.
- **Never loop forever or weaken a check to pass.** Widening an AC or deleting a
  requirement just to clear a finding defeats the review — if a finding can't be resolved
  cleanly, record it and surface it.

A spec defect the review surfaces is logged to `state.md` Decisions. Fixes land in the
artifact itself; the review leaves no separate file.

## Graceful degradation (never fake a review)

- **No subagents available:** the author runs each applicable lens inline, sequentially,
  with fresh framing per lens — same discipline, one context. Working inline is fine for
  a small change.
- **No spec (design run without one):** reviewer 1 traces coverage against the acceptance
  criteria gathered inline at design time, same structure.

A lens that was skipped is a `gap-open` row in `state.md`'s `## Open findings`, never
reported as reviewed.

Under the conductor, a lens also raises a choice in the artifact that has no entry in the
drafting owner's manifest as a decision (`decide.md` → *Decision discovery*). Its prompt
carries `auto.md` → Guards → *Dispatch preamble*. Where subagents are unavailable the
inline rule above applies, and the record says the review was not independent (`decide.md` → *Owners*, Without
subagents).
