---
name: forge
description: >
  Spec-driven development from problem to shipped, verified code in four phases:
  `/forge specify|design|plan|execute`, plus `/forge fix` to correct course mid-stream.
  TRIGGER when: the user asks to ship/build/implement a feature, write a PRD or spec or
  requirements, design architecture, write a technical design, break work into tasks or
  an implementation plan, run TDD or write acceptance criteria, or correct/adjust an
  in-flight change — a misstated requirement, a design or implementation detail that's
  wrong, or a bug found while testing. SKIP for: trivial one-off edits the user already
  has fully specified, pure code review, or questions about how forge itself works.
---

# Forge

Forge runs spec-driven development as four phases. You invoke one phase at a time. Each
phase does its work, updates shared state, and recommends (but does not run) the next
phase. A fifth command, `fix`, re-enters the flow to correct course at any layer. Every
phase's depth auto-sizes to the change — see Sizing.

```text
/forge specify <name>   Understand the problem + capture requirements   → spec.md
/forge design           Architecture, contracts, verification gates     → design.md
/forge plan             Atomic tasks, dependencies, AC traces            → plan.md
/forge execute          Implement, then run independent verifiers        → working code
/forge fix <change>     Correct course mid-stream, keep the chain aligned → aligned artifacts + code
/forge auto <brief>     Run the whole chain itself, ratify at the PR      → draft PR + decision log
```

## Dispatch

Read the first argument as the phase verb. **Read the matching reference file fully
before acting** — it is the step-by-step playbook for that phase.

| Verb | Read | Produces |
|------|------|----------|
| `specify` | `references/specify.md` (`references/review.md` at its review step, when a reviewer runs) | `./.specs/<slug>/spec.md` |
| `design` | `references/design.md` (+ `references/review.md`) | `./.specs/<slug>/design.md` |
| `plan` | `references/plan.md` | `./.specs/<slug>/plan.md` |
| `execute` | `references/execute.md` (+ `references/verification.md`) | code + commits |
| `fix` | `references/fix.md` | re-aligned artifacts + code |
| `auto` | `references/auto.md` (+ `references/decide.md`) | code + commits + PR |

When `state.md` records `Surface: ui`, every phase also reads `references/ui.md`, which
holds every frontend rule. A change with `Surface: none` never opens it.

`references/structural-standards.md` is the single always-applied baseline for what good
structure is and how a structural review runs. Two dispatches load it: `review.md`'s
under-design lens and `verification.md`'s structure verifier. It is the only structural
check set in forge.

`references/glossary.md` indexes forge's load-bearing terms — the door verdict, blast
radius, a seam, a stage, the three lies — and names where each one is defined. No phase
dispatches it; read it when a pointer uses a term you cannot place.

Only `auto` loads `references/auto.md` and `references/decide.md`; a plain verb never
opens them. Under the conductor (the agent running `/forge auto`), every ask, confirm or
escalate in a phase is a decision point handled per `references/decide.md`, not a
question to the user.

If no verb is given, infer the phase from the request and confirm it. Never fail because
a verb is missing or unknown. Common mappings:

| Request pattern | Phase |
|-----------------|-------|
| "write a PRD", "what should this do", problem with no proposed solution | `specify` |
| "design this", "how should we build X", architecture question | `design` |
| "break this into tasks", "plan the work" | `plan` |
| "implement X", "build this", spec + plan already exist | `execute` |
| "this detail is wrong", "correct course", "I don't like this design", "found a bug while testing", change to an in-flight spec/design/plan/code | `fix` |

`specify` takes a feature name. If absent, ask for one and derive a kebab-case slug.

Forge does not orchestrate phase transitions — you do. Start at any phase. A phase that
finds no earlier artifacts gathers the minimum context it needs; each reference
describes its own fallback.

## Every phase starts by

1. Resolving `SPECS_ROOT` (see *Artifact root*).
2. Resolving the slug. `specify` derives it from the feature name. Other phases take the
   argument when it names a `.specs/` directory; otherwise, when the request does not
   point elsewhere, the only directory there; otherwise they ask, and `fix` refuses when
   none exists. A direct `/forge execute` on a new change derives one.
3. Re-reading `state.md` if it exists, and otherwise creating it from the template (`fix`
   refuses instead). Do not assume the runtime
   preserves its own internal state across phases — if it is not in `state.md`, it did not
   happen.
