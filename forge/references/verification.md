# Verification

How `execute` proves a change is correct. Correctness is enforced by **independent
verifier subagents**: the author writes code and tests; separate agents, each with a
fresh context, check different aspects. Author ≠ verifier — an agent grading its own
work tends to pass it, so the check must come from outside the author.

## Why independent verifiers

The thing that makes a test trustworthy is that it actually fails when the behavior
breaks. The **mutation sensor** (verifier 5) proves that directly: it injects a fault
and confirms the tests catch it. Pairing it with the spec-coverage and architecture
verifiers gives correctness an external, evidence-backed gate, rather than relying on
author discipline. Write tests first if it helps you think — the gate is the
verifiers, not a ritual.

A typical run looks like:

```text
execute → spawn N verifiers in parallel (size-gated)
       → each verifier returns a verdict (PASS / FAIL / SKIPPED / SPEC-GAP)
       → execute aggregates → if FAIL, fix-the-delta loop (≤3 cycles)
       → if PASS, append Verification evidence to state.md
```

## The five verifiers

Run by independent subagents. Give each only what it needs (paths, AC IDs, the
design's gates, the commit/diff under review). They are stateless.

1. **Test suite + regression guard** *(automated)* — run the full suite. All pass, or
   report each failure by test name + file:line. Then inspect the task's own diff and
   flag when the suite has **fewer test cases than baseline**, or when existing
   **assertions were deleted or loosened**, unless `state.md` records a justified
   reason. (Gutting pre-existing tests to go green is invisible to verifier 5, which
   mutates only new code.)
2. **Static analysis** *(automated)* — the non-runtime correctness gate. Run three
   sub-checks, each as the project's **own configured command** (discover them from
   package scripts, config files, pre-commit hooks, or CI — never invent one), and give
   each an independent verdict `PASS | FAIL | N/A`, reporting unresolved issues by
   file:line:
   1. **Type check** — the configured type/compile check (`tsc --noEmit`, `mypy`,
      `cargo check`, `go vet`, …) — the non-emitting check, not a full artifact build
      (a build can clobber a live/running server). On a typed codebase this must run; a
      change must not ship type-unchecked.
   2. **Lint** — the configured linters (ESLint, Biome, Ruff, clippy, golangci-lint).
   3. **Format** — the configured formatter in **check mode** (`prettier --check`,
      `biome format`, `gofmt -l`). Report drift; never auto-fix-and-hide — a formatter
      that rewrites files masks the drift and mutates the diff under review.

   **N/A vs gap.** A tool the project genuinely has no analogue for (e.g. no type
   checker in a dynamically-typed repo) is `N/A` — not a failure. A tool that *is*
   configured but wasn't run is a gap: record it, never report it green (see "never
   fake a gate" below).
3. **Spec coverage** *(analysis)* — **evidence-or-zero**, in both directions.

   **Forward (sufficiency).** For each AC ID the task claims, produce a row:
   `AC ID → file:line of the assertion → spec-defined expected value → covered?`. No
   `file:line` = not covered = fail. The assertion must check the AC's actual outcome
   value, not "something ran" / "no error thrown" (unless not-throwing *is* the
   criterion).

   **Field-level rule.** When an AC outcome is a multi-field event, returned object,
   or persisted record, require a value/state assertion at file:line for *each* named
   field. Asserting that a method was *called* (spy/mock/call-count) is never a
   substitute for asserting the resulting state.

   **Reverse (necessity).** For each test touched in the phase diff, map it back to an
   AC ID, spec edge case, or done-when criterion — `file:line + assertion → anchor →
   keep?`. A test anchored to nothing is scope creep → remove. Reject speculative
   what-if tests, tests of framework/library behavior, and cross-layer duplicate
   assertions.

   **SPEC-GAP verdict.** If an AC (by its `PREFIX-NN` ID) lacks a precise expected
   value to anchor against, do not score it covered (false pass) or fail the
   implementer (unfair) — raise **SPEC-GAP**, record it as a spec defect against that
   AC ID plus a lessons candidate, and route the fix back to `spec.md`.
