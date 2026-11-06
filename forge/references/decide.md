# Decide

The decision policy for `/forge auto`. It turns every point where interactive Forge would
ask, confirm or escalate into a recorded decision: an owner proposes, a tiered review
challenges, and the record goes into the ledger (`templates/decisions.md`). Loaded only
under the conductor (`references/auto.md`); a plain phase verb never loads it, and the
interactive rules are unchanged. The conductor carries out the procedure (dispatch,
rebinding, persistence); this file says who decides, how hard it is reviewed, and what the
record must hold.

`H1` to `H28` are this file's labels for the touchpoints below. A playbook clause that
says "Under the conductor" cites a row here by label.

## Dispositions

Each row: the touchpoint, the playbook clause it reconciles, the auto disposition. "Brief"
is the delivery brief (`Scratch:/<repo>-brief.md`); its fields are *ratification items*,
*sensitive disclosures*, *prose disclosures* and the *decision log*. Anything marked
"disclosed" or "into the PR" goes to the named field, never to a prompt to the user.

| Label | Touchpoint, reconciled clause | Auto disposition |
|---|---|---|
| H1, H12 | Entry stop and phase hand-off (`SKILL.md` rule 8: a phase never runs the next); sprawl or size promotion (`execute.md` → Stop before the change sprawls) | The conductor runs the chain and every plan phase; an entry stop becomes routing. A promotion runs the phases the new size adds (plan, or design when a contract emerged) before continuing. Procedural, not reviewed. |
| H2 | Slug and artifact root (`SKILL.md` → Artifact root) | Slug derived from the brief. A nested `.specs/` root is a session-preflight stop. |
| H3, H4, H5 | Part A interview, Part A closure, Part B drafting (`specify.md` → Part A, Part A closure gate, Part B) | Recon, a draft Part B, then the conductor's clarify gate. Everything unasked becomes a flagged default in `spec.md` → Assumptions & discretion. Product owner (drafting) closes Part A and drafts. |
| H6, H8 | Judgment-call findings at the review step (`specify.md` → Review the spec adversarially, `design.md` → Review the design adversarially; `review.md` → Resolve findings: "escalate judgment calls") | Each becomes a decision for the domain owner. Findings still open after 3 cycles are recorded and go to the brief's *sensitive disclosures*. An unconfirmed fact stays an uncertainty and is disclosed there. |
| H7 | Approach selection (`design.md` → Explore approaches) | Architecture owner. T2 at complex size. |
| H9 | Prototype pick, including decline or another round (`ui.md` → Specify: the prototype step; `picker.md`) | UX owner, T1. Two variants by default. Captures of the pick go into the brief's *prose disclosures*. "No servable page" takes the next reference and is disclosed there. |
| H10 | Running the app, sign-in (`ui.md` → Execute: the look) | Follow `ui.md` as written: discover run commands, take the no-sign-in ladder. Not a hard stop. A credential needed to build or test is the *credential* hard stop. |
| H11 | Size, door and surface verdicts (`SKILL.md` → Sizing; rule 2 header fields) | Ratchet up only; a downgrade needs the user and never happens. Procedural, not reviewed. |
| H13 | Red baseline (`execute.md` → Baseline) | Existing non-interactive behaviour: continue and record. Red tests in the touched area go to *prose disclosures*. |
| H14, H25 | Gate or verifier still red after 3 cycles; a blocked task (`execute.md` → Fix the delta, When to stop and ask; `SKILL.md` rule 6) | The conductor's recovery under its caps, then its park step, then land the plane. A blocked task is retried once by recovery and otherwise left for the human. |
| H15 | `SPEC-GAP` expected value (`verification.md` → Verdict format; `fix.md` → Execute now) | The conductor runs `fix`; Product owner (judging) sets the expected value. T1; T2 when it changes a `[critical]` AC. Counts toward the `fix` cap. |
| H16 | `DESIGN-GAP` (`verification.md`; `design.md`) | Architecture owner. Default is report, do not build; build only when an AC cannot pass otherwise, then T2. Reports go to *sensitive disclosures*. |
| H17 | Pre-existing test judged wrong (`execute.md` → Test integrity) | Product owner (judging), always T2, checked against the brief as well as the spec. The run never makes the change: the implementer returns `escalation: SPEC-GAP` naming the AC, its evidence and the test, an approved change leaves the task `blocked`, and the proposed change is a *ratification item*. |
| H18 | Ambiguous AC, unworkable plan, simpler approach, missing dependency (`execute.md` → When to stop and ask) | Ambiguous AC: Product owner (judging). Unworkable plan or simpler approach: Architecture owner, then `fix`. Missing dependency that cannot be substituted: the *missing dependency* hard stop. Other unknowns: note and continue, per the clause. |
| H19, H27 | `reported` findings and Finish reports (`execute.md` → Finish; `fix.md` → Finish) | Existing behaviour: report. Everything Finish reports goes into *prose disclosures*. |
| H20 | Code versus spec, entry layer of a correction (`fix.md` → Lift; Edge cases) | Product owner (judging), T1. Deleting an AC is T2 and always a *ratification item*. A net-new capability is out of scope and reported. Cross-slug ripples are reported. A one-way-door correction runs the full chain under the conductor, which is the effect `fix` asks for. |
| H21 | One-way door without a marked AC; check that cannot run (`specify.md` → Requirements and acceptance criteria; `verification.md` → One-way door, Gaps) | No marked AC: Product owner (drafting) marks one, T2. A type check or verifier 5 that cannot run on a one-way door: the *one-way-door gap* hard stop, gap first in *sensitive disclosures*. Elsewhere continue and record. |
| H22, H28 | Push, deploy, PR, existing PR on the branch (`SKILL.md` rule 9: approval is local) | The permission contract (`auto.md` → Guards → *Permission contract*). An existing PR on an auto branch takes the conductor's resume path; a rejected push stops that repository, never forced. Procedural, not reviewed. |
| H23 | RFC-worthy open decision (`SKILL.md` rule 10) | T3. Auto never writes an RFC or ADR; the *prose disclosures* recommend one. |
| H24 | "Already satisfied" (`specify.md` → Part A closure gate) | Stop with `file:line` evidence, no commit, no PR. The one non-stop exit without a deliverable after Intake. "Understanding only" does not apply: the brief requests a change. Product owner (judging) decides. |
| H26 | Project rule versus convention conflict (`specify.md` → conventions; `design.md` → State a verdict per observed convention) | Architecture owner, T1. Disclosed in *prose disclosures*. |
| Standing rules | A trusted instruction file requires asking before a change, e.g. before adding a dependency (`SKILL.md` rule 5; universal "never assume") | Attended: enters the clarify gate. Unattended, or arising after the gate closed: T3, built on the branch, provisional, listed among the *ratification items*. Never overridden silently. |