4. Picking the size and classifying the door and the surface, each one `state.md` does not
   record, the door per `references/specify.md`. `Surface` is `ui` when an AC's outcome is
   something a person sees or operates on a rendered screen, or the change edits code that
   renders, styles or lays out a screen; otherwise it is `none`. Judge by behaviour, never
   by file extension.
5. Loading `lessons.md` if it exists: all Standing Rules, plus Log entries tagged to the
   area of this work.

**A compaction is a resume.** After one, re-read this file and the phase's reference,
because rules read hours earlier may be gone. Treat Handoff as a hypothesis and reconcile
it with git and the task status before acting on it.

## Sizing

Every change is one of three sizes. The size controls how deep each phase goes and which
phases are needed at all. A change is **quick** unless a trigger below it fires, and then
the **largest** tier with a trigger that fires. When in doubt, size up: under-sizing skips
rigor a change needed, and over-sizing only wastes some effort. The numeric anchors are
rough guides; the qualitative triggers decide.

| Tier | Triggers (any one promotes to this tier; quick's are its limits) |
|------|------------------------------------------|
| **quick** | ≈ ≤2 files / ~30 LOC; no new public interface; no schema/API/contract change; no new dependency; an existing test pattern already covers the seam |
| **standard** | ≈ more than quick's limit, up to ~6 files within one component/module/service; a mechanical change of any reach (the same edit repeated, such as a rename); one new interface or endpoint; a new dependency; a schema/API/contract change; no existing test pattern covers the seam |
| **complex** | ≈ more than ~6 files of non-mechanical change; a non-mechanical change crossing components, services, or repos; new subsystem or migration; requirements are ambiguous; touches security/PII/auth/payments |

The first phase to run picks the size and writes it to `state.md` with a one-line
justification. Any later phase that finds no recorded size picks it the same way. **Size
can only go up.** Any phase may promote it with a reason logged in Decisions. A downgrade
requires the user's confirmation — ratcheting prevents work from quietly skipping rigor a
later phase already showed it needed.

Depth per phase:

| Phase | quick | standard | complex |
|-------|-------|----------|---------|
| **specify** | Inline spec: Problem, Conventions observed, Request, 1–3 ACs; a one-way door adds Scope and Assumptions. Light domain map, no impact trace. | Full spec + impact trace + calibrated sweep | Full spec + impact trace with cross-repo/service ripples + full dimension sweep |
| **design** | Skip | Code-reuse analysis, interfaces, verdicts, data models if any, error matrix, verification gates, risks, hard-to-reverse choices | + architecture diagram, alternatives, full risk register |
| **plan** | Skip (one implicit phase with one implicit task) | 1–3 phases, one per integration boundary, with a parallelism assessment | Several dependency-ordered phases, sequencing, execution risks |
| **execute** | Implement + the gate below | Per phase: implement + the gate below | Per phase: implement + the gate below |

Gates per size. A plan phase's gate **is** its verifiers: there is no separate phase-gate
step. Reviewer and lens numbers are defined in `references/review.md`, verifier numbers in
`references/verification.md`.

| Gate | quick | standard | complex | a one-way door adds |
|------|-------|----------|---------|---------------------|
| **Spec reviewers** | none | 1, 2 | 1, 2, 3 | 3 |
| **Design lenses** | no design | 1, 2, 4 | 1, 2, 3, 4 | 4 (at quick, reading the ACs gathered inline) |
| **Verifiers** | 1, 2, 3 in conventions-only mode | 1, 2, 3, 4 | 1, 2, 3, 4, 5 | all 5 at any size, with 3 in full mode |

A screen phase is one whose diff renders, styles or lays out a screen, or adds or changes
an item, message or label a screen displays. Its gate also includes the look, placed by
`references/verification.md` and run per `references/ui.md`.

Each phase ends by stating the size and naming the next needed phase: quick goes from
`specify` to `execute`; standard and complex run the whole chain, except that `specify` may
log a design skip at standard. The user still drives every transition.

## Artifacts and state

### Artifact root (session CWD)

All `./.specs/*` paths in this skill resolve against the **session CWD** — the
directory the agent was invoked in — **not** the shell's current directory at
the moment of the write. Subsequent `cd`s do not move the artifact root.

**At the start of every phase, resolve the artifact root once and reuse it.**
Capture the session CWD as an absolute path (`pwd` at the very first Bash call
of the session, or the harness-provided starting directory) and set
`SPECS_ROOT="<abs>/.specs"`. Every read, write, `mkdir`, and `ls` inside this
skill must go through `$SPECS_ROOT/...`. Never use a bare `.specs/...` after
that resolution — a bare path would be interpreted against the current shell
CWD and drift into a subfolder.

If the resolved root points inside another repo's `.specs/` (e.g. the user
invoked the skill from a nested package), **stop and confirm** with the user
before writing.

