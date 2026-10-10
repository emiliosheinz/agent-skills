# Structural standards

The always-applied baseline for **under-design**: code that works, passes its tests, and
is still arranged badly. Forge's other structural voices all argue for *less* — the
simplicity lens, execute's "no anticipatory code", the owner's own steering. This file is
the one that asks whether what was built is in the right place, points the right way, and
names the domain.

Two sections, always read together: **Checks** (what good structure is) and
**How to run one** (how a review is conducted). The file knows nothing about forge's
phases, so anything with a diff and a subject can call it.

**Read by:** `references/review.md`'s under-design lens (subject: `design.md`),
`references/execute.md`'s per-batch structural axis (subject: a batch's hunks), and
`references/fix.md`'s claim-review lenses. Nothing else. `verification.md`'s verifiers 3
and 4 consume the spec's recorded conventions directly and never load this file.

## Checks

A check is a **question**, not a verdict. A smell is "a surface indication that usually
corresponds to a deeper problem in the system", and "smells don't *always* indicate a
problem" ([Fowler, CodeSmell](https://martinfowler.com/bliki/CodeSmell.html)) — a check
opens a question, it never closes one.

**The first-cut rule.** A check ships **enabled** only when its sources agree or
empirical backing exists. A check whose wording is contested in the literature ships
**disabled**, and is enabled only by evidence beyond a principle's name — named actors,
or a repeated-edit history visible in the diff. A check backed by nothing but one
author's heuristic does not ship at all. Adding a check later means rating it against
this rule, not arguing for it.

Every check is stated as a **fundamental**. No language, framework, or file extension
appears in a check statement; those live in Manifestations below. The applicable set is
chosen by **what the code does** — see the selection rule — never by what it is written
in.

### Enabled

