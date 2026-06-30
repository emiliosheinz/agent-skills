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

1. **Test suite** *(automated)* — run the full suite. All pass, or report each failure
   by test name + file:line.
2. **Lint / format** *(automated)* — run the project's configured linters/formatters
   (ESLint, Prettier, Biome, etc.). Report unfixed issues by file:line.
3. **Spec coverage** *(analysis)* — **evidence-or-zero.** For each AC ID the task claims,
   produce a row: `AC ID → file:line of the assertion → spec-defined expected value →
   covered?`. No `file:line` citation = not covered = fail. The assertion must check the
   AC's actual outcome value, not merely that "something ran" or "no error thrown"
   (unless not-throwing *is* the criterion).
4. **Architecture compliance** *(analysis)* — confirm the code follows `design.md`
   (component boundaries, contracts, decisions). No design → check consistency with the
   codebase patterns the spec recorded. Report violations by file:line.
5. **Mutation / discrimination sensor** *(expensive, destructive)* — inject small faults
   into the task's **own new code** (flip a condition, off-by-one, drop a field), run the
   tests, confirm they fail. A surviving mutant means the tests don't actually
   discriminate → becomes a fix item. **Run in isolation and restore the code
   afterward** (e.g. a scratch copy or guaranteed `git checkout` of the touched files).
   Never mutate the whole repo.

## What runs when (size-gated)

| Size | Verifiers |
|------|-----------|
| quick | 1, 2 |
| standard | 1, 2, 3, 4 |
| complex | 1, 2, 3, 4, 5 |

1 and 2 are cheap and parallel-safe. 3 and 4 are read-only analysis — run in parallel.
5 is expensive and destructive — run last, alone, scoped to the task's new code.

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
### Verifier N — <name>: PASS | FAIL | SKIPPED (reason)
<failures by file:line, or the coverage table, or "clean">
```

The execute orchestrator aggregates these into an overall PASS/FAIL and drives the fix
loop. See `references/execute.md`.
