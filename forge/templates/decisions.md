# Decisions — <slug>

<!-- Per-run ledger for auto runs. Append-only: never delete or rewrite a record; supersede
     it with a new one and set the old one's Status.
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

### DR-NN · <area>
Question: <one sentence>
Key: <normalized question, for re-open detection>
Options: 1) <...> 2) <...> 3) smallest change: <...>
Choice: <n> — <one line>
Rationale: <at most 5 lines, each claim cited>
Assumptions: <each, spec-invalidating or not>
Reversibility: two-way / hard-to-reverse (<cost to undo>) / one-way
Would change my mind: <evidence>
Supersedes: <DR-NN or none>
Type: <decision / assumption>
Owner: <role>
Tier log: <T1 -> T2 -> ...>
Review: <outcome of the review steps>
Arbiter: <model differs from the owner's: yes / no, and why not>; <ruling, tie-breaker>
Dissent: <losing position, one line>
Ratify: <yes / no>
Binds: <tasks / components>
Status: active
