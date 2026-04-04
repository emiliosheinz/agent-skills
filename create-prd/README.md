# create-prd

A Claude Code skill that guides the creation of structured, explicit, and detailed Product Requirement Documents (PRDs).

## When to use

Invoke this skill when you want to:

- Write a PRD for a new feature or product
- Define requirements before implementation begins
- Clarify scope, constraints, and success criteria for a planned initiative

## How it works

The skill runs a three-step process:

1. **Gather context** — conducts a structured interview to understand the problem, users, goals, constraints, and scope. Does not draft anything until it has enough information to proceed without inventing details.
2. **Draft the PRD** — produces a structured document following a fixed template, saved to `.specs/[feature-slug]/PRD.md`.
3. **Review with the user** — presents the draft, surfaces gaps, and iterates until the PRD is complete and accurate.

## Output

A `PRD.md` file at `.specs/[feature-slug]/PRD.md` containing:

- Overview and problem statement
- Target users and their needs
- Measurable goals and success criteria
- In-scope capabilities and explicit non-goals
- Functional requirements with priority labels (P0/P1/P2)
- Constraints and assumptions
- Open questions

## Usage

```
/create-prd
```

Claude will begin the interview immediately. Answer questions as specifically as possible — vague answers ("it depends") will be followed up with more targeted questions.
