# How to Choose the Right Architecture for Your App

A practical decision guide for Apple-platform apps: **SwiftUI**, **UIKit/AppKit**, **hybrid**, and supporting layers like **Swift Markdown** and **WebKit**.

Use this document before writing code. The goal is to pick the smallest architecture that meets your requirements — not the most modern or most native one by default.

---

## 1. Start with requirements, not frameworks

Answer these questions first. Your answers matter more than personal preference.

| Question | Why it matters |
|---|---|
| What platforms? (macOS only, iOS only, both, visionOS?) | Multiplatform strongly favors SwiftUI |
| Is this a greenfield app or an existing codebase? | Existing AppKit/UIKit code is expensive to rewrite |
| What is the core interaction? (forms, documents, text editing, media, charts?) | Text and custom rendering push you toward AppKit/UIKit |
| How complex is the UI? (simple screens vs custom canvases, timelines, editors) | Complex custom UI often needs imperative frameworks |
| Do you need rich text, Markdown, or code editing? | SwiftUI alone is usually insufficient |
| What are performance constraints? (large lists, real-time updates, streaming) | May require native views or WebKit |
| What is the team skill set? | Delivery speed depends on what your team already knows |
| What is the maintenance horizon? (prototype, 1 year, 5+ years) | Long-lived apps benefit from conservative choices |

Write a one-paragraph **app charter**:

> Example: "A macOS Markdown notes app with folder browsing, live preview, export to PDF, and on-device search. Must feel native. No web backend."

That charter drives every decision below.

---

## 2. The four architecture layers

Most apps combine multiple layers. Do not treat this as a single either/or choice.

```text
┌─────────────────────────────────────────────┐
│  App shell (windows, navigation, settings)    │  ← SwiftUI or AppKit/UIKit
├─────────────────────────────────────────────┤
│  Feature views (lists, forms, dashboards)   │  ← SwiftUI or AppKit/UIKit
├─────────────────────────────────────────────┤
│  Specialized surfaces (editor, preview)     │  ← AppKit/UIKit, WebKit, Metal
├─────────────────────────────────────────────┤
│  Content & logic (files, parsing, models)   │  ← Swift, Swift Markdown, etc.
└─────────────────────────────────────────────┘
```

| Layer | Typical choices |
|---|---|
| App shell | SwiftUI `App` + `Scene`, or `AppDelegate` + manual windows |
| Standard UI | SwiftUI views, or `UIViewController` / `NSViewController` |
| Specialized UI | `NSTextView`, `WKWebView`, `Canvas`, custom `NSView` |
| Data & parsing | Swift models, SwiftData, `swift-markdown`, file I/O |

---

## 3. Quick decision tree

```text
Are you maintaining an existing AppKit/UIKit app?
├── Yes → Stay imperative. Add SwiftUI incrementally only where it helps.
└── No → Continue

Do you need serious text editing or rich Markdown rendering?
├── Yes → Use hybrid or full AppKit/UIKit for that surface.
└── No → Continue

Is the UI mostly standard controls (lists, forms, navigation)?
├── Yes → Start with SwiftUI.
└── No → Continue

Do you need deep window/document control or legacy macOS integrations?
├── Yes → Prefer AppKit (macOS) or UIKit scenes (iOS).
└── No → Start with SwiftUI.
```

---

## 4. Choose SwiftUI when…

SwiftUI is the default for **new apps** whose hardest UI problems are not text or custom rendering.

### Good fit

- Utility apps, settings panels, onboarding flows
- CRUD apps with lists, forms, tabs, navigation stacks
- Multiplatform apps (iOS + macOS + iPadOS) with shared UI
- Apps where most screens are system-standard patterns
- MVVM-style state binding is a natural fit
- You want faster iteration and less boilerplate

### Structural shape

```swift
@main
struct MyApp: App {
    var body: some Scene {
        WindowGroup {
            RootView()
        }
        Settings {
            SettingsView()
        }
    }
}
```

### Watch out for

- Rich text selection across formatted content
- High-performance scrolling through complex composed views
- Fine-grained menu bar / toolbar / window behavior on macOS
- APIs that still require AppKit/UIKit bridges

### Rule of thumb

> If 80%+ of screens are "list + detail" or "form + submit," choose SwiftUI.

