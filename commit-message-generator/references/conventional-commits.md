# Conventional Commits — Reference

On-demand reference for edge cases. Do not load unless the diff calls for one
of these: breaking changes, reverts, merges, multi-scope diffs, or unusual
footer conventions. Basic commits should be written directly from `SKILL.md`.

## Full format

```
<type>[optional scope][!]: <short imperative subject>

[optional body — what and why, wrapped at ~72 cols]

[optional footer(s) — one per line]
```

Rules:

- **Type** — one of `feat`, `fix`, `refactor`, `test`, `docs`, `chore`. Extend
  only if the project already uses a broader list (e.g. `perf`, `build`, `ci`,
  `style`).
- **Scope** — noun in parentheses naming the area of the codebase touched
  (`feat(api):`). Optional. Comma-separated for a small number of related
  scopes (`fix(api,ui):`). Prefer splitting the commit if the list would
  exceed 2–3 scopes.
- **Subject** — imperative mood, no trailing period, ≤72 chars (50 is a good
  ceiling). "add", not "added" or "adds".
- **Body** — separated from the subject by a blank line. State facts about
  what changed and why. Do not restate the subject.
- **Footer** — separated from the body by a blank line. `Token: value` per
  line. Reserved tokens include `BREAKING CHANGE`, `Refs`, `Closes`,
  `Reviewed-by`.

## Breaking changes

Two ways to signal a breaking change. Use both when it is a public API break:

1. Append `!` after the type/scope: `feat(api)!: drop support for Node 16`
2. Add a `BREAKING CHANGE:` footer describing the break and the migration.

Example:

```
feat(api)!: return ISO strings from /events endpoint

Timestamps now serialize as ISO 8601 strings instead of Unix epoch integers.
Clients decoding the previous integer format will break.

BREAKING CHANGE: /events response field `timestamp` changed from integer
(epoch seconds) to string (ISO 8601). Update clients to parse ISO strings.
```

## Reverts

Use type `revert` and a footer naming the reverted commit hash.

```
revert: feat(api): add pagination to /events endpoint

This reverts commit 3a1c5f2e.

The change caused latency regressions on the events dashboard. Reverting
while we investigate.
```

The subject after `revert:` should echo the subject of the commit being
reverted, so the log stays readable.

## Merges

Prefer letting `git merge` write its default merge message
(`Merge branch 'feature/x' into main`). Do not force-fit merge commits into
Conventional Commits — they describe a merge event, not a code change.

If the project explicitly requires Conventional Commits on merges, use type
`chore` with scope `merge`:

```
chore(merge): merge feature/pagination into main
```

## Multi-scope commits

Comma-separated scopes are allowed for genuinely related changes across a
small number of areas:

```
fix(api,ui): normalize date format across event pipeline
```

Rules of thumb:

- 1 scope: normal case.
- 2–3 scopes: acceptable when the change is one logical unit that touches
  each area (a shared type used in api + ui, a rename that spans both).
- 4+ scopes: split the commit. A commit that touches four scopes is almost
  always four commits pretending to be one, and reverting or bisecting it
  later is painful.

## Worked examples

### feat with body

```
feat(auth): add refresh-token rotation

- Issue new refresh token on every /auth/refresh call
- Invalidate the prior refresh token in Redis
- Log rotation events for audit trail
```

### fix with issue footer

```
fix(api): reject empty tag arrays on /events POST

Empty tag arrays passed validation and produced malformed rows downstream.
Reject with 400 before insertion.

Refs: PROJ-482
Closes: #1093
```

### refactor with no body (trivial)

```
refactor(db): rename `getUser` to `findUserById`
```

### docs

```
docs(readme): document PORT and DATABASE_URL environment variables
```

### test-only

```
test(api): cover pagination edge cases for /events endpoint

- Empty result set returns page metadata
- Cursor beyond last page returns 200 with empty items
- Invalid cursor returns 400
```

### chore with breaking change

```
chore(deps)!: upgrade express from 4 to 5

BREAKING CHANGE: Express 5 removes the callback signature for res.send.
Route handlers using the callback form must be migrated to the promise form.
```

## Anti-patterns

- **Subject as a sentence, not an imperative** — "adds pagination" or
  "added pagination" instead of "add pagination".
- **Restating the subject in the body** — the body should add information,
  not paraphrase the subject.
- **Vague scope** — `chore(misc):`, `fix(stuff):`, `feat(update):`. If the
  scope does not name a real part of the codebase, omit it.
- **Rationale essays** — bodies longer than the diff are usually smuggling
  design discussion into the log. Move it to the PR description or an ADR.
- **`BREAKING CHANGE` without a migration hint** — a footer that only says
  "this is breaking" wastes a footer. Say what to change.
