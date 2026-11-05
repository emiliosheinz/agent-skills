# UI

Every rule for a change that alters what a person sees on a rendered screen. When a phase
reads it is set in `SKILL.md` → *Dispatch*.

The principle: on such a change, the expected look comes from outside the change. Specify
fixes it as a reference before any code is written, the implementer receives it in the UI
brief, verifier 3 checks the diff against it, and the look judges the running app against
it.

## Specify: the reference

Name one reference per screen the change touches: the first of these that exists.

1. **A provided design**, such as an image or an export the user supplied. Save it under
   `./.specs/<slug>/design/`.
2. **The picked prototype**, when specify ran the prototype step.
3. **A screen the user names.**
4. **The closest existing screen**: the same kind of page first (a list, a form, a
   settings page), then the nearest route.
5. **`no-precedent`**, when the app has no screen to anchor to. It says a design decision
   is needed, as in `references/plan.md`.

Record each reference in `spec.md`'s `Conventions observed` as a `reference` row: the
screen and its route with a `file:line`, or the saved design's path. Beside the rows, state
that each reference is a consistency anchor, not a template, as below.

**The reference is a consistency anchor, not a template.** It fixes the app's vocabulary:
its components, tokens, feedback patterns and tone. Layout, hierarchy and interaction for
the new work stay the implementer's judgment unless a provided design or a picked
prototype fixes them. Copying an existing screen's layout only because it is the reference
misreads it.

## Specify: the UI rows

Add three rows to `Conventions observed`, under the same rules as the six categories
(`references/specify.md` → *A2*, *Conventions observed*): every entry cites a
`file:line`, an empty row names where it looked, and the section is regenerated whole.

| Category | What to record |
|---|---|
| components | the shared components screens are built from, and where they live |
| tokens | how colours, spacing, type and radii are named and where they are defined |
| feedback pattern | how the app shows loading, empty, error, success and pending states, and how it confirms a destructive action |

Read what the repository already documents first (a design-system page, a component
catalogue, a style guide, agent instructions) and cite it, then the code. Never create
such a document in the repository.

## Specify: the prototype step

Runs in Part B, before the ACs are written, when no design was provided and the change
adds a new screen or a substantial new piece of UI. A tweak to existing UI skips it unless
the user asks for one. Let the user decline, even after seeing variants; then delete any
throwaway page already built, take the next reference in the order above, and record the
decline in `spec.md` under Assumptions as user-declined (`references/specify.md` →
*Part B*).

**One piece per round.** When the change spans several screens, prototype the one that
sets the pattern for the rest, say which and why, and let the others follow the winner.

**Choose directions first.** Three variants by default, up to five if the user asks.
Before building, give each a name that describes it (never "A", "B", "C") and the axis it
explores: layout, density, interaction model, or, when the app has no visual system yet,
visual direction. Two variants that would differ only in colour or copy are one; replace
or cut it.

**Native, working, realistic.** Every variant uses the app's own components, tokens and
feedback patterns from the UI rows. It works for real, with no dead control and no
placeholder text, and renders full size inside its real surroundings: the page around it
and its sibling content. It lives in a throwaway page production code never imports,
such as an isolated route on the dev server, or one static page using the app's
stylesheet when there is no server.

