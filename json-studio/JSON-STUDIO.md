# JSON Studio

A standalone, zero-dependency JSON viewer and formatter with local parse history. Open locally or deploy as a single HTML file.

**File:** `json-studio.html`

---

## Quick Start

```bash
open json-studio.html
```

Or double-click the file in Finder. No server, no folder permission, no install step.

---

## Features

### JSON editing & viewing

| Feature | Description |
|---------|-------------|
| **Parse** | Validate, format (2-space indent), and render a collapsible tree |
| **Minify** | Remove whitespace from valid JSON |
| **Copy** | Copy formatted JSON to clipboard |
| **Upload** | Pick a `.json` / `.txt` file from disk |
| **Drag & drop** | Drop a JSON file anywhere on the page |
| **Keyboard shortcut** | `Cmd + Enter` (Mac) / `Ctrl + Enter` (Windows) to parse |

### Parse history

Every successful parse is saved automatically in the browser:

- **Date & time** — when the JSON was parsed
- **Summary** — auto-generated preview (type, keys, sample values)
- **Size** — payload size in bytes
- **Search** — filter history by summary, date, or filename
- **Download** — save any history entry as a `.json` file
- **Delete** — remove individual entries or clear all

Click a history item to reload it into the editor.

---

## Storage

History is stored in **IndexedDB** (database name: `.json-studio`):

| Store | Contents |
|-------|----------|
| `history` | Metadata — id, date, summary, size, fileName |
| `content` | Full formatted JSON text, keyed by id |

### Cache size limit — 1 GB

- Total cached data is capped at **1 GB**
- When the limit is exceeded, **oldest entries are removed first**
- Usage is shown in the header bar

### Export to disk

Browsers cannot write to arbitrary folders without permission. Use the **↓ Download** button on any history item to save that JSON as a file to your Downloads folder (or wherever your browser saves downloads).

---

## Technology stack

| Layer | Technology |
|-------|------------|
| **UI** | Vanilla HTML5, CSS3 |
| **Logic** | Vanilla JavaScript (ES6+, no frameworks) |
| **JSON tree** | Custom renderer |
| **Storage** | IndexedDB |
| **Export** | Blob download |

---

## Privacy

All JSON data is processed and stored **locally in your browser**. Nothing is sent to a server unless you deploy the HTML yourself.
