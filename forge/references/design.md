# Design

**Goal:** define *how* the change is built and *how we will know it is correct.*
Output: `./.specs/<slug>/design.md`. Skipped at `quick` size.

Load first:

- `./.specs/<slug>/spec.md` — source of truth for requirements, ACs, scope.
- `./.specs/<slug>/state.md` — size, door and Decisions log.

If no spec exists, gather the minimum design context inline (problem, constraints,
codebase realities). Prefer running `/forge specify` first for anything past `quick`.

## Core principle: architecture over implementation

Before adding any detail ask: *"if we swapped frameworks or libraries, would this still
apply?"* Yes → it belongs here. No → it's an implementation detail; leave it for
execute.

**Include:**

- Component responsibilities and interfaces
- Data models and schemas
- API and event contracts
- Integration boundaries
- Technology choices *with rationale*

**Exclude:** code snippets, CLI commands, framework syntax, file paths, tool config.

The design must survive an implementation rewrite.

## What design covers

1. **Architecture overview** — how components interact. Add a Mermaid diagram for
   complex changes.
2. **Code-reuse analysis** *(required at every size that runs design, because plan's
   `reuses` field depends on it)* — what already exists (from the spec's codebase findings)
   that this should reuse or extend, with locations. Do not design new what the repo
   already has. While reading that code, flag concerns it surfaces that affect the
   change. Categories:
   - security (unvalidated input, auth gaps, exposed secrets);
   - performance (N+1, unbounded loops, missing indexes);
   - test-coverage gaps on paths you depend on;
   - fragility or tech-debt in the chosen approach.

   Each concern needs a location and a mitigation, recorded under Architectural risks.
   Stay scoped to the change — do not audit the whole repo.
3. **Components** — each with purpose, responsibility, interface/contract,
   dependencies. For every **new or modified** component, record four further fields in
   stable vocabulary — later phases check against these words:
   - **responsibility** — one sentence, no "and" (needing one describes two components);
   - **dependency direction** — which way source dependencies point across each named
     boundary it sits on;
   - **seam** — where its interface sits, i.e. where behaviour can be substituted without
     editing it there (a seam with no enabling point is not a seam);
   - **domain concepts that take a type** rather than a primitive.
4. **Data models** — schemas and relationships, if any.
5. **Error-handling matrix** — failure scenarios → user-facing or system outcome.
   An AC stating that something must not happen names its mechanism here: what prevents it.
6. **Verification gates (required).** Define what makes the change *done and correct*.
   For each requirement / AC ID from the spec, name the gate that proves it: a test
   type and what it must assert, a typecheck check, or a runtime/observability
   check. These gates are what `plan` attaches to tasks and what `execute`'s verifiers
   enforce. Reference AC IDs; never restate the criterion text.
7. **Architectural risks** — with impact, probability, and mitigation. Execution and
   sequencing risks belong in `plan`, not here.
8. **Hard-to-reverse choices** — one row each: the literal shape chosen (a schema, a
   contract, a public name) and the alternative rejected. This holds at every size that runs
   design, because these are what a later change pays the most to undo.

## State a verdict per observed convention

`spec.md`'s `Conventions observed` section is an input. Design carries **one verdict per
listed convention** — all six rows, always: either **conformant**, or **deviating with a
stated reason**. Verifier 3 checks the diff against all six.

**A deviation with no stated reason is a finding.** It is how a convention gets dropped
silently. Record verdicts in the design's conventions table by
category and `file:line`; never restate the convention text.

## Apply active decisions

Read the Decisions log in `state.md`. Every active decision must be either applied or
explicitly superseded with a reason. Silently ignoring one creates hidden
inconsistency. For each `AD-NN` decision: either reference it in `design.md`'s
Decisions section, or append a superseding row in `state.md` (with a reason). Record
new architectural decisions back into the Decisions log, or use `/create-adr` if one
deserves a standalone record.

## Critical sections (include when applicable)

- **Security** — when payments, auth, PII, or external integrations are involved:
  auth/authz, encryption at rest/in transit, PII handling and retention, compliance,
  secrets, webhook signature validation.
- **Monitoring / observability** — for production systems: key metrics with
  thresholds, log format and what must never be logged, alert severity and response.

For complex changes also offer, as useful: performance targets, external/team
dependencies, migration plan.

## Explore approaches (complex only)

For a complex change, before detailing components:

1. Generate **2–3 viable approaches that all deliver the same scope.**
2. Lead with your recommendation to avoid analysis paralysis.
3. Tabulate the trade-offs.
4. Confirm the chosen approach before fleshing it out — never detail a rejected
   architecture.

Use `AskUserQuestion` if the runtime supports it. Otherwise present your recommendation
and proceed unless the user objects (in non-interactive runs, default to proceeding,
log the choice in `state.md` Decisions as a flagged assumption, and surface it when you
report). Record the chosen approach (and why
the others were rejected) in the Decisions or Alternatives section.

## Research unknowns honestly

If the design depends on an unfamiliar library or service, verify before committing to
it: check the codebase, then docs, then the web (`WebFetch` / `WebSearch` when
available). Don't design around an assumed API.

**If none of those confirm a needed fact, do not invent one.** Record it as an
explicit uncertainty in `design.md` and surface it. "This is unconfirmed" beats a
plausible fabrication that propagates design → plan → execute.

## Review the design adversarially

Before writing the final design, draft it and hand the draft to independent reviewer
subagents that attack it from lenses you're blind to: requirement coverage,
failure-mode/risk, simplicity/reuse, and **under-design**. Run the review per
`references/review.md` (`SKILL.md` → *Sizing* says which run), fold the ranked delta back
into the draft, and escalate any genuine architecture decision to the user. A structural
finding here costs a document edit. The same defect found after the code is written costs a
rewrite.

## Write and route

Write `./.specs/<slug>/design.md` from `templates/design.md`, sized per `SKILL.md` →
*Sizing*. Validate before presenting:

- Every requirement has a verification gate.
- Every active decision is applied or superseded.
- No implementation details leaked.
- Risks have mitigations.

A failing item goes back to the draft, for **at most 3 cycles** (`SKILL.md` → *Retries*).
Then stop and report the failing items.

Update `state.md` (decisions, any size promotion with a reason).

Recommend `/forge plan` next.
