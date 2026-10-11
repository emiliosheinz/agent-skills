---
name: grill-me
description: Grill the user relentlessly about a plan, decision, or idea through structured AskUserQuestion rounds. Use when the user wants to stress-test their thinking, or uses any 'grill' or 'grill me' trigger phrases.
---

Interview the user relentlessly until you reach a shared understanding. Map this as a **design tree**: every decision branches into the decisions that hang off it.

Work the tree in **rounds**. The **frontier** is every decision whose prerequisites are already settled: the questions you can ask _now_ without guessing at answers you haven't heard yet. Ask the whole frontier in one round, then wait for the user's answers before the next round.

## Asking a round

Ask every question with the `AskUserQuestion` tool. Never ask frontier questions as plain chat text.

- One tool call holds at most 4 questions. When the frontier is larger, ask it in consecutive calls of up to 4, most load-bearing questions first, before recomputing the frontier.
- `question`: the full question, ending with a question mark. Include the context the user needs to decide; keep it self-contained.
- `header`: a short chip label, 12 characters max.
- `options`: 2 to 4 concrete, mutually exclusive choices, each with a `description` stating its trade-off. Put your recommended answer first and append ` (Recommended)` to its label. Do not add an "Other" option; the tool provides one.
- Set `multiSelect: true` only when the choices genuinely combine.
- Use `preview` when the user must compare concrete artifacts: code snippets, config, ASCII layouts, diagrams.
- Open-ended questions still get options: offer the most plausible answers you can infer, and let "Other" catch the rest.

Read each answer carefully. A free-text "Other" answer may reject the premise, ask for clarification, or open a new branch; treat it as such rather than forcing it into the tree you expected.

## Recomputing the frontier

Each round the user answers reshapes the tree: settled decisions push the frontier outward and unblock questions that depended on them. Recompute the frontier and ask the next round. A question whose answer depends on another question still open in this round belongs to a _later_ round, not this one.

## Facts versus decisions

Finding _facts_ is your job, never the user's. When a frontier question needs a fact from the environment (filesystem, tools, etc.), dispatch a sub-agent to find it; don't ask the user for anything you could look up yourself. Don't block on it: a running exploration is an unsettled prerequisite, so only the questions downstream of it wait for the sub-agent to report; ask the rest of the frontier now. The _decisions_ are the user's: put each to them and wait.

## Finishing

The session is done when the frontier is empty: every branch of the design tree visited, nothing left silently assumed. Summarize the settled decisions as a plain list, then confirm with one final `AskUserQuestion` call whether you have reached a shared understanding. Do not act on it until the user confirms.

## Style

No emojis anywhere: not in questions, options, headers, previews, or summaries.
