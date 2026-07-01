# Specify

**Goal:** reach shared understanding of the problem with the user, then capture what to
build as testable requirements. Output: `.specs/<slug>/spec.md`.

This is the heaviest phase. Everything downstream inherits its quality. Do not rush it.
Sizing controls how much you *write*, never whether you bother to *understand*.

## Before you start

1. Derive the kebab-case `<slug>` from the feature name. If no name was given, ask for
   one.
2. Load `.specs/<slug>/lessons.md` if it exists. Always read Standing Rules. Read Log
   entries tagged to this area.

Specify runs in **two ordered passes** with a gate between them. **Do not mix them.**
Part A captures the world as it *is* (no decisions). Part B decides what to *build*.
Mixing the two makes you propose solutions before you understand the problem.

---

## Part A — Understand (record what is, decide nothing)

**Rule:** gather understanding, not decisions. Do not define success, propose
solutions, sketch architecture, prioritize, or set scope here. Capture the world as it
is.

Three activities run together and interleave. None of them is "done" until you have
shared understanding. Pursue all three until they are done.

### A1. Interview to shared understanding

There is no fixed question list. At every turn you decide the next question from what
is still unclear.

1. **One question at a time.** Use `AskUserQuestion` when available (fall back to a
   single plain question otherwise). Never bundle unrelated topics. Tightly related
   sub-questions under one topic are fine.
2. **Walk the tree.**
   - Each answer either closes a branch or opens new ones.
   - When an answer surfaces something you did not know, follow that branch to
     resolution before returning to the parent.
   - Do not abandon a half-open branch to move on.
3. **Always offer a recommended answer.** Propose a default the user can accept or
   override, derived from the codebase, prior conversation, or context.
4. **Codebase first.** If the code, `.specs/`, or git history can answer it, read
   first — do not ask. Save the user's attention for what only they know.
5. **Record, do not invent.** "I don't know" / "not decided" is a valid answer — write
   it down as an open question. Never cover a gap with an assumption.

**How to pick the next question:** ask yourself *"if a peer asked me to describe this
problem right now, where would I have to guess or hedge?"* Every place you'd hedge is a
gap; every gap is the next branch.

**Stop condition.** Concretely: every open branch is closed or recorded as an open
question, and nothing in Part A's template requires invention to fill. Said another
way: you could describe the problem, the people affected, the constraints, prior art,
and codebase reality, and the user would say *"yes, that's it."*

Signals that often hide gaps (use to find branches, not as a script):

- the lived experience of the affected person;
- adjacent stakeholders the user didn't name;
- the current workarounds and how widespread they are;
- hard boundaries (technical, legal, operational, time);
- what is settled vs. assumed-settled vs. open;
- prior attempts, internal or external.

### A2. Scan the codebase

Scan what is relevant to the problem until you have mapped the codebase areas the
change will touch. Record as observations, not conclusions:

- Existing modules, services, components in the same domain
- Established patterns: structure, naming, data flow, testing approach
- Prior decisions in `.specs/` (specs, designs, ADRs, RFCs) that overlap
- Technical debt or known limitations visible in code or comments
- Integration boundaries: external services, APIs, data stores

For a wide or unfamiliar codebase, dispatch read-only subagents per SKILL.md's
Orchestration rules to map areas in parallel. Ground every claim in something you
actually read or ran.

**Scan thoroughly** — the reuse analysis in `design.md` depends on it. Use the best
search the toolchain offers. Prefer a syntax-aware/structural search when one is
available, since a plain text/regex search misses how symbols are actually declared
(arrow functions, methods, exported consts, decorators). Fall back to text search
otherwise. Exclude generated, vendored, and build output so the scan does not surface
false "prior art" from dependencies.

### A3. Surface external references

Actively look outward, not just at URLs the user mentioned. The point is to avoid
rebuilding something that already exists or repeating a known mistake.

When web tools are available (`WebSearch` + `WebFetch`), search for and **read**:

- Established approaches and state-of-the-art for this class of problem
- Open-source projects solving the same or an analogous problem
- Standards, RFCs, or compliance documents that apply
- Published case studies or postmortems from teams who did this before

Rules:

- Fetch every source before recording it. Never cite from a search snippet.
- Never invent a URL.
- Stay focused on the problem.
- Summarize relevance; do not reproduce content.
- If a search returns nothing relevant, say so and move on. Do not add filler.

If web tools are unavailable, say so in the spec and lean on codebase prior art.

Record external *solutions or competing approaches* as **Prior Art** with an
applicability rating. Record general references (standards, docs, patterns) under
**External References**.

---

## Part A closure gate

Before Part B, verify:

