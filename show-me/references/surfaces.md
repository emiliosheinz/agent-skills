# Surfaces

Three places a view gets read, with near-opposite strengths. Read the section
for the `surface` you were given before producing anything.

- [The matrix](#the-matrix)
- [terminal](#terminal) — fence colors, glyphs, width, no Mermaid
- [markdown](#markdown) — GitHub's renderer, layout, images
- [html](#html) — a published Artifact page

Everything below was verified against the renderer it describes, not inferred
from documentation.

## The matrix

| Primitive | `terminal` | `markdown` | `html` |
|-----------|------------|------------|--------|
| Mermaid | no | renders | renders |
| Color inside a block | by fence language | by fence language | full CSS |
| Tables | renders, padded and aligned | renders | renders |
| Box drawing, block bars | yes | yes | yes |
| Callout bar | blockquote only, no `[!NOTE]` styling | `> [!NOTE]` | yes |
| Collapsing a long view | no | `<details>` | yes |
| Inline HTML | printed as literal text | sanitized allowlist | full |
| Images | no | yes | yes |
| Clickable links | yes, in most terminals | yes | yes |

A view built for the wrong surface is the failure this file exists to prevent.

## terminal

Claude Code renders Markdown through `marked` plus a bundled highlight.js.
What that buys: headings carry weight (`#` bold-italic-underline, `##` and
below bold), bold and italic work, inline code takes an accent color,
blockquotes get a dim left bar with italic body, tables are padded and
honour `:--:` alignment, and nested ordered lists change marker by depth —
digits, then `a.`, then roman. Markdown links become real terminal
hyperlinks in ghostty, kitty, iTerm2, WezTerm, Warp, Alacritty, Hyper,
Windows Terminal and JetBrains terminals, so a file path can be clickable.

Raw HTML is printed as literal text. `<details>` does nothing here.

### Fence language is the color channel

Claude Code maps highlight.js scopes to colors through a fixed table. Scopes
missing from that table render with no color at all, which makes several
intuitive choices useless — `section` (a `[toml-section]`, a Makefile target,
an nginx block) and `attribute` (an HTTP header name) are both uncolored.

| The view is | Fence | What actually colors |
|-------------|-------|----------------------|
| Anything added, removed, good or bad | `diff` | `+` green, `-` red, `!` green, `@@` grey, and `===` / `---` / `***` green |
| Pseudocode | `python` | `if`, `for`, `return`, `def`, `in` blue; builtins cyan; strings red; numbers green |
| A label that needs real weight | `markdown` | `**x**` renders bold, `*x*` italic — inside a code block |
| Key-to-value pairs | `ini` | keys cyan, strings red, numbers green, booleans blue, `#` comments green |
| A payload or record | `json` | keys cyan, strings red, numbers green, literals blue |
| An endpoint contract | `http` | method blue, path red, status code green |
| A component or element tree | `xml` | tag names blue, attribute names cyan, values red |
| A query | `sql` | keywords blue, builtins cyan, strings red |
| Commands with a prompt | `console` | prompt grey, command highlighted as shell |
| Pure geometry — trees, panels, bars | `text` | nothing, deliberately |

Rules that follow from how the highlighter works:

- **Always label the fence.** An unlabeled fence is not grey — its whole body
  is painted one accent color, which reads as "all of this matters equally".
- **Only the first word of the info string selects the language.** ```` ```diff title=x ````
  works; a misspelling is printed dimmed above the block and the body renders
  plain, so the mistake is visible rather than silent.
- **In a `diff` fence every unchanged line needs a leading space.** Without
  it, a line starting `-` becomes a red deletion and one starting `---`
  becomes a green rule. That last misread is useful on purpose: `====` inside
  a `diff` fence is a green horizontal rule, the only one available.
- **Avoid `makefile`, `apache`, `nginx` and `[sections]` in `ini`** — the part
  you wanted emphasized is exactly the part that renders uncolored. Write an
  `ini` heading as `# Name`, which is green, not `[Name]`, which is not.

### Glyphs

```text
Safe, width 1 everywhere:
  ─ │ ┌ ┐ └ ┘ ├ ┤ ┬ ┴ ┼   ━ ┃ ┏ ┓ ┗ ┛ ┣ ┫ ┳ ┻ ╋   ═ ║ ╔ ╗ ╚ ╝ ╠ ╣ ╦ ╩ ╬
  ╭ ╮ ╯ ╰   ┄ ┆   ▁▂▃▄▅▆▇█   ▏▎▍▌▋▊▉   ▀ ▄ ▌ ▐   ▖▗▘▙▚▛▜▝▞▟   ░ ▒ ▓
  and ASCII  -> <- => ^ v | + * x o # .
Never, in anything that has to align:
  ■ □ ● ○ ◆ ◇ ▲ ▼ ▶ ◀ ★ ✓ ✗ → ← ↑ ↓ ⇒ … — • · × °  and every emoji.
```

The banned set is East Asian **Ambiguous** width: Claude Code pads those
characters as one column while several common monospace fonts draw them at
two, so a table or panel using them shears for some readers and not others.
Box Drawing and Block Elements are one column in every font measured.

Braille (`⠀`–`⣿`) looks tempting at 2×4 subpixels per cell, but ten of
fourteen common monospace fonts ship no braille glyphs at all — the fallback
is a wrong-width glyph that clips, not a visible box. Skip it.

### Texture is a second channel

With color unavailable inside a `text` fence, fill character carries the
distinction: `█` solid, `░` light, `▓` medium, `⣿` hatched. That is three
distinguishable series with no color at all. `▉` leaves a gap in every cell,
so it reads as stripes — texture only, never a solid bar.

Give bars a track so the scale is visible:

```text
specify  ███████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  2
design   ███████████████░░░░░░░░░░░░░░░░░░░░░░░░  4
execute  ███████████████████░░░░░░░░░░░░░░░░░░░░  5
```

Use the full eighths `▏▎▍▌▋▊▉█` when a bar needs sub-cell precision.

### Width

Claude Code wraps prose at `maxProseWidth` but leaves **tables and fenced
blocks at full width** — nothing truncates them, so an over-wide view is
re-wrapped by the terminal itself and its alignment is destroyed. You cannot
know the reader's width. Target 80 columns because it is the narrowest common
terminal, and treat it as a budget you chose rather than a limit anything
enforces.

### Drawing by hand

Models generate ASCII layouts far less reliably than they read them. Do not
free-hand a box diagram. Fix the column positions first — write the ruler,
decide each box's left edge and width — then fill the grid, then read the
result back line by line checking that every `│` meets a `─` at a `┼`, `┬`,
`┴`, `├` or `┤`.

### No Mermaid here

A terminal gets text views, never a Mermaid fence. Claude Code's own renderer
is behind a server-side gate that is off by default and cannot be switched on
locally, and every other route needs a binary the reader may not have — so a
fence here is a wall of source far more often than it is a diagram.

Each diagram shape has a text view that carries it:

| If the shape wants to be | Draw instead |
|--------------------------|--------------|
| A flowchart or pipeline | A box panel, or a call tree when it is strictly nested |
| A sequence diagram | A call tree, indented by who calls whom |
| A state machine | A `diff`-fenced transition list, `state --event--> state` |
| A class diagram | A type block in the real language, or a `diff` of it |
| An ER diagram | A table of entities and their relations |
| A pie or bar chart | Block bars against a `░` track |
| An architecture diagram | A shallow file tree, or a table of parts and duties |

When the shape genuinely needs layout a terminal cannot give it, say so and
offer the `markdown` or `html` surface rather than approximating badly.

## markdown

GitHub renders Mermaid, so the diagram views are live. Everything specific to
writing one is in [diagrams.md](diagrams.md); this section is the rest of the
renderer.

### Layout

GitHub's sanitizer strips `class`, `style`, `aria-*` and `role`, deletes
inline `<svg>` entirely, and removes the `src` of any `data:` URI — so there
is no CSS, no hand-authored inline vector, and no embedded image bytes.

What survives is a real one:

- **`<table><td>` is the only column layout.** With blank lines inside a cell,
  the cell holds full Markdown — including fenced code and Mermaid. This is
  how a diagram sits beside its legend, or a before and after sit side by
  side.
- `<details>`/`<summary>` folds a long view, nests, and can contain a Mermaid
  fence provided blank lines surround it.
- `> [!NOTE]` and `> [!IMPORTANT]` are the only colored callouts. One per
  output; a second spends the emphasis of the first. They cannot nest.
- `<kbd>`, `<sub>`, `<sup>`, `<ins>`, `<del>`, `<mark>`, `<samp>`, `<br>`,
  `<dl>`, `<div align>` and `<p align>` all survive. `<nobr>`, `<small>`,
  `<abbr>`, `<figure>` and `<figcaption>` do not — use `&nbsp;` where you
  wanted `<nobr>`.
- Unicode box drawing inside a fence or a `<td>` needs no hosting and cannot
  be sanitized away.

### Line breaks and length

In a PR or issue body a single newline is a **hard break**, so a paragraph
wrapped at 80 columns arrives as ragged short lines. Write each paragraph as
one unwrapped line. A README does not do this. Body cap is 65,536 codepoints.

### Images

`geojson`, `topojson` and `stl` fences render as live interactive views.
Beyond those, an image needs a URL: GitHub proxies external `<img>` sources
server-side, so a referenced image renders even in a private repository, and
`<picture>` with `<source media="(prefers-color-scheme: dark)">` is the
supported way to ship a light and a dark variant. A repo-relative path works
in a README and breaks in a PR body — use an absolute raw URL pinned to a sha.

`gh pr create --attach` uploads a local image and rewrites its reference in
the body, from `gh` v2.99.0 onward. Feature-detect it rather than assuming.

## html

A self-contained page, published as an Artifact by whoever asked for it. This
is the surface with real layout, color and diagrams — so it is also the one to
resist. Reach for it only when the view genuinely exceeds the other two: more
nodes than a terminal can hold, more than one dimension at once, or something
the reader will return to rather than scroll past. A six-line call tree does
not need a web page.

1. Load the `artifact-design` skill before writing the file. Load
   `artifact-diagramming` as well if the page carries a diagram, and `dataviz`
   if it carries a chart.
2. Write page content only — no doctype, `html`, `head` or `body` tags; the
   publisher wraps the file. Put the `<title>` and the `<style>` at the top.
3. Match the product being described: its real colors, type, spacing and
   component shapes, with real labels and real data rather than placeholders.
   The page may be a diagram, an infographic or a short deck.
4. Write the file into the session scratchpad, never into the repository, and
   **return the absolute path**.

Publishing is the caller's job, exactly as it is for a screenshot. When no
other skill asked for the visual, the one who invoked you is the caller:
publish the file with the Artifact tool and hand back the link.

### Libraries

Only `cdnjs.cloudflare.com`, `cdn.jsdelivr.net/npm/`, `cdn.tailwindcss.com`
and `code.jquery.com` load, and only scripts — **stylesheets from a CDN are
blocked**, so any library CSS must be pasted inline. WebAssembly is blocked
too, which rules out Graphviz, Pikchr and svgbob.

| Need | Load |
|------|------|
| A diagram | `https://cdn.jsdelivr.net/npm/mermaid@12.2.0/dist/mermaid.min.js` — jsdelivr, not cdnjs, which has no 12.x. Version 12 uses the ELK layout engine by default, which is the single biggest quality difference available |
| A chart | `echarts` for best defaults, `Chart.js` for best quality per kilobyte. Load `dataviz` first |
| ASCII art as crisp vector | `https://cdn.jsdelivr.net/npm/aasvg@0.5.7/text2svg.js` — 84 KB, no dependencies; turns the same ASCII source the terminal surface uses into clean SVG |

Two traps worth knowing: Observable Plot's bundle silently renders nothing
unless a global `d3` is loaded first, and Vega throws under the page's
security policy unless you pass `vega.expressionInterpreter` as `expr`.
