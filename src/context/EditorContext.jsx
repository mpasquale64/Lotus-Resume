import React, { createContext, useContext, useState, useCallback } from 'react';

const EditorContext = createContext();

export function EditorProvider({ children }) {
  const [activeFile, setActiveFile] = useState(null);
  const [content, setContent] = useState('');
  const [editorType, setEditorType] = useState('wysiwyg'); // 'wysiwyg' | 'raw'
  const [viewMode, setViewMode] = useState('editor'); // 'editor' | 'reader'
  const [isDirty, setIsDirty] = useState(false);

  const openFile = useCallback(async (filePath) => {
    if (isDirty && activeFile) {
      await saveFile();
    }
    if (window.lotus) {
      const fileContent = await window.lotus.readFile(filePath);
      setContent(fileContent);
    }
    setActiveFile(filePath);
    setIsDirty(false);
  }, [isDirty, activeFile]);

  const updateContent = useCallback((newContent) => {
    setContent(newContent);
    setIsDirty(true);
  }, []);

  const saveFile = useCallback(async () => {
    if (!activeFile || !window.lotus) return;
    await window.lotus.writeFile(activeFile, content);
    setIsDirty(false);
  }, [activeFile, content]);

  const createNewNote = useCallback(async (notesDir) => {
    if (!window.lotus || !notesDir) return;
    const timestamp = new Date().toISOString().slice(0, 10);
    let name = `Untitled ${timestamp}.md`;
    let filePath = `${notesDir}/${name}`;
    let counter = 1;
    // Avoid collisions
    while (true) {
      const exists = await window.lotus.readFile(filePath);
      if (exists === '') {
        // Could be empty file or non-existent, try to create
        break;
      }
      name = `Untitled ${timestamp} (${counter}).md`;
      filePath = `${notesDir}/${name}`;
      counter++;
    }
    await window.lotus.createFile(filePath);
    setActiveFile(filePath);
    setContent('');
    setIsDirty(false);
    return filePath;
  }, []);

  return (
    <EditorContext.Provider value={{
      activeFile,
      content,
      editorType,
      viewMode,
      isDirty,
      openFile,
      updateContent,
      saveFile,
      createNewNote,
      setEditorType,
      setViewMode,
    }}>
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor() {
  return useContext(EditorContext);
}
