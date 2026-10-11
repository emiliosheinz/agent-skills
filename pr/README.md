# pr

Agent skill that opens a pull request whose body a reviewer can scan in under a
minute — the problem, how it was solved, why that way, with visuals carrying
the explanation instead of walls of prose.

## When to use

Invoke this skill when you want to:

- Open a pull request for work that is finished.
- Get a body written that a reviewer can actually use.
- Commit, push and open a draft in one step.

Reach for **`/commit-message-generator`** instead when you only want commits
and no PR.

## Requirements

- `git`, and `gh` authenticated against the remote.
- A `gh` whose `pr create` supports `--attach`, to attach screenshots.
  Without it the body carries a placeholder for you to drag the image into.
  Attachments work on GitHub.com and GitHub Enterprise Cloud only.
- The `show-me` skill, for visuals. Without it, bodies fall back to prose and
  no diagram is improvised.
- Playwright or a browser extension, if screenshots are to be captured rather
  than placeheld.

## How it works

`open` runs the whole chain — preconditions, commits, body, screenshots, push,
draft PR — without asking. Project checks are not run; CI is the check.

The draft status is the gate on **merge**, not on history: the commits and the
push land before anyone sees the rendered body. Full procedure in
[references/open.md](references/open.md).

## The two tests

There is no template and no mandatory section. Every body passes both of these,
and nothing else is enforced:

1. A reviewer scans it in under 60 seconds.
2. The body is never more complex than the fix.

## What it will not do

- Claim the change is tested, verified, or safe to merge.
- Inventory the tests that cover the change.
- Restate the diff.
- Invent a motive when the real one cannot be recovered.
- Open a PR from the default branch, or create the branch for you.
- Open a PR on a detached HEAD.
- Update a PR that already exists, in any state.
- Commit a screenshot into the repo to get it into a body.
- Amend, rewrite history, or force-push.

## Installation

Install to the current project:

```bash
npx skills add emiliosheinz/agent-skills --skill pr
```

Install globally (available across all projects):

```bash
npx skills add emiliosheinz/agent-skills --skill pr --global
```

Install `show-me` alongside it for visuals. See the
[root README](../README.md) for installing all skills at once.

## Usage

```
/pr open
```

## It's working if

A reviewer can say what the change does and why it exists without opening the
diff — and, on a change big enough to need it, where to read carefully.

## Extending it

`pr` is a verb surface: `SKILL.md` routes, and each verb's procedure is one
file under `references/`. Verbs not built yet: `review`, `update`, `fix`.

## Credits

Framing adapted from Dex Horthy's `visual-pr`. Views come from this repo's
`show-me`, itself adapted from his. See [CREDITS.md](CREDITS.md).
