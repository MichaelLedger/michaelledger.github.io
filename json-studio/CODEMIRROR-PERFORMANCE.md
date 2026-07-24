# Why CodeMirror Feels Fluent for Large JSON

JSON Studio’s input pane used to be a plain HTML `<textarea>`. That works fine for small documents, but at roughly **12MB** it often freezes the page. Replacing it with **CodeMirror 6** keeps scrolling and editing responsive. This note explains why.

---

## The problem with `<textarea>`

A browser `<textarea>` treats the document as **one big text layout**:

| Cost | What happens |
|------|----------------|
| Layout | The engine measures and lays out **all** characters |
| Paint | Scrolling and selection operate against that full layout |
| Main thread | Layout + paint + input handling share the UI thread |

For a multi‑megabyte JSON file, that work is large and **blocking**. The page cannot smoothly handle clicks, scroll, or Parse until the text control finishes.

```
┌─────────────────────────────────────┐
│  <textarea> — entire 12MB document  │
│  laid out as one text control       │
│  ████████████████████████████████   │  ← all of this costs up front
└─────────────────────────────────────┘
```

---

## What CodeMirror 6 does differently

CodeMirror keeps the **full text in memory**, but only **renders the viewport** (visible lines plus a small buffer). That is the same idea as a virtualized list: many rows in data, few rows in the DOM.

```
┌─────────────────────────────────────┐
│  Full document in memory (12MB)     │
│  ·································  │
│  ┌───────────────────────────────┐  │
│  │  Visible viewport (~screen)   │  │  ← only this is in the DOM
│  │  lines N … N+k                │  │
│  └───────────────────────────────┘  │
│  ·································  │
└─────────────────────────────────────┘
```

### 1. Viewport rendering

- DOM nodes exist mainly for lines you can see.
- Scrolling **recycles / swaps** line chunks instead of laying out millions of characters every time.
- Result: scroll cost stays roughly proportional to screen size, not file size.

### 2. Incremental document model

Edits update an internal document structure (piece-table style), not “rebuild the whole control from scratch.” Small keystrokes stay cheap even when the file is huge.

### 3. Deferred editor features

Extras such as:

- syntax highlighting  
- fold markers  
- line-number gutters  
- bracket matching  

are applied mainly to **visible ranges** (and nearby buffers), not the entire 12MB in one shot.

### 4. Still a web component

This runs in the browser (Safari / Chrome / WKWebView). It is not a native iOS `UITextView`. The fluency comes from **smarter rendering**, not from Apple’s TextKit.

---

## How this fits with the Web Worker

CodeMirror and the parse worker solve **different** bottlenecks:

| Layer | Bottleneck | Fix in JSON Studio |
|-------|------------|--------------------|
| **Editor UI** | Laying out / painting huge text | CodeMirror 6 (viewport) |
| **Parse / format** | `JSON.parse` / `JSON.stringify` on the main thread | Web Worker (for larger payloads) |
| **Pretty-print rewrite** | Writing a full formatted 12MB string back into the editor | Skip editor rewrite when size ≥ 2MB; still build the tree |

So:

- CodeMirror → **looking at and editing** large text feels fluent  
- Worker → **parsing** large text does not freeze the UI for as long  
- Skip format rewrite → avoid a second huge write after Parse  

---

## What CodeMirror does *not* magically fix

1. **Memory** — the full string still lives in JS memory.  
2. **First load** — the first `setValue` of a 12MB file still copies a large string (usually much cheaper than textarea layout, but not free).  
3. **`JSON.parse` cost** — parsing 12MB still takes CPU; we move it off the main thread when possible.  
4. **Tree view DOM** — the collapsible tree is separate; it already uses lazy expansion so it does not create millions of nodes at once.

---

## Large-document display mode

Above **512 KB**, or when any line is longer than **~20k characters** (typical minified JSON), the editor switches to a **fast view**:

| Feature | Small docs | Large / long-line docs |
|---------|------------|-------------------------|
| Line wrapping | On | **Off** (horizontal scroll) |
| Selection-match / active-line extras | On | **Off** |
| JSON syntax highlighting | On | Off if a line is huge |
| Undo for bulk `setValue` | On | **Off** (avoids duplicating MBs in history) |

The input stats label shows `· fast view` when this mode is active.

---

## Short version

| Control | Strategy |
|---------|----------|
| `<textarea>` | Layout **everything** |
| CodeMirror 6 | Layout **what’s on screen** |
| Fast view (large docs) | Also skip wrap / heavy highlights / undo bloat |

That combination is why large JSON text feels fluent in the input pane.
