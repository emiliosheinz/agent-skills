# `open`

Commit, push, and open a draft PR.

## Contents

- Step 0 — Preconditions
- Step 1 — Gather context
- Step 2 — Commits
- Step 3 — Capability and screenshots
- Step 4 — Write the body
- Step 5 — Check the draft
- Step 6 — Push and open
- Step 7 — Report
- Failure handling

`open` runs start to finish without asking. The draft status is the gate on
merge, not on history: the commits and the push land before anyone sees the
rendered body.

Never run the project's checks. CI is the check.

## Step 0 — Preconditions

Check all of these before doing any work. Each one fails the whole verb; none
is worked around.

```bash
git rev-parse --show-toplevel                                    # in a repo
git symbolic-ref -q HEAD                                         # not detached
gh auth status                                                   # authenticated
BRANCH=$(git branch --show-current)
BASE=$(gh repo view --json defaultBranchRef -q .defaultBranchRef.name)
git fetch -q origin "$BASE"
git rev-list --count "origin/$BASE..HEAD"                        # commits ahead
git status --porcelain                                           # uncommitted
gh pr view --json number,url,state                               # existing PR
```

| Condition | Response |
|-----------|----------|
| Not a git repository | Stop. Say so. |
| `git symbolic-ref -q HEAD` fails | Stop. HEAD is detached — committing here risks losing the commits. Do not proceed. |
| `gh auth status` fails | Stop. Name `gh auth login` and let the user run it. |
| `gh repo view` reports `no git remotes found` | Stop. The repo has no remote. Same response when every `gh` call fails for lack of network. |
| `$BRANCH` is `$BASE` | **Stop.** Say the change needs a branch, and that the user should create it. Do not create it for them. |
| `gh pr view` returns a PR in any state | **Stop.** Give its URL. Say `open` never updates an existing PR, and that changing the body is a manual edit for now. |
| 0 commits ahead of `origin/$BASE` and nothing uncommitted | Stop. There is no change to open a PR for. |

`gh pr view` resolves the PR for the current branch and exits non-zero when
there is none, which `gh pr list --head` does not do reliably — it matches on
branch name across forks and defaults to open PRs only.

The base branch is read from the remote, never assumed to be `main`.

## Step 1 — Gather context

Read what is available; none is required.

- `git diff "origin/$BASE...HEAD"` plus the working tree. Always use the
  remote-qualified ref: a bare `$BASE` resolves to the local branch, which is
  usually stale and sometimes absent. If the three-dot form fails for want of a
  merge base (a shallow clone), fall back to `git diff "origin/$BASE..HEAD"` and
  say in the report that the base is approximate.
- Commit messages on the branch — they carry intent the diff does not.
- `forge` artifacts, when the change came from a `forge` run, under
  `./.specs/<slug>/`: `state.md`'s door verdict and decisions, `spec.md`'s
  problem statement and blast radius, `design.md`'s architectural risks. Newest
  slug if there are several; ask which if that is ambiguous.
- An issue or ticket reference in a commit message or branch name. When one
  exists, close it from the body with `Closes #<n>`.

## Step 2 — Commits

If anything is uncommitted:

1. **Invoke the `commit-message-generator` skill** with the Skill tool. It
   writes conventional commits and groups unstaged work into a sequence, which
   beats one commit of everything, and commits without asking. It refuses
   outright above 4 groups — in that case follow its instruction to re-group
   rather than working around it.
2. **If the Skill tool reports it is not installed**, fall back: stage
   everything, make one commit with a conventional-commit subject, and **say in
   the final report that the fallback ran** so the user knows grouping did not
   happen.

Never amend an existing commit. Never rewrite history on the branch.

## Step 3 — Capability and screenshots

Both decisions here change what gets written in Step 4, so they come first.

```bash
gh pr create --help | grep -q -- '--attach' && echo attach || echo placeholder
gh repo view --json url    # attachments are GitHub.com and GHEC only
```

Feature-detect `--attach`; do not compare version strings. Treat any host that
is not GitHub.com or GitHub Enterprise Cloud as placeholder-only.

Only when the change is one a reviewer would want to see: invoke `show-me` for
a screenshot. It returns an absolute path outside the repo. Carry that path
into Step 4 — the body must reference it for `gh` to rewrite it in place.

With no `--attach` and a captured image, or on an unsupported host, Step 4
writes a placeholder line instead.

## Step 4 — Write the body

Load [writing-the-body.md](writing-the-body.md) and write the body there. It is
the deliverable.

Write it to a literal path, not a shell variable — shell state does not survive
between tool calls, so `BODY=$(mktemp ...)` in one call is unset in the next.
Use the file-writing tool, not a heredoc:

```
/tmp/pr-body-<branch>.md
```

**The title** is written fresh from the change, as a short sentence a person
would say. Not the conventional-commit subject — `feat(auth): add token
refresh` is a good commit subject and a poor PR title, and a multi-commit PR has
no single subject to borrow. Same register as the body.

## Step 5 — Check the draft

Do not skip this. Writing the body and judging it are different jobs, and the
second one is the one that gets dropped under pressure.

Run both checks in [writing-the-body.md](writing-the-body.md):

1. **The thirteen patterns.** Walk the table row by row against the draft. Name
   the ones that fire. If any fire, rewrite and walk it again.
2. **The scan test.** Re-read only the first sentence of each paragraph, the
   bolded words and the views, and confirm that alone answers what changed and
   why.

A draft that has not been through both does not get pushed.

## Step 6 — Push and open

```bash
git push -u origin "$BRANCH"

gh pr create \
  --draft \
  --base "$BASE" \
  --title "<title from step 4>" \
  --body-file "/tmp/pr-body-<branch>.md"
```

With `--attach` available and an image captured, add one flag per image, using
the absolute path `show-me` returned:

```bash
  --attach '/abs/path/after.png#what it shows'
```

Always `--draft`. Delete the body file once `gh` has succeeded.

## Step 7 — Report

1. The PR URL.
2. Whether the commit fallback ran, if it did.
3. Whether a screenshot placeholder is waiting to be filled, if one is.
4. Whether the base was approximated for a shallow clone, if it was.

Do not paste the body back.

## Failure handling

| Failure | Response |
|---------|----------|
| `git push` rejected (branch moved) | Stop. Report it. Do not force-push. |
| `gh pr create` fails | The commits and the push already happened. Report exactly what succeeded and what did not, and give the command to retry. Never silently retry with different arguments. |
| `--attach` rejected despite the Step 3 check | Re-write the body file with a placeholder line, then retry the create without `--attach`. Do not fail the verb over an image. |
