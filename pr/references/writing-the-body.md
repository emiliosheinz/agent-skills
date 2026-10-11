# Writing the body

Load this before writing any PR body.

## Contents

- The three questions
- Length
- Scannability
- Register
- Patterns that read as machine-written
- Visuals
- Attaching a screenshot
- Sensitive parts
- Examples

The reader is a teammate who already knows the codebase and is about to review
the diff. They need what the diff cannot tell them.

Two rules the body never breaks:

- **Never claim confidence.** No "fully tested", "verified", "production
  ready", "safe to merge". That verdict is the reviewer's.
- **Never inventory the tests.** CI reports what passed.

## The three questions

Answer these, in whatever form the change needs. They are not section headings.

| Question | What it carries |
|----------|-----------------|
| What problem, and why now | The reason this exists. One sentence is usually enough. |
| How it was solved | The shape of the approach, not the file list. |
| Why that way | Only where another way was plausible. Skip it when there was no fork. |

A change with no interesting fork answers two questions, not three — writing a
"why that way" for a dependency bump invents a decision nobody made.

**When the reason is not recoverable** from the diff, the commits, an issue
reference or the session, say what the change moves and stop. Do not invent a
motive; a plausible-sounding one is worse than none, because the reviewer
cannot tell it was guessed.

## Length

**Before drafting**, decide from the diff how complex the change actually is.
That caps the body — test 2. A change whose whole content is one line cannot
earn paragraphs, however interesting its context.

Length is earned by two things and nothing else:

- **What the diff cannot tell them.** Motivation, rejected alternatives and
  consequences are not in the diff. Function names are.
- **Reversibility.** A small change that is hard to undo earns more words than
  a large change that is trivially revertible. A rename across 40 files is wide
  and reversible. A migration that drops a column is narrow and one-way. The
  second one gets the paragraphs.

**After drafting**, run test 1 literally: re-read only the first sentence of
each paragraph, the bolded words, and the views. If that alone does not answer
what changed and why — and, where it fires, where to look carefully — cut until
it does.

## Scannability

- Lead with the answer. The first sentence says what problem this solves, not
  what the PR contains.
- Short paragraphs, two or three sentences each.
- Bold the words a scanning eye should land on, sparingly. Bolding everything
  bolds nothing.
- Code identifiers in backticks.

Headings only once the body needs navigation — more than about four paragraphs,
or more than one visual. Below that they are ceremony.

## Register

Write as one engineer writing to another. Specific, direct, willing to say a
plain thing plainly.

Four bans:

1. **No restating the diff.** Nothing in the body may be information the
   reviewer gets by reading the diff.
2. **No bullet mush.** Bullets are for genuinely parallel items. Reasoning goes
   in prose, because a bullet list holds conclusions but cannot hold an
   argument. Sensitive parts are the exception — parallel observations about
   consequence are a list by nature.
3. **No self-praise and no filler openers.** Not "this PR introduces", not
   "comprehensive", "robust", "cleanly", "seamlessly", "significantly".
4. **No headings on a short body.** See Scannability for the threshold.

## Patterns that read as machine-written

Check the draft against these thirteen. If any fire, rewrite and re-check; only
then open the PR.

| Pattern | What it looks like | Instead |
|---------|-------------------|---------|
| Generic opening | "In order to improve maintainability and code quality..." | Name the actual problem. |
| Restating the prompt | The first paragraph paraphrases the ticket before answering it. | Start with the answer. |
| Excessive bullets | Every idea is a bullet, including the connected argument. | Prose for reasoning. |
| Formulaic headings | "Overview", "Key Changes", "Benefits", "Next Steps". | Headings that state the actual finding, or none. |
| Empty intensifiers | "significantly faster", "greatly simplifies". | The number, or nothing. |
| Corporate cheerleading | "unlocks", "empowers", "drives", "delivers value". | The concrete result. |
| Padding through paraphrase | The same point appears twice anywhere in the body — adjacent sentences, or a paragraph and a bullet. | Keep the clearest version; delete the other. |
| Narrating the process | How the change was made: what was reviewed, how many passes, what tooling ran. | Cut it. The reviewer is reviewing the change, not the method. |
| Interchangeable content | A paragraph that would fit almost any PR in any repo. | The specific constraint, number or decision. |
| Over-signposting | "First", "Second", "Finally", "Let's look at". | Let the content carry the order. |
| Redundant summary | A closing paragraph repeating the body. | End on the implication. |
| Unearned confidence | "this fully resolves", "thoroughly tested". | Say what changed; stop. |
| Length mistaken for depth | Many headings, none investigated. | Fewer claims, each carried. |

## Visuals

A visual earns its place by **removing the prose it would have taken**, never
by sitting on top of it. If the text explaining the diagram runs as long as the
text the diagram replaced, delete the diagram and keep the prose.

