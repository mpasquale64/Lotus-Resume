const { Menu, app } = require('electron');

function buildMenu(mainWindow) {
  const send = (action) => mainWindow.webContents.send('menu:action', action);

  const template = [
    {
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    },
    {
      label: 'File',
      submenu: [
        {
          label: 'New Note',
          accelerator: 'CmdOrCtrl+N',
          click: () => send('newNote'),
        },
        {
          label: 'New Folder',
          accelerator: 'CmdOrCtrl+Shift+N',
          click: () => send('newFolder'),
        },
        { type: 'separator' },
        {
          label: 'Save',
          accelerator: 'CmdOrCtrl+S',
          click: () => send('save'),
        },
        { type: 'separator' },
        {
          label: 'Change Notes Folder…',
          click: () => send('changeNotesDir'),
        },
        { type: 'separator' },
        { role: 'close' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
        { type: 'separator' },
        {
          label: 'Find',
          accelerator: 'CmdOrCtrl+F',
          click: () => send('find'),
        },
      ],
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Toggle Sidebar',
          accelerator: 'CmdOrCtrl+B',
          click: () => send('toggleSidebar'),
        },
        { type: 'separator' },
        {
          label: 'Editor Mode',
          accelerator: 'CmdOrCtrl+E',
          click: () => send('editorMode'),
        },
        {
          label: 'Reader Mode',
          accelerator: 'CmdOrCtrl+R',
          click: () => send('readerMode'),
        },
        { type: 'separator' },
        {
          label: 'WYSIWYG Editor',
          accelerator: 'CmdOrCtrl+1',
          click: () => send('wysiwygMode'),
        },
        {
          label: 'Raw Markdown',
          accelerator: 'CmdOrCtrl+2',
          click: () => send('rawMode'),
        },
        { type: 'separator' },
        {
          label: 'Toggle Dark Mode',
          accelerator: 'CmdOrCtrl+Shift+D',
          click: () => send('toggleDarkMode'),
        },
        { type: 'separator' },
        { role: 'reload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        { type: 'separator' },
        { role: 'front' },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

module.exports = { buildMenu };
