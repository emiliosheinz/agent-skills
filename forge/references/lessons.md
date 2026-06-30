# Lessons

A slug-local memory so the agent gets better at *this* change over time: the hacks, the
gotchas, the wrong assumptions corrected under fire. Stored at
`.specs/<slug>/lessons.md`. (Moving lessons to an outer scope — repo-wide or
skill-global — is a deliberate future step once the per-feature shape proves out. Keep
them slug-local for now.)

## When to load

At the start of `specify`, `design`, `execute`, and `fix` for the slug. Always read
`## Standing Rules` (small). Read `## Log` entries filtered to the area/tag relevant to
what you're about to do.

## When to write

At the end of `execute` (after verification) and at the end of `fix` — **only when
something non-obvious was learned**:

- a hack or workaround invented to get unblocked,
- a gotcha that cost real time (flaky test, hidden coupling, env quirk),
- a wrong assumption that the work corrected,
- a gate that couldn't run and why.

Routine success is not a lesson. Most runs write nothing. If you can't name what the next
agent should do differently, don't write an entry.

## Format

```markdown
# Lessons — <slug>

## Standing Rules
<!-- curated, short imperatives, always loaded. Cap ~15. -->
- This repo's test runner needs `--runInBand`; parallel runs flake. [testing]
- Auth tokens are minted in `auth/mint.ts`, not the middleware. [auth]

## Log
<!-- append-only, terse, tagged -->
- 2026-06-30 · [testing] mutation sensor couldn't run — no test seam for the CLI path;
  added an integration harness instead. Going forward: gate CLI changes on the harness.
```

Each Log entry: `date · [tag] · what went wrong · root cause · the rule going forward`.

## Bounding growth

- Cap the Log (by count or size). On overflow, **distill**: a pattern that recurs across
  Log entries becomes one Standing Rule; drop the raw entries it summarizes; merge
  duplicates.
- Standing Rules is itself capped (~15). When full, promoting a new rule means retiring a
  stale one.
- Tag entries so loads pull a relevant subset — context cost stays flat as the file
  grows.