All work for a change lives under `./.specs/<slug>/` (create it if missing):

```text
./.specs/<slug>/spec.md       what & why (requirements, acceptance criteria, scope)
./.specs/<slug>/design.md     how (architecture, contracts, verification gates)
./.specs/<slug>/plan.md       tasks grouped into phases (parallel within a phase, AC-traced)
./.specs/<slug>/state.md      size, door, decisions, task status, findings, handoff — the source of truth
./.specs/<slug>/lessons.md    what went wrong here and the rule going forward
```

Templates for each are in `templates/`. **`state.md` is the single source of truth.**

Acceptance criteria are written **once**, in `spec.md`, with stable IDs (`PREFIX-NN`).
Design, plan, and execute reference those IDs; they never restate the criterion text.

## Lessons

Each change keeps its own `./.specs/<slug>/lessons.md` with `## Standing Rules` (short
imperatives, at most about 15, always loaded) and `## Log` (tagged, append-only).

Write at the end of `execute`, and at the end of a `fix` that corrected a wrong assumption
or exposed a hidden coupling. Other phases only read. Append **only when something
non-obvious was learned**: a hack, a gotcha, a corrected wrong assumption, a skipped gate.
Routine success writes nothing.

Every entry cites a source: an AC ID, a test, a `file:line`, a surviving mutant, or a
failed gate. An entry with no source is an opinion, so do not record it. Log entries read
`date · [tag] · source · what went wrong · root cause · rule going forward`. Delete a
Standing Rule that proves wrong. If you can't name what the next agent should do
differently, don't write an entry. Observations about forge itself stay out of this file.

## Orchestration (canonical — references should cite, not restate)

- **Use subagents for parallel or heavy work.** They run in Claude Code and OpenCode.
  They keep the main agent's context small and give independent perspectives (execute's
  verifiers depend on this).
- **Workflow is an optional speed-up** for dispatching many subagents at once, where
  the runtime supports it. Plain sequential subagent calls always work as a backup.
  Never require Workflow.
- **Match model tier and reasoning effort to the task.** See below. This is the primary
  cost lever.
- **One level of delegation.** Subagents do not spawn subagents.
- **Subagents are stateless.** Put everything they need in the prompt (file paths, section
  refs, constraints), and name `references/glossary.md` when it uses forge's terms.
  Outputs over ~100 lines go to a file; return the path, not the content.
- **Prefer `AskUserQuestion` when available**, with a recommended default per question.
  Fall back to a single plain-text question otherwise. Never bundle unrelated questions.
  Under the conductor, the clarify gate batches up to five questions per round, per
  `references/auto.md` → *Clarify gate*.

### Model & effort selection

Every subagent dispatch picks a tier and an effort; never let a whole fan-out default to
the most expensive model. Map tiers to the runtime's per-subagent model control (in Claude
Code, `haiku`, `sonnet`, `opus`). With no such control, skip the tier and rely on effort.
With no effort dial, fold the intent into the tier.

- **Economy, low effort:** read-only scouting; verifiers 1 and 2; an implementer task that
  creates no new file, exported type, interface or class, and either mirrors a `reuses`
  pointer or is mechanical with a clear gate. `no-precedent` is not a pointer: it says a
  design decision is needed.
- **Standard, medium effort:** ordinary implementation; verifier 5; any task creating
  a new file, exported type, interface or class — never economy, because where a
  responsibility belongs is decided once, when the file or type is created; and any task
  carrying the UI brief (`references/ui.md`), even one with a `reuses` pointer.
- **Standard, high effort:** review lenses and verifiers 3 and 4 at `standard`, or on a
  one-way door at `quick`; the look at every size. Analysis and adversarial work is never
  economy.
