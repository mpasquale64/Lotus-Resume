const { app, BrowserWindow, ipcMain, dialog, nativeTheme } = require('electron');
const path = require('path');
const { buildMenu } = require('./menu');
const { FileService } = require('./fileService');

let mainWindow;
let fileService;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 600,
    minHeight: 400,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 16, y: 16 },
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  buildMenu(mainWindow);
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (fileService) fileService.stopWatching();
  if (process.platform !== 'darwin') app.quit();
});

// --- IPC Handlers ---

ipcMain.handle('dialog:selectDirectory', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory', 'createDirectory'],
    title: 'Select Notes Folder',
  });
  if (result.canceled) return null;
  return result.filePaths[0];
});

ipcMain.handle('fs:setNotesDir', async (_, dirPath) => {
  const Store = (await import('electron-store')).default;
  const store = new Store();
  store.set('notesDir', dirPath);
  fileService = new FileService(dirPath);
  fileService.startWatching((event, filePath) => {
    mainWindow.webContents.send('fs:fileChanged', { event, filePath });
  });
  return true;
});

ipcMain.handle('fs:getNotesDir', async () => {
  const Store = (await import('electron-store')).default;
  const store = new Store();
  return store.get('notesDir', null);
});

ipcMain.handle('fs:listFiles', async (_, dirPath) => {
  if (!fileService) return [];
  return fileService.listFiles(dirPath);
});

ipcMain.handle('fs:readFile', async (_, filePath) => {
  if (!fileService) return '';
  return fileService.readFile(filePath);
});

ipcMain.handle('fs:writeFile', async (_, filePath, content) => {
  if (!fileService) return false;
  return fileService.writeFile(filePath, content);
});

ipcMain.handle('fs:createFile', async (_, filePath) => {
  if (!fileService) return false;
  return fileService.createFile(filePath);
});

ipcMain.handle('fs:createDirectory', async (_, dirPath) => {
  if (!fileService) return false;
  return fileService.createDirectory(dirPath);
});

ipcMain.handle('fs:deleteFile', async (_, filePath) => {
  if (!fileService) return false;
  return fileService.deleteFile(filePath);
});

ipcMain.handle('fs:renameFile', async (_, oldPath, newPath) => {
  if (!fileService) return false;
  return fileService.renameFile(oldPath, newPath);
});

ipcMain.handle('fs:search', async (_, query) => {
  if (!fileService) return [];
  return fileService.search(query);
});

ipcMain.handle('theme:getSystem', () => {
  return nativeTheme.shouldUseDarkColors ? 'dark' : 'light';
});

nativeTheme.on('updated', () => {
  if (mainWindow) {
    mainWindow.webContents.send('theme:systemChanged', nativeTheme.shouldUseDarkColors ? 'dark' : 'light');
  }
});
