# RFC Types — Additional Focus Areas

The template (`templates/rfc.md`) covers every RFC's universal skeleton.
This file lists the extra focus areas each RFC type usually needs. Pick
the closest match; skip focus areas that do not apply.

| RFC Type | Extra focus areas |
|----------|-------------------|
| **Technical / Architecture** | System impact, migration path, technical risks, rollback plan, observability |
| **Process / Workflow** | Team impact, adoption plan, training needs, rollback if the process fails |
| **Product / Feature** | User impact, target metrics, go/no-go criteria, dependencies on other teams |
| **Vendor / Tool Selection** | Cost comparison, lock-in risk, exit strategy, evaluation criteria, POC results |
| **Policy / Compliance** | Regulatory requirements, audit trail, enforcement mechanism, exception process |

## How to apply

- Add the type-specific focus areas as extra fields under the relevant
  option in "Options Considered", or as extra criteria in "Decision
  Criteria" — whichever fits the framing better.
- Do not add every focus area — pick the ones that carry weight for this
  specific RFC. An RFC padded with irrelevant sections is worse than one
  that is honestly narrow.
- If the RFC crosses two types (e.g., a vendor selection that is also a
  compliance decision), take focus areas from both.

## Gotchas per type

- **Technical / Architecture** — the migration path is a common blind
  spot. If an option requires a migration, explicit stages and rollback
  triggers are mandatory, not optional.
- **Process / Workflow** — teams will adopt the new process only if the
  proposal shows how enforcement/adoption happens, not just what the new
  process is.
- **Product / Feature** — go/no-go criteria must be measurable. "Users
  will love it" is not a criterion; "40% activation among cohort X within
  30 days" is.
- **Vendor / Tool Selection** — lock-in risk is the criterion teams
  underweight most. Always ask "what does exit look like?" before
  recommending a vendor.
- **Policy / Compliance** — regulatory requirements are must-haves in the
  Decision Criteria table, not options. If an option fails a must-have,
  it should be marked as such and can still be listed for completeness
  and audit trail.
