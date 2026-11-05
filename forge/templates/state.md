# State — <feature-slug>

| Field | Value |
|-------|-------|
| Size | quick / standard / complex — <one-line justification> |
| Door | one-way / two-way door — <the triggers that fired, or "none"> |
| Surface | ui / none — <the trigger that fired, or "none"> |
| Created | YYYY-MM-DD |

<!-- Door: set by the first phase to run, per references/specify.md. Overrides the size
     gate for spec reviewer 3, design lens 4 and verifiers 3, 4 and 5. Never blank. Like Size
     it moves one way only; a downgrade needs the user's confirmation.
     Surface: set by the first phase to run, per SKILL.md step 4. Never blank; moves only
     from none to ui. -->

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

## Baseline
Written by `execute` before the change's first task. Verifiers 1 and 2 use these commands.

| Check | Command | Result |
|---|---|---|
| tests | `<cmd>` | <pass / failing names>, <test count> |
| type check | `<cmd>` | <pass / N/A> |
| lint | `<cmd>` | <pass / N/A> |
| format | `<cmd>` | <pass / N/A> |

## Tasks
Populated by `plan`, updated by `execute`. Task details live in `plan.md`. Task status:
pending / in-progress / done / blocked. Mark a finished phase `**completed**` below its
heading. `execute` writes `Base:` when a phase starts and `Verifying:` while its verifiers
run; `fix` writes `Fix-base:` for verifier 3. A quick change has one implicit phase.

### Phase 1 — <goal>
Base: <sha>
Fix-base: <sha, only during a fix>
Verifying: <stage>, cycle <n>

| ID | status | evidence (sha, test count) |
|----|--------|----------------------------|
| PREFIX-P1-01 | pending | — |
| PREFIX-P1-02 | pending | — |

### Phase 2 — <goal>

| ID | status | evidence (sha, test count) |
|----|--------|----------------------------|
| PREFIX-P2-01 | pending | — |

## Open findings
One row per verifier finding or gap. Clear only `applied` rows on resolve. Disposition:
open / applied / rejected(reason) / gap-blocking / gap-open / reported.

| Source | Finding | Disposition |
|---|---|---|

## Verification evidence
Written by `execute` on phase PASS — one row per AC, no prose/logs. Preserves the
AC→code proof on green.

| AC ID | file:line | spec-defined expected value | covered | sensor |
|---|---|---|---|---|
| PREFIX-01 | src/checkout/refund.ts:42 | refund amount == order.total | yes | mutant: drop-field caught |

## Handoff
Overwrite-in-place. The recommended next verb stays first; the rest records where a
phase stopped. Treat it as a hypothesis on resume: reconcile it with git
and the task status above, matching commits to tasks by evidence sha and `files`, because
commit messages carry no task IDs. Gaps belong in `## Open findings`, never here.

- Next: <verb> — <what it should do>
- In-progress: <file:line, or none>
- Completed task IDs: <…>
- Blockers: <…>
- Uncommitted files: <…>
- Branch: <…>
