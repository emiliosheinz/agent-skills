---
name: create-rfc
description: >
  Writes a Request for Comments (RFC): proposes a change, compares alternatives
  against explicit decision criteria, and drives a decision across teams.
  TRIGGER when: the user asks to create or write an RFC,
  draft a proposal, compare options, align stakeholders, get approval for a
  significant change, or propose a technical/process/product/vendor/policy
  change before deciding. SKIP for: decisions that have already been made (use
  `/create-adr` to record them), implementation planning or breaking work into
  tasks (use `/forge plan`), or informal one-off asks that don't need
  stakeholder alignment.
metadata:
  author: emiliosheinz
  version: 2.0.0
compatibility: >
  Works in any repository. No project-specific setup — the RFC directory is
  discovered from the repo layout, or created on first use.
---

# Create RFC

Produce one RFC per invocation. An RFC proposes a decision that has *not*
yet been made and drives stakeholder alignment; if the decision is already
made, use `/create-adr` to record it. Follow the five-step process in
order: Step 2 validates the mandatory fields, and drafting starts once every
one of them is present.

## Hard rules

- **Never invent facts.** If a mandatory field is missing, ask. Never fill
  Background, Assumptions, or Options with plausible-sounding filler.
- **Never present a foregone conclusion.** If only one option is real, the
  document is an ADR, not an RFC — use `/create-adr` instead.
- **Decision criteria come before options.** Criteria written after options
  look like justification for a preferred choice.
- **Include "do nothing" as an explicit option** for any significant change —
  Universal rule 2 defines which changes those are.
- **Never skip trade-offs.** Every option needs honest cons alongside pros.
- **Write in the user's language** — the one they are using in this session,
  every section of the document included.

## Dispatch

Run the process in order. **Read the matching reference file fully before
acting** — it is the playbook for that step.

| Step | Read | Purpose |
|------|------|---------|
| 1 — Gather context | `references/process.md` | Ask for topic, impact, urgency, options in mind |
| 2 — Validate mandatory fields | `references/process.md` | Ensure title, background, RACI, criteria, options, recommendation are present |
| 3 — Tailor to RFC type | `references/types.md` | Technical / Process / Product / Vendor / Policy — extra focus areas |
| 4 — Generate | `templates/rfc.md` + `references/numbering.md` | Fill template, assign number, run quality checklist |
| 5 — Place + next steps | `references/process.md` | Confirm file location, print summary + follow-ups |

Run the quality checklist (`references/quality.md`) before finalizing —
honest options, weighted criteria, quantified background, explicit
assumptions.

## Template

Pure markdown scaffold. Load only when writing:

- `templates/rfc.md` — mandatory + recommended sections. Delete any
  recommended section that would be empty; keep every mandatory section
  even if the value is `*to be confirmed*`.

## Universal rules

1. **Honesty.** Options are compared honestly against the criteria; pros
   and cons are real; assumptions are surfaced with confidence levels and
   invalidation triggers.
2. **"Do nothing" is always an option** for significant changes — it forces
   honest evaluation of whether change is worth the cost. **Significant means
   the impact level recorded in Step 1 is HIGH or MEDIUM** (multiple
   teams/systems/users, or one whole team or system). A LOW-impact change —
   limited scope, easily reversible — may omit the status quo, and says so in
   one line rather than leaving the reader to wonder. This is the only
   definition of *significant* in this skill; every other mention keys to it.
3. **Outcome is a placeholder** during drafting — fill it after the
   decision is made, then link to the resulting ADR if the decision is
   worth preserving.
4. **RFCs are for decisions, not implementation.** Once decided, hand off
   to `/create-adr` (record) and `/forge` (build).
5. **Date everything** and record the impact level up front.
6. **Confirm before writing.** Suggest the file path in Step 5; write only
   after the user confirms placement.

## Sibling skills

Reach for these at any point in the flow:

- **`/create-adr`** — the decision *has* been made. Use ADR to record the
  what/why/consequences as an immutable historical record. RFC → decision →
  ADR is the natural flow for significant choices.
- **`/forge`** — spec-driven implementation. Once the RFC is decided, use
  `/forge specify | design | plan | execute` to break the chosen option
  into shippable work.

## Attribution

Based on [create-rfc](https://github.com/tech-leads-club/agent-skills/blob/main/packages/skills-catalog/skills/(creation)/create-rfc/SKILL.md)
by [Tech Leads Club](https://github.com/tech-leads-club), licensed under
[CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/). Changes have been
made to the original.
