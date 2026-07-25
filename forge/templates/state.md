# State — <feature-slug>

| Field | Value |
|-------|-------|
| Size | quick / standard / complex — <one-line justification> |
| Created | YYYY-MM-DD |

<!-- state.md is the single source of truth. Re-read at the start of every phase.
     Write SURGICALLY (see SKILL.md Universal rules for the section write-mode table).
     Keep this file the tightest of all — if it is growing, you are restating instead of
     referencing by AC ID. Trim. -->

## Decisions
Cross-phase decisions not captured in an artifact (incl. size promotions with reason).
Append-only: to reverse a decision, add a new row and mark the prior one
`superseded by AD-NN` — never delete or edit a logged decision.

| # | Decision | Why | Status | Date |
|---|---|---|---|---|
| AD-01 | <decision> | <rationale> | active | YYYY-MM-DD |

## Tasks
Populated by `plan`, updated by `execute`. Tasks grouped by phase; phases run in
order, `[P]` tasks run in parallel within a phase. Task status: pending /
in-progress / done / blocked. Mark a finished phase `**completed**` below its heading.

### Phase 1 — <goal>
Phase gate: `<full test + static analysis (typecheck + lint + format)>`

| ID | par | depends-on | AC-trace | gate | status | evidence (sha) |
|----|-----|------------|----------|------|--------|----------------|
| PREFIX-P1-01 | [P] | — | PREFIX-01 | `<cmd>` | pending | — |
| PREFIX-P1-02 | seq | PREFIX-P1-01 | PREFIX-02 | `<cmd>` | pending | — |

### Phase 2 — <goal>
Phase gate: `<...>`

| ID | par | depends-on | AC-trace | gate | status | evidence (sha) |
|----|-----|------------|----------|------|--------|----------------|
| PREFIX-P2-01 | [P] | — | PREFIX-03 | `<cmd>` | pending | — |

## Validation delta
During execute retries, the specific failing items only (cleared when resolved).

- <none>

## Verification evidence
Written by `execute` on phase PASS — one row per AC, no prose/logs. Preserves the
AC→code proof on green.

| AC ID | file:line | spec-defined expected value | covered | sensor |
|---|---|---|---|---|
| PREFIX-01 | src/checkout/refund.ts:42 | refund amount == order.total | yes | mutant: drop-field caught |

## Handoff
Overwrite-in-place. The recommended next verb stays first; the rest is a resume
snapshot for a phase interrupted mid-task (cross-task position is recoverable from
git via per-task commits).

- Next: <verb> — <what it should do>
- In-progress: <file:line, or none>
- Completed task IDs: <…>
- Blockers: <…>
- Uncommitted files: <…>
- Branch: <…>