- Every open branch is closed or explicitly recorded as an open question.
- Each remaining open question is either resolved or carried forward — never silently
  dropped. Split carried-forward items into two categories, because they have opposite
  downstream consequences:
  - **Agent discretion (user delegated):** the user said "you decide" — safe for
    design/plan to settle without coming back.
  - **Assumptions (unconfirmed):** a guess the work rests on; flag any that would
    invalidate the spec if wrong, so design/plan surface them before building.
- The user confirms the captured understanding is accurate.

If the user only wanted shared understanding, **stop here.** Write the Part A sections
of `spec.md`, mark the spec `context-only` in its metadata, and recommend resuming with
`/forge specify` (or `/forge design`) later.

---

## Part B — Specify (decide what to build)

Now turn understanding into requirements. Cover the following, asking only for what is
genuinely missing:

- **Success, measurably.** Falsifiable outcomes — verifiable true/false after shipping.
  Reject "users are happy" / "performance improves". Write "task completion ≥ 85%",
  "support tickets for X down 30% within 60 days".
- **Scope.** In-scope capabilities (discrete, verifiable) and a single **out-of-scope**
  table. Anything a reader might reasonably assume is included but isn't must appear
  here, with a reason. The feature boundary is fixed once Part B starts: if the user
  raises a new capability mid-spec, capture it under **Deferred Ideas** (newly-raised,
  intentionally postponed — distinct from the static out-of-scope table) and continue.
  This keeps scope from expanding while losing nothing.
- **Requirements & acceptance criteria.** See below.
- **Assumptions & discretion.** Split per the Part A closure gate. Flag assumptions
  that would invalidate the spec if proven false.
- **Edge conditions.** Empty / error / first-run / power-user behavior.

### Requirements and acceptance criteria

- Functional requirements only — *what* the system does, never *how*. No tech stack,
  data store, or protocol choices.
- One requirement per item. Split anything with "and". Independently verifiable as
  pass/fail.
- **IDs:** prefix = feature slug uppercased, shortened to 3–5 chars (`user-onboarding`
  → `ONBD`). Sequential: `ONBD-01`, `ONBD-02`.
- Priorities: **P0** launch blocker · **P1** high value · **P2** nice to have.
- Mark an AC **`critical`** when it governs auth, payments, or data integrity.
  Execute's mutation sensor runs on critical ACs regardless of size.
- Each requirement carries one or more **acceptance criteria** in WHEN/THEN/SHALL
  form: *WHEN \<condition\>, THEN the system SHALL \<observable outcome\>.* Each AC
  must have a single interpretation and a precise expected outcome.

**Acceptance criteria are written here and nowhere else.** Design, plan, and execute
reference the IDs; they never restate the criterion text. This is the single trace
that ties code back to intent.

### Implicit-requirement dimension sweep (complex tier)

For complex changes, walk the relevant dimensions. Each resolves to a concrete
requirement **or** an explicit "N/A because \<reason\>". Skipping one silently is how
production gaps ship.

First **classify the feature's primary surface** (pick all that apply; name the
primary). Then walk the systems list plus the matching surface list:

- **systems / backend (always):** input validation · failure states · idempotency ·
  auth & rate limits · concurrency · data lifecycle/retention · observability ·
  external dependencies · state transitions
- **UI:** empty/loading/error states · density · interactions · visual hierarchy
- **API:** response format · error shapes · auth · versioning · rate limiting
- **CLI:** output format · flags · modes · verbosity · exit codes
- **content/docs:** structure · tone · depth · navigation
- **data-org:** grouping · naming · duplicates · exceptions

The nine systems dimensions cover internals only. For a UI, CLI, or content feature,
the visible-surface dimensions are exactly what users notice if you skip them.

### Part B closure gate

Before writing the spec, confirm:

- Every AC has a single interpretation and a precise expected outcome.
- Every unresolved decision is logged as an assumption with a chosen default and
  rationale.
- No requirement embeds implementation.

---

## Write the spec and route

Write `.specs/<slug>/spec.md` from `templates/spec.md`, sized per
`references/sizing.md` (quick = a few lines; complex = full matrix + dimension sweep +
prior art). Set or confirm `Size:` in `state.md` and append any decisions made.

Recommend the next phase by size:

- **quick:** "Size: quick — skip design and plan. Run `/forge execute`."
- **standard / complex:** "Run `/forge design` next."
- **Specify may recommend skipping design when** the standard change adds **no new
  public interface, pattern, or data model.** In that case recommend `/forge plan`
  directly and log the skip in `state.md` Decisions.

If a significant decision still needs alignment, run `/create-rfc` first regardless of
size.
