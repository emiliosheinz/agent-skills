# Credits

## Visuals

The visual views this skill asks for come from the `show-me` skill in this
repo, which is itself adapted from Dex Horthy's `show-me` (HumanLayer). The
attribution and MIT notice live in `show-me/CREDITS.md`.

The PR-specific framing — a PR body as a short "why" plus a scannable
structural outline rather than a file-by-file changelog — is adapted from
Horthy's `visual-pr`. Its two extra views, for contracts and type changes,
live in `show-me`'s catalogue with the rest.

- Article: <https://x.com/dexhorthy/article/2087569590268391897>
- Blog: <https://www.humanlayer.com/blog/show-me-skill>
- Source: <https://github.com/humanlayer/skills>

## AI slop patterns

Twelve of the thirteen patterns in `references/writing-the-body.md` are
selected from a larger catalogue of writing-quality failures, itself
synthesized from:

- Shaib et al., *Measuring AI "Slop" in Text* (2025 preprint)
- Pew Research Center's 2026 analysis of writing-pattern shifts across 490,000
  webpages
- Wikipedia's *Signs of AI writing*

Only the patterns that can fire in a pull request description were kept. The
rest concern essays, citations and creative writing.

The thirteenth, *Narrating the process*, is not from that research. It was
added after this skill wrote a body that spent a paragraph on how the change
had been reviewed — a failure mode specific to a PR written by an agent, which
a catalogue drawn from human prose does not cover.
