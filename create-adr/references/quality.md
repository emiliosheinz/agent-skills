# Quality — Checklist, Anti-Patterns, Naming

## Checklist (run before finalizing)

- [ ] **Title** is a noun phrase describing the decision (not a question,
      not a vague label)
- [ ] **Date** is included (decisions without dates lose context quickly)
- [ ] **Status** is set correctly — Accepted / Proposed / Deprecated /
      Superseded
- [ ] **Context** explains the *forces* that made this decision necessary,
      not just what was done
- [ ] **Decision** is stated directly and tied to the context
- [ ] **Consequences** include honest trade-offs — not just positives
- [ ] **Options** (MADR) include at least 2 alternatives actually considered
- [ ] **Supersedes / superseded by** links present when applicable
- [ ] **File** follows naming convention: `NNN-kebab-case-title.md`
- [ ] **Number** is sequential in the ADR directory

## File naming

```
docs/adr/
├── 001-use-postgresql-for-primary-storage.md
├── 002-adopt-event-driven-architecture.md
├── 003-replace-jenkins-with-github-actions.md   ← supersedes ADR-001 if relevant
└── README.md                                    ← optional index
```

- Zero-padded numbers: `001`, `002`, ... `099`, `100`
- Kebab-case title
- `.md` extension
- Common directories: `docs/adr/`, `docs/decisions/`, `adr/`, `.adr/`

## Anti-patterns to avoid

### Title as a question

**BAD**: `# ADR-001: Should we use PostgreSQL?`

**GOOD**: `# ADR-001: Use PostgreSQL for Primary Storage`

Titles record the decision, not the question. Future readers need to know
what was decided.

### Vague context

**BAD**:
```
We needed a database and chose PostgreSQL.
```

**GOOD**:
```
Our application requires a relational database with strong ACID guarantees.
The team has deep PostgreSQL experience. MySQL was evaluated but lacks
native support for JSONB columns, which our schema design requires. Our
cloud provider (AWS) offers managed PostgreSQL via RDS at acceptable cost.
```

Context should explain the *forces* — why the alternative was not obviously
better.

### Consequences without trade-offs

**BAD**:
```
## Consequences
PostgreSQL is fast and reliable.
```

**GOOD**:
```
## Consequences
- Enables JSONB columns and advanced indexing for our query patterns
- Team expertise means fast onboarding and fewer operational surprises
- Adds operational burden compared to a managed NoSQL service
- Schema migrations require careful planning in a relational model
```

Honest trade-offs are what make ADRs valuable years later. A one-sided ADR
loses credibility the first time a future engineer hits the downside.

### Editing instead of superseding

**BAD**: Editing an old ADR to change the decision after the fact.

**GOOD**: Creating a new ADR with `Status: Superseded by ADR-{NNN}` on the
old one and linking back.

ADRs are historical records. The old decision was correct *given what was
known at the time*. Superseding preserves that context.

### Missing the "why not" rationale

**BAD**:
```
## Decision
We will use Redis for session storage.
```

**GOOD**:
```
## Decision
We will use Redis for session storage. We considered storing sessions in
PostgreSQL (already in our stack) but Redis's built-in TTL and in-memory
performance are significantly better suited for high-frequency session
reads. The operational cost of an additional service is justified by the
simplified session expiry logic.
```

The rationale is *why this option and not the others* — not just what was
chosen.
