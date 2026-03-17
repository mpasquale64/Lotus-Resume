import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

const EditorContext = createContext();

const AUTO_SAVE_DELAY = 2000; // 2 seconds after last edit

export function EditorProvider({ children }) {
  const [activeFile, setActiveFile] = useState(null);
  const [content, setContent] = useState('');
  const [editorType, setEditorType] = useState('wysiwyg'); // 'wysiwyg' | 'raw'
  const [viewMode, setViewMode] = useState('editor'); // 'editor' | 'reader'
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState(null); // timestamp of last save
  const [externalChange, setExternalChange] = useState(null); // { path, content } when external edit detected
  const autoSaveTimer = useRef(null);
  const contentRef = useRef(content);
  const activeFileRef = useRef(activeFile);
  const isDirtyRef = useRef(isDirty);

  // Keep refs in sync
  useEffect(() => { contentRef.current = content; }, [content]);
  useEffect(() => { activeFileRef.current = activeFile; }, [activeFile]);
  useEffect(() => { isDirtyRef.current = isDirty; }, [isDirty]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, []);

  const doSave = useCallback(async () => {
    if (!activeFileRef.current || !window.lotus) return;
    await window.lotus.writeFile(activeFileRef.current, contentRef.current);
    setIsDirty(false);
    setLastSaved(Date.now());
  }, []);

  const openFile = useCallback(async (filePath) => {
    // Save current file if dirty
    if (isDirtyRef.current && activeFileRef.current) {
      await doSave();
    }
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    if (window.lotus) {
      const fileContent = await window.lotus.readFile(filePath);
      setContent(fileContent);
    }
    setActiveFile(filePath);
    setIsDirty(false);
    setExternalChange(null);
  }, [doSave]);

  const updateContent = useCallback((newContent) => {
    setContent(newContent);
    setIsDirty(true);
    setExternalChange(null);

    // Reset auto-save timer
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      doSave();
    }, AUTO_SAVE_DELAY);
  }, [doSave]);

  const saveFile = useCallback(async () => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    await doSave();
  }, [doSave]);

  const createNewNote = useCallback(async (notesDir) => {
    if (!window.lotus || !notesDir) return;
    const timestamp = new Date().toISOString().slice(0, 10);
    let name = `Untitled ${timestamp}.md`;
    let filePath = `${notesDir}/${name}`;
    let counter = 1;
    while (true) {
      const exists = await window.lotus.readFile(filePath);
      if (exists === '') break;
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

  // Handle external file changes
  const handleExternalChange = useCallback(async (changedPath) => {
    if (changedPath !== activeFileRef.current) return;
    if (!window.lotus) return;
    const newContent = await window.lotus.readFile(changedPath);
    if (newContent === contentRef.current) return; // no actual change

    if (isDirtyRef.current) {
      // File changed externally while we have unsaved edits - notify user
      setExternalChange({ path: changedPath, content: newContent });
    } else {
      // No local edits, just reload
      setContent(newContent);
    }
  }, []);

  const acceptExternalChange = useCallback(() => {
    if (externalChange) {
      setContent(externalChange.content);
      setIsDirty(false);
      setExternalChange(null);
    }
  }, [externalChange]);

  const dismissExternalChange = useCallback(() => {
    setExternalChange(null);
  }, []);

  return (
    <EditorContext.Provider value={{
      activeFile,
      content,
      editorType,
      viewMode,
      isDirty,
      lastSaved,
      externalChange,
      openFile,
      updateContent,
      saveFile,
      createNewNote,
      setEditorType,
      setViewMode,
      handleExternalChange,
      acceptExternalChange,
      dismissExternalChange,
    }}>
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor() {
  return useContext(EditorContext);
}