- **Frontier, high effort:** design synthesis and plan decomposition for a complex change,
  and review lenses and verifiers 3 and 4 at `complex`.

A `quick` change should almost never dispatch a frontier subagent. When unsure between two
tiers, pick the lower and let a failed gate promote it.

## Universal rules (apply to every phase)

### State hygiene

1. Write size, decisions, and status changes to `state.md` as they happen, not at the end.
   Write Handoff at every stop, including a blocked task and an escalation, not only on
   success.
2. **Write surgically.** Edit only the target section — replace the content between its
   `##` header and the next `##` or end-of-file. Never regenerate the whole file or
   reorder sections; that silently clobbers append-only or update-in-place sections you
   did not mean to touch. Section write modes:

   | Section | Write mode |
   |---------|------------|
   | `## Decisions` | append-only (never edit existing rows) |
   | `## Baseline` | write once per change; rewritten only on a recorded user decision |
   | `## Tasks` | update-in-place (status, evidence, each phase's `Base:`, `Fix-base:` and `Verifying:` lines) |
   | `## Open findings` | update-in-place; clear only `applied` rows on resolve |
   | `## Verification evidence` | append-only: on PASS, plus `fix`'s superseded rows |
   | `## Handoff` | overwrite |
   | `Mode` and `Auto stage` header fields (`state.md`) | `Mode`: write once (`auto`); `Auto stage`: update-in-place along the stage machine |
   | `## Run` (`state.md`) | update-in-place; its write-once fields are marked (once) in the template |
   | `decisions.md` | append-only (supersede a record, never rewrite it) |
   | `Size`, `Door` and `Surface` header fields (`state.md`) | update-in-place (upward, to one-way, or to `ui` only; a downgrade needs the user) |
   | `## Conventions observed` (`spec.md`) | overwrite-in-place (regenerated whole on a specify re-run) |

   A section with no row here is clobbered by the next surgical write, so adding one
   means adding its row in the same change.

### Honesty

3. Never claim a task or gate passed without running it. Done means you saw it pass,
   not that you believe it would.
4. Record honestly. Open questions, skipped gates, and assumptions stay visible. Never
   cover a gap with an invented answer. A gap is a row in `## Open findings`.
5. A run that cannot ask the user (non-interactive) picks the recommended default, logs it
   in Decisions as a flagged assumption, and surfaces it when it reports. A decision about a
   one-way door stops instead.
   Under the conductor, `references/decide.md` → *Tiers* (T3) governs instead; a one-way
   door's irreversible path is a provisional decision there, not a stop. A check that
   cannot run on a one-way door is still a hard stop (`references/auto.md` → Guards →
   *Hard stops*).

### Retries

6. **Every retry against a check stops at 3 cycles.** A cycle is one fix plus one re-run of
   the check that failed, so a check gets its first run plus at most 3 re-runs. Each
   playbook names the exit. An interview or a scan gathers information rather than
   retrying a failed check, so it runs to its own stop condition instead.
7. A failure the fix did not cause — one that predates the check's first failing run, or
   one in a path the fix cannot affect — spends no cycle and does not loop: record it,
   then stop and report. A cap never justifies weakening a check.

### Hand-off

8. Each phase finishes, reports, and **recommends the next verb** — it never runs the
   next phase. The one documented exception is `fix`: for a *contained* correction it
   re-aligns the artifacts and runs the code delta end-to-end in the same invocation
   (see `references/fix.md`); a larger correction still only recommends the phase chain.
   Under the conductor, the chain runs phase to phase per `references/auto.md` → *Driving
   the chain*.
9. **Approval is local.** Approving a spec, a design or a plan never authorises a remote
   action. Push, deploy, or run a production migration only on the user's explicit request
   for that action.
10. `/create-rfc` and `/create-adr` are separate skills. Use `/create-rfc` when a decision
   is **still open and binds someone outside this change** — a one-way door per
   `state.md`'s verdict, a contract another consumer already depends on, or an assumption
   `spec.md` flagged as spec-invalidating if wrong. Use `/create-adr` once such a decision
   is **settled**, so the next reader finds the reasoning instead of re-deriving it. A
   decision this change can settle on its own belongs in `state.md`'s Decisions. Reach for
   either at any point in the flow.
