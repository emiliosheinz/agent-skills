---
name: pr
description: >
  Commits, pushes, and opens a draft pull request whose body a reviewer can scan
  in under a minute: the problem, how it was solved, why that way.
  TRIGGER when: the user asks to open a PR, raise a pull request, submit work
  for review, write a PR body for work that has no PR yet, or says "open a pr",
  "pr this", "ship this for review". SKIP for: reviewing a PR's code or diff,
  updating or re-describing a PR that already exists, addressing review
  comments on a PR, writing a commit message alone, or pushing a branch without
  opening a PR.
metadata:
  author: emiliosheinz
  version: 1.1.0
compatibility: >
  Requires `git`, and `gh` authenticated against the remote. Screenshot
  attachment needs a `gh` whose `pr create` has `--attach`; without it the body
  carries a placeholder instead.
---

# PR

One verb per invocation.

## Verbs

`open` is the only verb: commit, push, and open a draft PR with a written body.
Procedure: [references/open.md](references/open.md).

No verb given, and the branch has commits the base does not: assume `open`. A
PR already exists for the branch: stop, give its URL, and say `open` never
updates an existing PR. Do not infer a verb absent from this file.

## The two tests

Every body this skill writes passes both. They are the whole quality bar; there
is no word count and no mandatory section.

1. **A reviewer scans it in under 60 seconds.** Not reads — scans.
2. **The body is never more complex than the fix.** A one-line dependency bump
   cannot earn three paragraphs.

Test 2 is decided from the diff before drafting, and test 1 is re-checked
against the draft. Both procedures are in
[references/writing-the-body.md](references/writing-the-body.md).

## Writing the body

Load [references/writing-the-body.md](references/writing-the-body.md) before
writing any body. There is no template: sections are not mandatory, not fixed
in order, and not named in advance. A change that needs one sentence gets one
sentence.

## Credits

Framing adapted from Dex Horthy's `visual-pr`; views come from this repo's
`show-me`. See [CREDITS.md](CREDITS.md).
