import React, { useEffect } from 'react';
import { useEditor as useTiptapEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useEditor } from '../context/EditorContext';
import '../styles/editor.css';

export default function WysiwygEditor() {
  const { content, updateContent } = useEditor();

  const editor = useTiptapEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Start writing…' }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      // Convert to markdown-like text for storage
      // Tiptap stores HTML internally; we serialize to text
      updateContent(editor.storage.markdown?.getMarkdown?.() || editor.getText());
    },
  });

  // Sync content when file changes
  useEffect(() => {
    if (editor && content !== undefined) {
      const currentContent = editor.getText();
      if (currentContent !== content) {
        editor.commands.setContent(content || '');
      }
    }
  }, [content, editor]);

  // Listen for format commands from toolbar
  useEffect(() => {
    const handleFormat = (e) => {
      if (!editor) return;
      const action = e.detail;
      switch (action) {
        case 'bold': editor.chain().focus().toggleBold().run(); break;
        case 'italic': editor.chain().focus().toggleItalic().run(); break;
        case 'heading': editor.chain().focus().toggleHeading({ level: 2 }).run(); break;
        case 'code': editor.chain().focus().toggleCode().run(); break;
        case 'bulletList': editor.chain().focus().toggleBulletList().run(); break;
        case 'orderedList': editor.chain().focus().toggleOrderedList().run(); break;
        case 'blockquote': editor.chain().focus().toggleBlockquote().run(); break;
        case 'link': {
          const url = prompt('URL:');
          if (url) editor.chain().focus().setLink({ href: url }).run();
          break;
        }
      }
    };
    window.addEventListener('lotus:format', handleFormat);
    return () => window.removeEventListener('lotus:format', handleFormat);
  }, [editor]);

  return (
    <div className="editor wysiwyg-editor">
      <EditorContent editor={editor} />
    </div>
  );
}
