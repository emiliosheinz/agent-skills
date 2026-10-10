# Evidence

Proof that the change does what the description claims. A reviewer who can *see* the
result spends their minute on judgement instead of reconstruction.

**The rule:** every change with an observable surface ships proof of it, or ships an
explicit note that the proof is missing. Never a claim with neither.

## 1. Does the change have an observable surface?

Read the diff and classify. A change can land in more than one row.

| Surface | Signals in the diff | Evidence that counts |
|---|---|---|
| **UI** | component files, templates, styles, routes, anything rendering | **before/after screenshots** — required |
| **CLI** | command definitions, flag parsing, output formatting | before/after terminal output |
| **API** | route handlers, schemas, serializers | request/response pair, or the contract diff |
| **Behavior** | logic, conditionals, calculations | the test that now fails on the old code and passes on the new |
| **Performance** | queries, loops, caching, indexes | a measured number, before and after |
| **Internal only** | types, pure refactor, build config, docs | the green check is the evidence; add nothing |

Internal-only changes need no evidence section. Do not invent one.

## 2. Screenshots for UI changes

A UI change without a before/after pair is not reviewable — a reviewer cannot tell
whether it looks right from a diff of class names.

### Capture

Use whatever browser tooling this runtime exposes, in this order:

1. **Playwright** (MCP tools or an installed project harness) — drive the real route,
   capture at a realistic viewport. Capture mobile too when the change touches
   responsive behavior.
2. **Browser extension integration** — drive the already-signed-in browser when the
   route needs a real session.
3. **A project script** — a visual-regression or storybook snapshot command the repo
   already has (`npm run test:visual`, `storybook`), if one exists.

Hit the real screen the change affects, not a placeholder. Set up whatever state the
screen needs (a seeded record, a signed-in user) using the project's own fixtures.

### The "before" problem

"After" is the current branch — easy. "Before" needs the base branch running, and that
is the step that usually fails. In order of preference:

1. **The user already has them.** Ask once, up front, before building anything: if they
   captured before/after while developing, use those.
2. **A second worktree on the base branch** — check the base out beside the current one,
   run the dev server there, capture the same route. Correct, and costs one install.
3. **After-only, flagged.** Capture the after shot and write, verbatim:
   `Before: not captured — base branch not runnable here.` Then stop trying.

**Never** reconstruct a "before" by reverting files in the working tree, and never
present an after shot as a pair. A wrong before is worse than a missing one.

### No tooling, or capture fails

Flag it and continue — this never blocks the PR:

```text
Evidence: UI change, screenshots not captured (no browser tooling available).
```

Then list the exact routes or screens a human should shoot. The PR is a draft; the human
finishes it.

### Getting them into the PR

GitHub accepts image uploads only through the web UI — `gh` cannot attach them. So:

- Save captures outside the repo, in `$TMPDIR` (fall back to `/tmp`), named
  `<branch>-<screen>-before.png` / `-after.png`.
- Put a visible placeholder in the body where they belong:

  ```markdown
  ### Before / After
  <!-- drop the two images here -->
  - before: /tmp/fix-token-refresh-login-before.png
  - after:  /tmp/fix-token-refresh-login-after.png
  ```

- After creating the PR, report the paths and open it with `gh pr view --web` so the
  user drags them in.

Never commit screenshots to the repo to work around this.

## 3. Non-UI evidence

Keep it to the shortest form that proves the point.

**Behavior** — name the test and what it asserts, not the whole run:

```text
src/auth/refresh.test.ts — 4 new cases; the second-401 path fails on main.
```

**CLI** — the before/after output, trimmed to the lines that differ.

**Performance** — a number with its method. `cold start 1.4s → 0.9s (n=10, median)`.
A measurement with no method is an adjective; see `voice.md`.

**When `forge` ran**, `./.specs/<slug>/state.md` already holds a Verification evidence
table (`AC ID → file:line → expected value`). Condense it to one line per AC; do not
paste the table.

## 4. Honesty

- A check you did not run is not evidence. Run it or omit the claim.
- A skipped check is written as skipped, never as passing.
- "Tested manually" with nothing behind it is noise — either say what you did and what
  you saw, or leave it out.
