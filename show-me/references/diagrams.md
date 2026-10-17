# Diagrams

How to draw one that is worth looking at, and how to know it is correct before
anyone sees it. Applies on every surface; the Mermaid sections apply wherever
Mermaid renders.

- [The loop](#the-loop)
- [Ceilings](#ceilings)
- [Rules, ranked](#rules-ranked)
- [Anti-patterns](#anti-patterns)
- [The self-check](#the-self-check)
- [Mermaid: choosing a type](#mermaid-choosing-a-type)
- [Mermaid: color](#mermaid-color)
- [Mermaid: syntax that fails silently](#mermaid-syntax-that-fails-silently)
- [Mermaid: validating](#mermaid-validating)

## The loop

Drawing first and judging afterwards is how a diagram ends up pretty and
wrong. Four steps, in order.

1. **Enumerate.** Write the node list and the edge list — each edge as
   `source --verb--> target` — before emitting any diagram syntax. Staged
   enumeration raises how much of the subject a model actually captures;
   drawing straight from prose does not.
2. **Draw** only what is on the list. Nothing appears in the picture that was
   not enumerated.
3. **Validate** the syntax, so a broken diagram never ships. Renderers fail
   silently: GitHub shows an error box, a terminal shows source, and neither
   reaches you.
4. **Verify** the content by reading the drawn diagram back against the list.
   Every enumerated edge present, every drawn edge enumerated.

Step 4 is not optional polish. Measured on ER diagrams, a clean-looking result
is almost no evidence of a complete one — completeness stayed under a third
across every configuration tested, and a model once scored full marks on
clarity with zero on completeness. Grade against the list, never by eye.

## Ceilings

| Quantity | Ceiling | Why |
|----------|---------|-----|
| Nodes | 12 to scan, **split at 20** | Attention holds about four chunks; a 12-node diagram with three or four visual groups is already at that limit |
| Edges | ≤ 1.5 × node count | Past that it is a hairball whatever the layout engine does |
| Edge crossings | **0** at this size | By far the strongest measured aesthetic for comprehension. If one is truly unavoidable, make it cross near 90° |
| Bends per edge | ≤ 1 | Measured, smaller effect than crossings |
| Node label | ≤ 4 words | Longer labels break the layout before they break the reader |
| Edge label | ≤ 3 words, a verb | An unlabeled arrow asserts "related somehow" |

This model over-generates nodes relative to others, with no matching gain in
edge quality. Treat the node ceiling as a real constraint rather than a
guideline, and raise abstraction instead of shrinking type.

## Rules, ranked

Ranked by how much evidence there is that each one changes comprehension.

1. **Zero edge crossings.** At twelve nodes a crossing-free arrangement nearly
   always exists — reorder before accepting one.
2. **Title states the finding, not the category.** "Auth runs twice per
   request", not "Authentication flow". A sentence headline asserting the
   point measurably raises what readers retain over a topic label.
3. **Keep the main path straight.** The flow a reader traces should not
   zig-zag; continuity and crossings dominate the cost of following a path.
4. **Every edge carries a verb** — `writes`, `invalidates`, `polls every 30s`.
   Edge direction and relationship type are exactly where generated diagrams
   are measured to be weakest, and naming the relation forces the commitment.
5. **One axis semantic, held throughout.** Position means time, or call depth,
   or layer — pick one and never let placement be incidental.
6. **One abstraction level per diagram.** A box that is a whole service next
   to a box that is a function is two diagrams.
7. **At most four categorical colors**, and color is never the only carrier —
   duplicate every color distinction in position, grouping or text.
8. **Group by enclosure before reaching for color.** A labelled box around
   three nodes beats three nodes sharing a fill.
9. **Two or three visual weights, no more.** Push context to low contrast and
   keep the subject at full contrast. One weight means nothing is emphasized;
   four also means nothing is.
10. **Never encode a category by node shape alone.** Shape is the one visual
    variable the eye cannot isolate preattentively — it may only ever be
    redundant with something else.
11. **Delete every mark that encodes nothing.** Not as asceticism: embellished
    charts test no worse on accuracy and better on recall weeks later. The
    rule is "remove marks that carry no datum", never "plainer is clearer".
12. **Compare with small multiples**, not one merged picture: same layout,
    same scale, one variable changed.

Deliberately absent, because the evidence does not support them: maximizing
symmetry, orthogonality, uniform edge lengths, and Miller's "seven plus or
minus two" as a budget.

## Anti-patterns

| Name | Detection test on your own draft |
|------|----------------------------------|
| Hairball | Count crossings; count edges against 1.5 × nodes. Either fails → raise abstraction |
| Kitchen sink | Write the title as one assertion. Needing "and" means it is two diagrams |
| Prose in boxes | Delete every arrow. If it still says the same thing, it was a list — draw the mechanism or cut it |
| Verbless arrows | Count unlabeled edges. Any at all → fail |
| Chartjunk | Point at each non-text mark and name the datum it encodes. Cannot → delete it |
| Abstraction salad | List each node's kind. More than one level → split |
| Legend dependency | Cover the legend. Any node now ambiguous → inline the labels |
| Mystery-meat position | State the axis semantic in one word. Cannot → re-lay out |
| Rainbow | Count hues. More than four, or any hue meaning two things → recolor |
| Monochrome mush | Count visual weights. Exactly one → nothing is the subject |

## The self-check

Cheapest first, so the common failures are caught before the expensive checks
run.

1. Count nodes. Over 12 simplify, over 20 split.
2. Count edges against 1.5 × nodes.
3. Read the title — a complete sentence asserting a finding, with no "and".
4. Count unlabeled edges. Any → add verbs.
5. Count hues and abstraction levels.
6. Count crossings.
7. Trace the main path; it should hold one direction.
8. Validate the syntax (below).
9. Read the drawn diagram back against the enumerated node and edge lists.

## Mermaid: choosing a type

GitHub renders far more than flowcharts. Picking the type that matches the
shape beats bending a flowchart into it.

| The subject is | Type |
|----------------|------|
| A pipeline, a call graph, an architecture | `flowchart` |
| An exchange over time between parties | `sequenceDiagram` |
| Modes and transitions | `stateDiagram-v2` |
| Tables and their relations | `erDiagram` |
| Branch and release history | `gitGraph` |
| Events along a timeline | `timeline` |
| A hierarchy with no edges worth naming | `mindmap` |
| Proportions of a whole | `pie` |
| A series across an axis | `xychart-beta` |
| Flow volumes between stages | `sankey` |
| Nested sizes | `treemap` |
| Work in columns | `kanban` |
| Two-axis positioning | `quadrantChart` |

Never `zenuml` — GitHub does not register it. Never plain `radar`; the
`-beta` suffix is mandatory on that one.

Renderers move. To see which Mermaid version a host deploys before relying on
anything above, put `info` alone in a Mermaid fence there — it renders the
version string.

Two GitHub behaviours worth designing around: a wide diagram is scaled down
and its text shrinks with it, so prefer `TD` over `LR` past about five
columns; and diagrams are zoomable and pannable, so detail that rewards a
closer look is not wasted. `click <node> href "<url>"` works and is styled —
deep-linking a node to the file it names is free. Source over 50,000
characters is silently replaced with an error box.

Inside a label, `<br/>`, `<b>`, `<i>` and `<span>` survive; `<code>`, `<img>`,
`<sub>`, `<sup>` and `<mark>` are stripped.

## Mermaid: color

**Never set `theme` or `themeVariables`** through `%%{init}%%` or frontmatter
`config:`. GitHub chooses Mermaid's light or dark theme from the reader's
color mode, and naming a theme replaces that choice in both.

Style with `classDef`, `class` and `style` only — and know where `classDef`
does nothing. It is a no-op on `sequenceDiagram` (use `box` to group),
`classDiagram` (use `style`), `erDiagram`, `mindmap` and `sankey`. Styling
those the usual way produces a silently unstyled diagram.

Default to a **translucent fill with an opaque stroke and no `color:` entry**.
The alpha lets the page show through, so the tint reads on white and on near
black; omitting `color:` leaves the label to the theme's own text color, which
is already correct in both modes. These four hues are colorblind-safe and
clear the contrast threshold against both a white and a near-black page:

```text
classDef entry fill:#0072B233,stroke:#0072B2,stroke-width:1.5px
classDef work  fill:#009E7333,stroke:#009E73,stroke-width:1.5px
classDef warn  fill:#D55E0033,stroke:#D55E00,stroke-width:1.5px
classDef alt   fill:#CC79A733,stroke:#CC79A7,stroke-width:1.5px
```

An opaque fill is for one emphasis node, never for the whole diagram, and then
`color:` becomes mandatory and the fill must be mid-toned enough to work
against both grounds — `#2563eb`, `#0e7490`, `#7c3aed`, `#be123c` and
`#0f766e` all qualify.

Leave edges, edge labels, arrowheads and subgraph titles unstyled; they
inherit theme-correct colors already. Encode a node's *kind* with a shape
rather than another color — `X@{ shape: doc }`, `docs`, `cyl`, `hex`,
`stadium` and about forty others are available.

Icon syntax is not: no icon pack is loaded, so every `fa:` or iconify name
renders as a placeholder box. The one exception is `architecture-beta`, which
carries its own small built-in set.

## Mermaid: syntax that fails silently

The failures below produce an error box or raw source for the reader and
nothing at all for you.

- **Quote any label containing** `(` `)` `[` `]` `{` `}` `:` `;` `#` `/` `\`
  `@` `!` `?` `<` `>` `"` `'`. Unquoted parentheses are the single most common
  break: `A[Start (now)]` fails, `A["Start (now)"]` works.
- **`end` in lowercase is reserved.** `End` or `END` is fine.
- **A node id beginning `o` or `x`** can be absorbed into edge syntax —
  `A --- ox` reads as an edge marker. Rename or quote.
- **Comments are `%%`**, never `%`.

## Mermaid: validating

Run the validator on anything carrying a Mermaid fence, before returning it:

```bash
node show-me/scripts/validate-mermaid.mjs path/to/file.md
```

It parses with Mermaid's own parser under Node — no browser — and prints
`file:line: Parse error ... Expecting '<token>', ... got '<token>'`. The list
of accepted tokens is the point: repair feedback that names the admissible
alternatives fixes far more than feedback naming only the location. Fix the
named construct, re-run, and do not present a diagram that has not passed.

| Exit | Meaning |
|------|---------|
| 0 | Every diagram parsed, or the file carries no Mermaid |
| 1 | At least one failed; the message names the line and the legal tokens |
| 2 | Validation could not run — `npm` missing, or the cache unwritable |

On exit 2, check the diagram against the silent-failure list above by hand and
say that validation was skipped. First run installs the parser into a cache
directory outside the project, which takes a moment.
