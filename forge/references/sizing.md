# Sizing

Forge adapts to the change. A one-line fix and a multi-repo refactor must not pay the
same ceremony. Size controls two things: **how deep each phase goes** (depth) and
**which phases are needed at all** (routing).

## Tiers

A change is the **largest** tier for which any trigger fires. When in doubt, size up —
under-sizing skips rigor a change needed; over-sizing only wastes some effort.

Numeric anchors are rough guides (≈), not hard rules — they just keep the quick/standard
split from being pure vibe; the qualitative triggers decide.

| Tier | Triggers (any one promotes to this tier) |
|------|------------------------------------------|
| **quick** | ≈ ≤2 files / ~30 LOC; single function or file; no new public interface; no schema/API/contract change; no new dependency; an existing test pattern already covers the seam |
| **standard** | ≈ up to ~6 files within one component/module/service; at most one new interface or endpoint; fits in one mental model |
| **complex** | crosses components, services, or repos; new subsystem or migration; requirements are ambiguous; needs the implicit-requirement dimension sweep; touches security/PII/auth/payments |

## Deriving and recording size

- The **first phase to run** on a change derives the size and records it in `state.md`
  (`Size:` field) with a one-line justification.
- Any later phase that finds no recorded size derives it the same way.
- **Size ratchets up only.** A later phase may promote (e.g. design uncovers a
  cross-service contract → standard becomes complex); it logs the reason in the
  Decisions section of `state.md`. A **downgrade requires the user's confirmation** —
  never silently shrink scope to skip work.

## Channel 1 — depth per stage

| Stage | quick | standard | complex |
|-------|-------|----------|---------|
| **specify** | inline spec: problem + 1–3 acceptance criteria, a few lines | full spec, no dimension sweep | full spec + implicit-requirement dimension sweep + prior-art/external-reference pass |
| **design** | skip | interfaces + error matrix + verification gates | + architecture diagram, data models, alternatives, risk register |
| **plan** | skip (execute works the change as one task inline) | 1–2 phases of tasks with a parallelism assessment | several dependency-ordered phases, sequencing, execution risks |
| **execute** | implement + verifiers 1–2 (tests, lint) | per phase: + verifiers 3–4 (spec coverage, architecture) | per phase: + verifier 5 (mutation/discrimination sensor) |

Even at `quick`, specify still runs its interview/scan loop — it just reaches shared
understanding fast and writes little. Sizing controls how much you *write*, never
whether you bother to *understand*.

## Channel 2 — routing advice

Each phase ends by stating the size and naming the next needed verb(s):

- **quick** → `specify` recommends going straight to `execute` (design and plan skipped).
- **standard** → `specify` → `design` (light) → `plan` → `execute`.
- **complex** → the full pipeline, with every gate.

**Condition-based skips refine the tier default** (the tier stays the baseline). A stage's
exit recommendation may suggest skipping the next stage when its condition holds — at
standard, `design` may recommend skipping itself when the change introduces no new public
interface, pattern, or data model; `plan` may recommend skip-to-inline when there are ≤~3
ordered steps with no cross-file dependency. Log any skip in `state.md` so the ratchet can
still promote later.

The user still drives every transition. Routing advice tells them what's worth doing;
it never runs the next phase automatically.
