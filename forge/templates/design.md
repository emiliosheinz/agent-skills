# Design — <Feature Name>

| Field | Value |
|-------|-------|
| Slug | <feature-slug> |
| Tech Lead | @Name |
| Status | Draft / In Review / Approved |
| Created | YYYY-MM-DD |

<!-- Architecture over implementation: if swapping frameworks wouldn't change it, it
belongs here; otherwise it's an implementation detail. Cite spec AC IDs; never restate
criterion text. Size the depth per references/sizing.md.
Soft size budget ~5k words — if larger, you're likely restating the spec; reference by ID. -->

## Architecture Overview
How components interact. Mermaid diagram for complex changes.

## Code-Reuse Analysis
| Existing component / utility | Location | Reuse / extend |
|---|---|---|

## Components
- **<Component>** — purpose, responsibility, interface/contract, dependencies.

## Data Models
Schemas and relationships, if any.

## Error-Handling Matrix
| Scenario | Detection | User-facing / system outcome |
|---|---|---|

## Verification Gates
What makes the change done & correct. One row per spec requirement/AC ID.

| AC ID | Gate (test type + what it asserts / build / runtime check) |
|---|---|

## Architectural Risks
| Risk | Impact (H/M/L) | Probability (H/M/L) | Mitigation |
|---|---|---|---|

## Decisions
New architectural decisions made here (also mirror to state.md Decisions). Note any
active decision applied or explicitly superseded.

## Alternatives Considered (complex)
The 2–3 same-scope approaches weighed, the recommendation, and why the others lost.

| Approach | Trade-offs | Chosen? |
|---|---|---|

<!-- Include when applicable: Security (payments/auth/PII/integrations);
Monitoring/Observability (production); Performance targets; Dependencies; Migration plan. -->
