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

### Requirements & Acceptance Criteria
Functional only (what, not how). One per item. IDs `PREFIX-NN`, priority P0/P1/P2.

- **[P0] PREFIX-01** — The system SHALL <observable outcome>.
  - AC: WHEN <condition>, THEN the system SHALL <precise expected outcome>.

### Assumptions
Treated as true; flag which would invalidate the spec if false.

### Implicit-Requirement Dimensions (complex only)
Each resolves to a requirement or "N/A because <reason>":
input validation · failure states · idempotency · auth & rate limits · concurrency ·
data lifecycle/retention · observability · external dependencies · state transitions
