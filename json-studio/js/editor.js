/**
 * CodeMirror 6 adapter for JSON Studio.
 * Bundled to vendor/codemirror/editor.bundle.js (IIFE → window.JsonStudioEditor).
 */
import { basicSetup } from 'codemirror';
import { EditorView, placeholder, keymap } from '@codemirror/view';
import { EditorState, Compartment, Prec } from '@codemirror/state';
import { json } from '@codemirror/lang-json';

const themeCompartment = new Compartment();

const darkTheme = EditorView.theme(
  {
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
  },
  { dark: true }
);

const lightTheme = EditorView.theme(
  {
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
  },
  { dark: false }
);

function themeExt(theme) {
  return theme === 'light' ? lightTheme : darkTheme;
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
  let view = null;

  const parseKeymap = options.onModEnter
    ? Prec.highest(
        keymap.of([
          {
            key: 'Mod-Enter',
            run: () => {
              options.onModEnter();
              return true;
            },
          },
        ])
      )
    : [];

  const state = EditorState.create({
    doc: options.doc ?? '',
    extensions: [
      basicSetup,
      json(),
      placeholder(options.placeholder || 'Paste JSON here, or drop a .json file…'),
      themeCompartment.of(themeExt(initialTheme)),
      EditorView.lineWrapping,
      parseKeymap,
      EditorView.theme({
        '&': { height: '100%' },
        '.cm-scroller': { overflow: 'auto' },
      }),
    ],
  });

  view = new EditorView({ state, parent });

  return {
    getValue() {
      return view.state.doc.toString();
    },
    setValue(text) {
      const next = text == null ? '' : String(text);
      const cur = view.state.doc.toString();
      if (cur === next) return;
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: next },
      });
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
