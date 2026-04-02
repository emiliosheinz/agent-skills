---
name: plan-prd
description: Transforms a Product Requirement Document (PRD) into a phased execution plan using vertical slice methodology. Use when the user has a PRD and wants to plan implementation, convert requirements into actionable phases, or generate an execution plan.
---

# Plan PRD

**Goal:** convert a PRD into a phased execution plan. Prefer explicitness over interpretation. Prefer small composable tasks over large ambiguous ones.

## Process

### Step 1 — Locate the PRD

Look for the PRD at `.specs/[feature-slug]/PRD.md`. If the path is ambiguous or the file does not exist, ask the user to provide the PRD content or path before proceeding.

Read the entire PRD before doing anything else.

Read `.specs/[feature-slug]/STATE.md` to understand what has already been completed. Update it marking Step 1 as complete.

### Step 2 — Explore the codebase

Before identifying architectural decisions, explore the existing codebase to understand:
- Current project structure and conventions
- Existing patterns for routes, data access, and service boundaries
- Frameworks, libraries, and tools already in use
- Integration points relevant to the feature

This step grounds the plan in how the system actually works, not how it might be assumed to work. Architectural decisions in the next step must align with existing patterns unless the PRD explicitly calls for deviation.

Update STATE.md marking Step 2 as complete.

### Step 3 — Extract architectural decisions

Identify decisions that are durable — unlikely to change as phases are built — and must be consistent across all phases. Derive these from the PRD requirements, constraints, and the codebase exploration.

Durable decisions to identify:
- **Data models:** entity names, key fields, relationships
- **Route paths:** URL structures and API endpoint patterns
- **Schema shapes:** request/response contracts, storage structures
- **Integration boundaries:** which external systems are involved and how they are accessed
- **Auth strategy:** how access control is enforced

Do not invent decisions the PRD did not make. If a decision cannot be determined from the PRD or the codebase, record it as an open decision in the plan.

Update STATE.md marking Step 3 as complete.

### Step 4 — Draft vertical slices

Each phase is a **vertical slice**: a thin, complete pass through every layer the feature requires (data, logic, API, UI) that delivers one user-facing capability end-to-end. A phase is never a horizontal layer (schema alone, API alone, UI alone). It must be independently deliverable and produce something demonstrable.

**Ordering phases with tracer bullet thinking**

Start from the thinnest possible slice that proves the core path works — one user type, one happy path, no edge cases, no secondary flows. This is the tracer bullet phase. Each subsequent phase adds a new slice of user value on top of the verified foundation, ordered by PRD priority (P0 before P1 before P2). Edge cases, error states, and secondary flows come last.

The goal is that completing any phase produces a working, shippable increment — not groundwork for a future phase.

**Steps within a phase**

Each step must name what to build and where it connects. Include route paths, model names, and schema shapes where relevant. Do not name specific files, functions, or classes — these are implementation details that change as later phases are built.

**Tests**

Include a test step in a phase only when:
- The logic has non-trivial conditional branches where an incorrect branch would silently corrupt data or block core functionality
- The area is flagged as regression-prone or high-risk in the PRD

Do not add tests as a standalone phase. Do not write tests for coverage.

Update STATE.md marking Step 4 as complete.

### Step 5 — Review with the user

Before presenting to the user, verify that every requirement ID from the PRD appears in at least one phase's "PRD requirements satisfied" list. If any requirement is uncovered, assign it to a phase or explicitly mark it as deferred with a reason.

Present the plan as a list of phase titles with one-sentence objectives. Ask:
- Does the ordering make sense given your constraints?
- Are there phases that are too large or too small?
- Are there missing requirements or open decisions you can resolve now?

If the user surfaces gaps or changes, update the draft before writing the file.

Update STATE.md marking Step 5 as complete.

### Step 6 — Write the plan file

Write the final plan to `.specs/[feature-slug]/PLAN.md` in the same directory as the PRD.

Update STATE.md marking Step 6 as complete and append an `## Implementation` section with one checkbox per phase, derived from the phases just written:

```markdown
## Implementation
- [ ] Phase 1: [Name]
- [ ] Phase 2: [Name]
...
```

As each phase is implemented, the corresponding checkbox should be marked complete.

---

## Plan Template

```markdown
# Execution Plan: [Feature or Product Name]

> Source PRD: `.specs/[feature-slug]/PRD.md`
> Generated: [date]

## Architectural Decisions

Durable decisions that apply across all phases. Phases must not contradict these.

| Decision | Value | Rationale |
|----------|-------|-----------|
| [Decision type] | [Concrete value] | [Why this was chosen or implied by the PRD] |

### Open Decisions

Decisions required for implementation but not determinable from the PRD or codebase. Must be resolved before the affected phase begins.

| Decision | What needs to be decided | Blocks |
|----------|--------------------------|--------|
| [Decision] | [What needs to be decided and why it matters] | Phase N |

---

## Phase 1: [Name — short, outcome-oriented]

**Objective:** [One sentence: what this phase delivers and why it matters]

**PRD requirements satisfied:** [REQ-NNN, REQ-NNN, ...]

**Input:** [What must exist before this phase starts — outputs of previous phases or initial project state]

**Steps:**

1. [Concrete action. Include the specific route, model name, schema shape, or integration boundary where relevant.]
2. [Concrete action.]
3. [Continue until phase is fully specified. Each step must be unambiguous.]

**Output:** [What is verifiable or observable when all steps are done. Be specific: a route responds, a record is persisted, a UI state changes.]

---

## Phase 2: [Name]

[Repeat structure]

---

[Continue for each phase]
```

---

## Heuristics

### A phase is too large if:
- It satisfies more than 4–5 PRD requirements
- The output cannot be verified without completing all steps first
- It requires building multiple unrelated capabilities simultaneously

### A phase is too small if:
- Its output has no user-observable effect on its own
- It only sets up infrastructure without using it

### A step is too vague if:
- It uses words like "implement", "set up", "handle", or "add support for" without specifying what
- It could be interpreted in more than one meaningfully different way

### Replace vague steps with:
- "Create a `POST /api/[resource]` endpoint that accepts `{ field: type, ... }` and persists a `[ModelName]` record"
- "Render the `[screen name]` screen, showing `[field]` from the `[ModelName]` returned by `GET /api/[resource]`"
- "Extend the `[ModelName]` schema to include `[field]: [type]`, migrating existing records to `[default value]`"

---

## Common Mistakes

**Horizontal phases**
Wrong: Phase 1 — Database schema; Phase 2 — API layer; Phase 3 — UI
Right: Phase 1 — User can create and view a [resource] end-to-end

**Replicating the PRD**
Wrong: "Users need to be able to track their orders" (problem statement)
Right: "Create a `GET /orders/:id/status` endpoint returning `{ status, updatedAt }` and render it on the order detail screen"

**Infrastructure phase with no user outcome**
Wrong: Phase 1 — Project setup and scaffolding; Phase 2 — Database schema and migrations
Right: Phase 1 — User can [core action] end-to-end: route accepts input, persists a [ModelName] record, and returns the result

**Premature specificity**
Wrong: "Create `src/services/OrderService.ts` with a `getOrderById` method"
Right: "Implement the order lookup logic in the service layer, accepting an order ID and returning the order with its current status"

**Tests as a phase**
Wrong: Phase 5 — Write tests
Right: Include a test step inside Phase 2 because the payment processing logic has non-trivial conditional branches that are high-risk
