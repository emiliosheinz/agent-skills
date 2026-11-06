# Decisions — <slug>

<!-- Per-run ledger for auto runs. Append-only: never edit or delete a record; supersede it.
     This file is the only home of a decision's tier, choice and status; state.md Decisions
     holds one pointer row per record. Spec-level assumptions stay in the spec. -->

## Clarify gate
<!-- First entry. Candidates are ranked: rank 1 is the highest priority.
     Outcome: asked / default / dropped: <evidence>. -->

| Rank | Candidate | Source | Outcome |
|---|---|---|---|
| 1 | <question> | <where it came from> | asked |

Rounds asked: <n>

## Records
<!-- One record per decision or assumption, numbered DR-NN in order.
     Type: decision / assumption.
     Tier log: upward-only; a tier is never lowered. Write "T3 (provisional)" when T3.
     Status: active / superseded by DR-NN.
     Review trail: save each role return as Scratch:/<DR-NN>-<step> before the next step
     starts. On resume, list those files, find the last completed step and redo only a
     missing one, saying so in the record. -->

### DR-NN · <decision / assumption> · <area> · <tier>
Question: <one sentence>
Options: 1) <...> 2) <...> 3) smallest change: <...>
Choice: <n> — <one line>
Rationale: <at most 5 lines, each claim cited>
Reversibility: two-way / hard-to-reverse (<cost to undo>) / one-way
Type: <decision / assumption>
Owner: <role>
Tier log: <T1 -> T2 -> ...>
Review: <outcome of the review steps>
Ratify: <yes / no>
Status: active
