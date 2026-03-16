import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';
import { FileTreeProvider } from './context/FileTreeContext';
import { EditorProvider } from './context/EditorContext';
import './styles/global.css';

const root = createRoot(document.getElementById('root'));
root.render(
  <ThemeProvider>
    <FileTreeProvider>
      <EditorProvider>
        <App />
      </EditorProvider>
    </FileTreeProvider>
  </ThemeProvider>
);
