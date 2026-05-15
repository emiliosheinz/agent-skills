---
name: create-technical-design
description: >
  Creates technical design documents covering architecture, component responsibilities,
  data models, API contracts, and key decisions. Use when asked for a technical design,
  architecture document, system design, technical spec, or design doc.
---

# Technical Design Creator

Creates technical design documents that communicate architecture decisions, system structure, and key trade-offs. The output defines **what to build and how it is structured** — not how to execute the work step by step.

## Core Principle: Architecture Over Implementation

Before adding any detail, ask: "If we change frameworks or libraries, does this still apply?"

- YES → include it (architectural decision)
- NO → exclude it (implementation detail)

**Include**: API contracts, data schemas, component diagrams, technology choices with rationale, event/log schemas, integration boundaries.

**Exclude**: CLI commands, code snippets, framework-specific syntax, file paths, tool-specific configuration.

The technical design must survive implementation changes. If the team migrates ORMs or rewrites a service, the design doc should remain valid.

## Routing

- Understand the problem space first → `/contextualize`
- Define requirements → `/create-prd`
- Debate and decide options → `/create-rfc`
- Record a finalized decision → `/create-adr`
- Plan execution phases → `/create-implementation-plan`

## Document Sections

### Mandatory

If the user does not provide this information, ask using AskUserQuestion.

1. **Header & Metadata** — tech lead, team, epic/ticket link, status, dates
2. **Context** — current state, business domain, stakeholders (2–4 paragraphs)
3. **Problem Statement & Motivation** — specific problems with quantified impact, why now, cost of inaction
4. **Scope** — in-scope (V1/MVP, min 3 items), out-of-scope (min 3 items), future considerations (V2+)
5. **Technical Solution** — architecture overview with diagram (Mermaid), key components and responsibilities, data flow, API contracts, database changes
6. **Key Decisions & Trade-offs** — decisions made, alternatives rejected, rationale
7. **Risks** — min 3 risks with impact (H/M/L), probability (H/M/L), and mitigation

### Critical (required when applicable)

Determine applicability from project context. If applicable but missing, ask using AskUserQuestion.

| Section | Required When |
|---------|---------------|
| **Security Considerations** | Payments, auth, PII, external integrations |
| **Monitoring & Observability** | Production systems |

**Security**: auth/authz approach, encryption (at rest, in transit), PII handling and retention, compliance requirements (GDPR, PCI DSS), secrets management, webhook signature validation.

**Monitoring**: key metrics with alert thresholds, structured log format and what never to log (secrets, card numbers), alert severity and response actions.

### Suggested (offer based on project size)

After mandatory and critical sections, offer these. Skip most for small/simple projects; include all relevant ones for large/complex projects.

| Section | When Valuable |
|---------|---------------|
| **Alternatives Considered** | Multiple viable approaches existed |
| **Performance Requirements** | Latency/throughput/availability targets |
| **Dependencies** | External services, team dependencies, blockers |
| **Migration Plan** | Replacing existing systems |
| **Open Questions** | Unresolved decisions blocking implementation |
| **Success Metrics** | Business KPIs, adoption targets |
| **Glossary** | Domain-specific terminology |
| **Approval & Sign-off** | Requires stakeholder approval |

## Process

### Step 1: Check for Upstream Artifacts

Before gathering context, look for upstream artifacts in `.specs/[feature-slug]/`. If the feature slug is not yet known, ask for the feature name first and derive the slug.

- **CONTEXT.md found** (`.specs/[feature-slug]/CONTEXT.md`): Read it. Treat Problem Framing, Stakeholders, Constraints, Prior Art, and Codebase Findings as the source of truth — do **not** re-ask any of those topics. Carry forward unresolved open questions and address them during the interview.
- **PRD found** (`.specs/[feature-slug]/PRODUCT-REQUIREMENTS.md`): Read it. Use it as the source of truth for requirements, scope, and problem statement. Skip asking for information already covered by the PRD.
- **Both found**: Read both. The PRD takes precedence for requirements and scope; `CONTEXT.md` provides background on constraints, prior art, and codebase findings.
- **Neither found**: Proceed to gather context directly in Step 2.

### Step 2: Gather Context

**Do not draft anything yet.**

Gather missing context using `AskUserQuestion`. Capture intent from what the user has already shared — only ask for what is genuinely absent. Topics split into two groups:

**Group A — derivable from upstream artifacts (skip when present):**
- Project/feature name and type (new feature, integration, refactor/migration, etc.) *(from PRD if present)*
- Problem statement: what is broken or missing, who is affected, quantified impact *(from `CONTEXT.md` or PRD)*
- Known constraints — technical, legal, operational *(from `CONTEXT.md` or PRD)*
- Codebase realities — relevant modules, patterns, integration boundaries *(from `CONTEXT.md`)*

**Group B — technical-design-only (always cover):**
- Solution approach: what is being built at a high level and why this approach over alternatives
- Scope boundaries: what is explicitly in V1, what is explicitly deferred, and why *(from PRD if present)*
- Key technical decisions already made and the reasoning behind them
- Known technical risks specific to the chosen approach

