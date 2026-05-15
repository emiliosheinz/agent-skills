---
name: create-prd
description: >
  Creates structured, explicit, and detailed Product Requirement Documents (PRDs).
  Use when asked to create or write a PRD, define product requirements, specify
  what to build, or capture requirements before implementation begins.
---

# PRD Creator 

**Goal:** produce a PRD that is precise, self-contained, and unambiguous. A reader should know exactly what to build and why without asking follow-up questions.

## Routing

- Understand the problem space first → `/contextualize`
- Decision still needs alignment → `/create-rfc`
- Record a finalized decision → `/create-adr`
- Document architecture → `/create-technical-design`
- Plan execution → `/create-implementation-plan`

## Process

### Step 1 — Check for upstream context

Before gathering anything, check for an existing context document at `.specs/[feature-slug]/CONTEXT.md`. If the feature slug is not yet known, ask for the feature name first and derive the slug.

- **CONTEXT.md found**: Read it. Treat it as the source of truth for problem framing, stakeholders, hard constraints, prior art, codebase findings, and open questions. Do **not** re-ask any of those topics during the interview — only ask about what `CONTEXT.md` deliberately excludes (success criteria, scope boundaries, non-goals, priority, edge-case behavior, failure conditions). Carry forward unresolved open questions from `CONTEXT.md` and address them as part of Step 2.
- **CONTEXT.md not found**: Proceed directly to Step 2 and gather everything inline.

### Step 2 — Gather context

**Do not draft anything yet.**

The conversation must cover two groups of topics. If `CONTEXT.md` was found in Step 1, **skip Group A entirely** — it is already captured. Otherwise, cover both.

**Group A — derivable from `CONTEXT.md` (skip when present):**

- The core problem from the user’s perspective, including the specific pain points and consequences of leaving it unsolved.
- All target users — primary, secondary, and edge-case personas — and their differentiated goals, constraints, and behaviors.
- Hard constraints (technical, legal, operational).

**Group B — PRD-only (always cover):**

- The measurable outcomes (quantitative or qualitative) that indicate the solution is successful post-implementation.
- Scope boundaries: what is included, what is explicitly excluded, and what is intentionally deferred, with justification for each.
- Key assumptions, with explicit callouts for which assumptions would invalidate the PRD if proven false.
- Behavior across edge conditions — empty states, error states, onboarding/first-time use, and advanced/power-user scenarios.
- Prioritization: must-have vs nice-to-have, with rationale for each classification.
- Adjacent problem areas or extensions intentionally not addressed in this iteration, with reasons.
- Failure conditions: specific outcomes, gaps, or user/stakeholder reactions that would indicate the solution was incorrectly designed or implemented.

**How to gather context:**
- Use the `AskUserQuestion` tool to ask one focused topic at a time. You may group tightly related sub-questions under one topic, but never ask about multiple unrelated topics in a single message.
- Capture intent from what the user has already shared — only ask for what is genuinely missing.
- When a response introduces a new edge case, persona variation, scope boundary, or constraint, follow that branch before moving to the next topic.
- When a decision depends on a prior unresolved decision, surface the dependency and resolve the blocker before continuing.
- If the user cannot answer a question, record it as an open question in the PRD — do not invent an answer or skip it silently.

**Additional rules:**
- Do not proceed until you can state all of the above without inventing anything.
- When asking questions, use dedicated tools (e.g. AskUserQuestion) to present them clearly.
- Treat every open branch as a blocker. A branch is open if any answer is vague, conditional, or incomplete. Resolve it before moving on.

**Before moving to Step 3, verify internally that you can answer all of the following without inventing anything:**
- What is the core problem from the user's perspective? *(from `CONTEXT.md` if present)*
- Who are the users and what does each need? *(from `CONTEXT.md` if present)*
- What are the hard constraints? *(from `CONTEXT.md` if present)*
- What does success look like, measurably?
- What is explicitly out of scope, and why?

If any cannot be answered from what the user (or `CONTEXT.md`) has said, continue the interview.

### Step 3 — Draft using the template

Follow the template below. Every section is required. Write "None." for sections with no content — do not omit them.

**File location:** Create the PRD to `.specs/[feature-slug]/PRODUCT-REQUIREMENTS.md`. Derive the slug from the feature name: lowercase, words separated by hyphens (e.g. `user-onboarding`, `payment-refunds`). Create the directory if it does not exist. This keeps the PRD co-located with related documents (plans, specs) that will be added later for the same initiative.

### Step 4 — Review with the user

Present the draft. Ask:
- Are all non-goals captured?
- Is there anything missing or incorrect?
- Are the success criteria measurable as stated?

If the feedback surfaces new information, gaps, or contradictions, return to Step 2 and continue the interview before updating the draft. Repeat steps 2–4 until the PRD is complete and accurate.

Once the PRD is finalized, offer the natural next step:

```
PRD created at .specs/[feature-slug]/PRODUCT-REQUIREMENTS.md

Suggested next steps:
- Run /create-technical-design to define the architecture
- Run /create-rfc if a significant decision still needs alignment
- Run /create-implementation-plan to jump straight to execution planning (skips technical design)
```

