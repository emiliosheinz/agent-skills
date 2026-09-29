# RFC-{NNN}: {Title}

<!--
Title is clear, action-oriented, specific — not "RFC about the database".
Delete any recommended section that would be empty; keep every mandatory
section. If a mandatory field is unknown, leave an italicized placeholder
(`*to be confirmed*`) rather than inventing content.
Target size: focused on the decision — usually 1–4 pages.
-->

## Metadata

- **Status**: NOT STARTED | IN PROGRESS | DECIDED | ARCHIVED
- **Impact**: HIGH | MEDIUM | LOW
- **Driver**: {who is proposing / responsible for driving the decision}
- **Approver(s)**: {who needs to approve}
- **Contributors**: {who should give feedback}
- **Informed**: {who needs to be kept in the loop}
- **Due date**: YYYY-MM-DD *(when a decision is needed)*
- **Created**: YYYY-MM-DD

## Background

<!-- Current state + problem + why now + cost of inaction. Concrete, quantified
     where possible ("45 minutes of manual steps", "3 incidents last quarter").
     Avoid vague claims like "the current process has some issues". -->

## Assumptions

<!-- Every assumption gets a confidence level and an invalidation trigger.
     Unstated assumptions become invisible time bombs. -->

| Assumption | Confidence (H/M/L) | Invalidated if... |
|---|---|---|
| *e.g., Team has 2 engineers available in Q3* | Medium | Q3 headcount changes |

## Decision Criteria

<!-- Define BEFORE listing options. Criteria chosen after the fact look like
     justification for a preferred option. Weight each; flag must-haves. -->

| Criterion | Weight | Must-have? |
|---|---|---|
| *e.g., Migration cost* | 30% | No |
| *e.g., Compliance with SOC 2* | — | Yes |

## Options Considered

<!-- Minimum 2 options. Include "do nothing / status quo" as an explicit
     option for significant changes — it forces honest evaluation of whether
     action is worth it. -->

### Option 1 — {name}

- **Summary**: {one paragraph}
- **Evaluation against criteria**: {per-criterion score/note}
- **Pros**:
  - {benefit}
- **Cons**:
  - {trade-off}
- **Estimated cost**: {effort / complexity / monetary}

### Option 2 — {name}

- **Summary**:
- **Evaluation against criteria**:
- **Pros**:
- **Cons**:
- **Estimated cost**:

### Option 3 — Do nothing / status quo

- **Summary**: What happens if we defer or reject this proposal.
- **Cost of inaction**: {tie back to Background}

## Recommendation

<!-- Which option, and WHY — tied back explicitly to the decision criteria.
     Do not sneak in criteria that were not defined above. -->

Recommended: **Option {N}** because {rationale referencing the weighted
criteria and the evaluation table}.

## Relevant Data *(recommended)*

<!-- Metrics, research, benchmarks, user feedback, prior art. Anything that
     supports the need for change or informs the option evaluation. -->

## Action Items

<!-- Concrete next steps AFTER a decision is made — assign owners and
     approximate dates. -->

- [ ] {task} — owner: {name} — target: YYYY-MM-DD

## Outcome

<!-- Leave as a placeholder during drafting; fill AFTER the decision is
     made. Records what was decided, by whom, and when. -->

*To be filled after the decision.*

- **Decision**: {which option was chosen}
- **Decided by**: {names / role(s)}
- **Decided on**: YYYY-MM-DD
- **Follow-up ADR**: [ADR-{NNN}]({link}) *(if applicable — decisions worth
  preserving usually get their own ADR)*

## Resources *(recommended)*

- {links, references, prior art, related RFCs / ADRs / tickets}
