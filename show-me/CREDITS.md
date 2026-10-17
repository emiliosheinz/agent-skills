# Credits

## `show-me` — Dex Horthy (HumanLayer)

This skill is adapted from Dex Horthy's `show-me`, including its view-to-purpose
mapping, its worked examples, the rule that a diff should diff the *shape*
rather than the source, and its closing guidance.

- Article: <https://x.com/dexhorthy/article/2087569590268391897>
- Blog: <https://www.humanlayer.com/blog/show-me-skill>
- Source: <https://github.com/humanlayer/skills>

### Changes from the original

- **Screenshots added.** The original has no screenshot concept; a picture of
  the real running app outranks a hand-written mock of it.
- **The focused HTML view reworked into a surface.** The original writes a
  self-contained HTML file for a UI too dense for Mermaid. Here HTML is one of
  three surfaces any view can be built for, published as an Artifact by the
  caller, rather than a view of its own.
- **Surfaces added.** The original emits the same fenced blocks everywhere.
  Here the caller says where the view will be read — a terminal, Markdown or
  an HTML page — and the view is built from what that surface can actually
  render.
- **Diagram craft and validation added.** Node and edge ceilings, the
  enumerate-draw-validate-verify loop, the anti-pattern tests, and a parser
  that checks Mermaid before it ships. The original has no equivalent.
- **The HTML guidance kept from the original**: match the product's colors,
  type, spacing and components, use real labels and data, and allow the page
  to be an infographic or a short deck rather than only a diagram.
- **Model-invocable.** The original sets `disable-model-invocation: true`.
  Here `/pr` calls this skill, so it must be invocable by a model.
- **Parameters added** so a caller can constrain surface, view count and size.

### License

The original is MIT licensed. Its notice, reproduced as the license requires:

```
MIT License

Copyright (c) 2026 HumanLayer

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