**Invoke the `show-me` skill** with the Skill tool, passing in the prompt:

- the topic — what the reviewer has to understand,
- `size: tight`, because a PR body is scanned rather than studied,
- `max-views: 1` or `2`. A body carrying five views is a body nobody scans.

`show-me` owns the catalogue of views and which one fits which point. It
produces; this skill places and attaches.

- If the Skill tool reports `show-me` is not installed, describe the shape in
  one or two sentences of prose. Do not improvise a diagram.
- If a returned view runs long enough to break test 1, re-ask with
  `max-views: 1`, or drop the visual and keep the prose. Never edit a returned
  view.

Every text view `show-me` returns is a fenced block, Mermaid included, and
renders in a PR body with no uploading or hosting. A screenshot is the
exception: it comes back as a file path.

## Attaching a screenshot

`show-me` captures the image and returns an absolute path outside the repo.
Placing it is this skill's job, and `open.md` Step 3 has already established
whether attachment is possible.

- **Attachment available:** reference that absolute path in the body, and
  `gh pr create --attach '<path>#<alt text>'` rewrites it in place to the
  uploaded URL. Reference nothing and the image is appended at the end instead.
- **Not available** — no `--attach`, or a host that is neither GitHub.com nor
  GitHub Enterprise Cloud: write a placeholder line naming what belongs there,
  and tell the user to drag the image in before marking the PR ready.

Never commit a screenshot into the repo to get it into a body. A committed
image does not render from a private repo, and it is permanent repo weight for
a review artifact.

## Sensitive parts

On a change large or complex enough that a reviewer cannot hold all of it at
once, the body says where their attention is worth spending.

**When it fires:** only on reach. A change a reviewer can hold in their head
does not need to be told where to look. Do not write the section to say the
change has none — omit it.

**What qualifies:** anywhere being wrong costs more than a revert. As many as
genuinely qualify, each one a consequence.

- Authentication, authorization, or anything deciding who may do what
- Money: prices, totals, currency, billing, anything that can double-charge
- Data migrations, and anything that drops or rewrites stored data
- Shared contracts: an API other callers depend on, an exported type
- One-way doors: anything whose undo is harder than its do

Each entry names a consequence, not a request. "The retry path can
double-submit if the first request succeeded but timed out" is the section
working. "Please review carefully" is not.

Test every entry against the criterion above before keeping it: if being wrong
there would cost no more than a revert, it is not a sensitive part. A known
gap, a follow-up, or a note about the change's own authorship belongs in the
prose or nowhere.

When the change ran through `forge`, `state.md`'s door verdict and `spec.md`'s
blast radius already carry this. Read them rather than re-deriving.

## Examples

Two bodies, at the extremes of what a change can earn. Neither is a template —
they calibrate how far the two tests stretch.

### A dependency bump

Diff: one line in `pnpm-lock.yaml`. No commits on the branch yet, no issue
reference, no recoverable reason.

```markdown
Bumps `tar` from 6.2.0 to 6.2.1.
```

One sentence, no heading, no visual, no sensitive parts, and no invented
motive. The reason was not recoverable, so it is absent rather than guessed. If
the changelog or an issue had given a reason, that is the one thing worth
adding — and it would still be one sentence.

### An auth change with a migration

Diff: 14 files, a new session middleware plus a migration dropping a column.
`forge` run present, door verdict one-way.

````markdown
The SSO callback trusted `users.legacy_token` for session lookup, so a session
outlived an IdP-side revoke until the token expired on its own. **The column is
gone and every request now resolves its session through one middleware.**

`requireSession` sits in front of the authenticated router and is the only
place a session is read. The callback writes a session row and returns a
cookie; nothing downstream reads a token any more.

```diff
 request
-  route handler
-    lookupLegacyToken(users.legacy_token)
+  requireSession
+    sessions.findByCookie
+    idp.verifyIfStale
   route handler
```

We considered keeping `legacy_token` as a read-only fallback for one release.
That leaves two session paths live at once, which is the bug being fixed, so
the column goes in the same change.

**Where to look carefully**

- `20261011_drop_legacy_token.sql` drops a column. One-way: rolling the code
  back after deploy leaves sessions the old path cannot read.
- `requireSession` decides who is authenticated. A handler reachable without it
  is unchecked — router mount order is the entire guarantee.
- Sessions issued before this deploy carry no `idp_sub`; `verifyIfStale` treats
  a missing one as stale and re-verifies rather than failing closed.
````

About 210 words, scans in roughly 30 seconds. The reversibility rule earned the
paragraphs. The call-tree diff replaced a paragraph describing the new path.
"Why that way" appears because there was a real fork. Sensitive parts fired
because 14 files exceed what a reviewer holds at once, and each entry names a
consequence. No confidence claim and no test list anywhere.
