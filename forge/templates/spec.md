# Spec — <Feature Name>

| Field | Value |
|-------|-------|
| Slug | <feature-slug> |
| Date | YYYY-MM-DD |

<!--
Auto-size the depth (see SKILL.md → Sizing). Size and Door live in state.md only.
- quick: Problem, Conventions observed, Request + Acceptance Criteria only — a few lines.
  Delete the rest (including Impact / Blast Radius). A one-way door keeps Scope and
  Assumptions. External References only if the user named a source.
- standard: all sections, with a calibrated dimension sweep.
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

### Conventions observed
<!-- Written by specify Move 1 at EVERY size. All six categories, always. Each entry cites a
     file:line; a category with nothing observed names where it looked. Regenerated whole on a
     re-run. See references/specify.md. design.md states a verdict per row. -->

| Category | Convention observed | Example (`file:line`) |
|---|---|---|
| structure | | |
| naming | | |
| data flow | | |
| layering | | |
| error handling | | |
| test placement | | |
<!-- Surface: ui only (references/ui.md); a reference is an anchor, not a template:
| reference | | |
| components | | |
| tokens | | |
| feedback pattern | | | -->

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
     Ask the decisions only the user can make. Carry remaining open questions into either
     "Assumptions" or "Agent discretion" in Part B. -->

---

## Part B — Requirements

### Request
The user's opening request plus any later statement of scope, verbatim. Every sentence
traces to an AC or an out-of-scope row.

### Overview
3–5 sentences: what this is, the core problem, who it's for. No implementation.

### Goals & Success Criteria
Falsifiable outcomes, verifiable after shipping.

| Goal | Success criterion | How to measure |
|---|---|---|

### Scope
**In scope:** discrete, verifiable capabilities.

**Out of scope:** anything a reader might assume is included but isn't. A capability raised
mid-spec goes here with the reason "raised mid-spec".

| Capability | Reason |
|---|---|

### Requirements & Acceptance Criteria
Functional only (what, not how). One per item. IDs `PREFIX-NN`.

The door verdict is in state.md's header. Append `[critical]` to the ACs carrying the
irreversible outcome (omit otherwise). The door verdict decides whether a gate fires; this
marker decides where it points.

- **PREFIX-01** — The system SHALL <observable outcome>.
  - AC: WHEN <condition>, THEN the system SHALL <precise expected outcome>. [critical]

### Assumptions & Discretion
- **Assumptions (unconfirmed):** facts nobody can confirm yet; flag which would invalidate
  the spec if false. A user decision is asked, not assumed. Mark any the user declined.
- **Agent discretion (user delegated):** points the user said "you decide" — safe to
  settle downstream.

### Implicit-Requirement Dimensions (standard: calibrated; complex: full)
<!-- See references/specify.md for the dimension lists. Classify the feature's primary
     surface (pick all that apply; name the primary), then resolve each dimension to a
     concrete requirement OR an explicit "N/A because <reason>". -->

| Surface(s) | Primary surface | Requirement IDs covered |
|---|---|---|
