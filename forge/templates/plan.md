# Plan — <Feature Name>

| Field | Value |
|-------|-------|
| Slug | <feature-slug> |
| Created | YYYY-MM-DD |

<!-- See references/plan.md for the playbook.
     Authoritative task status lives in state.md.
     Target size ~6k words. -->

## Overview
What is being built and the execution approach. Links: spec.md, design.md.

## Phase 1 — <goal / checkpoint this phase delivers>

**Depends-on:** none
**Phase gate:** `<full test + lint, or build — run once all tasks below are green>`

### PREFIX-P1-01 — <one-line action> `[P]` <!-- [P] — per-test in-memory DB, see <test file> -->
- **depends-on:** none
- **AC-trace:** PREFIX-01
- **tests:** <co-located tests; unit for logic, e2e for routes>
- **reuses:** <optional — existing component/pattern to mirror, from design.md>
- **gate:** `<deterministic command, project's real runner, clean iff the task succeeded>`
- **done-when:**
  - [ ] <pass/fail checkpoint>
  - [ ] gate passes: `<command>`

### PREFIX-P1-02 — <one-line action> <!-- seq — shares test DB with P1-01, see <test file> -->
- **depends-on:** PREFIX-P1-01
- ...

## Phase 2 — <goal>

**Depends-on:** Phase 1
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
