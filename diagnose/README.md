# diagnose

A Claude Code skill that finds the root cause of a bug through a structured loop: adaptive intake, a fast feedback loop, reproduction, falsifiable hypotheses, and a saved fix proposal. The skill diagnoses — it never implements the fix.

## When to use

Invoke this skill when you want to:

- Debug an unexpected error, exception, or crash
- Investigate a failing test or broken behavior
- Diagnose an intermittent or hard-to-reproduce issue
- Produce a documented bug report with a confirmed root cause and concrete fix proposal

## How it works

1. **Intake** — adaptive interview (one question at a time, walk-the-tree) until there is enough to attempt reproduction. No fixed question list.
2. **Build a feedback loop** — the heart of the skill. A fast, deterministic, pass/fail signal for the bug. Strategies are tried in order, starting with a failing test in the project's existing framework, then HTTP scripts, headless browser, trace replay, throwaway harness, fuzz, bisection, differential loops. The loop is iterated on for speed, determinism, and signal sharpness.
3. **Reproduce** — run the loop and confirm the failure matches what the user described.
4. **Hypothesize** — produce 3–5 ranked, falsifiable hypotheses, each stating a prediction.
5. **Verify** — work hypotheses from highest to lowest confidence with targeted probes. Refuted hypotheses feed back into Phase 4; exhausted hypotheses feed back into Phase 2. Loops until confirmation or genuine exhaustion.
6. **Propose and save** — write the bug report to `.specs/bugs/[bug-name].md` and route the user to `/implement` for the fix.

When the bug cannot be reproduced or no hypothesis confirms after exhausting strategies, the skill stops, writes a `blocked` report listing every attempt and what would unblock it, and surfaces concrete next steps.

## Output

A Markdown file at `.specs/bugs/[bug-name].md` in one of two shapes:

**Confirmed root cause** — root cause with file:line evidence, reproduction command, hypotheses tested, numbered fix proposal for `/implement` to execute, regression test plan, optional prevention measures.

**Blocked** — what was tried, why each attempt failed, hypotheses considered, what would unblock the investigation, suggested next steps.

## Usage

```
/diagnose
```

Claude will begin the adaptive intake immediately. Provide whatever you know — exact error messages, stack traces, reproduction steps, what changed recently. "Unknown" is a valid answer for anything you genuinely don't know.
