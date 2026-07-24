/**
 * CodeMirror 6 adapter for JSON Studio.
 * Bundled to vendor/codemirror/editor.bundle.js (IIFE → window.JsonStudioEditor).
 *
 * Large-doc mode (size / long-line heuristics) turns off expensive display work:
 * line wrapping, selection-match highlights, and (for extreme lines) JSON highlighting.
 */
import {
  EditorView,
  placeholder,
  keymap,
  lineNumbers,
  highlightActiveLineGutter,
  highlightSpecialChars,
  drawSelection,
  dropCursor,
  rectangularSelection,
  crosshairCursor,
  highlightActiveLine,
} from '@codemirror/view';
import { EditorState, Compartment, Prec, Transaction } from '@codemirror/state';
import { json } from '@codemirror/lang-json';
import {
  foldGutter,
  indentOnInput,
  bracketMatching,
  foldKeymap,
  syntaxHighlighting,
  HighlightStyle,
} from '@codemirror/language';
import { tags as t } from '@lezer/highlight';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search';
import {
  autocompletion,
  completionKeymap,
  closeBrackets,
  closeBracketsKeymap,
} from '@codemirror/autocomplete';
import { lintKeymap } from '@codemirror/lint';

/** Soft-wrap + match highlights off above this size (bytes, UTF-8 approx via Blob). */
const LARGE_DOC_BYTES = 512 * 1024;
/** Disable JSON syntax highlighting when any line exceeds this (chars). */
const HUGE_LINE_CHARS = 20000;

const themeCompartment = new Compartment();
const wrapCompartment = new Compartment();
const langCompartment = new Compartment();
const extrasCompartment = new Compartment();

/** Matches page CSS vars (--json-*) so editor and tree colors stay in sync. */
const jsonHighlightStyle = HighlightStyle.define([
  { tag: t.propertyName, color: 'var(--json-key)' },
  { tag: t.string, color: 'var(--json-string)' },
  { tag: t.number, color: 'var(--json-number)' },
  { tag: t.bool, color: 'var(--json-bool)', fontWeight: '600' },
  { tag: t.null, color: 'var(--json-null)', fontStyle: 'italic' },
  { tag: t.keyword, color: 'var(--json-bool)', fontWeight: '600' },
  { tag: t.atom, color: 'var(--json-bool)', fontWeight: '600' },
  { tag: t.punctuation, color: 'var(--text-muted)' },
  { tag: t.separator, color: 'var(--text-muted)' },
  { tag: t.bracket, color: 'var(--text-muted)' },
  { tag: t.squareBracket, color: 'var(--text-muted)' },
  { tag: t.brace, color: 'var(--text-muted)' },
  { tag: t.paren, color: 'var(--text-muted)' },
  { tag: t.invalid, color: 'var(--danger)' },
]);

const sharedThemeRules = {
  '&': {
    height: '100%',
    backgroundColor: 'var(--bg)',
    color: 'var(--text)',
    fontSize: '13px',
  },
  '.cm-scroller': {
    fontFamily: 'var(--font-mono)',
    lineHeight: '1.6',
    overflow: 'auto',
  },
  '.cm-content': {
    caretColor: 'var(--accent)',
    padding: '16px 0',
  },
  '.cm-line': {
    padding: '0 16px',
  },
  '&.cm-focused': {
    outline: 'none',
  },
  '.cm-gutters': {
    backgroundColor: 'var(--bg-elevated)',
    color: 'var(--text-muted)',
    border: 'none',
    borderRight: '1px solid var(--border)',
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'var(--bg-hover)',
  },
  '.cm-activeLine': {
    backgroundColor: 'var(--accent-soft)',
  },
  '.cm-selectionBackground, ::selection': {
    backgroundColor: 'var(--accent-soft) !important',
  },
  '&.cm-focused .cm-selectionBackground': {
    backgroundColor: 'var(--accent-border-soft) !important',
  },
  '.cm-cursor, .cm-dropCursor': {
    borderLeftColor: 'var(--accent)',
  },
  '.cm-matchingBracket': {
    backgroundColor: 'var(--accent-soft)',
    outline: '1px solid var(--accent-border-soft)',
  },
  '.cm-foldPlaceholder': {
    background: 'var(--bg-hover)',
    border: '1px solid var(--border)',
    color: 'var(--text-muted)',
  },
  '.cm-tooltip': {
    backgroundColor: 'var(--bg-elevated)',
    color: 'var(--text)',
    border: '1px solid var(--border)',
  },
};

const darkTheme = EditorView.theme(sharedThemeRules, { dark: true });
const lightTheme = EditorView.theme(sharedThemeRules, { dark: false });

function themeExt(theme) {
  return theme === 'light' ? lightTheme : darkTheme;
}

function byteSize(text) {
  if (!text) return 0;
  if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(text).length;
  return text.length;
}

