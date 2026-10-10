# Voice

The description has to read like a colleague wrote it in two minutes, because that is
what a reviewer trusts. Generated-sounding prose gets skimmed and then ignored, which
defeats the whole point of writing it.

This pass **only removes words**. If it adds any, it is doing the wrong job.

## Kill list

Delete on sight. Every one of these is a word doing no work.

**Puffery:** comprehensive, robust, seamless, powerful, elegant, modern, best-in-class,
production-ready, battle-tested, cutting-edge, significantly, substantially, greatly,
dramatically, carefully, thoughtfully.

**Corporate verbs:** leverage, utilize, facilitate, streamline, enable (when it means
"let"), ensure (when it means "make sure" and nothing enforces it), enhance, empower,
orchestrate, unlock.

**Throat-clearing:** It's worth noting that · It's important to note · Note that ·
Additionally · Furthermore · Moreover · In order to · As mentioned above · At its core ·
Essentially · Fundamentally · Simply put.

**Announcements:** "This PR introduces…" · "This PR implements…" · "This change adds…" ·
"In this pull request, we…". The reader knows it is a PR. Start with the fact.

**Padding frames:** "not only X but also Y" · "a mix of X and Y" when there is no mix ·
any trailing participle that restates the clause before it ("…, ensuring consistency
across the codebase", "…, improving maintainability", "…, making the code more
readable").

**Rule of three.** Three adjectives or three clauses in a row, where one would do:
"faster, cleaner, and more maintainable". Pick the one that is true and measurable; cut
the rest.

**Emoji.** None. Not in headings, not as section markers, not as status indicators.

## Structural tells

- **A heading with nothing under it worth reading.** Delete the heading and the filler.
- **A closing paragraph that summarizes what was just said.** Delete it. PRs do not need
  conclusions.
- **Bold labels on every bullet** (`**Performance:** …`, `**Reliability:** …`) when the
  bullets are plain facts. Write the facts.
- **A bullet list of exactly three items** where the third is visibly weaker. Cut it.
- **"N/A" / "None" / "No special considerations"** under a heading. Delete the heading.
- **File-by-file narration** — "Updated `auth.ts` to add the retry, modified `client.ts`
  to call it". That is the diff. Say what the change *does*, once.
- **Restating the title** in the first sentence.

## Rewrite pairs

| Slop | Written |
|---|---|
| This PR introduces a comprehensive refactor of the authentication module, improving maintainability. | Auth logic was spread across four files; it is now one module. |
| Leverages the existing cache to significantly enhance performance. | Reuses the existing cache. Cold start 1.4s → 0.9s. |
| Ensures robust error handling across all edge cases. | A second 401 now logs out instead of retrying forever. |
| Added comprehensive test coverage for the new functionality. | 4 new cases in `refresh.test.ts`, including the second-401 path. |
| This change carefully updates the component tree to be more modular. | Split `<SessionPage>` so the toolbar no longer owns session state. |
| Various improvements and fixes to the transport layer. | Split `transport.ts` into `client.ts` and `stream.ts`. |

The pattern: **a number, a name, or a behavior replaces every adjective.**

## Facts, not impressions

- Numbers over adjectives. "400ms faster" not "much faster". No number → do not claim
  the improvement.
- Name the thing. "`useSessionEvents`" not "the relevant hook".
- Attribute a claim or drop it. "Stripe's webhook docs require a 2xx within 10s" not
  "best practice suggests".
- Hedging is a smell in both directions: "this should probably work" means it was not
  verified — go verify it, or write what you actually know.

## Tense and voice

- Present tense for what the code now does: "A second 401 logs out."
- Past tense for the problem it replaced: "Refresh tokens were dropped on a 401."
- Active voice. "The retry runs before the error surfaces", not "the error is handled by
  a retry mechanism".
- First person plural only where a decision was made together. Otherwise no narrator at
  all — describe the system, not your process.

## The scan test

Read only the **first five words of every line**. A reviewer skimming on a phone sees
roughly that much.

Those fragments alone should convey the change. If they read as generic — "This PR
introduces a…", "Additionally, the implementation…", "**Performance:** improved…" — the
body fails. Front-load the specific noun in every line and re-test.

## Length ceiling

If the body is longer than the diff is interesting, cut it. A good description is
usually shorter than the reviewer expects: one sentence, one view, one proof. Length
signals effort to the author and cost to the reader, and the reader is the customer.
