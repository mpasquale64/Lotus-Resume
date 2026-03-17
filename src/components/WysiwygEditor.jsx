import React, { useEffect } from 'react';
import { useEditor as useTiptapEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import { Markdown } from 'tiptap-markdown';
import { useEditor } from '../context/EditorContext';
import '../styles/editor.css';

export default function WysiwygEditor() {
  const { content, updateContent } = useEditor();

  const editor = useTiptapEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Start writing...' }),
      Link.configure({ openOnClick: false }),
      Markdown,
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      const md = editor.storage.markdown.getMarkdown();
      updateContent(md);
    },
  });

  // Sync content when file changes externally
  useEffect(() => {
    if (editor && content !== undefined) {
      const currentMd = editor.storage.markdown.getMarkdown();
      if (currentMd !== content) {
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
