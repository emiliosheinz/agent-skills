# State — <feature-slug>

| Field | Value |
|-------|-------|
| Size | quick / standard / complex — <one-line justification> |
| Current phase | specify / design / plan / execute |
| Created | YYYY-MM-DD |
| Updated | YYYY-MM-DD |

<!-- state.md is the single source of truth, re-read at the start of every verb. Write
size/decisions/status changes here as they happen. -->

## Decisions
Cross-phase decisions not captured in an artifact (incl. size promotions with reason).

| # | Decision | Why | Date |
|---|---|---|---|
| AD-01 | <decision> | <rationale> | YYYY-MM-DD |

## Tasks
Populated by `plan`, updated by `execute`. Tasks grouped by phase; phases run in order,
`[P]` tasks run in parallel within a phase. Task status: pending / in-progress / done /
blocked. Mark a finished phase `**completed**` below its heading.

### Phase 1 — <goal>
Phase gate: `<full test + lint / build>`

| ID | par | depends-on | AC-trace | gate | status | evidence (sha) |
|----|-----|------------|----------|------|--------|----------------|
| PREFIX-P1-01 | [P] | — | PREFIX-01 | `<cmd>` | pending | — |
| PREFIX-P1-02 | seq | PREFIX-P1-01 | PREFIX-02 | `<cmd>` | pending | — |

### Phase 2 — <goal> (depends-on: Phase 1)
Phase gate: `<...>`

| ID | par | depends-on | AC-trace | gate | status | evidence (sha) |
|----|-----|------------|----------|------|--------|----------------|
| PREFIX-P2-01 | [P] | — | PREFIX-03 | `<cmd>` | pending | — |

## Validation delta
During execute retries, the specific failing items only (cleared when resolved).

- <none>

## Handoff
What the next verb should pick up, and the recommended next verb.

- Next: <verb> — <what it should do>
