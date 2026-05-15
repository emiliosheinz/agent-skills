---
name: contextualize
description: >
  Gathers the context that downstream spec and design work depends on. Use when
  you need to understand a problem space, surface constraints and prior art, or
  build a shared map of the codebase before writing a PRD, a technical design,
  or an implementation plan.
---

# Contextualize

Reach **shared understanding** with the user of the problem and its surroundings, then record that understanding so `create-prd`, `create-technical-design`, and `create-implementation-plan` can consume it without re-interviewing. The output is a structured `CONTEXT.md` file.

Shared understanding means: if you and the user were each asked separately to describe the problem, the constraints, and what already exists, your accounts would match. The interview is not over until that is true.

**Rule**: gather understanding, not decisions. Do not define success, propose solutions, sketch architectures, prioritize, or set scope — those belong to downstream skills. Capture the world as it is, not what it should become.

## Routing

- Turn context into requirements → `/create-prd`
- Turn context into architecture → `/create-technical-design`
- Propose and decide between options → `/create-rfc`

## Interview Discipline

Interview the user relentlessly until you reach shared understanding. There is no pre-defined script — at every turn you decide what to ask next based on what is still unclear. Apply the five rules below throughout.

1. **One question at a time.** Use `AskUserQuestion`. Never bundle unrelated topics in a single message. Tightly related sub-questions under one topic are fine.
2. **Walk the tree.** Each answer either closes a branch or opens new ones. When an answer surfaces something you did not previously know, follow that branch to resolution before returning to the parent.
3. **Always offer a recommended answer.** For every question, propose a default the user can accept or override. Derive it from the codebase, prior conversation, or stated context.
4. **Codebase first.** If a question can be answered by reading the code, prior decisions in `.specs/`, or git history, read first — do not ask. Save the user's attention for things only they know.
5. **Record, do not invent.** When the user does not know or has not decided, record it as an open question. Never paper over a gap with an assumption.

**How to decide what to ask next.** At every turn, ask yourself: *"If a peer asked me to describe this problem right now, where would I have to guess or hedge?"* Each place you would hedge is a gap. Each gap becomes the next branch.

**Stop condition.** The interview ends when you have **shared understanding** with the user — when you could describe the problem, the people affected, the constraints, the prior art, and the relevant codebase reality, and the user would say "yes, that's it." Concretely:
- Every open branch has been closed or recorded as an open question.
- No section of the template requires invention to be filled.
- The user confirms the captured understanding is faithful to theirs.

## Process

### Step 1 — Interview to shared understanding

Before reading code or fetching URLs, run the grilled interview. The five rules above govern *how* you ask; **shared understanding** governs *when you stop*. There is no pre-defined question list. Your job is to find the gaps and close them.

Start from what the user has already said in their initial request. Then, on every turn:

1. Identify all open branches of the problem space and decision tree.
2. Prioritize the branch that is most likely to block downstream progress.
3. Ask a single, targeted question and include your recommended answer.
4. If the answer creates a new branch, resolve it fully before returning to the parent branch.

### Signals that often hide gaps

Use these to spot branches, not as a checklist:

- The lived experience of the affected person: what they actually do, see, and feel today, not the abstraction.
- Adjacent stakeholders or downstream consumers the user did not name.
- The current state — workarounds, hacks, accepted pain — and how widespread it is.
- Hard boundaries: technical, legal, operational, time, team.
- What is genuinely settled vs. assumed-settled vs. still open.
- Prior attempts, internal patterns, or competitor approaches that would inform this one.

If the user's first message already covers one of these, do not re-ask. If a signal does not apply to the problem at hand, skip it. The interview is finished when neither of you would describe the problem differently, not when a list is checked off.

### Step 2 — Scan the codebase

Scan only what bears on the problem. Surface:

- Existing modules, services, or components in the same domain
- Established patterns: file structure, naming, data flow, testing approach
- Prior decisions in `.specs/` (ADRs, RFCs, PRDs, technical designs) that overlap
- Technical debt or known limitations visible in code or comments
- Integration boundaries: external services, APIs, data stores

Record findings as observations, not conclusions.

### Step 3 — External references and state of the art

Actively surface external work that would inform downstream decisions — not just URLs the user mentioned. Use `WebSearch` to find:

