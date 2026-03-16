import React from 'react';
import { useEditor } from '../context/EditorContext';
import { useTheme } from '../context/ThemeContext';
import '../styles/toolbar.css';

export default function Toolbar({ sidebarOpen, onToggleSidebar }) {
  const { editorType, viewMode, setEditorType, setViewMode, isDirty, saveFile, activeFile } = useEditor();
  const { theme, toggleTheme } = useTheme();

  const formatAction = (action) => {
    // Dispatch formatting commands to the active editor
    window.dispatchEvent(new CustomEvent('lotus:format', { detail: action }));
  };

  const fileName = activeFile ? activeFile.split('/').pop().replace('.md', '') : 'Lotus';

  return (
    <div className="toolbar">
      <div className="toolbar-left">
        <button
          className={`toolbar-btn sidebar-toggle ${sidebarOpen ? 'active' : ''}`}
          onClick={onToggleSidebar}
          title="Toggle Sidebar (⌘B)"
        >
          ☰
        </button>
        <span className="toolbar-title">
          {fileName}
          {isDirty && <span className="dirty-indicator">●</span>}
        </span>
      </div>

      <div className="toolbar-center">
        {viewMode === 'editor' && (
          <div className="format-buttons">
            <button className="toolbar-btn format" onClick={() => formatAction('bold')} title="Bold (⌘B)">
              <strong>B</strong>
            </button>
            <button className="toolbar-btn format" onClick={() => formatAction('italic')} title="Italic (⌘I)">
              <em>I</em>
            </button>
            <button className="toolbar-btn format" onClick={() => formatAction('heading')} title="Heading">
              H
            </button>
            <button className="toolbar-btn format" onClick={() => formatAction('code')} title="Code">
              &lt;/&gt;
            </button>
            <button className="toolbar-btn format" onClick={() => formatAction('link')} title="Link">
              🔗
            </button>
            <button className="toolbar-btn format" onClick={() => formatAction('bulletList')} title="Bullet List">
              •≡
            </button>
            <button className="toolbar-btn format" onClick={() => formatAction('orderedList')} title="Numbered List">
              1.
            </button>
            <button className="toolbar-btn format" onClick={() => formatAction('blockquote')} title="Quote">
              ❝
            </button>

            <div className="toolbar-divider" />

            <div className="editor-toggle">
              <button
                className={`toolbar-btn toggle ${editorType === 'wysiwyg' ? 'active' : ''}`}
                onClick={() => setEditorType('wysiwyg')}
                title="WYSIWYG Editor (⌘1)"
              >
                WYSIWYG
              </button>
              <button
                className={`toolbar-btn toggle ${editorType === 'raw' ? 'active' : ''}`}
                onClick={() => setEditorType('raw')}
                title="Raw Markdown (⌘2)"
              >
                Raw
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="toolbar-right">
        <div className="view-toggle">
          <button
            className={`toolbar-btn toggle ${viewMode === 'editor' ? 'active' : ''}`}
            onClick={() => setViewMode('editor')}
            title="Editor (⌘E)"
          >
            Edit
          </button>
          <button
            className={`toolbar-btn toggle ${viewMode === 'reader' ? 'active' : ''}`}
            onClick={() => setViewMode('reader')}
            title="Reader (⌘R)"
          >
            Read
          </button>
        </div>
        <button className="toolbar-btn" onClick={toggleTheme} title="Toggle Dark Mode">
          {theme === 'dark' ? '☀' : '☾'}
        </button>
      </div>
    </div>
  );
}
