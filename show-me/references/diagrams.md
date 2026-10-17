# Diagrams

How to draw one that is worth looking at, and how to know it is correct before
anyone sees it. Applies on every surface; the Mermaid sections apply wherever
Mermaid renders.

- [The loop](#the-loop)
- [Rules and their checks](#rules-and-their-checks)
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

## Rules and their checks

Every rule is a check you can run on your own draft, cheapest first. Crossings,
the title and the edge verbs are the three with measured effects on
comprehension; the rest are argued.

| Rule | Check |
|------|-------|
| At most 12 nodes, split at 20 | Count them |
| Edges no more than 1.5 × nodes | Count them |
| Title asserts a finding, not a category | Read it. Needing "and" means it is two diagrams |
| Every edge carries a verb | Count unlabelled edges; any at all fails |
| Node labels ≤ 4 words, edge labels ≤ 3 | Read the longest one |
| One abstraction level | Name each node's kind; more than one kind splits |
| At most four hues, none load-bearing alone | Count hues; a hue meaning two things fails |
| Zero edge crossings, at most one bend per edge | Count them. An unavoidable crossing meets near 90° |
| One axis semantic, held throughout | Name it in one word — time, call depth, layer. Cannot → re-lay out |
| The main path holds one direction | Trace it; zig-zag means re-lay out |
| Two or three visual weights | Count them. Exactly one means nothing is the subject |
| Every mark encodes something | Name the datum behind each non-text mark; delete the rest |
| Labels inline, no legend | Cover the legend. Any node now ambiguous fails |
| Shape never carries a category alone | Shape is not preattentive; it may only repeat what colour or position already says |
| It draws a mechanism, not a list | Delete every arrow. Same meaning → it was prose in boxes |
| Comparisons are small multiples | Same layout, same scale, one variable changed |

Then validate the syntax, and read the drawn diagram back against the
enumerated node and edge lists.

Claude over-generates nodes relative to other models with no matching gain in
edge quality, so the node ceiling binds harder than it feels like it should.
Deliberately absent, because the evidence does not support them: maximising
symmetry, orthogonality, uniform edge lengths, and Miller's "seven plus or
minus two" as a budget.

## Mermaid: choosing a type

GitHub renders far more than flowcharts. Picking the type that matches the
shape beats bending a flowchart into it.

Six of these subjects are UML subjects, marked below. For those, the notation
is not a style choice — read [uml.md](uml.md) before drawing one.

| The subject is | Type | UML |
|----------------|------|-----|
| A pipeline, a call graph, an architecture | `flowchart` | no |
| A workflow or algorithm | `flowchart` as an approximation | yes, activity |
| An exchange over time between parties | `sequenceDiagram` | yes |
| Modes and transitions of one object | `stateDiagram-v2` | yes |
| Classes, types, a data model | `classDiagram` | yes |
| Goals of actors against a system | `usecase-beta` | yes |
| Deployed units and their interfaces | none — approximate and say so | yes |
| Tables and their relations | `erDiagram` | no, crow's foot |
| Branch and release history | `gitGraph` | no |
| Events along a timeline | `timeline` | no |
| A hierarchy with no edges worth naming | `mindmap` | no |
| Proportions of a whole | `pie` | no |
| A series across an axis | `xychart-beta` | no |
| Flow volumes between stages | `sankey` | no |
| Nested sizes | `treemap` | no |
| Work in columns | `kanban` | no |
| Two-axis positioning | `quadrantChart` | no |

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

Go **monochrome plus one accent**. A diagram where every node carries its own
tint reads as fog: each one shouts quietly, so nothing is the subject. Give
the ordinary nodes a fill so faint it is barely a tint and a crisp opaque
stroke; spend colour on the one node, or the one path, the reader is meant to
land on.

```text
classDef node   fill:#80808014,stroke:#6e7781,stroke-width:1.25px
classDef accent fill:#0072B21f,stroke:#0072B2,stroke-width:2px
```

Why those values hold in both themes: a mid-grey at a fixed alpha sits between
the foreground and the background whichever way round they are, so
`#80808014` lands at 1.09 contrast on white and 1.08 on near-black — a tint
either way. The strokes are opaque because a neutral stroke never clears the
3:1 threshold on both grounds; `#6e7781` gives 4.55 and 4.16, `#0072B2` gives
5.19 and 3.65. Set no `color:` entry anywhere, so the theme keeps supplying
label colour.

Accent the edge too, when the path is the point:
`linkStyle 2 stroke:#0072B2,stroke-width:2px`.

Where a second accent is genuinely needed, `#D55E00` and `#009E73` are the
colourblind-safe partners for `#0072B2`. A third means you are colouring the
wrong thing.

Tighten the layout in frontmatter, which is safe because only `theme` and
`themeVariables` break light and dark:

```text
---
config:
  flowchart:
    nodeSpacing: 24
    rankSpacing: 40
    padding: 12
---
```

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

- **`usecase-beta` rejects any leading indentation.** Its keywords must start
  at column 0, unlike every other Mermaid diagram type.
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