## PRD Template

```markdown
# [Feature or Product Name]

## Overview

3–5 sentences covering: what this is, the core problem it solves, and who it's for.
Do not describe implementation or internal mechanics.

## Problem Statement

**Problem:** Describe the gap between the current state and the desired state, from the user's perspective.

**Affected users:** Who has this problem? Be specific about role, context, and frequency.

**Impact:** What happens if this problem is not solved? Use data or evidence where available.

## Target Users

| User | Context | Primary Need |
|------|---------|--------------|
| [User type] | [When/where they encounter this] | [What they need to accomplish] |

Add one row per distinct user type. If the same user appears in multiple contexts, add a row for each.

## Goals & Success Criteria

2–5 entries maximum. Each must be falsifiable — something that can be verified as true or false after shipping.

| Goal | Success Criterion | How to Measure |
|------|------------------|----------------|
| [Goal] | [Specific, observable outcome] | [Metric or verification method] |

Reject vague criteria: "users are happy", "performance improves", "adoption grows". Write instead: "task completion rate ≥ 85%", "support tickets for X decrease by 30% within 60 days of launch".

## Scope

### In Scope

Discrete, verifiable capabilities this PRD covers.

- [Capability]

### Non-Goals

What this PRD explicitly does not address. If a reader could reasonably assume something is in scope, it must appear here with a reason.

- [Topic] — [why it's excluded]

## Requirements

Functional requirements only — what the system must do, not how it does it.

**Priority labels:**
- **P0** — launch blocker; must ship
- **P1** — high value; should ship
- **P2** — nice to have; revisit later

Group by user or workflow where it aids clarity.

### [Group name]

- **[P0|P1|P2]** `[PREFIX-NNN]` The system must/should [verb] [object] [condition or outcome].

**Rules for writing requirements:**
- Use "must" for P0 and P1; use "should" for P2.
- One requirement per bullet — no AND; split compound requirements.
- Each requirement is independently verifiable as pass/fail.
- No implementation details: no tech stack, no data store names, no protocol choices.
- State the user outcome, not the internal mechanism.
- Requirement IDs use a prefix derived from the feature slug, uppercased and shortened to 3–5 characters (e.g. feature `user-onboarding` → prefix `ONBD`; `payment-refunds` → `PAY`). IDs are sequential within the PRD: `ONBD-01`, `ONBD-02`.

## Constraints & Assumptions

### Constraints

Hard limits that bound the solution. Non-negotiable.

- [Constraint]: [explanation]

### Assumptions

Things treated as true for this PRD. If an assumption is invalidated, the PRD must be revisited.

- [Assumption]: [what we believe and why]

## Open Questions

Unresolved questions that must be answered before or during implementation.

| Question | Why It Matters | Owner | Status |
|----------|---------------|-------|--------|
| [Question] | [Impact if unresolved] | [Person or team] | Open / Resolved |

Write "None." if there are no open questions.

## Additional Notes

Any relevant information that doesn't fit in the above sections but is important for context or future reference.
```

## Heuristics

### Include if any of the following are true

- It would change what gets built or how it is prioritized.
- Reasonable people could interpret it differently without explicit guidance.
- It defines a boundary between what is in scope and what is not.
- It is a constraint that eliminates valid solution approaches.
- It is an assumption that, if false, would invalidate the PRD.

### Exclude if any of the following are true

- It describes *how* to build something: architecture, tech stack, data models, API contracts, code.
- It can only be determined after implementation begins.
- It is a timeline, milestone, headcount, or team assignment.
- It requires a domain specialist to interpret — link to a separate spec instead.
- It duplicates content already present in another section.

### Requirement quality checklist

Before finalizing requirements, verify each one:

- [ ] Verifiable as pass/fail independently
- [ ] Does not contain "and" (split if so)
- [ ] Does not name a specific implementation technology
- [ ] States user outcome, not internal mechanism
- [ ] Priority label (P0/P1/P2) assigned

### Scope quality checklist

- [ ] Every non-goal includes a reason for exclusion
- [ ] Non-goals cover anything a reader might reasonably assume is in scope
- [ ] In-scope items are discrete and independently verifiable

## Common Mistakes

**Writing a solution as the problem**
Wrong: "We need a dashboard for order status."
Right: "Customers cannot determine the current status of their orders without contacting support."

**Vague success criteria**
Wrong: "Improve user engagement."
Right: "30-day active user retention increases from 42% to 55%."

**Requirements that embed implementation**
Wrong: "The system must store user preferences in a Redis cache."
Right: "The system must persist user preferences across sessions."

**Missing non-goals that readers will assume**
If you are building order tracking but not order editing, "order editing" must appear in non-goals — not just be absent from the in-scope list.

**Conflating constraints with requirements**
A constraint limits *how* you can solve the problem ("must comply with GDPR"). A requirement defines *what* the system must do ("must allow users to delete their account data"). Keep them separate.

