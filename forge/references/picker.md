# Picker

The control that switches between prototype variants in the prototype step
(`references/ui.md` → *Specify: the prototype step*). It is part of the harness, not of
the design, so its look is fixed: copy it as written below, in every project. It never
takes the app's fonts, colours, spacing or theme, and the repository's style rules (no
inline styles, lint rules, design tokens) do not apply to it, because it is deleted with
the throwaway page and never ships.

## Look

A dark, translucent pill fixed at the bottom centre of the viewport, above everything. One
button per variant, labelled with the variant's name, and a highlight that slides behind
the active one. A replay button sits after a divider when any variant animates on entry.
Move the pill to the top centre only when a variant puts something at the bottom centre.

## Behaviour

- Number keys 1 to N pick a variant; the left and right arrows step through them; R
  replays. Keys are ignored inside form fields and while a modifier key is held.
- Clicking a button picks its variant. Exactly one button is active.
- The choice lives in a `?v=` URL parameter (or the platform's equivalent), so a reload
  keeps it. Variant 1 is the default.
- Switching shows the new variant at once and re-mounts it, so entrance animations run
  again. Only the highlight moves, over 250 ms, and only after the first paint; with
  reduced motion it jumps.

## Reference implementation

For a web page, copy this verbatim and render each variant into `#stage`. In a component
framework, keep the same markup, class names and style values, and express the script in
the framework's own state.

```html
<nav class="proto-picker" aria-label="Prototype variants">
  <span class="proto-picker-highlight" aria-hidden="true"></span>
  <button class="proto-picker-item">Variant one</button>
  <button class="proto-picker-item">Variant two</button>
  <button class="proto-picker-item">Variant three</button>
  <span class="proto-picker-divider" aria-hidden="true"></span>
  <button class="proto-picker-item proto-picker-replay" aria-label="Replay (R)">↻</button>
</nav>
```

```css
.proto-picker {
  position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
  z-index: 2147483647; display: flex; align-items: center; gap: 2px; padding: 4px;
  border-radius: 999px; background: rgba(10, 10, 10, 0.82);
  -webkit-backdrop-filter: blur(12px) saturate(1.4);
  backdrop-filter: blur(12px) saturate(1.4);
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.08) inset, 0 8px 24px rgba(0, 0, 0, 0.24),
    0 2px 6px rgba(0, 0, 0, 0.12);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-size: 13px; line-height: 1; -webkit-font-smoothing: antialiased; user-select: none;
}
.proto-picker[data-position="top"] { bottom: auto; top: 24px; }
.proto-picker-highlight {
  position: absolute; top: 4px; left: 0; height: 28px; border-radius: 999px;
  background: rgba(255, 255, 255, 0.12); will-change: transform;
}
.proto-picker[data-ready] .proto-picker-highlight {
  transition: transform 250ms cubic-bezier(0.23, 1, 0.32, 1),
    width 250ms cubic-bezier(0.23, 1, 0.32, 1);
}
@media (prefers-reduced-motion: reduce) {
  .proto-picker[data-ready] .proto-picker-highlight { transition: none; }
}
.proto-picker-item {
  position: relative; display: flex; align-items: center; height: 28px; padding: 0 12px;
  border: 0; border-radius: 999px; background: transparent;
  color: rgba(255, 255, 255, 0.55); font: inherit; cursor: pointer;
  transition: color 150ms ease-out;
}
.proto-picker-item:hover { color: rgba(255, 255, 255, 0.85); }
.proto-picker-item:active { transform: scale(0.97); }
.proto-picker-item:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.4); outline-offset: 2px;
}
.proto-picker-item[data-active] { color: #fff; }
.proto-picker-divider {
  width: 1px; height: 16px; margin: 0 4px; background: rgba(255, 255, 255, 0.12);
}
.proto-picker-replay { padding: 0 10px; font-size: 14px; }
```

```js
const variants = [/* one function per variant, returning its markup */];
const stage = document.getElementById("stage");
const picker = document.querySelector(".proto-picker");
const highlight = picker.querySelector(".proto-picker-highlight");
const items = [...picker.querySelectorAll(".proto-picker-item:not(.proto-picker-replay)")];
let current = 0;

function moveHighlight() {
  const el = items[current];
  highlight.style.width = `${el.offsetWidth}px`;
  highlight.style.transform = `translateX(${el.offsetLeft}px)`;
}
function mount(i) {
  stage.innerHTML = "";
  requestAnimationFrame(() => { stage.innerHTML = variants[i](); });
}
function setActive(i) {
  if (i < 0 || i >= variants.length) return;
  current = i;
  items.forEach((el, j) => {
    el.toggleAttribute("data-active", j === i);
    if (j === i) el.setAttribute("aria-current", "true");
    else el.removeAttribute("aria-current");
  });
  moveHighlight();
  const url = new URL(location);
  url.searchParams.set("v", i + 1);
  history.replaceState(null, "", url);
  mount(i);
}

items.forEach((el, i) => el.addEventListener("click", () => setActive(i)));
picker.querySelector(".proto-picker-replay")?.addEventListener("click", () => mount(current));
window.addEventListener("resize", moveHighlight);
document.addEventListener("keydown", (e) => {
  if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable) return;
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  const n = Number.parseInt(e.key, 10);
  if (n >= 1 && n <= variants.length) setActive(n - 1);
  else if (e.key === "ArrowRight") setActive((current + 1) % variants.length);
  else if (e.key === "ArrowLeft") setActive((current - 1 + variants.length) % variants.length);
  else if (e.key === "r" || e.key === "R") mount(current);
});

setActive((Number.parseInt(new URLSearchParams(location.search).get("v"), 10) || 1) - 1);
requestAnimationFrame(() => requestAnimationFrame(() => picker.setAttribute("data-ready", "")));
```

Drop the divider and the replay button when no variant animates on entry.
