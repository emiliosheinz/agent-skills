# Fix

> **Phase prelude:** resolve `SPECS_ROOT` per SKILL.md → *Artifact root
> (session CWD)* before any read or write. Every `./.specs/...` path below is
> `$SPECS_ROOT/...`.

**Goal:** fold a mid-stream correction into an in-flight change and keep the whole chain
aligned — spec → design → plan → code → tests. A correction can enter at any layer: a
misstated requirement, a design detail you're unhappy with, a task that's wrong, an
implementation detail that's off, a bug found in manual testing. `fix` routes it to the
layer it truly belongs to, re-aligns every layer below, and executes the code delta when
it is contained.

> `fix` is a **re-entry** command, not a fifth linear phase. It is artifact-neutral:
> no bug-specific shape, no diagnosis engine (delegate hard root-causing to the
> `diagnose` skill), no new artifact or template. It edits the existing `spec.md` /
> `design.md` / `plan.md` / code in place and logs to `state.md`.

Load first:

- `./.specs/<slug>/state.md` — size, task table, Decisions, **Handoff** (read this before
  touching anything — it tells you what is mid-task).
- `./.specs/<slug>/lessons.md` — Standing Rules and Log.
- Only the artifact sections the correction touches — read selectively.

If there is no `./.specs/<slug>/` at all, `fix` has nothing to align: refuse and route —
`/forge execute` for a trivial self-contained change, or `/forge specify` to capture the
parent context. Never fabricate a spec.

## The model: lift, then cascade

The artifacts are a derived stack — gates derive from ACs, tasks from gates, code from
tasks. Any change roots at the **highest layer it invalidates**; everything below is
re-derivation. What propagates *up* is never the change, only the **discovery** — users
point at code when the real change is a missing requirement.

**One correction = one entry.** If the request bundles independent corrections, split
them and run each separately — a bundle has no single entry layer.

### 1. Lift — find the true entry layer

Decide which layer the change truly belongs to (it may be higher than where it was
noticed):

- fixes a wrong/missing requirement or expected value → **spec**
- breaks or changes a contract, boundary, or verification gate → **design**
- only re-shapes tasks, ordering, or parallelism → **plan**
- corrects code/tests within the existing spec, design, and tasks → **code**

**Gated adversarial claim-review.** When the correction plausibly implies a spec/design
change, or smells like a `SPEC-GAP` (a code complaint with no spec-defined expected value
to check against — see `references/verification.md`), review the claim before acting.
Reuse `references/review.md`: an independent stateless subagent, given only the correction
+ the current artifacts + one lens, never the user's justification. Lenses: (a) real
change vs. misunderstanding of existing intent; (b) the true entry layer / is this a
`SPEC-GAP`; (c) scope creep — net-new capability is **not** a correction; route it to
`/forge specify`. Escalate a genuine judgment call (user says "just change the code,"
reviewer says "spec gap") via `AskUserQuestion`, default to lifting. **Skip the review
entirely for pure code-cosmetic corrections** (rename, extract, flaky test, formatting) —
the same way `quick` skips review.

### 2. Cascade — re-align the affected slice, top-down

From the true entry down, re-align each layer's *slice* (not a single thread — a spec
delta can fork several ACs and collide with a peer decision below). Reuse each phase's
own discipline on just the delta; do not restate it:

- spec delta → `references/specify.md` Part B + its testability review
- design delta → `references/design.md` + its reviewers
- plan delta → `references/plan.md`, including its "Validate before presenting" graph
  re-check over the **whole** modified task table (acyclic, deps exist, no `[P]` depends
  on a same-phase task) — not just appended rows
- code delta → `references/execute.md` per-task loop + verifiers + bounded fix loop

As the cascade reaches already-`completed` work, **reopen it forward-only**: flip the
affected `done` tasks back to `pending`, and **invalidate stale proof** — a
`## Verification evidence` row the correction falsifies is marked superseded (never
edited — it is append-on-PASS), so re-execute regenerates fresh evidence. Never rewrite
history; a correction to shipped code is a new commit or a revert+reapply.

### 3. Verify the trace invariant

Every affected AC → gate → task → code+test, no orphans in either direction. When the
cascade reaches code this is **already** verifier 3 inside execute's verify step — don't
double-run it. Run a standalone trace check only when the correction **stops above code**
(docs edited, execution deferred).

### 4. Log

Append one `AD-NN` row to `state.md` Decisions (correction, why, entry layer, layers
touched), tagged `[fix]`. Then **capture a lesson when it adds value** — a correction is
one of the strongest signals `references/lessons.md` wants (a corrected wrong assumption,
a hidden coupling the fix exposed, a gap that would recur). Record it per that file's
grounding gate (cite a concrete source; a repo/code lesson, never forge-process
meta). A fix that just reflects the user changing their mind is a Decisions row only.

## Execute now, or stop and recommend (contained-only)

Compose forge's existing governors — the sizing ratchet (`references/sizing.md`) and
execute's "Stop before the change sprawls." **Auto-execute the cascade to committed code
in this same invocation only when ALL hold:**

- true entry is at or below the plan layer;
- the cascade touches ≤1 plan phase and adds **no** new phase;
- the code delta clears execute's quick-path guardrail (≤~5 atomic steps, no new public
  interface/contract, no schema/API change, no cross-file ordering dependency);
- no size promotion fires;
- no AC is deleted and no `critical` AC is touched;
- the affected slice's tasks are all `done`/`pending` — no conflicting uncommitted work.

**Otherwise stop** and recommend the phase chain from the true entry down (e.g. entry =
spec → `/forge specify` the delta → design → plan → execute), seeding the delta but never
running it. Any size promotion necessarily fails a clause, so it stops.

## Edge cases

- **AC deletion / scope-shrink** is allowed but gated: user-confirmed (same gate as a
  size downgrade), an `AD-NN` supersede row, and **tombstone the ID** (mark retired,
  never renumber or reuse — everything traces by ID). Cascade orphans its gate, closes
  its tasks, removes its tests/evidence.
- **Dirty tree / mid-task:** if uncommitted work touches the same code the correction
  touches, fold the correction into that task rather than opening a competing edit; never
  sweep unrelated uncommitted files into the fix's commit.
- **Cross-slug propagation** (a fix to this slug invalidates another slug) is out of
  scope — surface it to the user; don't pretend to handle it.
- **Hard bug:** delegate root-causing to the `diagnose` skill and consume its verified
  fix proposal as the correction. An obvious code bug just runs the execute loop.

## Finish

Report: the correction, its true entry layer, the layers re-aligned, whether the code
delta was executed or the phase chain was recommended, and any unknowns. Confirm the
Decisions row is written and `state.md` is consistent.
