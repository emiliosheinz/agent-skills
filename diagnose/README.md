# diagnose

A Claude Code skill that root-causes complex bugs through a structured loop: adaptive intake, a fast feedback loop, reproduction, falsifiable hypotheses probed by parallel subagents, and adversarial confirmation of the cause — ending in a saved fix proposal. The skill diagnoses; it never implements the fix.

## When to use

Reach for `/diagnose` when the cause is unknown and the bug is hard — intermittent, subtle, cross-system, or it already survived a wrong fix. It goes deeper than a quick fix and stops at a reviewed proposal.

- Debug an unexpected error, exception, or crash
- Investigate a failing or flaky test, a regression, or broken behavior
- Root-cause an intermittent or hard-to-reproduce issue
- Produce a documented report with a confirmed root cause and concrete fix proposal

For a bug you already understand and just want to fix, skip the ceremony and fix it directly — this skill is for the ones that resist that.

## How it works

1. **Intake** — adaptive interview (one question at a time, walk-the-tree, codebase-first) until there's enough to attempt reproduction. No fixed question list.
2. **Build a feedback loop** — the heart of the skill: a fast, deterministic, pass/fail signal for the bug. Strategies are tried in order (failing test first, then HTTP script, headless browser, trace replay, throwaway harness, fuzz, bisection, differential loop), scouted in parallel when the reachable seam is unclear, then sharpened for speed, determinism, and signal.
3. **Reproduce** — run the loop and confirm the failure matches what the user described.
4. **Hypothesize** — 3–5 ranked, falsifiable hypotheses, each stating a prediction, before testing any.
5. **Verify** — probe every hypothesis with independent subagents in parallel, then hand the winning cause to a fresh subagent that tries to *refute* it. A cause is confirmed only when refutation fails; refuted hypotheses and dry hypothesis wells loop back to Phase 4 or Phase 2.
6. **Report and save** — write the report to `./.specs/bugs/<bug-name>.md` (at the session CWD), summarizing the root cause and the proposed fix for the user to review and apply.

When the bug can't be reproduced or no cause survives, the skill stops and writes a `blocked` report listing every attempt, every hypothesis considered, and what would unblock it.

## Output

A Markdown file at `./.specs/bugs/<bug-name>.md` (from `templates/report.md`) at the session CWD, in one of two shapes:

**Confirmed** — root cause with file:line evidence, the reproduction loop, hypotheses tested, how the cause survived refutation, a numbered fix proposal to execute, a regression test plan, and optional prevention.

**Blocked** — what was tried, why each attempt failed, hypotheses considered, and what would unblock the investigation.

## Structure

```text
diagnose/
  SKILL.md              the diagnosis loop and subagent contract
  templates/report.md   confirmed + blocked report variants
```

## Installation

Install to the current project:

```bash
npx skills add emiliosheinz/agent-skills --skill diagnose
```

Install globally (available across all projects):

```bash
npx skills add emiliosheinz/agent-skills --skill diagnose --global
```

See the [root README](../README.md) for installing all skills at once.

## Usage

```
/diagnose
```

Claude begins the adaptive intake immediately. Provide whatever you know — exact error messages, stack traces, reproduction steps, what changed recently. "Unknown" is a valid answer for anything you genuinely don't know.
