# CodeMirror 6 vendor bundle

`editor.bundle.js` is a minified IIFE built from `../../js/editor.js`.

Rebuild after changing the adapter or upgrading packages:

```bash
cd json-studio
npm install
npm run build:editor
```

The page loads this file as a classic script (`window.JsonStudioEditor`).
