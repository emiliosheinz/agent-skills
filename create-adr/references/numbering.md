# Numbering — Assign the Next Sequential ADR

## Scan for an existing directory

Check these in order and use the first that exists:

1. `docs/adr/`
2. `docs/decisions/`
3. `adr/`
4. `.adr/`

Use `Glob` or `Bash` (`ls`) — do not guess. If none exists, ask the user
whether to create `docs/adr/` (the recommended convention) or a different
path.

## Find the highest existing number

List files matching `[0-9]+*.md` in the directory. Parse the leading
numeric prefix and take the maximum. Examples:

- Existing: `001-*.md`, `002-*.md`, `007-*.md` → highest is `007`, next is
  `008`.
- Existing: none → start at `001`.
- Existing: `1-*.md`, `2-*.md` (not zero-padded) → still pick the max, but
  new file uses zero-padded three-digit form (`003-*.md`) and note the
  inconsistency in your reply so the user can decide whether to renumber.

## Format

- Zero-padded to three digits: `001`, `002`, ..., `099`, `100`.
- Kebab-case slug from the title: `Use PostgreSQL for Primary Storage` →
  `use-postgresql-for-primary-storage`.
- `.md` extension.

Final path: `<directory>/{NNN}-{kebab-case-title}.md`.

## Do not

- Assume the number without scanning. Sequential numbering only works when
  it is actually sequential.
- Fill gaps (e.g., if `003` is missing between `002` and `004`, still
  assign the next after `004`, not `003`). Numbers are historical.
- Rename existing files to normalize padding without asking the user
  first — the numbers may be referenced elsewhere.
