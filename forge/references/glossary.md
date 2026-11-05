# Glossary

Forge's load-bearing terms. A pointer in another file can say *the door verdict* or *the
three lies* and be understood without restating what they are.

**This file is an index, not a second definition.** Each row gives the shortest gloss
that identifies the term and then names where it is actually defined — that place is the
authority, and it is the one to edit. A gloss here that disagrees with its home is a bug
in this file. Two terms have no home elsewhere and are defined here outright; their rows
say so.

**Keep it true.** A change that adds, renames, moves or redefines a load-bearing term edits
its row in the same change.

Read it when a pointer uses a term you cannot place. Nothing dispatches it. A subagent
prompt that uses these terms names this file.

| Term | Gloss | Defined in |
|---|---|---|
| **one-way door** | a change whose effect reverting the commit cannot undo | `specify.md` → *Requirements and acceptance criteria* |
| **two-way door** | the normal case: revertible. Recorded anyway, because a blank field reads as unconsidered | same |
| **door verdict** | which of the two a change is, plus the triggers that fired, in `state.md`'s header | same |
| **`[critical]`** | the per-AC marker on the ACs carrying the irreversible outcome; it scopes what the door verdict widened | same |
| **Request** | the user's opening request and later scope statements, verbatim, which every AC traces back to | `specify.md` → *Part B — Specify* |
| **blast radius** | what already depends on the code the change touches — observed, not predicted | `specify.md` → *A2. Scan the codebase*, Move 2 |
| **conventions observed** | the six-category record of what the code already does, cited `file:line`; the pipeline's only structural input | `specify.md` → *A2. Scan the codebase*, Move 1 |
| **seam** | a place a dependency can be substituted without editing the code that uses it | `structural-standards.md` → check 4 |
| **locality** | same module, same files; the axis `plan` groups implementer batches along and `execute` batches by | `plan.md` → *Execution plan* |
| **depth** | how far a phase goes for a given size, as opposed to which phases run at all | `SKILL.md` → *Sizing* |
| **ratchet** | a recorded judgement that may tighten freely but loosens only with the user's confirmation — size and door | `SKILL.md` → *Sizing* |
| **mechanical change** | the same edit repeated, such as a rename; it stays standard at any reach | `SKILL.md` → *Sizing* |
| **phase gate** | a plan phase's selected verifiers. There is no separate gate step | `SKILL.md` → *Sizing*; `verification.md` |
| **cycle** | one fix plus one re-run of the check that failed; every retry against a check stops at 3 | `SKILL.md` → *Retries* |
| **stage** | one step of the verifier order with its own budget of 3 cycles; verifiers 1 and 2 together are one stage | `verification.md` → *Run order and progression* |
| **baseline** | the discovered test and static-analysis commands and their first result, recorded once per change | `execute.md` → *Baseline* |
| **`Base:` / `Fix-base:`** | the sha a phase's review starts from, and the sha a `fix` invocation's review starts from | `execute.md` → *Run the phase*; `fix.md` → *2. Cascade* |
| **structure verifier** | verifier 3: runs the catalogue and checks conventions and design against the phase's diff | `verification.md` → *The five verifiers* |
| **conventions-only mode** | verifier 3 at `quick` on a two-way door: an inline comparison of the diff with the conventions record | `verification.md` → *The five verifiers* |
| **the three lies** | the ways a test passes without discriminating a bug: **tautological**, **structure-sensitive**, **cannot-fail** | `verification.md` → *How a test lies* |
| **evidence-or-zero** | a claim with no cited evidence scores zero rather than partial credit | `verification.md` → verifier 4 |
| **`gap-blocking` / `gap-open`** | a gap the phase cannot pass with, and one recorded without stopping it | `verification.md` → *Gaps* |
| **SPEC-GAP** | a verdict that the spec, not the implementation, is what is wrong; resolves through `/forge fix` | `verification.md` → *Gaps* |
| **DESIGN-GAP** | a finding that cannot be applied without new scope; a recorded decision for the user, spending no fix cycle | `verification.md` → *Gaps*; `execute.md` → *Fix the delta* |
| **`reported`** | a finding no phase will act on, which goes to the user at Finish | `execute.md` → *Fix the delta* |
| **delta** | the ranked list a review or verifier returns, folded back into what it reviewed | `review.md` → *Resolve findings*; `execute.md` → *Fix the delta* |
| **scope vs shape** | scope governs *whether* something is built, shape governs *how* what is built is arranged; relocating a rule or replacing a primitive is the same scope | `structural-standards.md` → *Scope versus shape* |
| **brake** | *(defined here)* a mechanism that can stop the work rather than only comment on it: a gate, a verifier, a required field, a cycle limit. Prose that cannot fail is not a brake |
| **slop** | *(defined here)* output that satisfies the instruction's letter while failing its purpose — a test that cannot fail, a rejection with no reason, a convention row marked empty without searching. What the gates exist to catch |
