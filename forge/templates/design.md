# Design — <Feature Name>

| Field | Value |
|-------|-------|
| Slug | <feature-slug> |
| Tech Lead | @Name |
| Created | YYYY-MM-DD |

<!-- See references/design.md for the playbook.
     Target size ~5k words — if larger, you are restating the spec; reference by AC ID. -->

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

| AC ID | Gate (test type + what it asserts / typecheck / runtime check) |
|---|---|

## Architectural Risks
| Risk | Impact (H/M/L) | Probability (H/M/L) | Mitigation |
|---|---|---|---|

## Decisions
New architectural decisions made here (also mirror to state.md Decisions). Note any
active decision applied or explicitly superseded.

## Alternatives Considered (complex)
The 2–3 same-scope approaches weighed, the recommendation, and why the others were
rejected.

| Approach | Trade-offs | Chosen? |
|---|---|---|

<!-- Include when applicable: Security (payments/auth/PII/integrations);
     Monitoring/Observability (production); Performance targets; Dependencies; Migration plan. -->
