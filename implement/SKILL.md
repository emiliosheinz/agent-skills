---
name: implement
description: >
  Executes implementation by consuming existing PRD, technical design, and
  implementation plan artifacts, or a bug report produced by `/diagnose`. Use
  when asked to implement a feature, build something, start implementing,
  write the code, execute an existing plan, or apply a fix from a bug report.
---

# Implementation Executor

You execute implementation tasks by translating existing requirements (PRD), technical design, and implementation plan into working, tested code. You follow strict Test-Driven Development and deliver work in small, incremental slices.

## Routing

- Define requirements → `/create-prd`
- Design architecture → `/create-technical-design`
- Plan phases and tasks → `/create-implementation-plan`
- Diagnose a bug before fixing → `/diagnose`

## Core Principle: Small Vertical Slices with TDD

Every unit of work follows **Red-Green-Refactor**:

1. **Red** -- Write one failing test for the smallest meaningful behavior
2. **Green** -- Write the minimum code to make the test pass
3. **Refactor** -- Improve code structure while keeping all tests green

Each slice delivers a thin but complete piece of functionality that can be verified independently. Never implement multiple behaviors before writing tests. Never write tests after the implementation.

## Staying Lean

Implementation generates a lot of context: artifact contents, test output, code diffs, lint results. Be intentional about what you hold onto.

- **Read selectively.** You rarely need the full PRD and technical design at once. Start with the implementation plan to identify the target phase, then pull in only the requirements and design sections that phase touches.
- **Extract, then let go.** Once you have pulled out the facts you need from an artifact (requirement IDs, API contracts, constraints), you do not need the raw document anymore. Re-read a specific section later if something comes up.
- **Shed finished work.** After a task's TDD cycle is green, the test output and code diff have served their purpose. Move on. Re-read a file only when the next task needs to reference it.
- **Delegate heavy lifting.** When a chunk of work is self-contained (running the full test suite, verifying requirements against the PRD, a single Red-Green-Refactor cycle), consider handing it to a sub-agent so the output stays out of your context. Give sub-agents specific inputs: file paths, section references, constraints -- not open-ended instructions.

These are guidelines, not rules. Use your judgment about what to hold, what to shed, and when delegation is worth the overhead.

## Modes

This skill runs in one of two modes. Detect the mode from the user's request and the artifact path.

- **Feature mode** (default): the source artifacts are a PRD, technical design, and/or implementation plan under `.specs/[feature-slug]/`. Runs the full Process below as written.
- **Bug-fix mode**: the source artifact is a bug report at `.specs/bugs/[bug-name].md` produced by `/diagnose`. Triggered when the user references a path under `.specs/bugs/`, says "fix the bug," "apply the fix," "implement the diagnose report," or similar. The Process applies with the deltas in **Bug-Fix Mode Deltas** below.

If the request is ambiguous (could be either a fresh feature or a bug fix), ask the user using `AskUserQuestion`.

## Bug-Fix Mode Deltas

When in bug-fix mode, the Process below applies with these differences:

- **Step 1 — Context.** Read `.specs/bugs/[bug-name].md` instead of the feature artifacts. Extract: **Root Cause** (with file:line evidence), **Reproduction** (the loop and command that proves the bug), **Fix Proposal** (numbered steps to apply), **Regression Test** (the test that locks the fix in).
  - If the report's status is `blocked`, stop. The report has no confirmed root cause — tell the user to re-run `/diagnose` with more context rather than implementing a guess.
  - If the report's status is already `resolved` or recent commits indicate the fix has landed, stop and tell the user.
  - There is no phase selection. The bug report is a single unit of work. Skip `IMPLEMENTATION-STATE.md` entirely.
- **Step 2 — Execute.** The Red step writes the **Regression Test** from the report and confirms it fails with the symptom the report describes — wrong symptom means wrong test. The Green step applies the **Fix Proposal** steps in order. Refactor as normal.
- **Step 3 — Validate.** Replace **Check 3 — Requirement tracing** with **Check 3 — Bug verification**: re-run the original reproduction loop from the report and confirm it now passes; confirm the regression test is committed and green. Checks 1, 2, and 4 are unchanged.
- **Step 4 — Commit.** Update the bug report: change `Status: confirmed` to `Status: resolved` and append a `**Resolved:** YYYY-MM-DD — <commit-sha>` line. Use a `fix:` commit type and reference the bug name in the message.

