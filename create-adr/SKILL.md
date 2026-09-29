---
name: create-adr
description: >
  Creates Architecture Decision Records (ADRs) — concise, durable documents that
  capture the context, decision, and consequences of significant architectural
  choices so future team members understand *why* things are the way they are.
  TRIGGER when: the user asks to create or write an ADR, document a decision,
  record why something was chosen, capture an architectural decision, or preserve
  the reasoning behind a finalized technical choice. SKIP for: decisions that
  have not been made yet (use `/create-rfc`), implementation planning or
  breaking work into tasks (use `/forge plan`), or general documentation that
  is not a decision record.
metadata:
  author: emiliosheinz
  version: 2.0.0
compatibility: >
  Works in any repository. No project-specific setup — the ADR directory is
  discovered from the repo layout, or created on first use.
---

# Create ADR

Produce one ADR per invocation. An ADR records a decision that has already
been made; if the decision is still open, use `/create-rfc`. Follow the
five-step process — do not skip Step 2 (validate mandatory fields) or draft
before every mandatory field is present.

## Hard rules

- **Never invent facts.** If a mandatory field is missing, ask. Never fill
  Context, Decision, or Consequences with plausible-sounding filler.
- **Never edit an existing ADR to change the decision.** Supersede with a new
  ADR and link back. ADRs are historical records.
- **Never skip trade-offs.** Consequences must be honest — include what
  becomes harder, not just what becomes easier.
- **Never write in a language other than the user's.** Match the language
  the user is using in this session.

## Dispatch

Run the process in order. **Read the matching reference file fully before
acting** — it is the playbook for that step.

| Step | Read | Purpose |
|------|------|---------|
| 1 — Gather context | `references/process.md` | Ask for decision, format, status, supersedes |
| 2 — Validate mandatory fields | `references/process.md` | Ensure title, date, status, context, decision, consequences are present |
| 3 — Pick format | `references/formats.md` | MADR (default) / Nygard / Y-Statement |
| 4 — Assign number | `references/numbering.md` | Scan directory, assign next sequential number |
| 5 — Generate + place | `references/process.md` + one of `templates/adr-{madr,nygard,y-statement}.md` | Fill template, run quality checklist, confirm file location |

Run the quality checklist (`references/quality.md`) before finalizing —
titles, honest trade-offs, options actually compared, naming convention.

## Templates

Pure markdown scaffolds; load only the one for the chosen format:

| Format | Template |
|--------|----------|
| MADR (default) | `templates/adr-madr.md` |
| Nygard | `templates/adr-nygard.md` |
| Y-Statement | `templates/adr-y-statement.md` |

## Universal rules

1. **Honesty.** Record trade-offs, unknowns, and open questions honestly.
   Never cover a gap with an invented answer. If a field cannot be filled,
   ask or leave an italicized placeholder (`*to be confirmed*`).
2. **Immutability.** ADRs are historical records. Never edit the decision
   after the fact — supersede with a new ADR and link `Superseded by
   ADR-{NNN}` on the old one.
3. **Short is better.** 200–500 words is ideal. If longer, move detail to a
   linked design doc or RFC.
4. **Date everything.** What seems obvious now will not be in three years.
5. **Language adaptation.** Always write the ADR in the user's language.
6. **Confirm before writing.** Suggest the file path in Step 5; write only
   after the user confirms placement.

## Sibling skills

Reach for these at any point in the flow:

- **`/create-rfc`** — the decision has *not* been made yet. Use RFC to
  propose options, gather feedback, and drive alignment. Once the decision
  is made, come back to `/create-adr` to record it.
- **`/forge`** — spec-driven implementation. Use `/forge specify | design |
  plan | execute` when the ADR is decided and you need to build the thing.
  An ADR often lands as a link in a forge `design.md`.

## Attribution

Based on [create-adr](https://github.com/tech-leads-club/agent-skills/blob/main/packages/skills-catalog/skills/(creation)/create-adr/SKILL.md)
by [Tech Leads Club](https://github.com/tech-leads-club), licensed under
[CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/). Changes have been
made to the original.