**Context-gathering rules:**
- Ask one focused topic at a time using `AskUserQuestion`. You may group tightly related sub-questions, but never ask about multiple unrelated topics at once.
- When a response introduces a new trade-off, alternative, constraint, or integration boundary, follow that branch to resolution before moving on.
- When a decision depends on a prior unresolved decision, surface the dependency and resolve the blocker first.

### Step 3: Collect Mandatory Information

Before drafting, verify you can answer all of the following without inventing anything:
- Who owns this work (tech lead, team)?
- What specific problems are being solved, with quantified impact?
- What is in scope (min 3 items) and explicitly out of scope (min 3 items)?
- What is the high-level solution and architecture approach?
- What are at least 3 concrete risks with mitigation strategies?

If any cannot be answered from what the user has said, continue the interview.

### Step 4: Determine Critical Sections

Based on project type, identify required critical sections:
- Payment/auth/PII projects: Security is mandatory
- Production systems: Monitoring is mandatory

### Step 5: Offer Suggested Sections

Based on project size, offer relevant suggested sections. Ask: "Would you like to include any of these sections?"

### Step 6: Generate and Validate

**File location**: `.specs/[feature-slug]/TECHNICAL-DESIGN.md` — derive the slug from the feature name (lowercase, hyphen-separated). Create the directory if it does not exist.

Generate using the template below. Validate against the checklist. Highlight any gaps in the output summary.

## Template

```markdown
# Technical Design — [Project/Feature Name]

| Field        | Value                        |
| ------------ | ---------------------------- |
| Tech Lead    | @Name                        |
| Team         | Name1, Name2, Name3          |
| Epic/Ticket  | [Link]                       |
| Status       | Draft / In Review / Approved |
| Created      | YYYY-MM-DD                   |
| Last Updated | YYYY-MM-DD                   |

## Context

2–4 paragraphs: current state, related system/feature, business domain, stakeholders.

## Problem Statement & Motivation

### Problems We're Solving

- **[Problem 1]**: [Pain point] — Impact: [Quantify]
- **[Problem 2]**: [Pain point] — Impact: [Quantify]

### Why Now?

- [Business, technical, or user driver]

### Cost of Inaction

- **Business**: [Revenue loss, competitive disadvantage]
- **Technical**: [Debt accumulation, system degradation]
- **Users**: [Poor experience, churn risk]

## Scope

### In Scope (V1)

- [Capability 1]
- [Capability 2]
- [Capability 3]

### Out of Scope (V1)

- [Item 1] (deferred to V2)
- [Item 2] (not needed for MVP)
- [Item 3] (future enhancement)

### Future Considerations (V2+)

- [Item dependent on V1 validation]

## Technical Solution

### Architecture Overview

[High-level description of the solution]

**Key Components**:

- [Component A]: [responsibility]
- [Component B]: [responsibility]

**Architecture Diagram**:

[Mermaid diagram showing component interactions]

### Data Flow

1. [Step 1]: [Source] → [Destination] ([protocol/method])
2. [Step 2]: [Source] → [Destination] ([protocol/method])

### APIs & Endpoints

| Endpoint | Method | Description | Request | Response |
|----------|--------|-------------|---------|----------|
| [path]   | [verb] | [what it does] | [schema] | [schema/status] |

### Database Changes

**New Tables**: [TableName] — [description], fields with types, indexes with rationale

**Schema Modifications**: [Change with type, constraints, migration strategy]

## Key Decisions & Trade-offs

| Decision | Choice Made | Alternatives Rejected | Rationale |
|----------|-------------|-----------------------|-----------|
| [Topic]  | [Chosen]    | [Not chosen]          | [Why]     |

## Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| [Description] | H/M/L | H/M/L | [Strategy] |
```

Critical and suggested sections follow after Risks based on project type and size.

## Validation Checklist

- [ ] Header has tech lead, team, and epic link
- [ ] Context has 2+ paragraphs with background and domain
- [ ] Problem statement has 2+ specific problems with quantified impact
- [ ] Scope has 3+ in-scope and 3+ out-of-scope items
- [ ] Technical solution has architecture diagram and API contracts
- [ ] Key decisions table is present with rationale
- [ ] Risks has 3+ entries with impact, probability, and mitigation
- [ ] Security section present (payment/auth/PII projects)
- [ ] Monitoring section present (production systems)
- [ ] No implementation details (code snippets, CLI commands, framework syntax)

## Output Summary

After generating, provide:

```
Technical Design Created: "[Project Name]"
File: .specs/[feature-slug]/TECHNICAL-DESIGN.md

Sections Included:
- Mandatory (N/7): [list]
- Critical (N/N): [list]
- Suggested: [list]

Missing (if any):
- [Section]: [why it matters]

Suggested Next Steps:
- Share for team review
- Run /create-implementation-plan to plan execution
- [Other actionable items]
```
