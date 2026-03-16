import React, { createContext, useContext, useState, useCallback } from 'react';

const FileTreeContext = createContext();

export function FileTreeProvider({ children }) {
  const [notesDir, setNotesDir] = useState(null);
  const [files, setFiles] = useState([]);
  const [initialized, setInitialized] = useState(false);

  const refreshFiles = useCallback(async () => {
    if (!window.lotus || !notesDir) return;
    const fileList = await window.lotus.listFiles(notesDir);
    setFiles(fileList);
  }, [notesDir]);

  const initialize = useCallback(async () => {
    if (!window.lotus) {
      setInitialized(true);
      return;
    }
    const dir = await window.lotus.getNotesDir();
    if (dir) {
      setNotesDir(dir);
      await window.lotus.setNotesDir(dir);
      const fileList = await window.lotus.listFiles(dir);
      setFiles(fileList);
    }
    setInitialized(true);
  }, []);

  const selectNotesDir = useCallback(async () => {
    if (!window.lotus) return;
    const dir = await window.lotus.selectDirectory();
    if (dir) {
      setNotesDir(dir);
      await window.lotus.setNotesDir(dir);
      const fileList = await window.lotus.listFiles(dir);
      setFiles(fileList);
    }
  }, []);

  return (
    <FileTreeContext.Provider value={{
      notesDir,
      files,
      initialized,
      initialize,
      selectNotesDir,
      refreshFiles,
    }}>
      {children}
    </FileTreeContext.Provider>
  );
}

export function useFileTree() {
  return useContext(FileTreeContext);
}
