# Numbering — Assign the Next Sequential RFC

## Scan for an existing directory

Check these in order and use the first that exists:

1. `docs/rfcs/`
2. `docs/rfc/`
3. `rfcs/`
4. `.rfcs/`

Use `Glob` or `Bash` (`ls`) — do not guess. If none exists, ask the user
whether to create `docs/rfcs/` (the recommended convention) or a
different path.

## Find the highest existing number

List files matching `[0-9]+*.md` in the directory. Parse the leading
numeric prefix and take the maximum. Examples:

- Existing: `001-*.md`, `003-*.md` → highest is `003`, next is `004`.
- Existing: none → start at `001`.
- Existing: `1-*.md`, `2-*.md` (not zero-padded) → still pick the max,
  but new file uses zero-padded three-digit form (`003-*.md`) and note
  the inconsistency in your reply so the user can decide whether to
  renumber.

## Format

- Zero-padded to three digits: `001`, `002`, ..., `099`, `100`.
- Kebab-case slug from the title: `Migrate CI from Jenkins to GitHub
  Actions` → `migrate-ci-from-jenkins-to-github-actions`.
- `.md` extension.

Final path: `<directory>/{NNN}-{kebab-case-title}.md`.

## Do not

- Assume the number without scanning. Sequential numbering only works
  when it is actually sequential.
- Fill gaps (e.g., if `003` is missing between `002` and `004`, still
  assign the next after `004`, not `003`). Numbers are historical.
- Rename existing files to normalize padding without asking the user
  first — the numbers may be referenced elsewhere.