function maxLineLength(text) {
  if (!text) return 0;
  let max = 0;
  let start = 0;
  for (let i = 0; i <= text.length; i++) {
    if (i === text.length || text.charCodeAt(i) === 10) {
      const len = i - start;
      if (len > max) max = len;
      start = i + 1;
      if (max >= HUGE_LINE_CHARS) return max;
    }
  }
  return max;
}

function analyzeDoc(text) {
  const size = byteSize(text);
  const longLine = maxLineLength(text) >= HUGE_LINE_CHARS;
  const large = size >= LARGE_DOC_BYTES || longLine;
  return { size, longLine, large };
}

function wrapExt(large) {
  return large ? [] : EditorView.lineWrapping;
}

function langExt(longLine) {
  // Highlighting a multi‑MB single line blocks the main thread hard.
  return longLine
    ? []
    : [json(), syntaxHighlighting(jsonHighlightStyle, { fallback: true })];
}

function extrasExt(large) {
  if (large) {
    return [
      highlightSpecialChars(),
      drawSelection(),
      dropCursor(),
      bracketMatching(),
    ];
  }
  return [
    highlightActiveLineGutter(),
    highlightSpecialChars(),
    drawSelection(),
    dropCursor(),
    indentOnInput(),
    bracketMatching(),
    closeBrackets(),
    autocompletion(),
    rectangularSelection(),
    crosshairCursor(),
    highlightActiveLine(),
    highlightSelectionMatches(),
  ];
}

function baseKeymap(onModEnter) {
  const parseKeymap = onModEnter
    ? Prec.highest(
        keymap.of([
          {
            key: 'Mod-Enter',
            run: () => {
              onModEnter();
              return true;
            },
          },
        ])
      )
    : [];

  return [
    parseKeymap,
    keymap.of([
      ...closeBracketsKeymap,
      ...defaultKeymap,
      ...searchKeymap,
      ...historyKeymap,
      ...foldKeymap,
      ...completionKeymap,
      ...lintKeymap,
      indentWithTab,
    ]),
  ];
}

/**
 * @param {HTMLElement} parent
 * @param {{
 *   doc?: string,
 *   theme?: 'light' | 'dark',
 *   placeholder?: string,
 *   onModEnter?: () => void,
 * }} [options]
 */
export function createEditor(parent, options = {}) {
  const initialTheme = options.theme === 'light' ? 'light' : 'dark';
  const initialDoc = options.doc ?? '';
  const initial = analyzeDoc(initialDoc);
  let view = null;
  let mode = { large: initial.large, longLine: initial.longLine };

  const state = EditorState.create({
    doc: initialDoc,
    extensions: [
      lineNumbers(),
      foldGutter(),
      history(),
      EditorState.allowMultipleSelections.of(true),
      wrapCompartment.of(wrapExt(initial.large)),
      langCompartment.of(langExt(initial.longLine)),
      extrasCompartment.of(extrasExt(initial.large)),
      themeCompartment.of(themeExt(initialTheme)),
      placeholder(options.placeholder || 'Paste JSON here, or drop a .json file…'),
      ...baseKeymap(options.onModEnter),
      EditorView.theme({
        '&': { height: '100%', maxWidth: '100%' },
        '.cm-scroller': { overflow: 'auto' },
        '.cm-content': { maxWidth: '100%' },
      }),
    ],
  });

  view = new EditorView({ state, parent });

  function applyDocMode(text, { addToHistory }) {
    const next = analyzeDoc(text);
    const effects = [];

    if (next.large !== mode.large) {
      effects.push(wrapCompartment.reconfigure(wrapExt(next.large)));
      effects.push(extrasCompartment.reconfigure(extrasExt(next.large)));
    }
    if (next.longLine !== mode.longLine) {
      effects.push(langCompartment.reconfigure(langExt(next.longLine)));
    }

    mode = { large: next.large, longLine: next.longLine };

    const annotations = addToHistory ? [] : [Transaction.addToHistory.of(false)];

    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: text },
      selection: { anchor: 0 },
      effects: [
        ...effects,
        EditorView.scrollIntoView(0, { y: 'start' }),
      ],
      annotations,
    });

    return next;
  }

  return {
    getValue() {
      return view.state.doc.toString();
    },
    setValue(text) {
      const next = text == null ? '' : String(text);
      const cur = view.state.doc.toString();
      if (cur === next) return mode;

      const size = byteSize(next);
      // Huge replacements must not enter undo history (memory + hitch).
      return applyDocMode(next, { addToHistory: size < LARGE_DOC_BYTES });
    },
    /** Current large-doc heuristics (after last setValue). */
    getDocMode() {
      return { ...mode, thresholds: { LARGE_DOC_BYTES, HUGE_LINE_CHARS } };
    },
    focus() {
      view.focus();
    },
    setTheme(theme) {
      const next = theme === 'light' ? 'light' : 'dark';
      view.dispatch({
        effects: themeCompartment.reconfigure(themeExt(next)),
      });
    },
    destroy() {
      view.destroy();
      view = null;
    },
    get view() {
      return view;
    },
  };
}

export default { createEditor };
