import React from 'react';
import FileTree from './FileTree';
import { useFileTree } from '../context/FileTreeContext';
import '../styles/nav-panel.css';

export default function NavPanel({ open }) {
  const { files, notesDir, refreshFiles } = useFileTree();

  const handleNewNote = async () => {
    if (!window.lotus || !notesDir) return;
    const timestamp = new Date().toISOString().slice(0, 10);
    const filePath = `${notesDir}/Untitled ${timestamp}.md`;
    await window.lotus.createFile(filePath);
    refreshFiles();
  };

  const handleNewFolder = async () => {
    const name = prompt('Folder name:');
    if (!name || !window.lotus || !notesDir) return;
    await window.lotus.createDirectory(`${notesDir}/${name}`);
    refreshFiles();
  };

  return (
    <div className={`nav-panel ${open ? 'open' : 'closed'}`}>
      <div className="nav-header">
        <span className="nav-title">Notes</span>
        <div className="nav-actions">
          <button className="nav-btn" onClick={handleNewNote} title="New Note">
            +
          </button>
          <button className="nav-btn" onClick={handleNewFolder} title="New Folder">
            📁
          </button>
        </div>
      </div>
      <div className="nav-tree">
        <FileTree items={files} />
      </div>
    </div>
  );
}
