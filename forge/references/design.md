# Design

**Goal:** define *how* the change is built and *how we will know it is correct*. Output:
`.specs/<slug>/design.md`. Skipped at `quick` size.

Load first: `.specs/<slug>/spec.md` (source of truth for requirements, ACs, scope) and
`.specs/<slug>/state.md` (size + Decisions log). Apply `.specs/<slug>/lessons.md`. If no
spec exists, gather the minimum design context inline (problem, constraints, codebase
realities) — but prefer running `forge specify` first for anything past `quick`.

## Core principle: architecture over implementation

Before adding any detail ask: *"if we swapped frameworks or libraries, would this still
apply?"* Yes → it belongs here. No → it's an implementation detail; leave it for execute.

**Include:** component responsibilities and interfaces, data models/schemas, API and
event contracts, integration boundaries, technology choices *with rationale*.
**Exclude:** code snippets, CLI commands, framework syntax, file paths, tool config.

The design must survive an implementation rewrite.

## What design covers

1. **Architecture overview** — how components interact. Add a Mermaid diagram for
   complex changes.
2. **Code-reuse analysis** — what already exists (from the spec's codebase findings)
   that this should reuse or extend, with locations. Do not design new what the repo
   already has.
3. **Components** — each with purpose, responsibility, interface/contract, dependencies.
4. **Data models** — schemas and relationships, if any.
5. **Error-handling matrix** — failure scenarios → user-facing/system outcome.
6. **Verification gates (required).** Define what makes the change *done and correct*:
   for each requirement/AC ID from the spec, the gate that proves it — a test type and
   what it must assert, a build/typecheck check, or a runtime/observability check. These
   gates are what `plan` attaches to tasks and what `execute`'s verifiers enforce.
   Reference AC IDs; never restate the criterion text.
7. **Architectural risks** — with impact, probability, and mitigation. (Execution and
   sequencing risks belong in `plan`, not here.)

## Apply active decisions

Read the Decisions log in `state.md`. Every active decision must be **consciously applied
or explicitly superseded with a reason** — silently ignoring one creates invisible
inconsistency. Record new architectural decisions you make back into the Decisions log
(or reach for `create-adr` if one deserves a standalone record).

## Critical sections (include when applicable)

- **Security** — when payments, auth, PII, or external integrations are involved:
  auth/authz, encryption at rest/in transit, PII handling and retention, compliance,
  secrets, webhook signature validation.
- **Monitoring/observability** — for production systems: key metrics + thresholds, log
  format and what must never be logged, alert severity and response.

For complex changes also offer, as useful: alternatives considered, performance targets,
external/team dependencies, migration plan.

## Research unknowns honestly

If the design depends on an unfamiliar library/service, verify before committing to it:
check the codebase, then docs, then the web (`WebFetch`/`WebSearch` when available).
Don't design around an assumed API.

## Write and route

Write `.specs/<slug>/design.md` from `templates/design.md`, sized per
`references/sizing.md`. Validate: every requirement has a verification gate; every active
decision applied or superseded; no implementation details leaked; risks have
mitigations. Update `state.md` (decisions, any size promotion with reason).

Recommend `forge plan` next (or `forge execute` for a small standard change whose task
breakdown is obvious — say so explicitly).
