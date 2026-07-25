# commit-message-generator

Agent skill that generates Conventional Commit messages from the currently
staged changes. Works in any git repository — scopes are derived from the diff
each run, so there is no per-project setup.

## When to use

Invoke this skill when you want to:

- Turn a staged diff into a well-formed Conventional Commit message
- Get a consistent commit style across many repositories
- Draft a message you can review and edit before running `git commit`

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
5. Adds a `Refs: KEY-123` footer if the branch name contains a ticket key.
6. For edge cases (breaking changes, reverts, merges, multi-scope diffs)
   consults `references/conventional-commits.md` instead of improvising.

The skill prints the message and waits for confirmation. Reply `yes` to
commit, reply with feedback to revise, or reply `no` to abort. Nothing is
committed without your explicit go-ahead.

## Output

A single fenced code block containing the ready-to-use commit message:

```
<type>[(scope)]: <short imperative subject>

[optional body — 2–5 bullets when it earns its keep]

[optional footer(s), e.g. Refs: PROJ-482]
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