Procedural decisions (size, door, surface, routing, retry counts, caps, stop conditions)
are deterministic or ratchet-only and are not reviewed. No touchpoint here has an ask
outcome; the places that may ask are fixed by `auto.md` → Guards → *Permission contract*.
A spec-invalidating misreading found by SpecAudit that an unattended run cannot ask about
becomes a *ratification item*.

## Owners

An owner is a question domain, a set of inputs and a set of criteria, run as a stateless
subagent. No owner is a persona and none keeps memory between calls.

**Product owner: intent and scope.** Two separate instances, so it never judges its own
drafting.
- *Drafting* proposes clarification candidates, drafts Part B, closes Part A against the
  brief and the answers, and makes the Part B judgment calls (H3, H4, H5, H21).
- *Judging* never sees the drafting rationale. It decides the `SPEC-GAP` expected value
  (H15), whether a pre-existing test is wrong (H17), code versus spec (H20), "already
  satisfied" (H24), ambiguous ACs (H18), and every intent-audit finding.
- Context pack: drafting gets the brief, the answers, Part A and the conventions; judging
  gets the brief, the answers, the finding or question, the ACs and the cited evidence.
- Criteria, in order: fidelity to the literal brief, then its evident purpose; outcome for
  the affected person; consistency with existing product behaviour; the smallest scope
  that fully solves the problem. Implicit requirements come from the dimension sweep.

