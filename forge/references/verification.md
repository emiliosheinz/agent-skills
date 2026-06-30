# Verification

How `execute` proves a change is correct. Correctness is enforced by **independent verifier
subagents**: the author writes code and tests; separate agents, each with a fresh context,
check different aspects. Author ≠ verifier — an agent grading its own work skews positive,
so the gate lives outside the author.

## Why independent verifiers

The thing that makes a test trustworthy is that it actually fails when the behavior breaks
— that it discriminates. The **mutation/discrimination sensor** (verifier 5) proves that
directly: it injects a fault and confirms the tests catch it. Pairing it with the spec-
coverage and architecture verifiers gives correctness an external, evidence-backed gate
rather than relying on author discipline. Write tests first if it helps you think — the
gate is the verifiers, not a ritual.

## The five verifiers

Run by independent subagents. Give each only what it needs (paths, AC IDs, the design's
gates, the commit/diff under review) — they are stateless.

1. **Test suite + regression guard** *(automated)* — run the full suite. All pass, or
   report each failure by test name + file:line. Then inspect the task's own diff: flag
   when the suite has **fewer test cases than baseline**, or when existing **assertions
   were deleted or loosened**, unless `state.md` records a justified reason. (Gutting
   pre-existing tests to go green is invisible to verifier 5, which mutates only new code.)
2. **Lint / format** *(automated)* — run the project's configured linters/formatters
   (ESLint, Prettier, Biome, etc.). Report unfixed issues by file:line.
3. **Spec coverage** *(analysis)* — **evidence-or-zero**, in both directions.
   - **Forward (sufficiency):** for each AC ID the task claims, produce a row:
     `AC ID → file:line of the assertion → spec-defined expected value → covered?`. No
     `file:line` = not covered = fail. The assertion must check the AC's actual outcome
     value, not "something ran" / "no error thrown" (unless not-throwing *is* the
     criterion). **Field-level rule:** when an AC outcome is a multi-field event, returned
     object, or persisted record, require a value/state assertion at file:line for *each*
     named field. Asserting that a method was *called* (spy/mock/call-count) is never a
     substitute for asserting the resulting state.
   - **3b. Reverse (necessity):** for each test touched in the phase diff, map it back to
     an AC ID, spec edge case, or done-when criterion — `file:line + assertion → anchor →
     keep?`. A test anchored to nothing is scope creep → remove. Reject speculative
     what-if tests, tests of framework/library behavior, and cross-layer duplicate
     assertions.
   - **SPEC-GAP verdict:** if an AC (by its `PREFIX-NN` ID) lacks a precise expected value
     to anchor against, do not score it covered (false pass) or fail the implementer
     (unfair) — raise **SPEC-GAP**, record it as a spec defect against that AC ID + a
     lessons candidate, and route the fix back to `spec.md`.
4. **Architecture compliance** *(analysis)* — confirm the code follows `design.md`
   (component boundaries, contracts, decisions). No design → check consistency with the
   codebase patterns the spec recorded. Report violations by file:line.
5. **Mutation / discrimination sensor** *(expensive, destructive)* — inject small faults
   into the task's **own new code** (flip a condition, off-by-one, drop a field), run the
   tests, confirm they fail. A surviving mutant means the tests don't actually
   discriminate → becomes a fix item. **Run in isolation and restore the code
   afterward** (e.g. a scratch copy or guaranteed `git checkout` of the touched files).
   Never mutate the whole repo. Manual mutations are the default; a configured mutation
   tool (Stryker, mutmut, cargo-mutants, pitest) may be used *only when already present in
   the project*.

## What runs when (size-gated)

| Size | Verifiers |
|------|-----------|
| quick | 1, 2 |
| standard | 1, 2, 3, 4 |
| complex | 1, 2, 3, 4, 5 |

1 and 2 are cheap and parallel-safe. 3 and 4 are read-only analysis — run in parallel.
5 is expensive and destructive — run last, alone, scoped to the task's new code.

**Criticality overrides the size gate.** Any AC marked `critical` in the spec
(auth, payments, data integrity) fires verifier 5 **regardless of size**, with a deeper
budget (≥5 mutations, all branches of the critical path). A standard-sized auth change
must not ship with zero discrimination testing.

**Optional human UAT** *(P2, conditional)* — for **user-facing** ACs only (visual/UX/
end-to-end correctness the five automated verifiers can't see), offer a manual
acceptance check: present a short checklist via `AskUserQuestion` when available, plain
checklist otherwise, and record the result against the AC IDs. Backend/infra ACs rely on
the automated verifiers — keep the default pipeline automated.

**Parallelism:** dispatch the applicable verifiers as concurrent subagents. The Workflow
tool is a fine accelerator where available; sequential subagent calls are the universal
fallback. One level of delegation — verifiers spawn nothing.

## Graceful degradation (never fake a gate)

- **No test framework:** verifier 1 degrades to build/typecheck/run-the-thing. Verifier 5
  is **skipped and recorded as a gap** in `state.md` + a lessons candidate ("no test
  seam here") — not silently passed.
- **No spec / quick direct execute:** verifier 3 traces against the acceptance criteria
  derived inline at execute time, same structure.
- **Missing linter:** verifier 2 reports "no linter configured" rather than passing.

A skipped check is recorded as a gap, never reported as green.

## Verdict format

Each verifier returns a compact structured verdict:

```
### Verifier N — <name>: PASS | FAIL | SKIPPED (reason) | SPEC-GAP (AC id)
<failures by file:line, or the coverage table, or "clean">
```

The execute orchestrator aggregates these into an overall PASS/FAIL and a **single
severity-ranked gap list** across all verifiers — **Blocker → Major → Minor → Cosmetic**
(severity = which verifier failed × the AC's criticality). `execute`'s bounded ≤3 fix loop
consumes this list **top-down**, so it spends its budget on blockers before cosmetics. See
`references/execute.md`.
