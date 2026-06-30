# State — <feature-slug>

| Field | Value |
|-------|-------|
| Size | quick / standard / complex — <one-line justification> |
| Current phase | specify / design / plan / execute |
| Created | YYYY-MM-DD |
| Updated | YYYY-MM-DD |

<!-- state.md is the single source of truth, re-read at the start of every verb. Write
SURGICALLY — edit only the target section, never regenerate the whole file. Section write
modes: Decisions = append-only · Tasks = update-in-place · Validation delta =
clear-on-resolve · Handoff = overwrite.
Soft size budget: keep this file tightest of all — it is re-read at the start of every
verb. If it is growing, you are restating instead of referencing by AC ID; trim. -->

## Decisions
Cross-phase decisions not captured in an artifact (incl. size promotions with reason).
Append-only: to reverse a decision, add a new row and mark the prior one
`superseded by AD-NN` — never delete or edit a logged decision.

| # | Decision | Why | Status | Date |
|---|---|---|---|---|
| AD-01 | <decision> | <rationale> | active | YYYY-MM-DD |

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

## Verification evidence
Written by `execute` on phase PASS — one row per AC, no prose/logs. Preserves the AC→code
proof on green.

| AC ID | file:line | spec-defined expected value | covered | sensor |
|---|---|---|---|---|

## Handoff
Overwrite-in-place. The recommended next verb stays first; the rest is a resume snapshot
for a phase interrupted mid-task (cross-task position is recoverable from git via per-task
commits).

- Next: <verb> — <what it should do>
- In-progress: <file:line, or none>
- Completed task IDs: <…>
- Blockers: <…>
- Uncommitted files: <…>
- Branch: <…>
