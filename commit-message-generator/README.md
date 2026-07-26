# commit-message-generator

Agent skill that turns the current git state into one or more well-formed
Conventional Commit messages. Works in any git repository — scopes and
commit groups are derived from the diff each run, so there is no
per-project setup.

## When to use

Invoke this skill when you want to:

- Turn a staged diff into a well-formed Conventional Commit message.
- Let the agent auto-stage a messy working tree and split it into
  sensible commits, one at a time.
- Get a consistent commit style across many repositories.
- Draft a message you can review and edit before it runs `git commit`.

## Requirements

- `git` on `PATH`
- `python3` (used by the analyzer script — stdlib only, no packages)

## How it works

1. Runs `scripts/analyze-diff.py` — the sole source of truth for what's in
   the working tree. Reports one of two states:
   - `staged` — staged files exist. The agent uses only those.
   - `unstaged` — nothing staged; unstaged tracked changes and/or
     untracked files exist. The agent proposes commit groups.
2. **Staged path:** picks a type (`feat`, `fix`, `refactor`, `test`,
   `docs`, `chore`), derives a scope from the top-level folders touched,
   writes a subject and — only when the diff is non-trivial — a 2–5
   bullet body.
3. **Unstaged path:** proposes 1–4 logical commit groups from the file
   list. On your confirmation, iterates the groups sequentially:
   `git add -- <paths>` → generate message → confirm → commit → next
   group.
4. Adds a `Refs: KEY-123` footer if the branch name contains a ticket key
   matching `[A-Z]{2,}-\d+` (e.g. `feature/JIRA-1234-foo` →
   `Refs: JIRA-1234`).
5. For edge cases (breaking changes, reverts, merges, multi-scope diffs)
   consults `references/conventional-commits.md` instead of improvising.

Every commit requires an explicit confirmation. Reply `yes` (also `lgtm`,
`ship it`, `commit`) to commit, reply with feedback (e.g. "shorter",
"change scope to auth", "drop the body") to revise, or reply `no` (also
`cancel`, `abort`) to stop. On cancel mid-run, already-confirmed commits
stay; the current group is unstaged; remaining groups are skipped.

## Guarantees

- Never runs `git commit` without your confirmation.
- Never runs `git push`.
- Never passes `--no-verify` — pre-commit hooks always run.
- Never amends an existing commit.
- Never uses `git add -A` / `git add .` — only the exact paths for the
  current group.
- Never touches staged files when the skill starts with a staged state.
- Never modifies file contents on disk — cancels only unstage.
- Never adds a `Co-Authored-By` trailer unless you ask.

## Special cases handled automatically

- **Lockfile files** (`package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`,
  `Cargo.lock`, `poetry.lock`, `go.sum`) → their own
  `chore(deps): update lockfile` group.
- **Docs-only files** (`README`, `docs/`, `*.md`) → their own `docs`
  group, unless shipped alongside a feature in the same run.
- **Config / meta files** (`.github/`, `.gitignore`, tooling configs) →
  their own `chore` group unless intertwined with feature code.
- **Rename-only diff** → `refactor` with the new name in the subject.
- **More than 4 groups** — the skill declines to auto-split; it prints the
  file list grouped by top-level folder and asks you to narrow scope.
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

In a multi-group run, each group is confirmed and committed in turn, with
`[N/M] committed <hash> <subject>` printed after each.

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

You do not need to stage anything first. Invoke the skill from your
agent:

```
/commit-message-generator
```

- If files are already staged, the skill works with them exactly as
  before: proposes a message, confirms, commits.
- If nothing is staged, the skill inspects tracked changes + untracked
  files, proposes commit groups, confirms the plan with you, then
  stages + confirms + commits each group in sequence.

Prefer to stage manually? Do it — the skill will respect your staged
selection and skip the grouping step.
