# Lessons

A per-change memory so the agent gets better at *this* change over time: hacks,
gotchas, and corrected wrong assumptions. Stored at `./.specs/<slug>/lessons.md`.

> Moving lessons to a wider scope — repo-wide or skill-global — is a future step once
> the per-change pattern proves itself. Keep them per-change for now.

## When to load

At the start of every phase (`specify`, `design`, `plan`, `execute`, and `fix`) for the
slug. Always read `## Standing Rules` (small). Read `## Log` entries filtered to the
area or tag relevant to the work — the verb name (`testing`, `auth`) or any tag
matching files in the current task is a good filter.

**Read only the content above the `<!-- environment-candidates -->` marker.** Everything
below it is parked for a later consumer and costs context every phase would pay for
nothing. The marker is named here and in `SKILL.md` so neither can drift from the other.

## When to write

At the end of `execute` (after verification), and at the end of a `fix` that corrected a
wrong assumption or exposed a hidden coupling. Other phases consume lessons; they do not
produce them. **Write only when something non-obvious was learned:**

- a hack or workaround invented to get unblocked,
- a gotcha that cost real time (flaky test, hidden coupling, env quirk),
- a wrong assumption that the work corrected,
- a gate that couldn't run and why.

Routine success is not a lesson. Most runs write nothing. If you can't name what the
next agent should do differently, don't write an entry.

### Triage before recording (required)

A standing rule is the weakest form a lesson can take: it is a sentence, loaded every
phase, that an agent may or may not act on. Before writing one, classify the observation
and route it. Four routes, and the first is the default:

| Class | What it looks like | Route |
|---|---|---|
| **mechanical** | a deterministic rule a command can check — a forbidden import, a missing flag, a path convention | **A proposed check**, written into the parked backlog as a concrete command or rule. When the repo can host it during this change, it *additionally* becomes a plan task. Prefer the check over the sentence: a check enforces itself |
| **judgement** | a structural or stylistic call no command can decide — where a responsibility belongs, what a name should describe | **The standards route**: the project's `CODING_STANDARDS.md` if one exists. **If none exists, park it with its intended destination and do NOT create one** (`references/structural-standards.md` — never create) |
| **navigation** | "the thing you were looking for lives here" | **A pointer** — one Standing Rule naming the location. This is the class Standing Rules are actually good at |
| **process** | an observation about forge itself — "specify earlier", "that phase split was wrong" | **The parked backlog.** Not a Standing Rule, not a repo lesson |

A mechanical lesson that becomes a Standing Rule instead of a check is the failure this
triage exists to prevent: it is how a recurring mistake becomes standing rule number 12
that nothing enforces.

**Capture only code/execution lessons about this repo** in `Standing Rules` and `Log`. Do
not record opinions about the forge process itself ("specify earlier", "split phases
differently") *there*. That is meta-commentary, it pollutes filtered loads, and it is not
a repo lesson.

**Carve-out.** The prohibition above carries one explicit carve-out, and this is it: it
applies to `Standing Rules` and `Log` only. Process
observations **are** permitted in `## Environment candidates`, below the
`<!-- environment-candidates -->` marker, which no phase loads. The prohibition exists to
keep meta-commentary out of the always-loaded text, not to throw the signal away: a
recurring process complaint is real data for whoever tunes the workflow later. Park it
there with its classification and its intended destination.

### Grounding gate (required)

Every entry must cite a concrete **source**: an AC ID, a test, a `file:line`, a
surviving mutant, or a failed gate. **An entry with no source is an opinion, not a
lesson — do not record it.**

### Signal taxonomy — what to walk

After verification, walk each failing or raised verifier output and emit **at most one
lesson per signal**, or note in one line why it is out of scope:

| Signal | Lesson-worthy when |
|--------|--------------------|
| spec-coverage zero / missing evidence | a recurring kind of AC keeps going uncovered |
| surviving mutant | the test seam can't discriminate a class of bug |
| architecture violation | a pattern the design forbids keeps reappearing |
| lint / test failure | a non-obvious project rule or flake bit you |
| exhausted 3-strike fix loop | the gap had a root cause worth recording |
| spec-deviation noticed during execute | the spec was wrong or ambiguous (also raise SPEC-GAP) |

## Format

```markdown
# Lessons — <slug>

## Standing Rules
<!-- Curated, short imperatives, always loaded. Cap ~15. -->
- This repo's test runner needs `--runInBand`; parallel runs flake. [testing]
- Auth tokens are minted in `auth/mint.ts`, not the middleware. [auth]

## Log
<!-- Append-only, terse, tagged: date · [tag] · source · what went wrong · root cause · rule -->
- 2026-06-30 · [testing] · src/cli/run.test.ts (no seam) · mutation sensor couldn't run —
  no test seam for the CLI path; added an integration harness instead. Rule: gate CLI
  changes on the harness.

## Retired
<!-- Standing Rules struck after they proved wrong; never loaded. -->
- ~~Always mock the clock in unit tests~~ (2026-06-30 — caused frozen-time bugs to pass)

<!-- environment-candidates -->
## Environment candidates
<!-- Append-only. NEVER loaded by a phase. Parked observations with their classification
     and intended destination: proposed mechanical checks, judgement calls with no
     standards file to hold them, and process observations about forge itself. -->
- 2026-06-30 · [mechanical → proposed check] · gate `rg -n "fetch\(" src/domain | wc -l`
  must be 0 · domain code kept reaching the network directly
- 2026-06-30 · [process → workflow] · the phase split put the schema change after its
  first consumer; a later phase had to reopen it
```

Each Log entry: `date · [tag] · source(AC-id|test|file:line|mutant|gate) · what went
wrong · root cause · the rule going forward`.

## Bounding growth

- Cap the Log (by count or size). On overflow, **distill**: a pattern that recurs
  across Log entries becomes one Standing Rule. Drop the raw entries it summarizes.
  Merge duplicates.
- Standing Rules is itself capped (~15). When full, promoting a new rule means retiring
  a stale one.
- **Demote rules that prove wrong.** When a Standing Rule appears to cause or coincide
  with a later failure, strike it (`~~rule~~ (date, reason)`) and move it to
  `## Retired` on the first credible observation. Retired rules are never loaded — a
  wrong rule silently degrades every phase that reads it.
- Tag entries so loads pull a relevant subset. Context cost stays flat as the file
  grows.
- `## Environment candidates` is **append-only and never loaded**, so it does not
  participate in the cap or the distillation pass. It grows without costing a phase
  anything; nothing is promoted out of it by forge.
