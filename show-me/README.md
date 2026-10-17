# show-me

Agent skill that produces a compact visual representation of whatever is being
discussed — pseudocode, a call tree, a component tree, a file tree, a
contract, a chart, a Mermaid diagram, a diff of any of those shapes, or a
screenshot of the running app — so a reader sees the shape instead of reading
a wall of prose.

Each view is built for the surface it will be read on. The same topic becomes
a colored text view in a terminal, a styled Mermaid diagram in a GitHub PR, or
a laid-out HTML page — because a diagram sent to a terminal is a wall of
source, which is the problem this skill exists to solve.

## When to use

Invoke this skill when you want to:

- See the shape of some code rather than a description of it.
- Discuss structure, control flow or data flow before anything is written.
- Get a screenshot of the app in a particular state.
- Give another skill a visual for a document it is writing.

## Surfaces

| `surface` | Read in | What it uses |
|-----------|---------|--------------|
| `terminal` | Claude Code, any CLI | Fence syntax highlighting for color, tables for borders, block characters for bars, 80 columns |
| `markdown` | GitHub PRs, issues, READMEs | Mermaid with a palette that survives both GitHub themes, `<details>`, `> [!NOTE]` |
| `html` | A published Artifact page | Real layout and CSS, native Mermaid, real charts |

## Requirements

- Nothing, for the text views. They render anywhere Markdown does.
- A surface that renders Mermaid — GitHub or an HTML page — for the diagram
  views.
- A caller that can publish an Artifact, for `surface: html`.
- Playwright or a browser extension, plus a way to run the app, for
  screenshots.

## Responsibility

This skill **produces** visuals. It does not embed, upload, host or publish
them. A caller that needs an image or a page somewhere specific — in a PR
body, in an Artifact — owns that step and knows its own constraints.

That boundary is why `/pr` can call this skill without this skill knowing
anything about GitHub.

## Parameters

| Parameter | Meaning | Default |
|-----------|---------|---------|
| topic | What to make visible. Required. | — |
| `surface` | `terminal`, `markdown` or `html` | `terminal` |
| `max-views` | Ceiling on how many views to return | judgement |
| `size` | `tight` keeps each view to roughly 12 lines; `normal` keeps what the topic needs | `normal` |

## It's working if

The headline lands from the first view alone, without the prose around it —
and the prose around it got shorter rather than longer.

## Credits

Adapted from Dex Horthy's `show-me` (HumanLayer), MIT licensed. Screenshots
added, surfaces and parameters added, the focused-HTML view reworked into a
surface, and made model-invocable so other skills can call it. See
`CREDITS.md`.
