---
name: open-pr
description: >
  Opens a draft pull request for the current branch with a description a reviewer can
  understand in under a minute — what changed and why, shown with diagrams, code-shape
  sketches, and before/after evidence instead of a wall of prose. Commits pending work,
  pushes, creates the PR as a draft. Structure is sized to the change; a one-line fix
  gets one sentence, a refactor gets the full story.
  TRIGGER when: the user asks to open or create a pull request, raise a PR, write a PR
  description or PR body, ship the current branch for review, or says "open a PR",
  "/open-pr", "PR this", "put this up for review".
  SKIP for: updating an already-open PR (this skill never edits an existing PR — it
  refuses and hands you the body), writing a commit message (use
  `/commit-message-generator`), reviewing someone else's PR, or merging.
metadata:
  author: emiliosheinz
  version: 1.0.0
compatibility: >
  Needs `git` and the GitHub CLI (`gh`) authenticated. Browser tooling (Playwright,
  a browser extension integration) is optional — used to capture UI evidence when
  present, flagged as missing when not. Reads `./.specs/` artifacts when `forge` ran,
  works without them.
---

# Open PR

Open **one draft pull request** per invocation, with a description built for a reviewer
who has sixty seconds and four other PRs to get through.

**The job is context transfer, not documentation.** A reviewer should finish the
description knowing what changed, why it was worth doing, and where to spend their
attention — before they open the diff.

**Draft is the confirmation step.** This skill runs end to end without asking permission
at each stage: it commits pending work, pushes, and creates the PR. It opens as a draft
because the human promotes it to ready — that is the review gate, not a prompt.

## Hard rules

- **Draft only.** Always `gh pr create --draft`. Never open a PR ready for review.
- **Never touch an already-open PR.** A PR already exists for this branch → stop, print
  its URL and the body you composed, and say the skill does not update existing PRs.
- **What and why, never how.** How is already in the diff, the diagrams, and the
  screenshots. A description that narrates the implementation file by file is waste —
  the Files Changed tab does that better.
- **No invented evidence.** Never describe a screenshot you did not capture, a benchmark
  you did not run, or a test result you did not see. Missing evidence is written as
  missing (see `references/evidence.md`).
- **No fixed template.** The shape is born from the change (`references/composition.md`).
  A one-line fix gets one sentence and a screenshot. Never pad a trivial PR into
  headings, and never print a section whose content would be "N/A" or "None" — delete it.
- **No slop.** `references/voice.md` is not optional styling. A description that reads
  like it was generated is the failure this skill exists to prevent.
- **Never push to the default branch.** On `main`/`master` → create a branch first.
- **Never** `--no-verify`, `--amend`, `--force`, or a rebase. Never add AI co-author
  trailers.

## Dispatch

Read the matching reference fully before acting on that step.

| Step | Read | Purpose |
|------|------|---------|
| 1 — Preflight | — | Repo, `gh` auth, base branch, existing-PR check, branch off default |
| 2 — Land the work | — | Commit pending changes, push with upstream |
| 3 — Gather context | — | Commits, diff, linked issue, `forge` artifacts |
| 4 — Evidence | `references/evidence.md` | Observable-surface detection, before/after capture |
| 5 — Compose | `references/composition.md` | Size the PR, pick views, order the story |
| 6 — Voice pass | `references/voice.md` | Strip slop, apply the scan test |
| 7 — Open | — | `gh pr create --draft`, report |

## Process

### 1. Preflight

Resolve, and stop with a plain message if any fails:

- Inside a git repo with a remote; `gh auth status` clean.
- **Base branch:** `gh repo view --json defaultBranchRef -q .defaultBranchRef.name`.
- **Existing PR:** `gh pr view --json url,state,isDraft 2>/dev/null`. Found and open →
  stop per Hard rules. Compose nothing further; print the URL.
- **On the default branch?** Create a topic branch before anything else. Derive a
  kebab-case name from the change (`fix-token-refresh`), or from the `forge` slug when
  `./.specs/<slug>/` exists.

### 2. Land the work

- **Clean tree** → nothing to do.
- **Dirty tree** → the changes must be committed before they can be reviewed. Invoke
  `commit-message-generator` if it is available in this runtime; it groups the diff and
  confirms each message. Otherwise list the pending paths, propose one Conventional
  Commit per logical group, and ask once before committing. Never `git add -A`.
- Push with upstream: `git push -u origin <branch>`.
- **Remote branch already exists and has diverged** → stop and report. Do not force.

### 3. Gather context

Read only what explains the change:

- `git log <base>..HEAD --oneline` and the full diff (`git diff <base>...HEAD`).
- Enough surrounding code to know what the change *affects*, not just what it edits.
- **Linked work:** an issue reference in a commit body (`Refs: KEY-123`, `Closes #45`)
  or in the branch name. Put it in the body as a link, once, at the top. No reference
  found → omit, don't invent one.
- **`forge` artifacts, when `./.specs/<slug>/` exists** — these are already-written
  answers, don't re-derive them:

  | Artifact | Feeds |
  |----------|-------|
  | `spec.md` problem statement | the why sentence |
  | `spec.md` ACs marked `critical` | one-way-door signal |
  | `spec.md` Part A impact trace | blast radius |
  | `design.md` architecture + Mermaid | the diagram, reused as-is |
  | `state.md` Verification evidence | the evidence section |
  | `state.md` `Size:` | seeds the composition tier |

### 4. Evidence

Per `references/evidence.md`: decide whether the change has an observable surface, and
capture before/after proof when tooling allows.

### 5. Compose

Per `references/composition.md`: size the PR, then write the smallest body that passes
the one-minute test.

### 6. Voice pass

Re-read the draft against `references/voice.md` and cut. This step only ever removes
words.

### 7. Open

```
gh pr create --draft --base <base> --title <title> --body-file <tmpfile>
```

- **Title:** Conventional Commit shape matching the dominant change
  (`feat(open-pr): add draft PR composer`), imperative, no trailing period. One commit
  on the branch → reuse its subject verbatim.
- Write the body to a temp file (`$TMPDIR`), never into the repo.
- **Report:** the PR URL on one line, then any captured screenshot paths with a single
  instruction to drag them into the draft (GitHub only accepts image uploads through the
  web UI — `gh` cannot attach them). Open it with `gh pr view --web` when screenshots
  are pending.
- `gh pr create` fails → print the temp file path so nothing is lost.

## The one-minute test

Before opening, read the body once as a reviewer who has never seen this branch. It
passes when all four hold:

1. You know **why** this exists from the first sentence.
2. You know **where to look first** in the diff.
3. Nothing in it restates what the diff already shows.
4. Nothing in it is unverified prose dressed as fact.

Fails any of them → cut or add, re-test. Usually the fix is cutting.

## Gotchas

- **Trivial PR, full structure** is the most common failure. One sentence and a
  screenshot is a complete description when the change is one line.
- **Screenshots cannot be uploaded by CLI.** Capture them, report the paths, let the
  human drop them in. This is part of why the PR opens as a draft.
- **A "before" screenshot needs the base branch running.** See
  `references/evidence.md` — after-only plus an honest flag beats a fabricated pair.
- **One PR per invocation.** A branch carrying two unrelated changes is a reviewer
  problem no description can fix — say so and suggest splitting the branch.
- **The risk tag is one line, not a section** unless the change is a one-way door or
  reaches past the module it touches.
