---
name: write-prd
description: Guides creation of structured, explicit, and detailed Product Requirement Documents (PRDs). Use when the user wants to write a PRD, define a feature, or plan what to build before implementation begins.
---

# Write PRD

**Goal:** produce a PRD that is precise, self-contained, and unambiguous. A reader should know exactly what to build and why without asking follow-up questions.

## Process

### Step 1 — Gather context

Ask the user these questions. Do not proceed until questions 1–3 are answered with specifics.

1. **What problem are you solving?** State it as a user or business problem, not as a feature request.
2. **Who has this problem?** Name the user type, their context, and how often they face it.
3. **What does success look like?** What measurable outcome signals this worked?
4. **What is explicitly out of scope?** What related problems are you intentionally not solving?
5. **What constraints exist?** Hard limits on compatibility, compliance, budget, or technical non-negotiables.
6. **What assumptions are you making?** Things you're treating as true that could turn out false.

Questions 4–6 may be answered with "none" but must be explicitly addressed.

### Step 2 — Interview until fully understood

Do not draft anything yet. Interview the user until you have a complete, shared understanding of the problem and what success looks like. Be relentless: walk down every branch of the product decision tree, resolving dependencies between decisions one by one before moving on.

**How to conduct the interview:**
- Ask one focused question at a time — not a list. Wait for the answer before asking the next.
- When an answer opens a new branch (edge case, persona variation, scope boundary), follow it to resolution before continuing.
- When a decision depends on a prior unresolved decision, surface the dependency explicitly and resolve the blocker first.
- Push back on vague answers. "It depends" is not an answer — ask what it depends on, then ask about each case.
- Keep going until you can state the full scope, requirements, and success criteria without needing to invent anything yourself.

**Topics to cover before moving on:**

- Every distinct user type and their specific needs (not just the primary persona)
- What happens at the edges: empty states, error states, first-time use, power use
- Where the scope boundary is, and why — not just what's in, but what's explicitly adjacent and deferred
- Which requirements are must-haves vs. nice-to-haves, and why
- What would make a stakeholder say "this shipped wrong"

If the user cannot answer a question, record it as an open question in the PRD — do not invent an answer.

### Step 3 — Draft using the template

Follow the template below. Every section is required. Write "None." for sections with no content — do not omit them.

**File location:** Write the PRD to `.specs/[feature-slug]/PRD.md`. Derive the slug from the feature name: lowercase, words separated by hyphens (e.g. `user-onboarding`, `payment-refunds`). Create the directory if it does not exist. This keeps the PRD co-located with related documents (plans, specs) that will be added later for the same initiative.

### Step 4 — Review with the user

Present the draft. Ask:
- Are all non-goals captured?
- Is there anything missing or incorrect?
- Are the success criteria measurable as stated?

If the feedback surfaces new information, gaps, or contradictions, return to Step 2 and continue the interview before updating the draft. Repeat steps 2–4 until the PRD is complete and accurate.

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

- **[P0|P1|P2]** `[REQ-NNN]` The system must/should [verb] [object] [condition or outcome].

**Rules for writing requirements:**
- Use "must" for P0 and P1; use "should" for P2.
- One requirement per bullet — no AND; split compound requirements.
- Each requirement is independently verifiable as pass/fail.
- No implementation details: no tech stack, no data store names, no protocol choices.
- State the user outcome, not the internal mechanism.

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
