---
name: forge
description: >
  Spec-driven development workflow that takes a change from problem to shipped, verified
  code in four phases: specify, design, plan, execute — plus a `fix` command to correct
  course mid-stream. Auto-sizes from one-line fixes to multi-repo refactors. Invoke with
  `/forge specify|design|plan|execute|fix`.
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
```

## Dispatch

Read the first argument as the phase verb. **Read the matching reference file fully
before acting** — it is the step-by-step playbook for that phase.

| Verb | Read | Produces |
|------|------|----------|
| `specify` | `references/specify.md` (+ `references/review.md`) | `./.specs/<slug>/spec.md` |
| `design` | `references/design.md` (+ `references/review.md`) | `./.specs/<slug>/design.md` |
| `plan` | `references/plan.md` | `./.specs/<slug>/plan.md` |
| `execute` | `references/execute.md` (+ `references/verification.md`) | code + commits |
| `fix` | `references/fix.md` | re-aligned artifacts + code |

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

## Sizing

Every change is one of three sizes. The size controls how deep each phase goes and
which phases are needed at all. See `references/sizing.md` for the full rubric.

| Size | Roughly | Pipeline |
|------|---------|----------|
| **quick** | one file/function, no new interface/schema/dep | inline spec → execute (skip design + plan) |
| **standard** | one component/module, a few files | full spec → light design → phased plan → execute |
| **complex** | crosses components/repos, new subsystem, ambiguous | full pipeline, all gates |

The first phase to run picks the size and writes it to `state.md`. Size can only go up.
Any later phase may promote it with a logged reason. A downgrade requires the user's
confirmation — ratcheting prevents work from quietly skipping rigor a later phase
already showed it needed. Each phase ends by listing which downstream phases the
current size needs or lets you skip.

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
./.specs/<slug>/state.md      size, decisions log, task status, handoff — the source of truth
./.specs/<slug>/lessons.md    what went wrong here and the rule going forward
```

Templates for each are in `templates/`. **`state.md` is the single source of truth.**
Re-read it at the start of every phase. Do not assume the runtime preserves its own
internal state across phases — if it is not in `state.md`, it did not happen.

Acceptance criteria are written **once**, in `spec.md`, with stable IDs (`PREFIX-NN`).
Design, plan, and execute reference those IDs; they never restate the criterion text.

## Lessons

Each change keeps its own `./.specs/<slug>/lessons.md` with `## Standing Rules` (short
imperatives, always loaded) and `## Log` (tagged, append-only). Load it at the start of
every phase. Append **only when something non-obvious was learned**: a hack, a gotcha,
a corrected wrong assumption, a skipped gate. Routine success writes nothing. See
`references/lessons.md`.

## Orchestration (canonical — references should cite, not restate)

- **Use subagents for parallel or heavy work.** They run in Claude Code and OpenCode.
  They keep the main agent's context small and give independent perspectives (execute's
  verifiers depend on this).
- **Workflow is an optional speed-up** for dispatching many subagents at once, where
  the runtime supports it. Plain sequential subagent calls always work as a backup.
  Never require Workflow.
- **Match model tier and reasoning effort to the task — don't pay frontier rates for
  mechanical work.** See Model & effort selection below. This is the primary cost lever.
- **One level of delegation.** Subagents do not spawn subagents.
- **Subagents are stateless.** Put everything they need in the prompt (file paths,
  section refs, constraints). Outputs over ~100 lines go to a file; return the path,
  not the content.
- **Prefer `AskUserQuestion` when available**, with a recommended default per question.
  Fall back to a single plain-text question otherwise. Never bundle unrelated questions.

### Model & effort selection (canonical — references cite, not restate)

Every subagent dispatch picks two dials. Set them explicitly per task; never let the
whole fan-out default to the most expensive model. This is agent-agnostic — map the
tiers to whatever your runtime exposes.

**Tier** — the model's capability class:

| Tier | Use for | Claude Code | OpenCode |
|------|---------|-------------|----------|
| **economy** | mechanical, well-scoped, low-ambiguity work with a clear pass/fail or a precedent to mirror | `haiku` | cheapest capable model configured |
| **standard** | ordinary implementation and verification needing moderate reasoning | `sonnet` | the default agent model |
| **frontier** | ambiguous synthesis, cross-cutting design, adversarial judgment, hard trade-offs | `opus` | strongest model configured |

Pass the tier via the runtime's per-subagent model control (`model` on the Agent tool
or Workflow `agent()`, `model` in a subagent definition's frontmatter, or the OpenCode
agent's model field). If a runtime exposes no per-subagent model control, skip this dial
and rely on effort alone — never block on it.

**Effort** — reasoning/thinking budget, where the runtime supports a reasoning-effort or
thinking-budget setting: `low` for mechanical tasks, `medium` for ordinary work, `high`
only for genuinely hard reasoning (adversarial refutation, ambiguous design). Where the
runtime has no effort dial, fold the intent into tier choice.

**Defaults by work type** (start here, adjust for the specific task):

| Work | Tier | Effort |
|------|------|--------|
| Read-only codebase scouting (specify), mirror-a-precedent implementer with a `reuses` pointer | economy | low |
| Mechanical `[P]` implementer task with a clear task gate | economy | low–medium |
| Ordinary implementer task, most single-verifier runs | standard | medium |
| Design/architecture synthesis, plan decomposition for a complex change | frontier | high |
| Adversarial or cross-cutting verification (the AC-trace / integration verifier) | standard→frontier | high |

**Size interacts with tier.** A `quick` change should almost never dispatch a frontier
subagent; a `complex` change earns frontier for its design and adversarial gates but
still routes mechanical tasks to economy. When unsure between two tiers, pick the lower
and let a failed gate promote it — the same ratchet as sizing.

## Universal rules (apply to every phase)

### State hygiene

1. Re-read `state.md` at the start of every phase. Write size, decisions, and status
   changes there as they happen, not at the end.
2. **Write surgically.** Edit only the target section — replace the content between its
   `##` header and the next `##` or end-of-file. Never regenerate the whole file or
   reorder sections; that silently clobbers append-only or update-in-place sections you
   did not mean to touch. Section write modes:

   | Section | Write mode |
   |---------|------------|
   | `## Decisions` | append-only (never edit existing rows) |
   | `## Tasks` | update-in-place (status, evidence) |
   | `## Validation delta` | clear-on-resolve |
   | `## Verification evidence` | append-on-PASS |
   | `## Handoff` | overwrite |

### Honesty

3. Never claim a task or gate passed without running it. Done means you saw it pass,
   not that you believe it would.
4. Record honestly. Open questions, skipped gates, and assumptions stay visible. Never
   cover a gap with an invented answer.

### Hand-off

5. Each phase finishes, reports, and **recommends the next verb** — it never runs the
   next phase. The one documented exception is `fix`: for a *contained* correction it
   re-aligns the artifacts and runs the code delta end-to-end in the same invocation
   (see `references/fix.md`); a larger correction still only recommends the phase chain.
6. `/create-rfc` and `/create-adr` are separate skills. Use `/create-rfc` when a
   significant decision needs stakeholder alignment; use `/create-adr` when an
   architectural choice deserves a standalone record. Reach for either at any point in
   the flow.