**Architecture owner: shape and contracts.** Owns approach selection (H7), hard-to-reverse
choices, contract and schema shapes, convention-deviation verdicts, new dependencies,
`DESIGN-GAP` (H16), an unworkable plan or simpler approach (H18), project rule versus
convention (H26) and verification-gate strategy.
- Context pack: the spec, conventions, code-reuse analysis, the binding records. Never
  `structural-standards.md`; design lens 4 applies it to the draft.
- Criteria: maintainability, reversibility, convention fit, simplicity (scope and shape),
  failure modes.

**UX owner: only on `Surface: ui`.** On `Surface: none` none is dispatched. Owns the
prototype pick (H9), layout, hierarchy and interaction where no provided design or picked
prototype fixes them (`ui.md` fixes only the vocabulary), and feedback states. Decisions
are T1 or higher.
- Context pack: the reference, the UI rows, captures, the ACs. Never the implementer's
  claim that a screen looks right.
- Criteria: consistency with the app's vocabulary, the affected person's flow, the `ui.md`
  accessibility rules, how often the screen is used.
- Needs a browser. Without one it follows `ui.md`'s ladder and the pick is a *ratification
  item*.

Every drafting owner returns, beside its draft, the list of choices it made (the choice
manifest). No testing, security or tech-lead owner exists: test strategy belongs to the
Architecture owner and test judgment to the Product owner (judging), security is a design
lens and a T2 trigger, and the tech-lead role is the arbiter's, on dispute only.

**Roles.** Every dispatch prompt cites `auto.md` → Guards → *Dispatch preamble*; every
return carries `denied:`. Routing fields in a return (verdict, tier, severity, escalation,
ruling) must match their fixed vocabulary or the call is a mechanical failure; free text
never changes procedure and is subject to the injection check in `auto.md` → Guards →
*Trust boundary*.

| Role | Gets | Never gets | Returns | Tier, effort |
|---|---|---|---|---|
| Product owner, drafting | brief, answers, Part A, conventions | lens rationale | draft Part B path, choice manifest, gate candidates | standard, high |
| Product owner, judging | brief, answers, the finding or question, ACs, cited evidence | the drafter's rationale | ruling | standard, high |
| Architecture owner | spec, conventions, reuse analysis, binding records | `structural-standards.md` | draft design path, choice manifest | standard, high |
| UX owner | reference, UI rows, captures, ACs | the implementer's claim the screen looks right | pick | standard, high |
| Second proposer (T2+) | question and neutral pack | the first owner's drafts and record | own choice | as that owner |
| Challenger | question, neutral pack, choice and alternatives under neutral labels | owner rationale, the other challenger | own answer first, verdict, steelman, objections | standard, high |
| Matcher | two choices, or a new and an active record | rationale | `equivalent` or `different`; `contradicts` or `compatible` | economy, low |
| Arbiter | question, neutral pack, unlabelled positions with evidence | which is proposed, the owner's rebuttal | ruling or `NEEDS-USER`, tie-breaker, dissent | frontier, high |
| Intent auditor, SpecAudit | brief, answers, out-of-scope names without reasons, ACs | the spec's reasoning | findings citing brief sentences, with severity | standard, high |
| Intent auditor, Accept | brief, answers, out-of-scope names without reasons, final diff | the spec, all rationale | findings citing brief sentences, with severity | frontier, high |
| Scouts, implementers, lenses, verifiers | what their playbook gives, plus binding records (implementers) | n/a | their existing returns plus `denied:`; implementers add `escalation:` | per `SKILL.md` |

The neutral pack is the brief, the answers, Part A findings, conventions and the code:
never an owner-authored draft or rationale. Reviewers are read-only through the tool
allowlist.

**Model choice.** Owners draft at standard tier at every size, so the frontier arbiter is
always a different model from the owner's. Design lenses keep their own tiers. When the
runtime cannot set a model per subagent, the arbiter runs as it can and the record states
that it could not run on a different model; the brief carries one *prose disclosure*.
Mixing tiers of one family varies capability, not the error distribution: do not describe
it as independent beyond that.