---

## 5. Choose traditional AppKit (macOS) or UIKit (iOS) when…

Use imperative frameworks when you need **control**, not convenience.

### Good fit (macOS / AppKit)

- Document-based apps with custom window management
- Professional text editors (`NSTextView`, TextKit)
- Menu bar apps with precise behavior
- Apps with heavy drag-and-drop, services, or AppleEvents
- Performance-critical custom views

### Good fit (iOS / UIKit)

- Complex transitions and custom interactive views
- Mature codebases already in UIKit
- Features that still lack solid SwiftUI equivalents
- `UIScene`-based multi-window or state restoration flows you already own

### Structural shape (macOS)

```text
NSApplication
  └── AppDelegate
        └── NSWindow / NSWindowController
              └── NSViewController
                    └── NSView hierarchy + Auto Layout
```

### Watch out for

- More boilerplate for windows, constraints, and state sync
- Slower UI iteration for simple screens
- Harder multiplatform sharing with iOS unless you duplicate UI

### Rule of thumb

> If the product *is* the text surface, timeline, or canvas, start with AppKit/UIKit for that core.

---

## 6. Choose a hybrid architecture when…

Hybrid is not a compromise — it is often the **best production architecture** for desktop apps.

### Good fit

- Markdown or code editor: SwiftUI chrome + `NSTextView` / `UITextView`
- Preview pane: SwiftUI shell + `WKWebView` for rendered HTML
- Settings and navigation in SwiftUI; one critical view in AppKit/UIKit
- Gradual migration from legacy AppKit/UIKit to SwiftUI

### Common patterns

| Feature | Shell | Core surface |
|---|---|---|
| Notes / Markdown app | SwiftUI sidebar + toolbar | `NSTextView` editor + WebKit preview |
| IDE / code tool | SwiftUI navigation | AppKit text view + custom gutter view |
| Dashboard app | SwiftUI charts (simple) | AppKit view for complex timeline |
| Existing AppKit app | Keep AppKit window | Embed SwiftUI via `NSHostingController` |

### Bridging checklist

- [ ] Define a narrow boundary between SwiftUI state and AppKit/UIKit views
- [ ] Avoid duplicating business logic on both sides
- [ ] Use coordinators or view models as the single source of truth
- [ ] Test keyboard shortcuts, focus, and selection across the bridge
- [ ] Document which layer owns lifecycle events

### Rule of thumb

> Default to SwiftUI for the shell. Drop to AppKit/UIKit only for the 1–2 views that SwiftUI cannot do well.

---

## 7. Content architecture: files, Swift Markdown, and renderers

If your app works with Markdown or long-form text, separate **storage**, **parsing**, and **rendering**.

