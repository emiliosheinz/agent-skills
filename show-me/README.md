# show-me

Agent skill that produces a compact visual representation of whatever is being
discussed — pseudocode, a call tree, a component tree, a file tree, a Mermaid
diagram, a diff of any of those shapes, or a screenshot of the running app —
so a reader sees the shape instead of reading a wall of prose.

## When to use

Invoke this skill when you want to:

- See the shape of some code rather than a description of it.
- Discuss structure, control flow or data flow before anything is written.
- Get a screenshot of the app in a particular state.
- Give another skill a visual for a document it is writing.

## Requirements

- Nothing, for the fenced views. They render anywhere Markdown does.
- Playwright or a browser extension, plus a way to run the app, for
  screenshots.

## Responsibility

This skill **produces** visuals. It does not embed, upload, host or publish
them. A caller that needs an image somewhere specific — in a PR body, in a
document — owns that step and knows its own constraints.

That boundary is why `/pr` can call this skill without this skill knowing
anything about GitHub.

## Parameters

| Parameter | Meaning | Default |
|-----------|---------|---------|
| topic | What to make visible. Required. | — |
| `max-views` | Ceiling on how many views to return | judgement |
| `size` | `tight` keeps each view to roughly 12 lines; `normal` keeps what the topic needs | `normal` |

## It's working if

The reader understands the shape from the view alone, and the prose around it
got shorter rather than longer.

## Credits

Adapted from Dex Horthy's `show-me` (HumanLayer), MIT licensed. Screenshots
added, the focused-HTML view dropped, parameters added, and made
model-invocable so other skills can call it. See `CREDITS.md`.