4. **Architecture compliance** *(analysis)* — confirm the code follows `design.md`
   (component boundaries, contracts, decisions). No design → check consistency with
   the codebase patterns the spec recorded. Report violations by file:line.
5. **Mutation sensor** *(expensive, destructive)* — inject small faults into the
   task's **own new code** and confirm the tests catch them. Concrete examples:
   - flip a boolean condition (`==` → `!=`)
   - off-by-one in a loop bound (`i < n` → `i <= n`)
   - drop a field from a returned object

   Run the tests after each mutation; they must fail. A **surviving mutant** (tests
   still pass after the fault) means the tests don't actually discriminate — it
   becomes a fix item.

   **Run in isolation and restore the code afterward** (e.g. a scratch copy or
   guaranteed `git checkout` of the touched files). Never mutate the whole repo.
   Manual mutations are the default; a configured mutation tool (Stryker, mutmut,
   cargo-mutants, pitest) may be used **only when already present in the project**.

## What runs when (size-gated)

| Size | Verifiers | Override |
|------|-----------|----------|
| quick | 1, 2 | Any `critical` AC also runs 5 |
| standard | 1, 2, 3, 4 | Any `critical` AC also runs 5 |
| complex | 1, 2, 3, 4, 5 | — |

1 and 2 are cheap and parallel-safe. 3 and 4 are read-only analysis — run in parallel.
5 is expensive and destructive — run last, alone, scoped to the task's new code.

**Criticality overrides the size gate.** Any AC marked `critical` in the spec (auth,
payments, data integrity) triggers verifier 5 regardless of size, with extra
mutations (at least 5, covering all branches of the critical path). A standard-sized
auth change must not ship with zero mutation testing.

**Optional human UAT** *(P2, conditional)* — for **user-facing** ACs only
(visual/UX/end-to-end correctness the five automated verifiers cannot see), offer a
manual acceptance check: present a short checklist via `AskUserQuestion` when
available, plain checklist otherwise, and record the result against the AC IDs.
Backend/infra ACs rely on the automated verifiers — keep the default pipeline
automated.

**Parallelism.** Dispatch the applicable verifiers as concurrent subagents per
SKILL.md's Orchestration rules. Use Workflow when the runtime supports it; otherwise
sequential subagent calls. Verifiers spawn nothing.

**Model tier per verifier** (SKILL.md Model & effort selection). The automated verifiers
have a mechanical pass/fail and run at economy/low: test suite (1) and static analysis
(2) — typecheck, lint, and format are all mechanical. The analysis verifiers — spec coverage (3) and architecture
compliance (4) — need judgment; run them at standard, or frontier with high effort for a
complex change. Don't send all five to the frontier tier by default.

## Graceful degradation (never fake a gate)

- **No test framework:** verifier 1 degrades to running the affected code path
  directly (a smoke check) — typecheck is verifier 2's job. Verifier 5 is **skipped and
  recorded as a gap** in `state.md` plus a lessons candidate ("no test seam here") —
  not silently passed.
- **No spec / quick direct execute:** verifier 3 traces against the acceptance
  criteria derived inline at execute time, same structure.
- **Missing static-analysis tool:** verifier 2 reports each sub-check independently. A
  tool the project has configured but that can't run is "not configured" / a gap, never
  passed; a tool with no analogue for the language is `N/A`.
- **No `WebFetch` / `WebSearch`:** the external-reference pass in `specify` degrades
  to codebase-only; design's "research unknowns" relies on docs already in the repo.

A skipped check is recorded as a gap, never reported as green.

## Verdict format

Each verifier returns a compact structured verdict:

```markdown
### Verifier N — <name>: PASS | FAIL | SKIPPED (reason) | SPEC-GAP (AC id)
<failures by file:line, or the coverage table, or "clean">
```

The execute phase combines these into one PASS/FAIL and a single gap list ranked by
severity: Blocker → Major → Minor → Cosmetic. (Severity is the failing verifier
multiplied by the AC's criticality.) The bounded fix loop in execute, capped at three
cycles, works the list top-down so it spends its retries on blockers before
cosmetics. See `references/execute.md`.
