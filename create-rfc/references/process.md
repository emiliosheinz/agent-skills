# Process — Creating an RFC

Five sequential steps. Do not skip. Do not draft the document before every
mandatory field is present.

## Step 1 — Gather context

If the user supplied a topic + impact + at least two options, skip to
Step 2. Otherwise ask what you are missing using `AskUserQuestion` (bundle
related questions into a single call, one question per topic):

- **Topic** — what change is being proposed?
- **Impact level** — HIGH (multiple teams/systems/users) / MEDIUM (one
  team or system) / LOW (limited scope, easily reversible).
- **Urgency** — is there a deadline, or roadmap timing?
- **Options in mind** — does the user have 2+ options to compare, a
  preferred one needing alternatives fleshed out, or nothing yet?

Fall back to plain-text questions if `AskUserQuestion` is unavailable.
Never bundle unrelated questions.

## Step 2 — Validate mandatory fields

An RFC is worthless without these — ask for anything missing before
drafting.

- **Title** — clear, action-oriented, specific
- **Background** — current state + why this matters now + cost of inaction
- **Driver** — who is proposing / responsible for the decision
- **Approver(s)** — who needs to approve
- **Impact level** — HIGH / MEDIUM / LOW
- **At least 1 explicit assumption** with confidence level
- **At least 2 decision criteria**, with weights, stated **before** the
  options
- **At least 2 options considered**, including "do nothing" when relevant
- **Recommended option** with rationale tied back to the decision criteria

Recommended (nice-to-have, don't block on these):
- Relevant data (metrics, benchmarks, research)
- Pros/cons per option
- Cost estimate per option
- Resources / prior art

## Step 3 — Tailor sections to RFC type

Detect the RFC type from context (or ask). Load `references/types.md` and
apply the additional focus areas that type calls for. The template
(`templates/rfc.md`) covers the universal skeleton; the type-specific
guidance tells you what extra fields to fill under Options or Background.

## Step 4 — Generate the document

Read `templates/rfc.md` and fill from the gathered context. Delete any
recommended section that would be empty. Do not invent values for
unknowns — either ask, or leave as an italicized placeholder
(`*to be confirmed*`).

Assign the RFC number per `references/numbering.md`. Before finalizing,
run through `references/quality.md`.

## Step 5 — Confirm placement and offer next steps

Suggest `docs/rfcs/{NNN}-{kebab-case-title}.md` (or the directory the
scan found in Step 4). Confirm placement with the user before writing.

Print a compact summary after writing:

```
RFC Created: "RFC-{NNN}: {Title}"
File: docs/rfcs/{NNN}-{kebab-case-title}.md
Impact: {HIGH | MEDIUM | LOW}
Status: NOT STARTED

Suggested next steps:
- Share with Contributors for feedback
- Set a decision deadline
- Schedule a review meeting with Approvers
- Link related tickets

Once the decision is made, consider `/create-adr` to record it as an
immutable architecture decision, or `/forge specify` to break the chosen
option into shippable work.
```
