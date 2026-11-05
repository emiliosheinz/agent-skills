# Verification

How `execute` proves a change is correct: **independent verifier subagents**, each with a
fresh context, checking different aspects of what the author wrote. Author ≠ verifier — an
agent grading its own work tends to pass it, so the check must come from outside the
author.

A plan phase's gate **is** its verifiers. `SKILL.md` → *Sizing* says which run for a given
size and door. Numbers match run order. On a phase whose diff renders, styles or lays out
a screen, **the look** (`references/ui.md`) runs after verifier 3 and before 4, at every
size. It is a named stage and carries no number.

## Run order and progression

Verifiers always run in ascending order. 1 and 2 may run together, because neither depends
on the other. Each later verifier starts once the one before it passes, so analysis never
runs on red code and a structural fix cannot invalidate coverage evidence.

**A verifier passes when no Blocker or Major finding remains.** Its Minor and Cosmetic
findings become `reported` and go to the user at Finish. A SPEC-GAP holds back verifier 5,
which would be wasted on a phase that cannot pass yet. A DESIGN-GAP holds back nothing.

**Each stage has its own budget of 3 fix cycles** (1 and 2 together are one stage), per
`SKILL.md` → *Retries*. A shared budget would let one stage spend every cycle and keep the
next from ever running. `references/execute.md` holds the fix loop.

## The five verifiers

