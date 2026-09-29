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
  version: 2.0.0
compatibility: >
  Works in any git repository. No project-specific setup, config, or scope
  list — scopes and groups are derived from the actual diff each time.
---

# Commit Message Generator

Turn the current git state into one or more well-formed Conventional Commit
messages, each confirmed by the user before the commit lands. Never guess
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
- **Never commit without explicit user confirmation.** Print the message,
  wait for a yes/edit/no response, then act. Never pass `--no-verify`,
  never amend, never `git push`.
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
- **2+ groups** → print a numbered proposal like:

  ```
  Proposed 2 commits:
    [1] feat(api): <files...>
    [2] docs: README.md, CHANGELOG.md
  Confirm? (yes / edit / merge / cancel)
  ```

  Responses:
  - `yes` / `lgtm` → iterate groups in order (see **Sequential loop**).
  - `edit` (or free-form feedback like "move X to group 2", "split group 1")
    → revise the proposal, re-print, re-prompt.
  - `merge` → treat everything as one group; stage all, go to **Step 3**.
  - `cancel` / `no` → stop. Do not stage anything.

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

### Step 4 — Confirmation loop

Print the message inside one fenced code block and ask
`Commit this? (yes / edit / no)`.

- `yes` / `lgtm` / `ship it` / `commit` → run `git commit -F -` with the
  message on stdin. Report the resulting hash + subject on one line.
- Feedback (any edit, reword, scope change, "shorter", etc.) → revise and
  loop back to the start of this step. Do not commit until confirmed.
- `no` / `cancel` / `abort` → **cancel semantics** (below).

### Step 5 — Sequential loop (multi-group runs only)

After each commit, print `[N/M] committed <hash> <subject>` and start the
next group at **Step 2 → staging** for that group. Re-run the analyzer
between groups. Stop when all groups are committed or the user cancels.

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

## Cancel semantics

If the user cancels a message confirmation mid-run:

- Commits already made in this run stay committed — they were confirmed.
- The current group's staged files are unstaged with
  `git reset HEAD -- <paths>`. File contents on disk are never modified.
- Remaining groups are not started.
- Print a one-line summary: `Committed N of M groups; group K unstaged and
  skipped.`

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
one confirmation line. On confirmation, one line with hash + subject.

Multi-group run: the numbered group proposal, then per-group
message-confirmation-commit cycles, with a `[N/M] committed ...` line after
each. On cancel, the one-line summary described in *Cancel semantics*.

Nothing else. No essays, no explanations of what changed — the log and the
diff already say it.
