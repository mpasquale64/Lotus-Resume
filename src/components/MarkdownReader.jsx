import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useEditor } from '../context/EditorContext';
import '../styles/editor.css';

export default function MarkdownReader() {
  const { content } = useEditor();

  return (
    <div className="editor markdown-reader">
      <div className="reader-content">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {content || '*No content*'}
        </ReactMarkdown>
      </div>
    </div>
  );
}