- Established approaches and state-of-the-art for this class of problem
- Open-source projects solving the same or analogous problem
- Standards, RFCs, or compliance documents that apply
- Published case studies, postmortems, or industry write-ups from teams that have tackled this before
- Competitor or analogous product behavior

Also fetch any URLs the user provided or that surfaced from the codebase scan.

**Rules:**
- Use `WebFetch` to actually read every source before recording it. Do not cite a URL from a search snippet alone.
- Do not invent URLs. Every recorded reference must be one you fetched.
- Stay on-problem. Skip tangential results, marketing fluff, or out-of-date material.
- Summarize what is relevant. Do not reproduce content verbatim.

**Where findings land in the template:**
- External *solutions* or competing approaches → **Prior Art** (with an Applicability rating).
- General references — standards, documentation, published patterns, case studies → **External References**.

The goal is to give downstream skills (`create-prd`, `create-technical-design`, `create-rfc`) a starting bibliography, not an exhaustive literature review. If a search returns nothing genuinely relevant, record "External search returned no relevant sources" and move on — do not pad the section.

### Step 4 — Synthesize

Write `.specs/[feature-slug]/CONTEXT.md` using the template below. Derive the slug from the feature or problem name (lowercase, hyphen-separated). Create the directory if it does not exist.

Before saving, verify:
- Every section is grounded in observed facts.
- Open questions are recorded honestly, not papered over.
- No success criterion, scope boundary, requirement, solution, or architecture appears anywhere.

### Step 5 — Route to the next skill

After saving the document:

```
Context captured: .specs/[feature-slug]/CONTEXT.md

Next:
- /create-prd to turn this into product requirements
- /create-technical-design if the work is primarily technical and requirements are already clear
- /create-rfc if a significant decision needs alignment first
```

## Template

```markdown
# Context — [Feature or Problem Name]

| Field   | Value         |
|---------|---------------|
| Author  | @Name         |
| Date    | YYYY-MM-DD    |

## Problem Framing

**What is happening today?** Describe the current state from the perspective of the affected person. No proposed solution.

**Who is affected?** Specific roles, contexts, and frequency.

**Cost of the status quo.** What pain or risk does the current state cause? Quantify where possible.

## Stakeholders & Users

| Stakeholder / User | Role or Context | Pain or Need |
|--------------------|-----------------|--------------|
| [Name or type] | [When/where they encounter this] | [What hurts or what is missing] |

Add one row per distinct stakeholder or user type.

## Constraints

Hard limits any solution must respect.

### Technical
- [Constraint]: [explanation]

### Legal / Compliance
- [Constraint]: [explanation]

### Operational
- [Constraint]: [explanation]

### Time / Team
- [Constraint]: [explanation]

Write "None identified." for any category with no constraints.

## Prior Art

What has been tried, built, or considered — internal or external?

| Solution / Approach | Source | Key Finding | Applicability |
|---------------------|--------|-------------|---------------|
| [Name or description] | [Internal / URL] | [What it reveals] | [High / Medium / Low — why] |

Write "None identified." if no relevant prior art was found.

## Codebase Findings

Observations from scanning the existing codebase that are relevant to this problem. Observations only — no conclusions about what to build.

- **[Module / file / pattern]**: [What it does and why it is relevant]

Write "Not applicable." if there is no relevant existing codebase.

## External References

| Reference | URL | Key Finding |
|-----------|-----|-------------|
| [Title or description] | [URL] | [What it contributes] |

Write "None." if no external sources were consulted.

## Open Questions

Known unknowns. Record honestly — do not paper over.

| Question | Why It Matters | Owner | Status |
|----------|---------------|-------|--------|
| [Question] | [Impact if unresolved] | [Person or team] | Open / In Progress / Resolved |

Write "None." if all questions have been resolved.
```

## Validation Checklist

- [ ] Problem Framing describes the situation, not a proposed fix
- [ ] No "desired state", success criterion, scope boundary, or requirement appears anywhere
- [ ] Stakeholders & Users has one row per distinct persona with their context
- [ ] All four Constraints categories are addressed (or explicitly marked "None identified.")
- [ ] Prior Art lists both internal and external sources where relevant
- [ ] Codebase Findings names specific modules, files, or patterns — not vague generalities
- [ ] External References include URL and key finding per entry
- [ ] Open Questions records every unresolved question — none silently dropped
- [ ] No architecture, technology choice, requirement, or success metric anywhere in the document