Run by independent subagents. Give each only what it needs (paths, AC IDs, the design's
gates, the phase's diff, the commands from `state.md`'s `## Baseline`, and
`references/glossary.md` for forge's terms). They are stateless and spawn nothing.

1. **Test suite + regression guard** *(automated)* — run the full suite with the recorded
   test command. All pass, or report each failure by test name + file:line. A failure named
   in `## Baseline` is not a failure of this phase; a new one is. Then inspect
   the phase's diff and flag when the suite has **fewer test cases than the recorded
   baseline**, or when existing **assertions were deleted or loosened**, unless `state.md`
   records a justified reason. (Gutting pre-existing tests to go green is invisible to
   verifier 5, which mutates only new code.)
2. **Static analysis** *(automated)* — the non-runtime correctness gate. Run three
   sub-checks with the recorded commands, each giving an independent verdict
   `PASS | FAIL | N/A`, reporting unresolved issues by file:line:
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
   configured but wasn't run is a gap: record it, never report it green.

   **Where the commands come from.** Execute discovers them once per change, from package
   scripts, config files, pre-commit hooks, or CI — never invented — and records them in
   `## Baseline`. Every phase uses the same ones, because a different command would make
   the baseline comparison false.
3. **Structure** *(analysis)* — confirm the phase's code is arranged well and follows what
   was decided. The subject is the recorded `Fix-base:` sha through HEAD when one is set,
   else `Base:` through HEAD. It reads, and does not edit. Two modes:

   **Full mode** (`standard`+, or a one-way door at any size). Carries
   `references/structural-standards.md`, any discovered `CODING_STANDARDS.md`, the spec's
   `Conventions observed` records, and `design.md` when one exists.
   - Run the catalogue per that file's selection and firing discipline. Findings carry its
     verdict delta.
   - Compare the diff against **all six** convention categories, and against `design.md`'s
     verdicts, boundaries, contracts and decisions. Report violations by file:line. A
     contract the code omits has no hunk to cite, so the firing discipline applies only to
     catalogue checks.
   - Prior dispositions go in the prompt on a re-run, so a finding already rejected with a
     reason is not raised again.

   Run it after commands have finished, and note the tree's dirty paths around the
   dispatch: any new delta is then this read-only verifier's own. Revert it, keep the
   verdict, and record a gap.

   **Conventions-only mode** (`quick` on a two-way door). Compare the diff against the
   `Conventions observed` records and nothing else. It **reads no design document**,
   **loads no structural catalogue**, and **dispatches no subagent**: it runs inline.
   Those three exclusions keep `quick` cheap; the look, on a screen phase, still runs as a
   subagent. Report each category as conformant or
   deviating, with the deviating `file:line`. A section present with nothing observed
   passes and says so; a none-observed marker that does not name where it looked is a
   finding. This step is part of quick's gate: a deviation feeds the fix loop.

   **Severity.** Blocker when the finding sits on the path of a `[critical]` AC. Major when
   it breaks a contract, boundary or decision the design names, or deviates from a
   convention with no stated reason. Minor otherwise.
4. **Spec coverage** *(analysis)* — **evidence-or-zero**, in both directions. It carries
   *How a test lies* below, and neither the catalogue nor a standards file.

   **Forward (sufficiency).** For each AC ID in this phase's scope, produce a row:
   `AC ID → file:line of the assertion → spec-defined expected value → covered?`. No
   `file:line` = not covered = fail, and an uncovered AC is at least Major. The assertion
   must check the AC's actual outcome value, not "something ran" / "no error thrown"
   (unless not-throwing *is* the criterion). The row must also show the test ran: its name
   in the gate's output, or a pass line the gate matched.

   An AC whose expected outcome is visible may instead be evidenced by a `look` row: the
   capture path and the observed outcome. Lacking an assertion, it is then neither
   uncovered nor a SPEC-GAP. On a screen phase, verifier 4's prompt carries the look's
   evidence rows. A row tagged `degraded` or `inline` counts as degraded evidence, as
   under *Graceful degradation*, beside the look's `gap-open` row for what it could not
   see, when the ladder wrote one.

   **Field-level rule.** When an AC outcome is a multi-field event, returned object,
   or persisted record, require a value/state assertion at file:line for *each* named
   field. Asserting that a method was *called* (spy/mock/call-count) is never a
   substitute for asserting the resulting state. When an AC names an enumerated set,
   require a value assertion per member, or one table-driven test whose size is stated.

   **Two values nobody named.** For an AC stating a rule, try the implementation on two
   input values neither the spec's examples nor the tests name, in a scratch copy, and
   compare with what the AC requires. This catches a wrong rule that code and test share,
   which mutation cannot. A resulting test anchors on the broken AC, with its expected
   value from the spec; if the spec cannot supply one, raise SPEC-GAP.

   **The three lies, by name.** Reject a test that is **tautological**,
   **structure-sensitive** or **cannot-fail**, and reject a test that breaks **the
   mocking boundary** or **the independent-expected-value rule**. See *How a test lies*. A
   test rejected by the forward or reverse check is at least Major.

   **No forge identifier in the diff.** Scan the phase's changed files for an AC ID, a
   task or decision ID, a slug, a `./.specs/...` path, or a verdict name — in source, a
   comment, a test name or description, or a fixture. Each hit is a Major finding at its
   `file:line`, cleared by restating the rule or the behaviour in its own terms;
   `references/execute.md` → *Per-task loop* holds the rule and the reason. The trace
   belongs in the evidence rows, which is why the code does not carry it.

   **Reverse (necessity).** For each test touched in the phase diff, map it back to an
   AC ID, a **design element**, a spec edge case, or a done-when criterion —
   `file:line + assertion → anchor → keep?`. A design element is a named component, a
   seam, or a recorded convention, and it is a legitimate anchor in its own right:
   structural work has no AC of its own and must not be deleted for lacking one. An item
   with **neither** anchor is still scope creep → remove. Reject speculative
   what-if tests, tests of framework/library behavior, and cross-layer duplicate
   assertions.

   **SPEC-GAP verdict.** If an AC (by its `PREFIX-NN` ID) lacks a precise expected
   value to anchor against, do not score it covered (false pass) or fail the
   implementer (unfair) — raise **SPEC-GAP** against that AC ID. See *Gaps*.
5. **Mutation sensor** *(expensive, destructive)* — inject small faults into the
   phase's **own new code** and confirm the tests catch them. Concrete examples:
   - flip a boolean condition (`==` → `!=`)
   - off-by-one in a loop bound (`i < n` → `i <= n`)
   - drop a field from a returned object

   Run the tests after each mutation; they must fail. A **surviving mutant** (tests
   still pass after the fault) means the tests don't actually discriminate — it
   becomes a Major fix item. Runs last and alone.

   **Run in isolation and restore the code afterward** (e.g. a scratch copy or
   guaranteed `git checkout` of the touched files). Never mutate the whole repo.
   Manual mutations are the default; a configured mutation tool (Stryker, mutmut,
   cargo-mutants, pitest) may be used **only when already present in the project**.

## How a test lies

A task's `tests` field is where its strength is decided. Verifier 5 catches a weak test
but runs only at `complex` or on a one-way door, so these names apply at every size, from
the moment a test is planned to the moment one is rejected.

- **tautological** — the assertion restates the implementation, comparing the code's
  output to its own expression or to a constant the code also reads, so it passes for any
  implementation including a wrong one.
- **structure-sensitive** — it checks *shape* rather than *outcome*: that a method was
  called, how often, in what order. A harmless refactor breaks it; a behavioural bug does
  not.
- **cannot-fail** — no input makes the assertion false: an empty loop body, a `try` that
  swallows, `expect(result).toBeDefined()`, a snapshot written from current output.

**The mocking boundary.** Mock at **system boundaries only** — external services, time,
randomness, and where unavoidable the datastore and filesystem. Never the change's own
collaborators: a test stubbing the unit next to the one under test asserts on the stub.

**The independent-expected-value rule.** An expected value's expression must not reference
any symbol **defined in the files the task changed** — write the value the acceptance
criterion names. A value computed by the code under test cannot disagree with it.

## One-way door

A change classified a **one-way door** (`references/specify.md`) forces verifier 3 in full
mode and verifiers 4 and 5 regardless of size, with extra mutations for 5: at least 5,
covering all branches of the irreversible path. The door verdict decides *whether* 5 runs;
the per-AC `[critical]` marker decides *where* it points — mutate the branches reachable
from the ACs carrying the irreversible outcome. A one-way door with no marked AC is a
blocking gap: ask the spec, rather than mutating everything or nothing.

## Human checks

**On a screen phase**, the look and its look list (`references/ui.md`) replace a manual
check. Backend and infrastructure ACs rely on the automated verifiers.

**Agent walk.** For other user-facing changes, such as CLI output, if the agent can start
the app it walks the user-facing paths before Finish and labels the result an author check,
never an independent one. A break with no AC
behind it is reported with a recommended `/forge fix`.

## Gaps

Every gap is a row in `state.md`'s `## Open findings`, either `gap-blocking` or
`gap-open`, so a resume can tell whether the phase can pass. A skipped check is recorded
as a gap, never reported as green. When the user decides a blocking gap, log it in
Decisions and change the row to `gap-open`.

| Gap | Disposition | Outcome |
|---|---|---|
| **SPEC-GAP** | `gap-blocking` | The AC stays open, spends no fix cycle, and blocks no unrelated finding. The phase cannot PASS until `/forge fix` resolves it. |
| **DESIGN-GAP** | `gap-open` | A recorded decision for the user. It does not block the phase unless the user acts, because the code works and the improvement needs new scope. Spends no cycle. |
| A one-way door with no marked AC | `gap-blocking` | Stop until the spec marks one. |
| Verifier 5 cannot run on a one-way door | `gap-blocking` | Stop until the user decides. |
| A configured type check cannot run | `gap-blocking` | Stop until the user decides. |
| Verifier 5 skipped on a two-way door, with no test seam | `gap-open` | Recorded, plus a lesson if non-obvious. |
| Any other check skipped or degraded | `gap-open` | Recorded. Never reported as passed. |

## Graceful degradation (never fake a gate)

- **No test framework:** verifier 1 degrades to running the affected code path
  directly (a smoke check) — typecheck is verifier 2's job. Verifier 4 cites that output,
  marking its rows `degraded`. Verifier 5 is skipped, per *Gaps*.
- **Missing static-analysis tool:** verifier 2 reports each sub-check independently. A
  tool the project has configured but that can't run is a gap, never passed; a tool with no
  analogue for the language is `N/A`.
- **No `WebFetch` / `WebSearch`:** the external-reference pass in `specify` degrades
  to codebase-only; design's "research unknowns" relies on docs already in the repo.
- **No subagents:** run each verifier inline, after a verbatim re-read of the changed files
  from disk, with no edits during the review. Report the tree comparison as `inoperative`,
  because one context gives a tree delta no boundary to straddle. Record those verifiers as
  run **inline**, never as independent.

## Verdict format

Each verifier returns a compact structured verdict:

```markdown
### Verifier N — <name>: PASS | FAIL | SKIPPED (reason) | SPEC-GAP (AC id)
<failures by file:line, or the coverage table, or "clean">
```

Verifier 4 may report FAIL and SPEC-GAP together, because a gap blocks no unrelated finding.

The execute phase combines these into one PASS/FAIL and a single gap list ranked by
severity: Blocker → Major → Minor → Cosmetic. A failure in verifier 1 or 2 is a Blocker. A
failure on a `[critical]` AC of a one-way-door change outranks the same failure anywhere
else.