| Concern | Recommended tool |
|---|---|
| Store user content | `.md` files on disk, SwiftData, or iCloud documents |
| Parse Markdown | [swift-markdown](https://github.com/swiftlang/swift-markdown) |
| Render for display | Native renderer, third-party library, or `WKWebView` |
| Edit content | `NSTextView` / `UITextView`, not SwiftUI `TextEditor` for serious use |

### Decision guide for Markdown apps

```text
Need only to read Markdown occasionally?
└── SwiftUI + lightweight renderer library

Need live preview with tables, math, code blocks?
└── SwiftUI shell + WebKit preview

Need professional writing/editing experience?
└── AppKit text view + swift-markdown + preview surface
```

---

## 8. Scoring worksheet

Score each item 0–2: **0 = not needed**, **1 = nice to have**, **2 = critical**.

| Requirement | Score |
|---|---|
| Multiplatform (iOS + macOS) | |
| Rich text editing | |
| Markdown preview fidelity | |
| Custom window/document behavior | |
| Large performance-sensitive lists | |
| Existing AppKit/UIKit codebase | |
| Fast prototype / small team | |
| Long-term native macOS feel | |
| Offline file-based documents | |
| Complex animations / custom drawing | |

### Interpretation

| Total | Suggested architecture |
|---|---|
| 0–6 | **SwiftUI-first** |
| 7–12 | **Hybrid** (SwiftUI shell + targeted AppKit/UIKit/WebKit) |
| 13+ | **AppKit/UIKit-first** (with optional SwiftUI islands) |

Adjust for hard constraints: if "Rich text editing" is critical, lean hybrid/AppKit even if the total score is low.

---

## 9. Architecture patterns by app type

| App type | Recommended architecture |
|---|---|
| Todo / habit tracker | SwiftUI + SwiftData |
| Settings / utility | SwiftUI |
| Social / feed app (iOS) | SwiftUI or UIKit; UIKit if heavy custom cells |
| Photo / video tool | UIKit/AppKit for viewer; SwiftUI for browsing |
| Markdown notes (macOS) | Hybrid: SwiftUI shell + `NSTextView` + WebKit preview |
| Code editor | AppKit/UIKit core + SwiftUI panels |
| Menu bar utility (macOS) | AppKit |
| Document-based creative app | AppKit `DocumentGroup` patterns or SwiftUI `DocumentGroup` + custom AppKit views |
| Internal admin dashboard | SwiftUI unless complex tables → hybrid |

---

## 10. Red flags that mean you picked the wrong architecture

Stop and reconsider if you see these early:

| Symptom | Likely problem | Fix |
|---|---|---|
| Fighting SwiftUI for text selection | Wrong surface for rich text | Move editor to AppKit/UIKit |
| Rebuilding `NSTextView` behavior in SwiftUI | Over-engineering | Use `NSTextView` |
| Massive `WKWebView` everywhere | Web stack by default | Restrict WebKit to preview only |
| Rewriting a stable AppKit app in SwiftUI | Migration without ROI | Incremental hybrid adoption |
| Business logic inside view controllers *and* SwiftUI views | No single source of truth | Introduce a shared model layer |

---

## 11. Recommended decision process (30 minutes)

### Step 1 — Write the charter (5 min)

Define platform, core user action, and non-negotiables.

### Step 2 — Identify the hardest screen (10 min)

Name the one screen that makes or breaks the product. Architect around *that* screen first.

Examples:

- Notes app → editor + preview
- Chat app → message list with streaming Markdown
- Design tool → canvas interactions

### Step 3 — Pick the core surface (5 min)

| Hardest screen involves… | Pick |
|---|---|
| Standard lists/forms | SwiftUI |
| Text editing | AppKit/UIKit text view |
| Markdown fidelity | WebKit preview or dedicated renderer |
| Custom drawing | AppKit/UIKit/Metal |

### Step 4 — Pick the shell (5 min)

Almost always SwiftUI for new apps unless you are extending AppKit.

### Step 5 — Record the decision (5 min)

Use this template:

```markdown
## Architecture Decision Record

**App:** [name]
**Date:** [date]
**Decision:** SwiftUI-first | Hybrid | AppKit/UIKit-first

### Context
[What we're building]

### Requirements
- [Critical req 1]
- [Critical req 2]

### Decision
[Chosen architecture and why]

### Boundaries
- SwiftUI owns: [navigation, settings, ...]
- AppKit/UIKit owns: [editor, ...]
- WebKit owns: [preview, ...]

### Revisit triggers
- [ ] Rich text requirements expand
- [ ] Performance issues in list X
- [ ] Need iOS port
```

---

## 12. Final recommendations

| Situation | Choose |
|---|---|
| New macOS utility, simple UI | SwiftUI |
| New iOS app, standard navigation | SwiftUI |
| Markdown / writing app | Hybrid |
| Existing AppKit/UIKit app | Keep core; adopt SwiftUI at edges |
| Unsure | SwiftUI shell now; isolate AppKit/UIKit behind one wrapper |

**The best architecture is the one that solves your hardest screen with the least custom framework code.**

When in doubt:

1. Start SwiftUI for the shell.
2. Prototype the hardest screen early.
3. Drop to AppKit/UIKit or WebKit only where measurement or UX proves SwiftUI is insufficient.

---

## 13. Further reading

- [swift-markdown](https://github.com/swiftlang/swift-markdown) — parsing and document analysis
- [Apple SwiftUI documentation](https://developer.apple.com/documentation/swiftui)
- [Apple AppKit documentation](https://developer.apple.com/documentation/appkit)
- [Apple UIKit documentation](https://developer.apple.com/documentation/uikit)
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)

---

*Generated as a decision guide for Apple-platform desktop and mobile app architecture.*
