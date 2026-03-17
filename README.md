# Lotus

A lightweight, local-first markdown note-taking app for macOS, built with Electron and React.

Your notes are plain `.md` files on disk — no cloud sync, no vendor lock-in.

## Features

- **WYSIWYG editor** — Rich text editing powered by Tiptap with full markdown round-tripping via tiptap-markdown
- **Raw markdown editor** — CodeMirror 6 with syntax highlighting and the OneDark theme in dark mode
- **Reader mode** — Clean rendered preview using react-markdown with GitHub Flavored Markdown support
- **File tree** — Sidebar with hierarchical folder/file navigation and right-click context menu (rename, delete)
- **Full-text search** — Search across all note filenames and content with match previews
- **Auto-save** — Saves automatically 2 seconds after your last edit, with manual save via Cmd+S
- **Conflict detection** — Detects external file changes and prompts to reload or keep your version when conflicts occur
- **Dark mode** — Follows macOS system preference by default, with manual toggle override
- **Native menus** — Full macOS menu bar with standard keyboard shortcuts
- **Formatting toolbar** — Bold, italic, heading, code, link, bullet list, ordered list, and blockquote
- **Status bar** — Live word count, character count, and save status

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Cmd+N | New Note |
| Cmd+Shift+N | New Folder |
| Cmd+S | Save |
| Cmd+F | Find |
| Cmd+B | Toggle Sidebar |
| Cmd+1 | WYSIWYG Mode |
| Cmd+2 | Raw Markdown Mode |
| Cmd+E | Editor Mode |
| Cmd+R | Reader Mode |
| Cmd+Shift+D | Toggle Dark Mode |

## Tech Stack

| Technology | Role |
|------------|------|
| Electron 32 | Desktop shell, native menus, file dialogs |
| React 18 | UI framework |
| Tiptap + tiptap-markdown | WYSIWYG rich text editor with markdown serialization |
| CodeMirror 6 | Raw markdown editor with syntax highlighting |
| react-markdown + remark-gfm | Markdown rendering in reader mode |
| chokidar | File system watching for external changes |
| electron-store | Persistent settings (notes directory, preferences) |
| Webpack 5 + Babel | Build toolchain |

## Project Structure

```
lotus/
├── electron/                  # Electron main process
│   ├── main.js                # Window creation, IPC handlers, theme events
│   ├── menu.js                # Native macOS menu with keyboard shortcuts
│   ├── fileService.js         # File CRUD, directory listing, search, file watching
│   └── preload.js             # Context bridge exposing window.lotus API
├── src/                       # React renderer
│   ├── App.jsx                # Root component, menu/file-change listeners
│   ├── index.jsx              # React DOM entry point
│   ├── index.html             # HTML template
│   ├── components/
│   │   ├── Toolbar.jsx        # Top bar: formatting buttons, mode toggles
│   │   ├── NavPanel.jsx       # Sidebar container with file tree
│   │   ├── FileTree.jsx       # Recursive file/folder tree with context menu
│   │   ├── ContextMenu.jsx    # Right-click menu component
│   │   ├── WysiwygEditor.jsx  # Tiptap WYSIWYG editor
│   │   ├── RawEditor.jsx      # CodeMirror raw markdown editor
│   │   ├── MarkdownReader.jsx # Rendered markdown preview
│   │   ├── SearchBar.jsx      # Full-text search with results
│   │   ├── StatusBar.jsx      # Word count, char count, save status
│   │   └── WelcomeScreen.jsx  # Initial folder selection screen
│   ├── context/
│   │   ├── ThemeContext.jsx    # Dark/light mode state
│   │   ├── FileTreeContext.jsx # Notes directory and file list state
│   │   └── EditorContext.jsx   # Active file, content, auto-save, conflict detection
│   └── styles/
│       ├── global.css          # CSS variables, layout, status bar, conflict bar
│       ├── toolbar.css         # Toolbar styling
│       ├── editor.css          # Editor and reader styling
│       └── nav-panel.css       # Sidebar, file tree, context menu styling
├── webpack.config.js
└── package.json
```

## Getting Started

**Prerequisites:** Node.js 18+ and npm

```bash
# Install dependencies
npm install

# Development (webpack watch + Electron)
npm run dev

# Production build
npm run build

# Run the app
npm start
```

## Architecture

Lotus uses Electron's two-process model with strict context isolation:

- **Main process** (`electron/`) — Manages the BrowserWindow, native menus, file system operations, file watching with self-write suppression, and IPC handlers. All privileged operations happen here.
- **Renderer process** (`src/`) — A React SPA with three context providers (Theme, FileTree, Editor) managing application state. Components communicate with the main process exclusively through the preload bridge.
- **Preload bridge** (`electron/preload.js`) — Exposes a typed `window.lotus` API via `contextBridge.exposeInMainWorld`, wrapping `ipcRenderer.invoke` for requests and `ipcRenderer.on` for push events (file changes, theme updates, menu actions).