**If artifacts are missing**, do not stop. Instead, perform a quick research phase to derive what you need:

- **Scan the codebase**: identify existing patterns, conventions, test setup, and relevant entry points
- **Derive scope**: from the user's task description and any code or partial artifacts that exist
- **Derive architecture**: from how the existing codebase is structured — frameworks in use, data flow, naming conventions
- **Derive constraints**: from existing tests, linter config, and code patterns
- **Derive acceptance criteria**: from the task description; make them explicit before proceeding

The research phase must be quick and focused — read only what is relevant to the task at hand. Do not do a broad codebase survey.

**IMPLEMENTATION-STATE.md**: This file tracks which phases and tasks have been completed. If it does not exist, create it at `.specs/[feature-slug]/IMPLEMENTATION-STATE.md` by deriving its initial state from the implementation plan (all tasks `pending`). Format:

```markdown
# Implementation State: [feature-slug]

## Phase 1 -- [Phase Title]
- [ ] Task 1: [description]
- [ ] Task 2: [description]

## Phase 2 -- [Phase Title]
- [ ] Task 1: [description]
```

Use `- [x]` for completed tasks. Mark a fully completed phase by adding `**Status: completed**` below its heading.

**Phase selection**: Always implement exactly one phase per invocation. Read `IMPLEMENTATION-STATE.md` and select the first phase that does not have `**Status: completed**`. If the user explicitly names a different phase, use that instead — but still implement only that one phase. Do not continue into subsequent phases after the selected phase is complete.

After reading artifacts (or completing the research phase), extract:

- **Scope**: What needs to be built for this task
- **Architecture**: What technical approach applies
- **Constraints**: Hard limits from artifacts or codebase patterns
- **Acceptance criteria**: How to verify the work is correct
- **Phase**: Which phase from the implementation plan to implement (if a plan exists)

If the task scope is ambiguous (e.g., "implement the feature" when the implementation plan has multiple phases and `IMPLEMENTATION-STATE.md` does not identify a clear next phase), ask the user to clarify.

### Step 2 -- Execute (Red-Green-Refactor)

For each task, follow this cycle strictly:

#### 2a. Red

- Write one test that captures the expected behavior for this task
- Run the test suite and confirm the new test fails
- If the test passes immediately, the behavior already exists -- skip to the next task

**Important**: Run the tests. Do not assume the result. The Red step is only complete when you have observed the failure.

#### 2b. Green

- Write the minimum code necessary to make the failing test pass
- Run the full test suite (not just the new test)
- If any test fails, fix the implementation before proceeding
- Do not add code beyond what the test requires

#### 2c. Refactor

- With all tests green, look for improvements:
  - Remove duplication introduced by the new code
  - Improve naming if the intent is unclear
  - Simplify structure if complexity crept in
- Run the full test suite after each refactor change
- If any test breaks during refactor, revert the refactor change and try a different approach

#### 2d. Move to Next Task

After completing one task, mark it as `- [x]` in `IMPLEMENTATION-STATE.md`, briefly state what was done, and move to the next. If you encounter unknowns or ambiguities, note them and continue — surface them all at the end in Step 4.

### Step 3 -- Review and Validate

After all tasks are complete, delegate the full review to a **specialized review subagent** with a fresh context. This ensures the validation is performed with an unbiased perspective, independent from the implementation context.

Provide the subagent with all relevant artifacts (PRD, technical design, implementation plan, and codebase access) and instruct it to perform the following checks, returning a structured verdict:

**Check 1 — Test suite** (automated)
Run the full test suite. All tests must pass. Report any failures with the test name, failure message, and file location.

**Check 2 — Lint and format** (automated)
Run whatever linters and formatters are configured in the project (Prettier, ESLint, Biome, etc.). Report any unfixed issues with file and line number.

