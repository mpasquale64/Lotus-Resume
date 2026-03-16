import React, { useEffect, useRef } from 'react';
import { EditorView, keymap } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { useEditor } from '../context/EditorContext';
import { useTheme } from '../context/ThemeContext';
import '../styles/editor.css';

export default function RawEditor() {
  const containerRef = useRef(null);
  const viewRef = useRef(null);
  const { content, updateContent } = useEditor();
  const { theme } = useTheme();

  useEffect(() => {
    if (!containerRef.current) return;

    const extensions = [
      markdown(),
      history(),
      keymap.of([...defaultKeymap, ...historyKeymap]),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          updateContent(update.state.doc.toString());
        }
      }),
      EditorView.lineWrapping,
    ];

    if (theme === 'dark') {
      extensions.push(oneDark);
    }

    const state = EditorState.create({
      doc: content || '',
      extensions,
    });

    const view = new EditorView({
      state,
      parent: containerRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [theme]); // Recreate on theme change

  // Sync content when file changes externally
  useEffect(() => {
    if (viewRef.current && content !== undefined) {
      const currentDoc = viewRef.current.state.doc.toString();
      if (currentDoc !== content) {
        viewRef.current.dispatch({
          changes: { from: 0, to: currentDoc.length, insert: content || '' },
        });
      }
    }
  }, [content]);

  // Listen for format commands from toolbar
  useEffect(() => {
    const handleFormat = (e) => {
      const view = viewRef.current;
      if (!view) return;
      const { from, to } = view.state.selection.main;
      const selected = view.state.sliceDoc(from, to);
      let insert = '';

      switch (e.detail) {
        case 'bold': insert = `**${selected || 'bold'}**`; break;
        case 'italic': insert = `*${selected || 'italic'}*`; break;
        case 'heading': insert = `## ${selected || 'Heading'}`; break;
        case 'code': insert = `\`${selected || 'code'}\``; break;
        case 'link': insert = `[${selected || 'text'}](url)`; break;
        case 'bulletList': insert = `- ${selected || 'item'}`; break;
        case 'orderedList': insert = `1. ${selected || 'item'}`; break;
        case 'blockquote': insert = `> ${selected || 'quote'}`; break;
        default: return;
      }

      view.dispatch({ changes: { from, to, insert } });
      view.focus();
    };

    window.addEventListener('lotus:format', handleFormat);
    return () => window.removeEventListener('lotus:format', handleFormat);
  }, []);

  return (
    <div className="editor raw-editor" ref={containerRef} />
  );
}
