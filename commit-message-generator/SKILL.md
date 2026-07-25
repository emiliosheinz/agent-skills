---
name: commit-message-generator
description: >
  Generates Conventional Commit messages from staged changes in any git repository.
  Use when asked to write a commit message, generate a commit, draft a commit for
  staged changes, or when the user says "commit", "commit message", "commit for staged
  changes", or "conventional commit".
metadata:
  author: emiliosheinz
  version: 1.0.0
compatibility: >
  Works in any git repository. No project-specific setup, config, or scope list —
  scopes are derived from the actual staged diff each time.
---

# Commit Message Generator

Generate a Conventional Commit message for the currently staged changes. Never
guess what changed — the analyzer script is the single source of truth for the
diff.

## Hard rules

- **Always run `scripts/analyze-diff.py` first.** Never read the diff manually,
  never call `git diff` or `git status` yourself. The script's output is the
  only input you use to build the message.
- **If the script exits non-zero** (no staged changes), stop and tell the user
  to stage files first. Do not invent a message.
- **Never commit without explicit user confirmation.** Print the message,
  wait for a yes/edit/no response, then act. Never pass `--no-verify`,
  never amend.
- **Never add co-author trailers** unless the user explicitly asks.

## Process

1. **Run the analyzer.**

   ```
   python3 <skill-dir>/scripts/analyze-diff.py
   ```

   Read only its output. It gives you: branch, file count, status counts,
   suggested type, likely scopes, and the file list.

2. **Pick the type.** Start from the script's `Suggested type` and override
   only when the diff clearly says otherwise:
   - `feat` — new user-visible capability
   - `fix` — bug fix
   - `refactor` — behavior-preserving code change
   - `test` — tests only
   - `docs` — documentation only
   - `chore` — tooling, deps, meta files

   Anything beyond this list (`perf`, `build`, `ci`, `style`, `revert`) or a
   breaking change → consult `references/conventional-commits.md` before
   deciding.

3. **Pick the scope.** Derive from `Likely scopes`:
   - 1 scope → use it as-is (lowercase, short noun).
   - 2 scopes touching one logical change → comma-separated (`fix(api,ui):`).
   - **>3 scopes** → do not force a scope. See *Gotchas* below.
   - Root-only files (README, LICENSE, package.json) → omit scope.
   - If the top-level folder name is generic (`src`, `lib`, `app`), look one
     level deeper in the file list for a more meaningful scope (e.g.
     `src/api/...` → `api`).
   - **Ask only when genuinely ambiguous** — the diff spans unrelated areas
     and no single scope fits. Otherwise pick and move on.

4. **Write the subject.** Imperative mood, ≤72 chars, no trailing period.
   "add", not "added" or "adds".

5. **Write the body — only if it earns its keep.**
   - Trivial diff (single small fix, rename, one-line change) → **omit the
     body entirely**.
   - Otherwise: 2–5 bullet points, one line each, facts only. State what
     changed and why based on the file list. Do not restate the subject. No
     rationale essays, no filler.

6. **Add footers when they apply.**
   - Branch name matches `[A-Z]{2,}-\d+` (e.g. `feature/JIRA-1234-foo`,
     `PROJ-42-refactor`) → add `Refs: JIRA-1234` footer.
   - Breaking change, revert, or closes-issue → see reference file.

7. **Print the message and ask for confirmation.**
   - Confirmation (yes / lgtm / ship it / commit) → run
     `git commit -F -` with the message on stdin. Report the resulting
     commit hash and subject. Never pass `--no-verify`, never amend.
   - Feedback (any edit request, rewording, scope change, "shorter", etc.)
     → revise the message per the feedback and loop back to this step.
     Do not commit until the user confirms.
   - Rejection ("no", "cancel", "abort") → stop. Leave the staged changes
     untouched.

## Message format

```
<type>[(scope)]: <short imperative subject>

[optional body — 2–5 bullets, one line each]

[optional footer(s)]
```

Allowed types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`. Extend only
via the reference file.

## Gotchas

- **More than 3 distinct scopes in the diff.** Do not force a generic scope
  like `chore(misc):` or drop the scope silently. Instead, print the scope
  list, suggest splitting into separate commits (one per scope), and ask
  whether to proceed with a single message anyway.
- **Mixed change types in one diff** (a `feat` + unrelated `fix` + `docs`).
  Same treatment: name the mix, suggest splitting.
- **Only lockfile / generated files changed** (`package-lock.json`,
  `yarn.lock`, `Cargo.lock`, `pnpm-lock.yaml`, `poetry.lock`, `go.sum`) →
  `chore(deps): update lockfile` with no scope beyond `deps`.
- **Rename-only diff** → `refactor` with the new name in the subject.
- **Something outside the basic case** (breaking change, revert, merge,
  multi-scope, unfamiliar footer) → read `references/conventional-commits.md`
  and follow its rules. Do not improvise.

## Output

Print exactly one block: the ready-to-use commit message inside a fenced code
block, followed by one line asking the user to confirm (e.g. "Commit this? (yes
/ edit / no)"). Nothing else. On confirmation, run the commit and report the
hash + subject on one line. On feedback, revise and re-prompt.
