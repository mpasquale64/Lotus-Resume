import React, { useState } from 'react';
import { useEditor } from '../context/EditorContext';
import { useFileTree } from '../context/FileTreeContext';
import ContextMenu from './ContextMenu';

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
  const [contextMenu, setContextMenu] = useState(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState('');
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

  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const startRename = () => {
    setRenameValue(item.name);
    setIsRenaming(true);
  };

  const commitRename = async () => {
    setIsRenaming(false);
    if (!renameValue || renameValue === item.name || !window.lotus) return;
    const dir = item.path.substring(0, item.path.lastIndexOf('/'));
    await window.lotus.renameFile(item.path, `${dir}/${renameValue}`);
    refreshFiles();
  };

  const handleDelete = async () => {
    if (!window.lotus) return;
    const confirmed = confirm(`Delete "${item.name}"?`);
    if (!confirmed) return;
    await window.lotus.deleteFile(item.path);
    refreshFiles();
  };

  const menuItems = [
    { label: 'Rename', action: startRename },
    { separator: true },
    { label: 'Delete', action: handleDelete, destructive: true },
  ];

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
        {isRenaming ? (
          <input
            className="tree-rename-input"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitRename();
              if (e.key === 'Escape') setIsRenaming(false);
            }}
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="tree-name">{item.name.replace('.md', '')}</span>
        )}
      </div>
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={menuItems}
          onClose={() => setContextMenu(null)}
        />
      )}
      {item.isDirectory && expanded && item.children && (
        <FileTree items={item.children} depth={depth + 1} />
      )}
    </>
  );
}
