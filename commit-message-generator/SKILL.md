---
name: commit-message-generator
description: >
  Generates Conventional Commit messages from staged changes in any git
  repository, and can auto-stage + group unstaged changes into a sequence of
  commits. Use when asked to write a commit message, generate a commit, draft
  a commit for staged changes, commit the current work, or when the user says
  "commit", "commit message", "commit for staged changes", or "conventional
  commit".
metadata:
  author: emiliosheinz
  version: 3.0.0
compatibility: >
  Works in any git repository. No project-specific setup, config, or scope
  list — scopes and groups are derived from the actual diff each time.
---

# Commit Message Generator

Turn the current git state into one or more well-formed Conventional Commit
messages and land them. Never guess
what changed — `scripts/analyze-diff.py` is the single source of truth.

## Hard rules

- **Always run `scripts/analyze-diff.py` first.** Never read the diff manually,
  never call `git diff` / `git status` / `git ls-files` yourself. The
  script's output is the only input you use to plan groups and write
  messages.
- **Staged wins.** If the script reports `State: staged`, work with the
  staged files only. Ignore unstaged / untracked files — the user staged
  what they meant to stage.
- **If the script exits non-zero** (nothing to commit), stop and tell the
  user.
- **Commit without asking.** Print the message, then commit. Never pass
  `--no-verify`, never amend, never `git push`.
- **Never add co-author trailers** unless the user explicitly asks.
- **Never `git add -A` / `git add .`.** Stage exactly the paths for the
  current group and nothing else.

## Process

### Step 1 — Inspect state

Run the analyzer:

```
python3 <skill-dir>/scripts/analyze-diff.py
```

Two possible states:

- `State: staged` → skip to **Step 3** (message generation for the staged
  diff).
- `State: unstaged` → continue with **Step 2** (propose groups).

### Step 2 — Propose commit groups (unstaged state only)

Read `Files` and propose 1–4 logical commit groups. Apply the heuristics
below. Then:

- **1 group** → stage all files with `git add -- <paths>` and go to
  **Step 3**. Show the user the single-group plan first only if there is
  visible ambiguity; otherwise stage silently and move on.
- **2+ groups** → print the plan, then iterate the groups in order (see
  **Sequential loop**). Do not wait for a reply.

  ```
  Committing 2 groups:
    [1] feat(api): <files...>
    [2] docs: README.md, CHANGELOG.md
  ```

- **More than 4 groups** → do not propose. Print the file list grouped by
  top-level folder and ask the user to narrow scope before rerunning.

### Step 3 — Generate the message

Re-run the analyzer if you just staged files, so scope/type signals reflect
what is actually staged now. Then:

1. **Pick the type** from `Suggested type`, overriding only when the diff
   clearly says otherwise:
   - `feat` — new user-visible capability
   - `fix` — bug fix
   - `refactor` — behavior-preserving code change
   - `test` — tests only
   - `docs` — documentation only
   - `chore` — tooling, deps, meta files

   Anything beyond this list (`perf`, `build`, `ci`, `style`, `revert`) or a
   breaking change → consult `references/conventional-commits.md`.

2. **Pick the scope** from `Likely scopes`:
   - 1 scope → use it as-is (lowercase, short noun).
   - 2 scopes touching one logical change → comma-separated
     (`fix(api,ui):`).
   - **>3 scopes** → do not force a scope. See *Gotchas* below.
   - Root-only files → omit scope.
   - Generic top-level folder (`src`, `lib`, `app`) → look one level deeper
     in the file list for a meaningful scope (e.g. `src/api/...` → `api`).

3. **Write the subject.** Imperative mood, ≤72 chars, no trailing period.
   "add", not "added" or "adds".

4. **Body — only if it earns its keep.** Trivial diff → omit. Otherwise 2–5
   bullets, one line each, facts only. Do not restate the subject.

5. **Footers.** Branch name matches `[A-Z]{2,}-\d+` → add `Refs: KEY-123`.
   Breaking / revert / closes → see the reference file.

### Step 4 — Commit

Print the message inside one fenced code block, then run `git commit -F -`
with the message on stdin. Report the resulting hash + subject on one line.

The user corrects a landed message the normal way, with their own
`git commit --amend`. This skill never amends.

### Step 5 — Sequential loop (multi-group runs only)

After each commit, print `[N/M] committed <hash> <subject>` and start the
next group at **Step 2 → staging** for that group. Re-run the analyzer
between groups. Stop when all groups are committed.

## Grouping heuristics

- One logical change spanning multiple folders (a shared type used in
  `api/` + `ui/`, a rename that spans both) → one group.
- Distinct top-level folders with clearly unrelated changes → separate
  groups.
- Test changes for a same-run feature → keep with the feature. Tests for
  pre-existing code → separate `test` group.
- **Lockfile-only files** (`package-lock.json`, `yarn.lock`,
  `pnpm-lock.yaml`, `Cargo.lock`, `poetry.lock`, `go.sum`) → their own
  `chore(deps): update lockfile` group.
- **Docs-only files** (README, `docs/`, `*.md`) → their own `docs` group,
  unless the docs ship *with* a feature in the same diff.
- **Config / meta files** (`.github/`, `.gitignore`, tooling configs) →
  their own `chore` group unless intertwined with a feature change.
- Cap: max 4 groups per run.

## Interrupted mid-run

If a commit fails or the run is interrupted between groups:

- Commits already made stay committed.
- The current group's staged files are left staged, so the run can be
  resumed. File contents on disk are never modified.
- Print a one-line summary: `Committed N of M groups; group K left staged.`

## Message format

```
<type>[(scope)]: <short imperative subject>

[optional body — 2–5 bullets, one line each]

[optional footer(s)]
```

Allowed types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`. Extend
only via the reference file.

## Gotchas

- **More than 3 distinct scopes in one group.** Do not force
  `chore(misc):` or silently drop the scope. Print the scope list and
  suggest re-grouping.
- **Mixed change types in one group** (a `feat` + unrelated `fix` +
  `docs`). Same treatment: name the mix, suggest re-grouping.
- **Rename-only diff** → `refactor` with the new name in the subject.
- **Breaking change, revert, merge, unfamiliar footer** → read
  `references/conventional-commits.md` and follow its rules. Do not
  improvise.

## Output

Single-group / already-staged run: one fenced code block with the message,
then one line with hash + subject.

Multi-group run: the group plan, then per-group message-commit cycles, with
a `[N/M] committed ...` line after each.

Nothing else. No essays, no explanations of what changed — the log and the
diff already say it.