**A plain picker.** Show one variant at a time and switch instantly with a small control
that is deliberately plain and never styled like the app, so it is not judged as part of
the design. Number keys and arrows switch, and the URL keeps the choice across a reload
(or the platform's equivalent).

**Check before showing.** Flip through every variant: it renders, its controls respond,
and the console logs no error. Capture each.

**Ask for the pick.** Give the URL and a table (variant, axis, when it wins, what it
costs), then ask with a recommended default reasoned from the product's personality and
how often the screen is used, never from looks alone. The user may ask for another round
that explores around one variant.

**After the pick.** Save the winner's captures and a copy of its source under
`./.specs/<slug>/design/` as the reference, delete the throwaway page, and write the
ACs against the winner. With no visual system yet, the winner also becomes the app's
direction, recorded in Decisions.

## Specify: a provided design

Structure, order, hierarchy and copy match the design. On detail, the app's existing
components and tokens win over the design's literal values: a colour a token nearly
matches becomes the token, a drawn button becomes the app's button. Record each such snap
under Assumptions in `spec.md`, naming the design element and what it snapped to, so a
reviewer can tell a snap from a miss.

## Plan

A task that renders, styles or lays out a screen names its screen's reference in
`reuses`.

## Execute: the UI brief

A task that renders, styles or lays out a screen carries the UI brief in its implementer
prompt, at the tier `SKILL.md` → *Model & effort selection* sets for it. The brief holds:

- the reference for each screen the task touches, with the line that it is a consistency
  anchor, not a template;
- the three UI rows;
- the accessibility rules below;
- this sentence: "The reference's states (empty, loading, error, disabled, pending) are
  part of the task, built as the reference builds them; they are not creep."

The accessibility rules:

1. Use the app's existing accessible components before building a new one.
2. Use the native element for its job: a button for an action, a link for navigation, a
   list for a list, headings in order.
3. Every control and meaningful image has an accessible name; every input has a visible
   label tied to it.
4. Focus is visible on every interactive element and moves in reading order.
5. A dialog or menu moves focus in when it opens, keeps it inside while open, closes on
   Escape, and returns focus to what opened it.
6. A form error names the field and how to fix it, sits next to the field, and is
   announced to assistive technology.
7. Text meets a contrast of 4.5:1, and large text, icons and control borders 3:1, in every
   theme the app has.
8. Motion respects the reduced-motion preference, and nothing flashes.
9. A pointer target is at least 24 by 24 CSS pixels, or the platform's equivalent.

## Execute: verifier 3 on a screen phase

On a screen phase, one whose diff renders, styles or lays out a screen, the orchestrator
adds the
reference, the three UI rows and the paragraph below to verifier 3's prompt, in both modes.
The UI rows extend the six convention categories on such a phase, and need no verdict in
`design.md`.

> Compare the diff against the UI rows like any other convention category. A raw value
> where a token exists, a hand-built control where the app has a component, or a state
> shown differently from the app's feedback pattern is a convention finding with that
> category's severity, not a visual choice under do-not-flag item 10.

## Execute: the look

The look judges the running app against the reference on a screen phase. The opening of
`references/verification.md` places it among the verifiers. It is a stage, with its own
budget of 3 fix cycles.

**Who.** A fresh subagent, at the tier `SKILL.md` → *Model & effort selection* sets for
it. Its prompt carries the phase diff, the ACs, the reference, the UI rows and this
section, and never the implementer's summary or any claim that a screen looks right. At
`quick` the look is still a subagent, limited to the changed screen. When the subagent
lacks a browser tool the orchestrator has, the orchestrator runs the look inline under
`references/verification.md` → *Graceful degradation*, and tags its rows `inline`.

**The app.** The app is usually already running. Find how to run it from what the
repository documents (its docs, agent instructions, task-runner scripts, test-server
config), never by guessing; when the repository documents none, ask the user once. Use a
running app only after checking it serves this worktree's code, for example by finding a
string the phase changed; one serving other code counts as unreachable. Start the app only
when none runs, and never stop it, including one the look started. Read every discovered
command before running it, and never run one that destroys or resets data. Sign in with a
test account or seed the repository documents; when only single sign-on exists, ask the
user once. The look is a subagent and cannot ask: it returns each such question to the
orchestrator, which asks. Saved sign-in state goes outside the repository.

**What it does**, on each screen the phase changed:

1. Open it at the repository's breakpoints, else at a common phone width and a common
   desktop width (390 and 1280 px on the web), and capture each to
   `./.specs/<slug>/evidence/<phase>/`.
2. Operate each changed control by its gesture and by keyboard: press it, press it twice,
   Tab to it, Escape out of any overlay and check that focus returns. Watch the console and
   failed requests.
3. Put realistic worst-case content in front of it: a long name, a missing optional
   value, one item, none. Values are plausible or taken from the schema's limits, and
   enter only through the data boundary (fixtures, mocks, seeds, request interception, or
   records the look creates). Never edit the component or shared data to produce them.
4. Act on a destructive or outbound control only for records the look created; otherwise
   stop at the confirmation step.
5. Compare each capture with the reference for consistency: the app's components, tokens
   and feedback patterns. A layout that merely differs from an existing screen is not a
   finding; a layout that differs from a provided design or a picked prototype is. Read
   the diff to name each finding's cause `file:line`.

**Grades.** Every finding takes exactly one.

| Grade | Meaning | Severity | Effect |
|---|---|---|---|
| Broken | An AC's flow cannot finish, its visible outcome is wrong, content is unreadable, or an action is unreachable | Major; Blocker on the path of a `[critical]` AC | Fails the stage and feeds the fix loop |
| Ugly | Readable but visibly wrong, or inconsistent with the app's components, tokens or feedback patterns | Minor | `reported` |
| Fragile | Fine now, one realistic step from breaking | Minor | `reported` |

The report also lists what held up: the screens, states and controls that worked. An
empty held-up list means the look did not really run.

**Output.** The verdict format of `references/verification.md`, headed `### The look`
with a status of PASS, FAIL, or `SKIPPED (rung n)` on a degraded rung; a Broken finding
on any rung is a FAIL. Each finding carries its grade, capture path, screen, width,
state, observation and cause `file:line`. Every run gives one evidence row per visible AC
it saw, with `sensor` set to `look` and the capture path in the `file:line` column (the
diff's `file:line` on a source read), tagged `degraded` or `inline` when the look was.

**When it cannot run.** When no app serving this worktree's code can be reached or
started, or no browser tool exists, the phase is not blocked. The look goes down this
ladder and stops at the first rung that works:

1. the running app without sign-in, for public screens;
2. a production build served statically;
3. the components in the repository's own isolation harness or test renderer;
4. a source read of the diff against the reference and the UI rows, labelled as one.

The verdict names the rung reached, a `gap-open` row names what the look could not see,
no look PASS is reported, and the look list comes first at Finish. An app that does not
start after one documented attempt goes down the ladder with its last error lines in the
gap row, and spends no fix cycle.

## Finish: the look list

On a screen phase, Finish gives at most five manual checks a person can run in about two
minutes, one line each: route, width, state, what to check, capture path. Pick first what
the look could not see, then its Ugly and Fragile findings, then the visible ACs. Each
check is also a `reported` row in `## Open findings`. When the full look did not run, the
list comes first in the report.
