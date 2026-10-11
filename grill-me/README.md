# grill-me

A Claude Code skill that grills you relentlessly about a plan, decision, or idea until you and the agent reach a shared understanding. Adapted from [mattpocock/skills `grilling`](https://github.com/mattpocock/skills/tree/main/skills/productivity/grilling), with every question asked through the `AskUserQuestion` tool and no emojis.

## When to use

- Stress-test a plan, design, or decision before acting on it
- Surface assumptions you have not made explicit
- Any request to "grill me" on something

## How it works

1. **Design tree** — every decision is mapped with the decisions that hang off it.
2. **Rounds** — each round asks the whole frontier: every decision whose prerequisites are settled. Questions go through `AskUserQuestion`, up to 4 per call, chained when the frontier is larger. The recommended answer is listed first and marked `(Recommended)`.
3. **Facts versus decisions** — facts the agent can look up are dispatched to sub-agents; only decisions are put to you.
4. **Finish** — when the frontier is empty, the agent summarizes the settled decisions and asks you to confirm shared understanding before acting.

## Installation

Install to the current project:

```bash
npx skills add emiliosheinz/agent-skills --skill grill-me
```

Install globally (available across all projects):

```bash
npx skills add emiliosheinz/agent-skills --skill grill-me --global
```

See the [root README](../README.md) for installing all skills at once.

## Usage

```
/grill-me <plan, decision, or idea>
```
