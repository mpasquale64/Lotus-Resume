# Lotus

A lightweight markdown note-taking app for macOS.

## Features

- **WYSIWYG & Raw editing** — Toggle between a rich Tiptap editor and a raw CodeMirror markdown editor
- **Reader mode** — Clean rendered markdown preview
- **File tree navigation** — Flyout sidebar with folder/file browser
- **Full-text search** — Search across all your notes
- **Dark mode** — Follows macOS system preference with manual toggle
- **Native menus** — File, Edit, View menus with keyboard shortcuts
- **Toolbar** — Markdown formatting buttons (bold, italic, heading, code, link, lists, blockquote)
- **Local storage** — Notes are plain `.md` files on disk

## Tech Stack

- Electron
- React
- Tiptap (WYSIWYG)
- CodeMirror 6 (Raw editor)
- react-markdown (Reader)
- chokidar (File watching)

## Development

```bash
npm install
npm start
```
