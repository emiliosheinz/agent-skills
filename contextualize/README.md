# contextualize

A Claude Code skill that gathers the context downstream spec and design work depends on — interviewing the user, scanning the codebase, and recording external references — before any requirements, design, or planning skill runs.

## When to use

Invoke this skill when you want to:

- Understand a problem space before writing requirements or designing a solution
- Surface constraints, prior art, and codebase realities the team needs to share
- Produce a single artifact (`CONTEXT.md`) that `create-prd`, `create-technical-design`, and `create-implementation-plan` can consume without re-interviewing the user
- Record open questions and unknowns honestly rather than papering over gaps

## How it works

The skill is a relentless, branch-by-branch interview followed by a structured write-up. It applies five rules throughout:

1. One question at a time
2. Walk every branch to resolution before moving on
3. Always offer a recommended answer for each question
4. Read the codebase before asking the user
5. Record gaps as open questions — never invent

The flow runs in five steps:

1. **Interview to shared understanding** — open-ended branch-by-branch interrogation. No pre-defined script; the agent decides what to ask based on where it would otherwise have to guess. Stops only when the user and agent share the same picture of the problem.
2. **Scan the codebase** — surface relevant modules, patterns, prior decisions in `.specs/`, and integration boundaries.
3. **External references and state of the art** — actively search for established approaches, open-source solutions, standards, and case studies that would inform downstream decisions; also fetch URLs the user provided or that came out of the codebase scan. Every recorded source is one the agent actually read.
4. **Synthesize** — compile findings into `.specs/[feature-slug]/CONTEXT.md`.
5. **Route** — point the user to the next skill (`/create-prd`, `/create-technical-design`, or `/create-rfc`).

## What contextualize does NOT do

- It does not define success criteria, scope, or non-goals — that is `create-prd`'s job.
- It does not propose solutions, sketch architectures, or pick technologies — that is `create-technical-design`'s job.
- It does not weigh alternatives or recommend a decision — that is `create-rfc`'s job.

If the skill catches itself doing any of the above, it strips it out before saving.

## Output

A `CONTEXT.md` file at `.specs/[feature-slug]/CONTEXT.md` containing:

- Problem framing (current state, affected users, cost of the status quo)
- Stakeholders and their pains or needs
- Hard constraints (technical, legal, operational, time/team)
- Prior art (internal and external)
- Codebase findings (observations only — no conclusions)
- External references with URLs and key findings
- Open questions

## Usage

```
/contextualize
```

Claude will begin the grilled intake immediately. Each question comes with a recommended answer — accept it, override it, or mark it unknown. The more concrete the inputs, the more useful the context output.