| # | Check (as a question) | Surface facts required | Source | Confidence |
|---|---|---|---|---|
| 1 | Does a domain concept travel as a bare primitive, with its validation or parsing repeated at call sites? | names-domain-concept | [Fowler, ValueObject](https://martinfowler.com/bliki/ValueObject.html); [Evans, Value Objects](https://raw.githubusercontent.com/WardCunningham/ddd/master/pages/value-objects) | well-supported |
| 2 | Does one transaction write to two separate consistency roots? | has-transaction | [Evans, Aggregates](https://raw.githubusercontent.com/WardCunningham/ddd/master/pages/aggregates); [Fowler, DDD_Aggregate](https://martinfowler.com/bliki/DDD_Aggregate.html) | well-supported |
| 3 | Is a rule enforced outside the unit that owns the data it governs? | enforces-rules | [Evans, Aggregates](https://raw.githubusercontent.com/WardCunningham/ddd/master/pages/aggregates); [Fowler, AnemicDomainModel](https://martinfowler.com/bliki/AnemicDomainModel.html); [Evans, Services](https://raw.githubusercontent.com/WardCunningham/ddd/master/pages/services) | well-supported |
| 4 | Does the new behaviour have a seam — a place its dependency can be substituted without editing it there? | crosses-boundary, orchestrates | [Fowler on Feathers, LegacySeam](https://martinfowler.com/bliki/LegacySeam.html) | well-supported |
| 6 | Does a source dependency point the wrong way across a boundary the design document names? | crosses-boundary, named-boundary | [Martin, The Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html); [Cockburn, Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/) | well-supported for direction only |
| 7 | Do foreign payload shapes reach inward, or into storage, untranslated? | crosses-boundary | [Evans, Anticorruption Layer](https://raw.githubusercontent.com/WardCunningham/ddd/master/pages/anticorruption-layer) | well-supported |
| 8 | Does a new implementation of an existing contract refuse part of it? | implements-existing-contract | [Martin, Solid Relevance](https://blog.cleancoder.com/uncle-bob/2020/10/18/Solid-Relevance.html) | well-supported |
| 10 | Does one operation both change state and return domain data, where separating them is cheap? | owns-state | [Fowler, CommandQuerySeparation](https://martinfowler.com/bliki/CommandQuerySeparation.html); [Evans, Side-Effect-Free Functions](https://raw.githubusercontent.com/WardCunningham/ddd/master/pages/side-effect-free-functions) | well-supported, explicit exceptions allowed |
| 11 | Do names describe effect and purpose rather than mechanism or type? | universal | [Evans, Intention-Revealing Interfaces](https://raw.githubusercontent.com/WardCunningham/ddd/master/pages/intention-revealing-interfaces); [Google, eng-practices](https://google.github.io/eng-practices/review/reviewer/looking-for.html) | well-supported |
| 12 | Is a unit past the size threshold **and** mixing abstraction levels in one body? | universal | [Chowdhury et al., MSR 2022](https://arxiv.org/abs/2205.01842) | well-supported for the threshold (~24 SLOC) |
| 15 | Does a new type carry data only, with the rules that govern it placed elsewhere? | enforces-rules | [Fowler, AnemicDomainModel](https://martinfowler.com/bliki/AnemicDomainModel.html) | well-supported where domain rules exist |
| 18 | Does one name carry two incompatible meanings across the diff? | universal | [Evans, Bounded Context](https://raw.githubusercontent.com/WardCunningham/ddd/master/pages/bounded-context); [Fowler, BoundedContext](https://martinfowler.com/bliki/BoundedContext.html) | well-supported |
| 20 | Does the new code reach into another unit's internals, or chain through it? | universal | [Refactoring smell catalogue](https://refactoring.guru/refactoring/smells) (Feature Envy, Message Chains, Inappropriate Intimacy) | well-supported |
| 21 | Does each piece of state have exactly one owner, at the narrowest scope serving all its consumers? | owns-state | [React, Sharing State](https://react.dev/learn/sharing-state-between-components); [Dodds, Colocation](https://kentcdodds.com/blog/colocation) | well-supported |
| 22 | Is a value stored that can be computed from values already present? | derives | [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect); [Choosing the State Structure](https://react.dev/learn/choosing-the-state-structure) | well-supported |
| 23 | Is authoritative data copied out of its owning store into a second holder? | owns-state, crosses-boundary | [TkDodo, Practical React Query](https://tkdodo.eu/blog/practical-react-query); [Svelte, $state](https://svelte.dev/docs/svelte/$state) | well-supported |
| 24 | Does the chosen home match the value's lifetime and audience — transient, shareable, remote, or persistent? | owns-state | [React Router, State Management](https://reactrouter.com/explanation/state-management); [Dodds, Application State](https://kentcdodds.com/blog/application-state-management-with-react) | well-supported |
| 25 | Is a consequence propagated by a later synchronisation step, where the originating event could do it in one place? | derives | [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect) | well-supported |
| 26 | Can the declared shape represent a state that cannot exist? | declares-shape | [Shevlin, Multiple Boolean Props](https://kyleshevlin.com/multiple-boolean-props-are-a-code-smell/); [Choosing the State Structure](https://react.dev/learn/choosing-the-state-structure) | well-supported |
| 28 | Is remote I/O started deep inside the unit that presents its result, rather than once at the entry point that owns it? | crosses-boundary, orchestrates | [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect) | well-supported |

### Disabled pending extra evidence

These fire **only** with named actors or a repeated-edit history visible in the diff.
Their wording is contested as vague by practitioners who otherwise accept the rest
([North, CUPID](https://dannorth.net/blog/cupid-the-back-story/);
[Miller, Putting SOLID into Perspective](https://jeremydmiller.com/2022/08/10/putting-solid-into-perspective/)).

| # | Check (as a question) | Extra evidence it needs | Source | Confidence |
|---|---|---|---|---|
| 9 | Are callers forced to depend on members they do not use? | a caller in the diff importing a wide type to reach one member | [Martin, Solid Relevance](https://blog.cleancoder.com/uncle-bob/2020/10/18/Solid-Relevance.html) | contested |
| 13 | Was an existing dispatch site edited again to add a case? | a third-or-later case appended to the same site, visible in history | [Martin, TheOpenClosedPrinciple](http://blog.cleancoder.com/uncle-bob/2014/05/12/TheOpenClosedPrinciple.html) | contested |
| 14 | Is one unit changed for two unrelated reasons, serving two different requesters? | both requesters named in the spec or the diff | [Martin, SingleResponsibilityPrinciple](https://blog.cleancoder.com/uncle-bob/2014/05/08/SingleReponsibilityPrinciple.html) | contested |
| 27 | Does a value traverse units that make no use of it, purely to reach a consumer? | two or more pass-through layers added in this diff | [React, Passing Data Deeply](https://react.dev/learn/passing-data-deeply-with-context) | contested — the fix is usually composition, never a store |

**Not shipped.** Four candidates from the research are backed by a single author's
heuristic with no corroboration and are therefore absent rather than disabled: whether a
diff's tests attach at the seam, whether a repeated query belongs behind a named
accessor, whether identifiers draw on domain vocabulary, and whether a multi-entity rule
needs its own named service (check 3 covers the part of that one which is supported).

### Manifestations

Examples only. A manifestation never widens a check — it helps recognise the trigger.
This is the **only** place technology names belong.

| Check | Service / backend form | Interface / frontend form |
|---|---|---|
| C1 | `string` email, `int` money, `string` currency code in a new signature | an id or amount as a raw prop or store field, re-parsed per consumer |
| C3 | validation in a request handler while the record exposes unguarded setters | a rule checked in a component while the store accepts any value |
| C4 | `new HttpClient()`, `now()`, a static call, raw SQL inside the unit | `fetch`, `Date.now()`, `localStorage`, `crypto.randomUUID()` called inline |
| C6 | a use-case file importing an ORM, SDK, or framework annotation | a feature module importing a vendor type or HTTP client directly |
| C7 | `snake_case` vendor keys persisted as-is | API field names rendered straight into markup; vendor enums compared in a view |
| C12 | a handler that parses, validates, and persists in one body | one unit that fetches, derives, branches, and renders |
| C21–C25 | a cache and a table both treated as authoritative | the same value in two sibling components; a query result copied into local state |
| C26 | three independent booleans for one lifecycle | `isLoading` + `isError` + `isEmpty` instead of one enumerated status |
| C28 | an N+1 call issued from inside a formatting loop | a request issued from a leaf's mount instead of the route that owns the view |

### Do not flag

An explicit list, not a tone. Each item is something a badly-tuned reviewer reaches for
and this lens must stay silent on — most of it is the simplicity lens's territory, and
colliding with it is how both get ignored.

1. **A missing port or interface around a single implementation.** "Question any
   interface with a single implementation, in the same module"
   ([Rentea](https://victorrentea.ro/blog/overengineering-in-onion-hexagonal-architectures/)).
   Check 4 is satisfied by a parameter or an injected function; demanding a port is
   over-design.
2. **A missing layer.** Martin's rule is about dependency *direction*, not layer count;
   strict layering in a small system produces "indirection without abstraction"
   ([Rentea](https://victorrentea.ro/blog/overengineering-in-onion-hexagonal-architectures/)).
   Check direction against the boundary the design document names, never layer count.
3. **Tactical domain patterns in code with no domain rules.** Entities, value objects,
   aggregates, and repositories in CRUD or glue code are ceremony; Evans himself
   de-emphasised the building blocks
   ([Evans, 2009](https://www.dddcommunity.org/library/evans_2009_1/)).
4. **Splitting a unit already under the size threshold.** Over-decomposition yields
   shallow interfaces and entanglement; "if two pieces of code are tightly related, the
   solution is to bring them together"
   ([Ousterhout](https://github.com/johnousterhout/aposd-vs-clean-code)). The supported
   threshold is ~24 SLOC ([MSR 2022](https://arxiv.org/abs/2205.01842)), not four lines.
5. **A comment.** Comments are not defects; missing *why* comments cost more than
   imperfect ones ([Ousterhout](https://github.com/johnousterhout/aposd-vs-clean-code);
   [Google](https://google.github.io/eng-practices/review/reviewer/looking-for.html)).
6. **Speculative generality of any kind** — a second implementation nothing calls, a
   config flag for a value that never changes, an extension hook with no extender. That
   is the simplicity lens's job, and it is itself a catalogued smell.
7. **Deduplication of two blocks that may diverge.** "My code traded the ability to
   change requirements for reduced duplication, and it was not a good trade"
   ([Abramov](https://overreacted.io/goodbye-clean-code/)).
8. **Single responsibility or open/closed as a bare assertion** — see Disabled above.
9. **Polymorphism for its own sake in a hot path**
   ([Muratori](https://www.computerenhance.com/p/clean-code-horrible-performance)).
10. **Accessibility, visual choices, re-render cost, bundle size, and framework-rule
    mistakes.** The last are correctness bugs with lint rules; raise one only as the
    local spelling of an enabled check.
11. **A smell treated as a defect.** A finding says what the trigger is and what the
    cheapest fix is. It never asserts a defect the diff does not show.

### Scope versus shape

The boundary that keeps this file from fighting the voices around it:

> **Scope** governs *whether* something is built. **Shape** governs *how* what is built
> is arranged.

Scope is the simplicity lens's question, and the right answer is usually "don't build
it". Shape is this file's question, and it is asked only about code the change already
contains. So:

- Moving a rule from a handler into the unit that owns its data is **the same scope** —
  the rule was already built. It is not an unrequested abstraction.
- Replacing a primitive with a domain type that already has validation repeated at call
  sites is **the same scope** — the validation was already built, three times.
- Splitting one oversized body into named steps is **the same scope**.
- Adding a port, a layer, a second implementation, a config flag, or an extension point
  is **new scope**, and this file never asks for it.

A finding that cannot be applied without widening scope is not a finding here. State it
as a **DESIGN-GAP** instead — surfaced, no fix cycle spent — the same routing
`verification.md` gives a `SPEC-GAP`.

## How to run one

### The subject contract

| Input | Shape | When absent |
|---|---|---|
| **subject** | an artifact to read, or a diff scope — a fixed point, or the hunks produced by this invocation | an explicitly-supplied subject that is empty **fails fast**; it is never a clean verdict. A per-batch slice that comes back empty is a task-level anomaly reported to the orchestrator, never a runner failure |
| **conventions** | the `Conventions observed` records from `spec.md`, each with a `file:line` example, or the legacy-absent marker | recorded as not available; the run continues |
| **standards** | a discovered `CODING_STANDARDS.md`'s content plus the discovery outcome | the outcome states none was found; this file is in force regardless |

This file is the reviewer's own dependency, not an input. Surface facts are **derived**
during selection, never supplied. If this file is missing, partially read, or names a
check id that cannot be resolved, the run is a **hard failure** — never run with partial
criteria and report clean.

### Selection

Each check declares the surface facts it requires. Derive the facts from the subject,
then run the checks whose facts are present.

| If the changed code… | …then these run |
|---|---|
| owns state that outlives one call or render (`owns-state`) | 10, 21, 23, 24, and 3, 15 |
| derives values, or writes state in response to other state changing (`derives`) | 22, 25, and 10 |
| crosses a network, storage, or vendor boundary (`crosses-boundary`) | 4, 6, 7, 23, 28 |
| enforces a rule, or computes money, eligibility, or permissions (`enforces-rules`) | 1, 3, 15, and 11, 18 |
| declares a shape with independent fields (`declares-shape`) | 26 |
| orchestrates several units or a multi-step flow (`orchestrates`) | 4, 25, 28 |
| implements a contract that already exists (`implements-existing-contract`) | 8 |
| has a transaction, persistence, or a multi-unit invariant (`has-transaction`) | 2 |
| is a presentational leaf — inputs in, output out, no I/O, no persistent state | **only** 11, 12, 20, 26. Nothing else fires |
| always | 11, 12, 18, 20 |

**Asserting a fact absent requires citing the evidence for that absence** — the file read,
the import list checked, the absent construct named — exactly as a finding requires a
trigger. Otherwise "the facts were not derivable" is a free path to a clean verdict, and
an unselected check is indistinguishable from a passing one. An unsupported absence
assertion is rejected and the check runs.

A run that evaluates **only** the universal checks is recorded as a **gap**, not a note.

### Firing discipline

The precision arithmetic that governs this file: review-time checks must stay under
**10% effective false positives** or developers stop trusting them
([Software Engineering at Google, ch. 20](https://abseil.io/resources/swe-book/html/ch20.html)),
while open LLM reviewers measure ~15% mean precision and ~1.49 false positives per pull
request ([SWR-Bench](https://arxiv.org/abs/2509.01494)). And the evidence that a checklist
beats unstructured review is weak: "we did not identify a strong relationship between the
guidance provided and code review performance"
([Gonçalves et al., EMSE 2022](https://doi.org/10.1007/s10664-022-10123-8)).

So **prefer silence.** Every finding carries three things or it is not emitted:

1. a **trigger** — a `file:line` inside a hunk of the subject;
2. a **source** — a string from this file's source list;
3. the **cheapest fix** — the smallest edit that resolves the trigger.

A candidate with no trigger visible in the subject is **dropped, never softened**. A
finding whose cited line falls outside the subject counts as a false positive.

### The verdict

Use the verdict format in `references/review.md` ("Verdict format") unchanged. On top of
it, report this delta:

- the **check ids actually evaluated**;
- the **surface facts** asserted, with the evidence for each asserted absence;
- the **count of candidates dropped** for want of a trigger;
- the **dispatch record** — tier, and whether the run was a subagent or inline.

Without the evaluated set, a review that silently selected nothing is indistinguishable
from a healthy clean run — and forge's standing rule is that a skipped check is a
recorded gap, never green.
