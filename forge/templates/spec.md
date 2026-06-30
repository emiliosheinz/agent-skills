# Spec — <Feature Name>

| Field | Value |
|-------|-------|
| Slug | <feature-slug> |
| Author | @Name |
| Date | YYYY-MM-DD |
| Size | quick / standard / complex |

<!--
Auto-size the depth (see references/sizing.md):
- quick: Problem + Acceptance Criteria only — a few lines. Delete the rest.
- standard: all sections except the dimension sweep.
- complex: all sections, including the dimension sweep and prior art.
Acceptance criteria are authored HERE and nowhere else. Downstream phases cite IDs.
Soft size budget ~3k words — if larger, you're restating instead of referencing by ID; trim.
-->

## Part A — Understanding

### Problem
What is happening today, from the affected person's perspective. No proposed solution.
Who is affected (role, context, frequency). Cost of the status quo.

### Constraints
Hard limits any solution must respect (technical, legal/compliance, operational,
time/team). Write "None identified." where empty.

### Prior Art
What has been tried/built/considered — internal or external.

| Solution / Approach | Source (internal / URL) | Key finding | Applicability (H/M/L — why) |
|---|---|---|---|

### Codebase Findings
Observations from the existing code relevant to this problem (modules, patterns,
integration boundaries, prior decisions). Observations only — no conclusions.

### External References
| Reference | URL (fetched) | Key finding |
|---|---|---|

### Open Questions
| Question | Why it matters | Owner | Status |
|---|---|---|---|

## Part B — Requirements

### Overview
3–5 sentences: what this is, the core problem, who it's for. No implementation.

### Goals & Success Criteria
Falsifiable outcomes, verifiable after shipping.

| Goal | Success criterion | How to measure |
|---|---|---|

### Scope
**In scope:** discrete, verifiable capabilities.
**Out of scope:** anything a reader might assume is included but isn't — with a reason.
**Deferred Ideas:** capabilities raised mid-spec, intentionally postponed (kept distinct
from out-of-scope so they aren't lost or allowed to balloon scope).

### Requirements & Acceptance Criteria
Functional only (what, not how). One per item. IDs `PREFIX-NN`, priority P0/P1/P2.
Mark an AC `critical` when it governs auth, payments, or data integrity.

- **[P0] PREFIX-01** — The system SHALL <observable outcome>.
  - AC: WHEN <condition>, THEN the system SHALL <precise expected outcome>. [critical?]

### Assumptions & Discretion
- **Assumptions (unconfirmed):** treated as true; flag which would invalidate the spec if false.
- **Agent discretion (user delegated):** points the user said "you decide" — safe to settle downstream.

### Implicit-Requirement Dimensions (complex only)
Classify the feature's primary surface, then resolve the systems list plus the matching
surface list — each to a requirement or "N/A because <reason>":
- **systems (always):** input validation · failure states · idempotency · auth & rate limits · concurrency · data lifecycle/retention · observability · external dependencies · state transitions
- **UI:** empty/loading/error states · density · interactions · visual hierarchy
- **API:** response format · error shapes · auth · versioning · rate limiting
- **CLI:** output format · flags · modes · verbosity · exit codes
- **content/docs:** structure · tone · depth · navigation
- **data-org:** grouping · naming · duplicates · exceptions
