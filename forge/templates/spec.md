# Spec — <Feature Name>

| Field | Value |
|-------|-------|
| Slug | <feature-slug> |
| Author | @Name |
| Date | YYYY-MM-DD |
| Size | quick / standard / complex |
| Mode | full / context-only |

<!--
Auto-size the depth (see references/sizing.md):
- quick: Problem + Acceptance Criteria only — a few lines. Delete the rest (including
  Impact / Blast Radius).
- standard: all sections except the dimension sweep.
- complex: all sections, including the dimension sweep and prior art.
Acceptance criteria are written HERE and nowhere else. Downstream phases cite IDs.
Target size ~3k words — if larger, you are restating instead of referencing by ID; trim.
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

### Impact / Blast Radius (standard+)
Observed: where the problem area sits and what already depends on it. Current state only —
no proposed changes (that is design's job).

| Area the change would touch | What currently depends on it | Integration boundary | Existing in-domain prior art |
|---|---|---|---|

### External References
| Reference | URL (fetched) | Key finding |
|---|---|---|

### Open Questions
| Question | Why it matters | Owner | Status |
|---|---|---|---|

<!-- Part A closure gate: confirm shared understanding with the user before filling Part B.
     Carry remaining open questions into either "Assumptions" or "Agent discretion" in Part B. -->

---

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
**Deferred Ideas:** capabilities raised mid-spec, intentionally postponed (kept
distinct from out-of-scope so they aren't lost or allowed to expand scope).

### Requirements & Acceptance Criteria
Functional only (what, not how). One per item. IDs `PREFIX-NN`, priority P0/P1/P2.
Append `[critical]` to an AC when it governs auth, payments, or data integrity (omit
the tag when not critical).

- **[P0] PREFIX-01** — The system SHALL <observable outcome>.
  - AC: WHEN <condition>, THEN the system SHALL <precise expected outcome>. [critical]

### Assumptions & Discretion
- **Assumptions (unconfirmed):** treated as true; flag which would invalidate the
  spec if false.
- **Agent discretion (user delegated):** points the user said "you decide" — safe to
  settle downstream.

### Implicit-Requirement Dimensions (complex only)
<!-- See references/specify.md for the dimension lists. Classify the feature's primary
     surface (pick all that apply; name the primary), then resolve each dimension to a
     concrete requirement OR an explicit "N/A because <reason>". -->

| Surface(s) | Primary surface | Requirement IDs covered |
|---|---|---|
