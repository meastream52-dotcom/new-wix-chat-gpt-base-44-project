'use client';

import { useState } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const [preview, setPreview] = useState(false);

  const insertTag = (openTag: string, closeTag: string) => {
    const textarea = document.getElementById('rich-editor') as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.substring(start, end);
    const newValue = value.substring(0, start) + openTag + selected + closeTag + value.substring(end);
    onChange(newValue);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + openTag.length, start + openTag.length + selected.length);
    }, 0);
  };

  const tools = [
    { label: 'B', title: 'Bold', open: '<strong>', close: '</strong>' },
    { label: 'I', title: 'Italic', open: '<em>', close: '</em>' },
    { label: 'H2', title: 'Heading 2', open: '<h2>', close: '</h2>' },
    { label: 'H3', title: 'Heading 3', open: '<h3>', close: '</h3>' },
    { label: 'P', title: 'Paragraph', open: '<p>', close: '</p>' },
    { label: 'UL', title: 'Bullet List', open: '<ul>\n  <li>', close: '</li>\n</ul>' },
    { label: 'LI', title: 'List Item', open: '<li>', close: '</li>' },
    { label: 'A', title: 'Link', open: '<a href="">', close: '</a>' },
    { label: 'IMG', title: 'Image', open: '<img src="', close: '" alt="" />' },
    { label: 'HR', title: 'Divider', open: '<hr />', close: '' },
  ];

  return (
    <div className="border border-gray-300 rounded overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-1 bg-gray-50 border-b border-gray-300 px-3 py-2 flex-wrap">
        {tools.map(tool => (
          <button
            key={tool.label}
            type="button"
            title={tool.title}
            onClick={() => insertTag(tool.open, tool.close)}
            className="px-2 py-1 text-xs font-bold text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors"
          >
            {tool.label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPreview(!preview)}
            className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
              preview
                ? 'bg-gray-900 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
            }`}
          >
            {preview ? 'Edit' : 'Preview'}
          </button>
        </div>
      </div>

      {/* Editor / Preview */}
      {preview ? (
        <div
          className="min-h-64 p-4 prose prose-sm max-w-none bg-white"
          dangerouslySetInnerHTML={{ __html: value || '<p class="text-gray-400">Nothing to preview.</p>' }}
        />
      ) : (
        <textarea
          id="rich-editor"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder || 'Write your article content here using HTML tags...'}
          className="w-full min-h-64 p-4 text-sm font-mono text-gray-900 bg-white focus:outline-none resize-y"
          rows={20}
        />
      )}

      <div className="bg-gray-50 border-t border-gray-300 px-3 py-1.5 text-xs text-gray-500">
        {value.length} characters · HTML mode
      </div>
    </div>
  );
}
