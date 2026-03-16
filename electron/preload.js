const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('lotus', {
  // Dialog
  selectDirectory: () => ipcRenderer.invoke('dialog:selectDirectory'),

  // File system
  setNotesDir: (dirPath) => ipcRenderer.invoke('fs:setNotesDir', dirPath),
  getNotesDir: () => ipcRenderer.invoke('fs:getNotesDir'),
  listFiles: (dirPath) => ipcRenderer.invoke('fs:listFiles', dirPath),
  readFile: (filePath) => ipcRenderer.invoke('fs:readFile', filePath),
  writeFile: (filePath, content) => ipcRenderer.invoke('fs:writeFile', filePath, content),
  createFile: (filePath) => ipcRenderer.invoke('fs:createFile', filePath),
  createDirectory: (dirPath) => ipcRenderer.invoke('fs:createDirectory', dirPath),
  deleteFile: (filePath) => ipcRenderer.invoke('fs:deleteFile', filePath),
  renameFile: (oldPath, newPath) => ipcRenderer.invoke('fs:renameFile', oldPath, newPath),
  search: (query) => ipcRenderer.invoke('fs:search', query),

  // Theme
  getSystemTheme: () => ipcRenderer.invoke('theme:getSystem'),

  // Event listeners
  onFileChanged: (callback) => {
    const handler = (_, data) => callback(data);
    ipcRenderer.on('fs:fileChanged', handler);
    return () => ipcRenderer.removeListener('fs:fileChanged', handler);
  },
  onSystemThemeChanged: (callback) => {
    const handler = (_, theme) => callback(theme);
    ipcRenderer.on('theme:systemChanged', handler);
    return () => ipcRenderer.removeListener('theme:systemChanged', handler);
  },
  onMenuAction: (callback) => {
    const handler = (_, action) => callback(action);
    ipcRenderer.on('menu:action', handler);
    return () => ipcRenderer.removeListener('menu:action', handler);
  },
});
