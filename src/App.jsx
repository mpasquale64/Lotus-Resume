import React, { useState, useEffect } from 'react';
import { useFileTree } from './context/FileTreeContext';
import { useEditor } from './context/EditorContext';
import { useTheme } from './context/ThemeContext';
import Toolbar from './components/Toolbar';
import NavPanel from './components/NavPanel';
import WysiwygEditor from './components/WysiwygEditor';
import RawEditor from './components/RawEditor';
import MarkdownReader from './components/MarkdownReader';
import WelcomeScreen from './components/WelcomeScreen';
import SearchBar from './components/SearchBar';
import StatusBar from './components/StatusBar';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const { notesDir, initialized, initialize, selectNotesDir, refreshFiles } = useFileTree();
  const {
    activeFile, editorType, viewMode, isDirty,
    saveFile, createNewNote, setEditorType, setViewMode,
    handleExternalChange, externalChange, acceptExternalChange, dismissExternalChange,
  } = useEditor();
  const { toggleTheme } = useTheme();

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Listen for menu actions
  useEffect(() => {
    if (!window.lotus) return;
    const cleanup = window.lotus.onMenuAction((action) => {
      switch (action) {
        case 'toggleSidebar': setSidebarOpen((v) => !v); break;
        case 'save': saveFile(); break;
        case 'newNote': createNewNote(notesDir).then(() => refreshFiles()); break;
        case 'newFolder': break; // Handled by NavPanel
        case 'changeNotesDir': selectNotesDir(); break;
        case 'editorMode': setViewMode('editor'); break;
        case 'readerMode': setViewMode('reader'); break;
        case 'wysiwygMode': setEditorType('wysiwyg'); break;
        case 'rawMode': setEditorType('raw'); break;
        case 'toggleDarkMode': toggleTheme(); break;
        case 'find': setSearchOpen((v) => !v); break;
      }
    });
    return cleanup;
  }, [saveFile, createNewNote, notesDir, selectNotesDir, refreshFiles, setEditorType, setViewMode, toggleTheme]);

  // Listen for file changes - refresh tree and detect conflicts
  useEffect(() => {
    if (!window.lotus) return;
    const cleanup = window.lotus.onFileChanged((data) => {
      refreshFiles();
      if (data.event === 'change' && data.filePath) {
        handleExternalChange(data.filePath);
      }
    });
    return cleanup;
  }, [refreshFiles, handleExternalChange]);

  if (!initialized) {
    return <div className="loading">Loading...</div>;
  }

  if (!notesDir) {
    return <WelcomeScreen />;
  }

  const renderEditor = () => {
    if (!activeFile) {
      return (
        <div className="empty-state">
          <p>Select a note or create a new one</p>
        </div>
      );
    }
    if (viewMode === 'reader') {
      return <MarkdownReader />;
    }
    if (editorType === 'wysiwyg') {
      return <WysiwygEditor />;
    }
    return <RawEditor />;
  };

  return (
    <div className="app">
      <div className="titlebar-drag" />
      <Toolbar sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen((v) => !v)} />
      <div className="main-layout">
        <NavPanel open={sidebarOpen} searchOpen={searchOpen} onToggleSearch={() => setSearchOpen((v) => !v)} />
        <div className="editor-area">
          {searchOpen && <SearchBar onClose={() => setSearchOpen(false)} />}
          {externalChange && (
            <div className="conflict-bar">
              <span>This file was modified externally.</span>
              <button onClick={acceptExternalChange}>Reload</button>
              <button onClick={dismissExternalChange}>Keep mine</button>
            </div>
          )}
          {renderEditor()}
          <StatusBar />
        </div>
      </div>
    </div>
  );
}
