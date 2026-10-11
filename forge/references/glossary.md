# Glossary

Forge's load-bearing terms. A pointer in another file can say *the door verdict* or *the
three lies* and be understood without restating what they are.

**This file is an index, not a second definition.** Each row gives the shortest gloss
that identifies the term and then names where it is actually defined — that place is the
authority, and it is the one to edit. A gloss here that disagrees with its home is a bug
in this file. Two terms have no home elsewhere and are defined here outright; their rows
say so.

Read it when a pointer uses a term you cannot place. Nothing dispatches it.

| Term | Gloss | Defined in |
|---|---|---|
| **one-way door** | a change whose effect reverting the commit cannot undo | `specify.md` → *Requirements and acceptance criteria* |
| **two-way door** | the normal case: revertible. Recorded anyway, because a blank field reads as unconsidered | same |
| **door verdict** | which of the two a change is, plus the triggers that fired, in `state.md`'s header | same |
| **`[critical]`** | the per-AC marker on the ACs carrying the irreversible outcome; it scopes what the door verdict widened | same |
| **blast radius** | what already depends on the code the change touches — observed, not predicted | `specify.md` → *A2. Scan the codebase*, Move 2 |
| **conventions observed** | the six-category record of what the code already does, cited `file:line`; the pipeline's only structural input | `specify.md` → *A2. Scan the codebase*, Move 1 |
| **seam** | a place a dependency can be substituted without editing the code that uses it | `structural-standards.md` → check 4 |
| **locality** | same module, same files; the axis `plan` groups implementer batches along and `execute` batches by | `plan.md` → *Execution plan* |
| **depth** | how far a phase goes for a given size, as opposed to which phases run at all | `sizing.md` → *Channel 1* |
| **the three lies** | the ways a test passes without discriminating a bug: **tautological**, **structure-sensitive**, **cannot-fail** | `plan.md` → *How a test lies* |
| **evidence-or-zero** | a claim with no cited evidence scores zero rather than partial credit | `verification.md` → verifier 3 |
| **SPEC-GAP** | a verdict that the spec, not the implementation, is what is wrong; routes back to `spec.md` | `verification.md` |
| **DESIGN-GAP** | a finding that cannot be applied without new scope; routes back to `design.md`, spending no fix cycle | `execute.md` → the structural axis; `structural-standards.md` |
| **ratchet** | a recorded judgement that may tighten freely but loosens only with the user's confirmation — sizing, and the gate set | `SKILL.md` → *Sizing* |
| **delta** | the ranked list a review or verifier returns, folded back into the artifact it reviewed | used throughout; see `review.md` |
| **scope vs shape** | scope governs *whether* something is built, shape governs *how* what is built is arranged; relocating a rule or replacing a primitive is the same scope | `execute.md` → step 5 |
| **brake** | *(defined here)* a mechanism that can stop the work rather than only comment on it: a gate, a verifier, a required field, a cycle limit. Prose that cannot fail is not a brake |
| **slop** | *(defined here)* output that satisfies the instruction's letter while failing its purpose — a test that cannot fail, a rejection with no reason, a convention row marked empty without searching. What the gates exist to catch |
