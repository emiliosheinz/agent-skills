# UI

Every rule for a change that alters what a person sees on a rendered screen. When a phase
reads it is set in `SKILL.md` → *Dispatch*.

The principle: on such a change, the expected look comes from outside the change. Specify
fixes it as a reference before any code is written, the implementer receives it in the UI
brief, and verifier 3 checks the diff against it.

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

On a phase whose diff renders, styles or lays out a screen, the orchestrator adds the
reference, the three UI rows and the paragraph below to verifier 3's prompt, in both modes.
The UI rows extend the six convention categories on such a phase, and need no verdict in
`design.md`.

> Compare the diff against the UI rows like any other convention category. A raw value
> where a token exists, a hand-built control where the app has a component, or a state
> shown differently from the app's feedback pattern is a convention finding with that
> category's severity, not a visual choice under do-not-flag item 10.
