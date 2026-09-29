# Lessons

A per-change memory so the agent gets better at *this* change over time: hacks,
gotchas, and corrected wrong assumptions. Stored at `./.specs/<slug>/lessons.md`.

> Moving lessons to a wider scope — repo-wide or skill-global — is a future step once
> the per-change pattern proves itself. Keep them per-change for now.

## When to load

At the start of every phase (`specify`, `design`, `plan`, `execute`, and `fix`) for the
slug. Always read `## Standing Rules` (small). Read `## Log` entries filtered to the
area or tag relevant to the work — the verb name (`testing`, `auth`) or any tag
matching files in the current task is a good filter.

## When to write

At the end of `execute` (after verification), and at the end of a `fix` that corrected a
wrong assumption or exposed a hidden coupling. Other phases consume lessons; they do not
produce them. **Write only when something non-obvious was learned:**

- a hack or workaround invented to get unblocked,
- a gotcha that cost real time (flaky test, hidden coupling, env quirk),
- a wrong assumption that the work corrected,
- a gate that couldn't run and why.

Routine success is not a lesson. Most runs write nothing. If you can't name what the
next agent should do differently, don't write an entry.

**Capture only code/execution lessons about this repo.** Do not record opinions about
the forge process itself ("specify earlier", "split phases differently"). That is
meta-commentary, not a repo lesson, and it pollutes filtered loads.

### Grounding gate (required)

Every entry must cite a concrete **source**: an AC ID, a test, a `file:line`, a
surviving mutant, or a failed gate. **An entry with no source is an opinion, not a
lesson — do not record it.**

### Signal taxonomy — what to walk

After verification, walk each failing or raised verifier output and emit **at most one
lesson per signal**, or note in one line why it is out of scope:

| Signal | Lesson-worthy when |
|--------|--------------------|
| spec-coverage zero / missing evidence | a recurring kind of AC keeps going uncovered |
| surviving mutant | the test seam can't discriminate a class of bug |
| architecture violation | a pattern the design forbids keeps reappearing |
| lint / test failure | a non-obvious project rule or flake bit you |
| exhausted 3-strike fix loop | the gap had a root cause worth recording |
| spec-deviation noticed during execute | the spec was wrong or ambiguous (also raise SPEC-GAP) |

## Format

```markdown
# Lessons — <slug>

## Standing Rules
<!-- Curated, short imperatives, always loaded. Cap ~15. -->
- This repo's test runner needs `--runInBand`; parallel runs flake. [testing]
- Auth tokens are minted in `auth/mint.ts`, not the middleware. [auth]

## Log
<!-- Append-only, terse, tagged: date · [tag] · source · what went wrong · root cause · rule -->
- 2026-06-30 · [testing] · src/cli/run.test.ts (no seam) · mutation sensor couldn't run —
  no test seam for the CLI path; added an integration harness instead. Rule: gate CLI
  changes on the harness.

## Retired
<!-- Standing Rules struck after they proved wrong; never loaded. -->
- ~~Always mock the clock in unit tests~~ (2026-06-30 — caused frozen-time bugs to pass)
```

Each Log entry: `date · [tag] · source(AC-id|test|file:line|mutant|gate) · what went
wrong · root cause · the rule going forward`.

## Bounding growth

- Cap the Log (by count or size). On overflow, **distill**: a pattern that recurs
  across Log entries becomes one Standing Rule. Drop the raw entries it summarizes.
  Merge duplicates.
- Standing Rules is itself capped (~15). When full, promoting a new rule means retiring
  a stale one.
- **Demote rules that prove wrong.** When a Standing Rule appears to cause or coincide
  with a later failure, strike it (`~~rule~~ (date, reason)`) and move it to
  `## Retired` on the first credible observation. Retired rules are never loaded — a
  wrong rule silently degrades every phase that reads it.
- Tag entries so loads pull a relevant subset. Context cost stays flat as the file
  grows.
