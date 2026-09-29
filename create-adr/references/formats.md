# Formats — MADR / Nygard / Y-Statement

Three formats are widely used. Default to MADR. Switch only when the user
asks or the format table below clearly points elsewhere.

| Format | Best for | Length | Template |
|--------|----------|--------|----------|
| **MADR** (Markdown ADR) | Teams that want a structured options comparison with drivers | Medium (200–500 words) | `templates/adr-madr.md` |
| **Nygard** (original) | Minimal, fast recording; obvious or forced decisions where option comparison is noise | Short (~150 words) | `templates/adr-nygard.md` |
| **Y-Statement** | Inline documentation, very compact contexts, single-paragraph decisions | One paragraph | `templates/adr-y-statement.md` |

## Selection heuristics

- **Options were compared or should have been** → MADR.
- **Decision was forced** (regulatory, single-vendor, only viable choice) →
  Nygard. There is nothing to compare.
- **Inline in another doc / very small scope** (e.g., "we log timestamps
  in UTC") → Y-Statement.
- **User asked for a specific one** → honor it. Never overrule the user.
- **You cannot tell** → MADR. It degrades gracefully; the other two do not.

## Escalate up, not down

If you start with Nygard or Y-Statement and realize the decision needs
options compared, switch to MADR. Adding structure to a small ADR is easy;
retro-fitting a compact format around a decision that already sprouted
sections is not.

## Format-specific gotchas

- **MADR** — the "Considered Options" section must include at least 2 real
  alternatives. "Do X" vs. "obviously don't do X" is not a comparison.
- **Nygard** — do not sneak options-comparison into Consequences. If you
  need to compare, you have picked the wrong format.
- **Y-Statement** — every one of the five clauses must be filled. Missing
  clauses defeat the point of the format.
