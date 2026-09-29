# create-rfc

Agent skill that produces one Request for Comments document per
invocation — a structured proposal that compares alternatives against
explicit criteria and drives aligned decisions across teams.

## When to use

Invoke this skill when you want to:

- Propose a significant technical, process, or product change before
  committing to it.
- Compare multiple options and document the reasoning behind the chosen
  direction.
- Get buy-in from stakeholders or approvers before acting.
- Align multiple teams on a direction with a formal, reviewable artifact.

Reach for **`/create-adr`** instead when the decision has already been
made — RFC decides; ADR records.

## Requirements

- Any agent runtime that can read markdown skills (Claude Code, OpenCode,
  Cursor, etc.).
- No language-specific tooling, no scripts.

## How it works

Five sequential steps, each guided by a small reference file loaded on
demand:

1. **Gather context** — asks for the topic, impact level, urgency, and
   the options in mind. Does not draft anything until the mandatory
   fields are available.
2. **Validate mandatory fields** — ensures title, background, driver,
   approver(s), impact, at least one assumption, at least two weighted
   decision criteria, and at least two options are present before
   proceeding.
3. **Tailor to RFC type** — technical / process / product / vendor /
   policy each get additional focus areas. See `references/types.md`.
4. **Generate the document** — fills `templates/rfc.md`, assigns the next
   sequential RFC number (`docs/rfcs/` and variants), runs the quality
   checklist (`references/quality.md`).
5. **Place and offer next steps** — confirms the file location with you,
   then prints a compact summary with suggested follow-ups (share for
   feedback, set a deadline, schedule review).

The skill loads only the reference and template it needs for the current
step, which keeps per-invocation context small.

## Output

A `NNN-kebab-case-title.md` file at `docs/rfcs/` (or a user-specified
directory) containing:

- Header and metadata (Driver, Approvers, Contributors, Status, Impact,
  Due Date)
- Background — current state, problem, why now, cost of inaction
- Assumptions — explicit, with confidence levels and invalidation
  triggers
- Decision criteria — defined before options, with weights and
  must-haves identified
- Options considered — minimum two, including "do nothing" for
  significant changes
- Pros and cons per option — honest assessment against the decision
  criteria
- Estimated cost per option (effort / complexity / monetary)
- Action items — concrete next steps after the decision
- Outcome — left as a placeholder to be filled when the decision is made

## Installation

Install to the current project:

```bash
npx skills add emiliosheinz/agent-skills --skill create-rfc
```

Install globally (available across all projects):

```bash
npx skills add emiliosheinz/agent-skills --skill create-rfc --global
```

See the [root README](../README.md) for installing all skills at once.

## Usage

```
/create-rfc
```

Or with a starter phrase:

```
/create-rfc migrate CI from Jenkins to GitHub Actions
```

Provide as much detail as possible about the change you want to propose,
the alternatives you have in mind, and who needs to approve the
decision — the more context, the more useful the RFC will be to
reviewers.

## Related skills

- **`/create-adr`** — record the decision once the RFC is decided.
- **`/forge`** — spec-driven implementation once the RFC is decided.

## Attribution

Based on [create-rfc](https://github.com/tech-leads-club/agent-skills/blob/main/packages/skills-catalog/skills/(creation)/create-rfc/SKILL.md)
by [Tech Leads Club](https://github.com/tech-leads-club), licensed under
[CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/). Changes have been
made to the original.