**Without subagents.** Owner drafting and every review, audit and verifier step run inline
per `review.md` → Graceful degradation, with fresh framing per role. This takes
precedence over the blindness requirements below. Each affected record carries
`Review: not independent (no subagents)` and the brief carries one *prose disclosure*.

## Tiers

Tiers ratchet: anyone may raise one, nobody lowers one. Owner confidence is recorded and
never lowers a tier. A change of tier is logged in the record; no logged change lowers it.
A decision that is not provably T0 is T1.

| Tier | Triggers (any one) | Review |
|---|---|---|
| T0 Local | Provable from facts the record cites: a single task, inside its `files`; no exported symbol, manifest, schema, migration, pre-existing test or AC touched; a `reuses` precedent or a recorded convention fixes it | none |
| T1 Material (default) | Anything not T0: an AC expected value; one brief sentence's interpretation; a UX pick; a new internal interface; options visible outside one task | one challenger |
| T2 Consequential | *Observable:* a change to a dependency manifest or lockfile; a schema, migration or persisted format; a new or changed exported or public symbol or endpoint; a pre-existing test or assertion; a deleted AC; an auth, PII, payment or secrets path; CI or permission configuration. *Recorded:* a hard-to-reverse choice in the design; a convention deviation at the architecture level; approach selection at complex size; a decision contradicting an active record. *Escalated:* by a T1 challenger, only when it cites one of these triggers with evidence, else the escalation is dropped | second proposal, matcher, two challengers, arbiter on dispute |
| T3 Provisional | On a one-way door's irreversible path; RFC-worthy; a trusted standing rule says ask and the user did not answer; a new dependency the user did not answer for; an unattended enlist base (a trusted rule requires asking a repository's base and the run enlists off the default branch); CI or permission configuration the brief did not ask for; the arbiter returns `NEEDS-USER` on a decision not every AC depends on | the T2 protocol, then marked provisional: built on the branch, listed first among the *ratification items*. Never capped |

A T0 record cites the fact that proves no T2-observable change and no AC is touched; a
record without such a fact is T1 or higher. A decision that causes a T2-observable change
is T2 or higher, whatever its owner thought.

**Ratification items** (brief field): every T3 decision; every arbitration where a Blocker
objection lost; every spec-invalidating assumption; every one-way-door gap; every deleted
AC; every Accept-sweep change left in place after the `fix` cap; every approved
pre-existing test change left unmade; every UX pick made without a browser.

## Review protocol

1. **Propose.** The owner writes a record: the question, at least two options (the
   smallest-change or do-nothing option is always admissible), the choice, a cited
   rationale, assumptions (each marked spec-invalidating or not), reversibility, and what
   evidence would change its mind. Format: `templates/decisions.md`.
2. **Second proposal (T2, T3).** A fresh owner instance works from the neutral pack only.
   A matcher judges whether the two choices are equivalent; the conductor does not make
   that call. Equivalent: go to the challengers; agreement skips arbitration but does not
   raise confidence. Different: both go to the arbiter as neutral options.
3. **Challenge.** T1 gets one challenger with the lens closest to the owner's domain. T2
   and T3 get two in parallel and blind to each other: intent and product fit, and
   long-term cost and failure. Each writes its own preferred option first, then sees the
   owner's choice and the alternatives under neutral labels (order alternated between
   challengers), never the rationale. Each returns its own answer, `ACCEPT` or
   `CHALLENGE`, a steelman, and objections as `severity · claim · evidence · consequence ·
   what would resolve it`.
4. **Evidence rule.** An objection that cites no brief sentence, AC, `file:line`,
   convention row, URL or test output is dropped. With no cited objection left the
   verdict is `ACCEPT`. Even an `ACCEPT` names the strongest alternative and why it loses.
