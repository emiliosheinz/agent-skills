# Sizing

Forge adapts to the change. A one-line fix and a multi-repo refactor must not pay the
same ceremony. Size controls two things: **how deep each phase goes** (depth) and
**which phases are needed at all** (routing).

## Tiers

A change is the **largest** tier for which any trigger fires. When in doubt, size up.
Under-sizing skips rigor a change needed; over-sizing only wastes some effort.

The numeric anchors (`≈`) are rough guides, not hard rules. They keep the
quick/standard split from being purely subjective; the qualitative triggers decide.

| Tier | Triggers (any one promotes to this tier) |
|------|------------------------------------------|
| **quick** | ≈ ≤2 files / ~30 LOC; single function or file; no new public interface; no schema/API/contract change; no new dependency; an existing test pattern already covers the seam |
| **standard** | ≈ up to ~6 files within one component/module/service; at most one new interface or endpoint; fits in one mental model |
| **complex** | crosses components, services, or repos; new subsystem or migration; requirements are ambiguous; needs the implicit-requirement dimension sweep; touches security/PII/auth/payments |

## Picking and recording the size

- The **first phase to run** on a change picks the size and writes it to `state.md`
  (`Size:` field) with a one-line justification.
- Any later phase that finds no recorded size picks it the same way.
- **Size can only go up.** A later phase may promote (e.g. design uncovers a
  cross-service contract → standard becomes complex). It logs the reason in the
  Decisions section of `state.md`. A **downgrade requires the user's confirmation** —
  never silently shrink scope to skip work.

## Channel 1 — depth per phase

| Phase | quick | standard | complex |
|-------|-------|----------|---------|
| **specify** | inline spec: problem + 1–3 acceptance criteria, a few lines (light domain map, no impact trace) | full spec + impact trace (observed dependents, integration, in-domain prior art), no dimension sweep | full spec + impact trace with cross-repo/service ripples + implicit-requirement dimension sweep + prior-art / external-reference pass |
| **design** | skip | interfaces + error matrix + verification gates | + architecture diagram, data models, alternatives, risk register |
| **plan** | skip (execute works the change as one task inline) | 1–2 phases of tasks with a parallelism assessment | several dependency-ordered phases, sequencing, execution risks |
| **execute** | implement + verifiers 1–2 (tests, static analysis) | per phase: + verifiers 3–4 (spec coverage, architecture) | per phase: + verifier 5 (mutation sensor) |

Even at `quick`, specify still runs its interview/scan loop — it just reaches shared
understanding fast and writes little. Sizing controls how much you *write*, never
whether you bother to *understand*.

## Channel 2 — routing advice

Each phase ends by stating the size and naming the next needed phase(s):

- **quick** → `specify` recommends going straight to `execute` (design and plan skipped).
- **standard** → `specify` → `design` (light) → `plan` → `execute`.
- **complex** → the full pipeline, with every gate.

**Conditions can skip a phase without changing the tier.** The tier stays the baseline.
A phase may recommend skipping the next phase when its condition holds:

- At standard, `specify` may recommend skipping `design` when the change adds **no new
  public interface, pattern, or data model**.
- At standard, `design` may recommend skipping `plan` when there are **≤~3 ordered
  steps with no cross-file dependency**.

Each phase reference restates the condition it applies. Log any skip in `state.md`
under Decisions so the size can still be promoted later if needed.

The user still drives every transition. Routing advice tells them what is worth doing;
it never runs the next phase automatically.
