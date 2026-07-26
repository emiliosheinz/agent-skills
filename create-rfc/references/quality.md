# Quality — Checklist and Anti-Patterns

## Checklist (run before finalizing)

- [ ] **Title** — clear, action-oriented, specific (not "RFC about the
      database")
- [ ] **Impact** — assessed as HIGH / MEDIUM / LOW with a one-line
      justification
- [ ] **Background** — current state + problem + why now + cost of
      inaction (concrete, ideally quantified)
- [ ] **Assumptions** — explicit, with confidence levels and invalidation
      triggers
- [ ] **Decision Criteria** — defined *before* options, weighted,
      must-haves flagged
- [ ] **Data** — at least some evidence supporting the need for change
- [ ] **Options** — minimum 2, including "do nothing" for significant
      changes
- [ ] **Options evaluated against the criteria** — not just pros/cons in
      isolation
- [ ] **Pros/Cons** — honest, not sales copy for the preferred option
- [ ] **Cost** — effort estimate for each option (even if rough)
- [ ] **RACI** — Driver, Approver(s), Contributors, Informed all
      identified
- [ ] **Action Items** — concrete next steps after the decision
- [ ] **Outcome** — left as a placeholder to be filled when the decision
      is made

## Anti-patterns to avoid

### Predetermined conclusion disguised as an RFC

**BAD**:
```
We should use Kubernetes. Here are some reasons.
Option 2 is to not use Kubernetes (obviously wrong).
```

**GOOD**:
```
Option 1: Adopt Kubernetes — [genuine pros and cons]
Option 2: Stick with Docker Compose — [genuine pros and cons]
Option 3: Move to managed container platform (ECS / Cloud Run) —
          [genuine pros and cons]
```

An RFC with a foregone conclusion produces bad decisions and destroys
trust. If the decision is already made, use `/create-adr` instead.

### Vague background

**BAD**:
```
Our current deployment process has some issues.
```

**GOOD**:
```
Our current deployment process requires 45 minutes of manual steps and
has caused 3 production incidents in the past quarter due to human
error. The team spends ~8 hours/week on deployment-related tasks.
```

Concrete numbers make the case. Vague pain justifies nothing.

### Missing "do nothing" option

Always include the status quo as an explicit option for significant
changes. It forces honest evaluation of whether action is truly needed
and gives readers a real baseline to compare against.

### No decision criteria, or criteria defined after options

**BAD**: Presenting options first, then listing criteria — looks like the
criteria were chosen to justify a preferred option.

**GOOD**: Define criteria with weights *before* listing options. Evaluate
each option against them explicitly. The recommendation section
references which criteria drove the decision.

### Hidden or unstated assumptions

**BAD**:
```
We'll migrate to the new system over 6 months.
```

**GOOD**:
```
| Assumption | Confidence | Invalidated if... |
|---|---|---|
| Team has 2 engineers available for migration work in Q3 | Medium | Q3 headcount changes |
```

Unstated assumptions become invisible time bombs. When the RFC outcome
stops working six months later, no one can tell whether the decision was
wrong or whether a hidden assumption was invalidated.