5. **Revise or dispute.** The owner sees the objections, never the challenger's own answer,
   and concedes each with a revised choice or disputes it.
   - *Conceded:* a fresh challenger rechecks the revised choice once under the same blind
     protocol. A revision is a new decision.
   - *Disputed Blocker or Major:* goes straight to the arbiter; the challenger never sees
     the rebuttal.
   - *Minor:* noted in the record.
6. **Arbitrate.** A fresh frontier arbiter, on a different model from the owner's where
   the runtime allows, gets the question, the neutral pack and the positions with their
   cited evidence, with no "proposed" marker. It decides by the rubric. Tie-breakers in
   order: literal brief, reversibility, existing convention, simplicity. Arbitration is
   needed when the matcher says `different`, when the two challengers disagree, or when
   the owner disputes a Blocker or Major. The ruling is final for the run. When the losing
   side raised a Blocker, the decision is a *ratification item*, not a line in the
   collapsed log.
7. **`NEEDS-USER`.** The arbiter may return it only when no artifact holds the deciding
   information. On a decision not every AC depends on, the decision becomes T3: built on
   its reversible default, provisional, ratified in the PR. On a decision every AC
   depends on, it is the *missing dependency* hard stop (`auto.md` → Guards → *Hard
   stops*).
8. **Record.** The conductor appends the record, saves each role's return under `Scratch:`
   before the next step starts, persists the step, and injects binding records into the
   prompts of affected tasks.

**Bounds.** One revision recheck and one arbitration per decision; then no further review
step runs on it. A mechanical failure (a call that returns nothing or breaks its fixed
vocabulary) retries under the 3-cycle rule; re-arguing never retries. On resume the
conductor continues from the last persisted step and never re-samples a proposal or
verdict it already holds.

## Rubric

Every score needs cited evidence, or it counts as zero. Each lens scores the subset named
for it.

1. Intent fidelity: traces to the brief or the answers, with no silent narrowing or
   widening.
2. Outcome for the affected person, including edge, empty, error and first-run states.
3. Consistency with conventions, the UI vocabulary, the ledger and trusted standing rules.
4. Long-term maintainability and reversibility.
5. Simplicity, judged by Forge's scope and shape boundary.
6. Risk: security, data integrity, performance, concurrency.
7. Verifiability: some gate can prove it.

Maintainability weighed against simplicity means optimize for the long term, not the
smallest diff. The tie-breakers put reversibility above simplicity on purpose.

## Supersession and re-open

- **Contradiction.** An owner whose choice contradicts an active record names it as
  superseded; the decision is then T2 at minimum. For every new record touching the same
  component or AC as an active one, a matcher records `contradicts` or `compatible`,
  which catches contradictions nobody declared. A contradiction names the superseded
  record. The conductor then rebinds every pending task bound by the old record, and
  reopens committed work bound by it through `fix`'s forward-only rules.
- **Re-open.** A decision that would reopen a recorded one with the same key and no new
  cited evidence does not: the recorded decision stands. Closed decisions cannot be shopped
  past the caps.
- **Dissent.** A superseded or overruled position stays in the record as one line.

## Decision discovery

Decisions enter the protocol from three sources, so choices cannot hide in prose.

1. **The dispositions table**: the places where Forge would have asked.
2. **Choice manifests**: each drafting owner returns the list of choices it made. The
   spec and design lenses run an unrecorded-decision check: a choice in the artifact
   with no manifest entry is a finding, raised as a decision. A manifest entry or gate
   candidate that was not asked becomes a flagged default in `spec.md` → Assumptions &
   discretion.
3. **The Accept sweep**: every T2-observable change between run start (on an adopted
   run, `Adopted at`) and HEAD must map to a decision record. An unmapped change gets a
   T2 review; if it fails and the `fix` cap allows, it is reverted through `fix`,
   otherwise it stays on the branch as a *ratification item* and the run status is `partial`.

Artifact review (spec reviewers, design lenses, verifiers) is unchanged and stays the main
quality engine. Mechanical tightenings are applied directly per `review.md`; only
judgment calls and discovered decisions enter the protocol, so nothing is reviewed twice.
Intent-audit findings and pre-existing-test questions are judged by a Product owner
(judging) that did not draft the spec.
