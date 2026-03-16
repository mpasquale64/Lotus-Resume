import React from 'react';
import { useFileTree } from '../context/FileTreeContext';

export default function WelcomeScreen() {
  const { selectNotesDir } = useFileTree();

  return (
    <div className="welcome-screen">
      <div className="welcome-card">
        <h1 className="welcome-title">Lotus</h1>
        <p className="welcome-subtitle">A lightweight markdown note-taking app</p>
        <p className="welcome-text">Choose a folder to store your notes.</p>
        <button className="welcome-btn" onClick={selectNotesDir}>
          Select Notes Folder
        </button>
      </div>
    </div>
  );
}
