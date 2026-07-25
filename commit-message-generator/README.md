# commit-message-generator

Agent skill that generates Conventional Commit messages from the currently
staged changes. Works in any git repository — scopes are derived from the diff
each run, so there is no per-project setup.

## When to use

Invoke this skill when you want to:

- Turn a staged diff into a well-formed Conventional Commit message
- Get a consistent commit style across many repositories
- Draft a message you can review and edit before running `git commit`

## Requirements

- `git` on `PATH`
- `python3` (used by the diff analyzer script — no external packages)

## How it works

1. Runs `scripts/analyze-diff.py` against the staged diff — the sole source of
   truth for what changed (branch, files, status counts, suggested type,
   likely scopes).
2. Picks a type (`feat`, `fix`, `refactor`, `test`, `docs`, `chore`) from the
   diff signals.
3. Derives a scope from the top-level folders touched. Only asks the user when
   the diff spans genuinely ambiguous or unrelated areas.
4. Writes a subject line and — only when the diff is non-trivial — a 2–5 bullet
   body.
5. Adds a `Refs: KEY-123` footer if the branch name contains a ticket key
   matching `[A-Z]{2,}-\d+` (e.g. `feature/JIRA-1234-foo` → `Refs: JIRA-1234`).
6. For edge cases (breaking changes, reverts, merges, multi-scope diffs)
   consults `references/conventional-commits.md` instead of improvising.

The skill prints the message and waits for confirmation. Reply `yes` (also
`lgtm`, `ship it`, `commit`) to commit, reply with feedback (e.g. "shorter",
"change scope to auth", "drop the body") to revise, or reply `no` (also
`cancel`, `abort`) to stop. Nothing is committed without your explicit
go-ahead.

## Guarantees

- Never runs `git commit` without your confirmation.
- Never passes `--no-verify` — pre-commit hooks always run.
- Never amends an existing commit.
- Never stages files for you — you control what's in the diff.
- Never adds a `Co-Authored-By` trailer unless you ask.

## Special cases handled automatically

- **Lockfile-only diff** (`package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`,
  `Cargo.lock`, `poetry.lock`, `go.sum`) → `chore(deps): update lockfile`.
- **Rename-only diff** → `refactor` with the new name in the subject.
- **More than 3 distinct scopes or mixed change types** → the skill lists the
  scopes, suggests splitting into separate commits, and asks before proceeding
  with a single message.
- **Trivial diff** (one-line fix, single rename) → subject only, no body.

## Output

A single fenced code block containing the ready-to-use commit message:

```
<type>[(scope)]: <short imperative subject>

[optional body — 2–5 bullets when it earns its keep]

[optional footer(s), e.g. Refs: PROJ-482]
```

Example, from a diff on branch `feature/PROJ-482-token-refresh` touching
`src/auth/`:

```
feat(auth): refresh access tokens before expiry

- Add `TokenRefresher` that renews within 60s of expiry
- Wire refresher into the auth interceptor
- Fall back to re-login when refresh fails twice

Refs: PROJ-482
```

## Installation

Install to the current project:

```bash
npx skills add emiliosheinz/agent-skills --skill commit-message-generator
```

Install globally (available across all projects):

```bash
npx skills add emiliosheinz/agent-skills --skill commit-message-generator --global
```

See the [root README](../README.md) for installing all skills at once.

## Usage

Stage your changes, then invoke the skill:

```bash
git add <files>
# then, in your agent:
/commit-message-generator
```

The agent runs the analyzer, prints the proposed commit message, and asks
for confirmation. `yes` → it runs `git commit` for you. Feedback (e.g.
"shorter", "change scope to auth", "drop the body") → it revises and asks
again. `no` → it aborts and leaves your staged changes alone.
