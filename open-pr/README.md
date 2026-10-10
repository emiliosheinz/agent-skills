# open-pr

Agent skill that opens one draft pull request per invocation, with a description a
reviewer can act on in under a minute — what changed and why, shown with diagrams,
code-shape sketches, and before/after evidence instead of a wall of prose.

Built against the failure mode of agent-opened PRs: a long, evenly-weighted description
that narrates the diff, reads as generated, and leaves the reviewer no faster than if
they had opened the Files Changed tab first.

## When to use

Invoke this skill when you want to:

- Put the current branch up for review, end to end: commit, push, open the PR.
- Get a PR description sized to the change instead of a filled-in template.
- Force before/after proof onto UI changes.

Reach for **`/commit-message-generator`** instead when you only want the commits.

This skill **never updates an already-open PR.** If one exists for the branch, it stops
and hands you the body it composed so you can paste it yourself.

## Requirements

- `git`, and the GitHub CLI (`gh`) authenticated.
- Optional: browser tooling (Playwright MCP, a browser extension integration, or a
  project visual-test command) for capturing UI evidence. Absent → the skill flags the
  missing screenshots and continues.
- Optional: `./.specs/` artifacts from `/forge`. Present → the why sentence, diagram,
  blast radius, and evidence are read from them instead of re-derived.

## How it works

Seven steps, with the three judgement-heavy ones guided by reference files loaded on
demand:

1. **Preflight** — checks the repo and `gh` auth, resolves the base branch, refuses if a
   PR is already open, and branches off the default branch if you are sitting on it.
2. **Land the work** — commits pending changes (delegating to
   `/commit-message-generator` when available), then pushes with upstream.
3. **Gather context** — commits, full diff, linked issue from a commit footer or branch
   name, and any `forge` artifacts.
4. **Evidence** (`references/evidence.md`) — classifies the change's observable surface,
   captures before/after screenshots with whatever browser tooling exists, and flags
   honestly when it cannot.
5. **Compose** (`references/composition.md`) — sizes the PR, then writes the smallest
   body that works. No fixed template: a one-line fix gets one sentence and a
   screenshot; a cross-module refactor gets an ordered story with several views.
6. **Voice pass** (`references/voice.md`) — a removal-only pass against a kill list of
   puffery, corporate verbs, throat-clearing, and structural padding.
7. **Open** — `gh pr create --draft`, then reports the URL and any screenshot paths.

### Why draft

The skill runs without stopping to confirm each stage. The draft state *is* the
confirmation: you review the composed body, drag in the screenshots `gh` cannot upload,
and promote it to ready yourself.

## Output

A draft PR whose body contains only what earned its place:

- **Always** — one sentence on why the change exists.
- **When observable** — before/after evidence, placed next to the claim it proves.
- **When it helps** — the smallest view that shows the shape: pseudocode, call tree,
  component tree, shallow file tree, Mermaid sequence, or a contract diff.
- **When there is a real warning** — up to three reviewer notes (migration,
  compatibility constraint, deliberate omission).
- **Always** — a one-line risk tag (`Risk: two-way door · local`), promoted to a section
  only when the change is irreversible or reaches past the module it touches.

Section headings are named after the change, never after a template, and a section with
nothing to say is deleted rather than filled with "N/A".

## Installation

Install to the current project:

```bash
npx skills add emiliosheinz/agent-skills --skill open-pr
```

Install globally (available across all projects):

```bash
npx skills add emiliosheinz/agent-skills --skill open-pr --global
```

See the [root README](../README.md) for installing all skills at once.

## Usage

```
/open-pr
```

Optionally steer the framing:

```
/open-pr focus on the migration risk
```

If you captured before/after screenshots while developing, say so — the skill will use
yours instead of trying to stand up the base branch.

## Related skills

- **`/commit-message-generator`** — the commits this PR is built from.
- **`/forge`** — when `./.specs/<slug>/` exists, its spec, design, and verification
  evidence feed the PR body directly.
- **`/diagnose`** — a verified root-cause report makes the why sentence write itself.

## Credits

The view catalog (pseudocode, call trees, component trees, shallow file trees, Mermaid,
`diff` sketches) follows
[show-me](https://github.com/humanlayer/skills/blob/main/plugins/show-me/skills/show-me/SKILL.md)
and [visual-pr](https://github.com/humanlayer/skills/tree/main/plugins/visual-pr) by Dex
Horthy (HumanLayer).

The one-way / two-way door framing comes from
[Amazon's 2015 letter to shareholders](https://s2.q4cdn.com/299287126/files/doc_financials/annual/2015-Letter-to-Shareholders.PDF),
by way of [Matt Pocock's `pr` skill](https://github.com/mattpocock/skills/tree/main/skills/engineering/pr)
and his talk [Fixing the PR Bottleneck](https://www.youtube.com/watch?v=LlgiOCmFG_w).
