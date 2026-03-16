import React, { useState, useCallback } from 'react';
import { useEditor } from '../context/EditorContext';

export default function SearchBar({ onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const { openFile } = useEditor();

  const handleSearch = useCallback(async (value) => {
    setQuery(value);
    if (!window.lotus || value.length < 2) {
      setResults([]);
      return;
    }
    const searchResults = await window.lotus.search(value);
    setResults(searchResults);
  }, []);

  const handleSelect = (filePath) => {
    openFile(filePath);
    onClose();
  };

  return (
    <div className="search-bar">
      <div className="search-input-row">
        <input
          type="text"
          className="search-input"
          placeholder="Search notes…"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          autoFocus
        />
        <button className="search-close" onClick={onClose}>✕</button>
      </div>
      {results.length > 0 && (
        <div className="search-results">
          {results.map((result) => (
            <div key={result.path} className="search-result" onClick={() => handleSelect(result.path)}>
              <span className="search-result-name">{result.name.replace('.md', '')}</span>
              {result.preview && <span className="search-result-preview">{result.preview}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
