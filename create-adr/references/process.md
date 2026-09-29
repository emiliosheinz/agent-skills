# Process — Creating an ADR

Five sequential steps. Do not skip. Do not draft the document before every
mandatory field is present.

## Step 1 — Gather context

If the user supplied a decision statement + status + at least one option
comparison, skip to Step 2. Otherwise ask what you are missing using
`AskUserQuestion` (bundle related questions into a single call, one question
per topic):

- **The decision** (noun phrase, not a question — e.g., "Use Redis for
  session storage").
- **Format** — see `references/formats.md` for the selection table. Default
  to MADR unless the user asks otherwise or the decision is trivially small.
- **Status** — Accepted / Proposed / Deprecated / Superseded.
- **Supersedes?** — if yes, ask for the ADR number/title being replaced.

Fall back to plain-text questions if `AskUserQuestion` is unavailable. Never
bundle unrelated questions.

## Step 2 — Validate mandatory fields

An ADR is worthless without these — ask for anything missing before drafting.

- **Title** (noun phrase, not a question)
- **Date** (or today's date)
- **Status**
- **Context** — the forces, constraints, and situation that made this
  decision necessary
- **Decision itself** — what was chosen and why
- **Consequences** — what becomes easier, harder, or different

Recommended (nice-to-have, don't block on these):
- Decision drivers (weighted criteria)
- Options considered
- Pros/cons per option
- Decision outcome rationale
- Links to related ADRs, RFCs, tickets

## Step 3 — Assign the ADR number

See `references/numbering.md` for the directory scan and fallback.

## Step 4 — Generate the document

Read the template that matches the selected format:

- MADR → `templates/adr-madr.md`
- Nygard → `templates/adr-nygard.md`
- Y-Statement → `templates/adr-y-statement.md`

Fill from the gathered context. Delete any section the template marks
optional if it would be empty. Do not invent values for unknowns — either
ask, or leave as an italicized placeholder (`*to be confirmed*`).

Before finalizing, run through `references/quality.md`.

## Step 5 — Offer file placement

Suggest `docs/adr/{NNN}-{kebab-case-title}.md` (or the directory the scan
found in Step 3). Confirm placement with the user before writing.

```
ADR Created: "ADR-{NNN}: {Title}"

Suggested path: docs/adr/{NNN}-{kebab-case-title}.md

Save to:
  1. docs/adr/ (recommended)
  2. A different location — tell me where
  3. Just show the content, I'll place it manually
```

If the user picks (1) or (2), write the file. If (3), print the ADR in a
fenced code block and stop.
