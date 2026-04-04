# create-rfc

An agent skill that guides the creation of structured Request for Comments (RFC) documents to propose significant changes, compare alternatives, and drive aligned decisions across teams.

## When to use

Invoke this skill when you want to:

- Propose a significant technical, process, or product change before committing to it
- Compare multiple options and document the reasoning behind the chosen direction
- Get buy-in from stakeholders or approvers before acting
- Align multiple teams on a direction with a formal, reviewable artifact

## How it works

The skill runs a five-step process:

1. **Gather context** — collects the topic, impact level, urgency, and available options. Does not draft anything until mandatory fields are available.
2. **Validate mandatory fields** — ensures title, background, driver, approver(s), impact level, at least one assumption, at least two weighted decision criteria, and at least two options are present before proceeding.
3. **Detect RFC type** — tailors additional sections based on whether the RFC is technical, process-oriented, product-focused, a vendor selection, or policy-related.
4. **Generate the RFC** — produces a structured Markdown document covering all mandatory and recommended sections.
5. **Offer next steps** — suggests sharing with contributors, setting a decision deadline, and scheduling a review meeting.

## Output

A Markdown RFC document containing:

- Header and metadata (driver, approvers, contributors, status, impact, due date)
- Background — current state, problem, why now, cost of inaction
- Assumptions — explicit, with confidence levels and invalidation triggers
- Decision criteria — defined before options, with weights and must-haves identified
- Options considered — minimum two, including "do nothing" for significant changes
- Pros and cons per option — honest assessment against the decision criteria
- Estimated cost — effort or complexity estimate for each option
- Action items — concrete next steps after the decision
- Outcome — left as a placeholder to be filled when the decision is made

## Usage

```
/create-rfc
```

The agent begin gathering context immediately. Provide as much detail as possible about the change you want to propose, the alternatives you have in mind, and who needs to approve the decision — the more context, the more useful the RFC will be to reviewers.
