# Plan — <Feature Name>

| Field | Value |
|-------|-------|
| Slug | <feature-slug> |
| Status | Draft / In Review / Approved |
| Created | YYYY-MM-DD |

<!-- Atomic tasks grouped into phases. Phases run in sequence; `[P]` tasks run in parallel
within a phase. Each task traces to a spec AC ID, co-locates its tests, and has a
deterministic gate. Task IDs are PREFIX-PN-NN. The authoritative task status lives in
state.md. -->

## Overview
What is being built and the execution approach. Links: spec.md, design.md.

## Phase 1 — <goal / checkpoint this phase delivers>

**Depends-on:** none
**Phase gate:** `<full test + lint, or build — run once all tasks below are green>`

### PREFIX-P1-01 — <one-line action> `[P]`
- **depends-on:** none
- **AC-trace:** PREFIX-01
- **tests:** <co-located tests; unit for logic, e2e for routes>
- **gate:** `<deterministic command that returns clean iff the task succeeded>`
- **done-when:**
  - [ ] <binary checkpoint>
  - [ ] gate passes: `<command>`

### PREFIX-P1-02 — <one-line action>  <!-- seq: shares test DB with P1-01 -->
- **depends-on:** PREFIX-P1-01
- ...

## Phase 2 — <goal> (depends-on: Phase 1)

**Phase gate:** `<...>`

### PREFIX-P2-01 — <one-line action> `[P]`
- ...

## Execution order
- **Phase 1:** `[P]` PREFIX-P1-01 ; then PREFIX-P1-02
- **Phase 2:** `[P]` PREFIX-P2-01, ...

## Execution Risks
| Risk | Impact (H/M/L) | Probability (H/M/L) | Mitigation |
|---|---|---|---|

<!-- Production deploys: add a Rollout/Rollback section (strategy, triggers + thresholds,
steps). -->
