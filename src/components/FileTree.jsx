import React, { useState } from 'react';
import { useEditor } from '../context/EditorContext';
import { useFileTree } from '../context/FileTreeContext';

export default function FileTree({ items, depth = 0 }) {
  if (!items || items.length === 0) {
    return depth === 0 ? <div className="empty-tree">No notes yet</div> : null;
  }

  return (
    <div className="file-tree" style={{ paddingLeft: depth > 0 ? 12 : 0 }}>
      {items.map((item) => (
        <FileTreeItem key={item.path} item={item} depth={depth} />
      ))}
    </div>
  );
}

function FileTreeItem({ item, depth }) {
  const [expanded, setExpanded] = useState(true);
  const { activeFile, openFile } = useEditor();
  const { refreshFiles } = useFileTree();
  const isActive = activeFile === item.path;

  const handleClick = () => {
    if (item.isDirectory) {
      setExpanded(!expanded);
    } else if (item.name.endsWith('.md')) {
      openFile(item.path);
    }
  };

  const handleContextMenu = async (e) => {
    e.preventDefault();
    // Simple context menu via prompt for now
    const action = prompt('Action: rename, delete');
    if (!action || !window.lotus) return;

    if (action.toLowerCase() === 'delete') {
      if (confirm(`Delete "${item.name}"?`)) {
        await window.lotus.deleteFile(item.path);
        refreshFiles();
      }
    } else if (action.toLowerCase() === 'rename') {
      const newName = prompt('New name:', item.name);
      if (newName && newName !== item.name) {
        const dir = item.path.substring(0, item.path.lastIndexOf('/'));
        await window.lotus.renameFile(item.path, `${dir}/${newName}`);
        refreshFiles();
      }
    }
  };

  return (
    <>
      <div
        className={`tree-item ${isActive ? 'active' : ''} ${item.isDirectory ? 'directory' : 'file'}`}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
      >
        <span className="tree-icon">
          {item.isDirectory ? (expanded ? '▼' : '▶') : '📄'}
        </span>
        <span className="tree-name">{item.name.replace('.md', '')}</span>
      </div>
      {item.isDirectory && expanded && item.children && (
        <FileTree items={item.children} depth={depth + 1} />
      )}
    </>
  );
}
