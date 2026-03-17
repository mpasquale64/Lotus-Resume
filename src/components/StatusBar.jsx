import React from 'react';
import { useEditor } from '../context/EditorContext';

export default function StatusBar() {
  const { activeFile, content, isDirty, lastSaved } = useEditor();

  if (!activeFile) return null;

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  const formatSaveTime = () => {
    if (!lastSaved) return null;
    const diff = Math.floor((Date.now() - lastSaved) / 1000);
    if (diff < 5) return 'Saved just now';
    if (diff < 60) return `Saved ${diff}s ago`;
    return `Saved ${Math.floor(diff / 60)}m ago`;
  };

  const saveStatus = isDirty ? 'Unsaved changes' : formatSaveTime();

  return (
    <div className="status-bar">
      <span className="status-item">{wordCount} words</span>
      <span className="status-separator" />
      <span className="status-item">{charCount} chars</span>
      <span className="status-spacer" />
      {saveStatus && (
        <span className={`status-item ${isDirty ? 'status-dirty' : 'status-saved'}`}>
          {saveStatus}
        </span>
      )}
    </div>
  );
}