**Check 3 — Requirement tracing** (spec-driven)
If a PRD exists at `.specs/[feature-slug]/PRODUCT-REQUIREMENTS.md`:
- Extract every requirement ID (e.g. `ONBD-01`, `PAY-03`)
- For each requirement ID, identify the test(s) or code that satisfies it
- Produce a traceability table:

  | Requirement ID | Priority | Description | Status | Evidence (test or file:line) |
  |----------------|----------|-------------|--------|------------------------------|
  | [ID] | P0/P1/P2 | [summary] | Pass / Fail / Not covered | [test name or file:line] |

- A requirement is **Pass** if there is at least one test that explicitly verifies it and that test passes
- A requirement is **Not covered** if no test references it — treat this as a failure
- A requirement is **Fail** if a test exists but fails

If no PRD exists, verify against the acceptance criteria derived in Step 1 using the same table structure.

**Check 4 — Architecture compliance** (design-driven)
Confirm the implementation follows the architectural decisions and code patterns. Use the technical design if one exists; otherwise verify consistency with the existing codebase patterns derived in Step 1.

Checks 1 and 2 are independent and should be run in parallel. Checks 3 and 4 are independent and should be run in parallel.

The subagent must return a structured verdict in this format:

```
## Validation Verdict

### Check 1 — Test Suite: [PASS / FAIL]
[Failures listed by test name and file:line, or "All tests pass."]

### Check 2 — Lint / Format: [PASS / FAIL]
[Issues listed by file:line, or "No issues."]

### Check 3 — Requirement Tracing: [PASS / FAIL]
[Full traceability table]
[Summary: N/N requirements covered, N failing]

### Check 4 — Architecture Compliance: [PASS / FAIL]
[Findings listed, or "No violations found."]

### Overall: [PASS / FAIL]
```

**If any check fails**, do not proceed to Step 4. Instead:

1. Collect all failures into a delta list — the specific requirement IDs, test failures, lint issues, or architecture violations that did not pass
2. Update `IMPLEMENTATION-STATE.md`: add a `**Validation failures:**` note under the current phase listing each failing item
3. Return to Step 2 and address **only** the failing items — do not re-implement passing items
4. After fixing, re-run Step 3 with a new subagent invocation
5. Repeat until the verdict is `Overall: PASS`

### Step 4 -- Summarize and Commit

Mark the completed phase as `**Status: completed**` in `IMPLEMENTATION-STATE.md`.

Briefly summarize what was implemented. Include any decisions made that were not covered by the artifacts and any unknowns or ambiguities encountered during execution.

Commit automatically using the project's conventions:

```
[type]: [concise description]

[Body briefly explaining what changed and why]
```

## When to Stop and Ask

Stop mid-execution only when proceeding is impossible without an answer:

- **Ambiguous scope**: The task could reasonably be interpreted multiple ways and both paths produce materially different code
- **Missing dependency**: A package, service, or tool needed for implementation is not available and cannot be substituted
- **Blocking conflict**: Existing code makes the planned approach entirely unworkable

For everything else — design gaps, minor ambiguities, non-blocking questions — note the unknown and continue. Surface all collected unknowns in Step 4.

## Common Mistakes

**Implementing without establishing context first.**
Always read available artifacts (PRD, technical design, implementation plan) before writing code. If no artifacts exist, do a quick research phase to understand the codebase. Do not rely solely on the user's verbal description — read the code.

**Writing tests after the implementation.**
This is not TDD. Always write the test first, confirm it fails, then implement. Tests written after the fact tend to test the implementation rather than the behavior.

**Bundling multiple behaviors into one task.**
Wrong: "Implement user registration with validation, email confirmation, and profile creation."
Right: Three separate tasks -- one for registration, one for validation, one for email confirmation.

**Refactoring while tests are red.**
Never refactor when a test is failing. Get to Green first, then refactor.

**Waiting to commit.**
This skill commits automatically after verification passes. Do not ask for approval before committing.

**Over-implementing beyond what the test demands.**
In the Green step, write only the code the failing test requires. Anticipatory code without a corresponding test leads to untested paths and unnecessary complexity.

**Implementing multiple phases in one go.**
Always implement one phase at a time. Do not continue to the subsequent phases.
