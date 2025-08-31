'use client';

import React, { useEffect, useRef } from 'react';

interface BlockNoteEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  className?: string;
}

export default function BlockNoteEditor({
  content = '',
  onChange,
  placeholder = 'Start typing or press "/" for commands...',
  className = ''
}: BlockNoteEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [localContent, setLocalContent] = React.useState(content);
  const [showSlashMenu, setShowSlashMenu] = React.useState(false);
  const [menuPosition, setMenuPosition] = React.useState({ x: 0, y: 0 });

  // Handle content changes
  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const newContent = e.currentTarget.innerText;
    setLocalContent(newContent);
    onChange?.(newContent);

    // Check for slash command
    if (newContent.endsWith('/')) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setMenuPosition({ x: rect.left, y: rect.bottom + 5 });
        setShowSlashMenu(true);
      }
    } else {
      setShowSlashMenu(false);
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Format shortcuts
    if (e.metaKey || e.ctrlKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          document.execCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          document.execCommand('italic');
          break;
        case 'u':
          e.preventDefault();
          document.execCommand('underline');
          break;
      }
    }

    // Close slash menu on Escape
    if (e.key === 'Escape') {
      setShowSlashMenu(false);
    }
  };

  // Insert block type from slash menu
  const insertBlock = (type: string) => {
    if (editorRef.current) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        
        // Remove the slash character
        const textNode = range.startContainer;
        if (textNode.nodeType === Node.TEXT_NODE) {
          const text = textNode.textContent ?? '';
          const slashIndex = text.lastIndexOf('/');
          if (slashIndex !== -1) {
            textNode.textContent = text.substring(0, slashIndex);
          }
        }

        // Insert the block element
        let element: HTMLElement;
        switch (type) {
          case 'h1': {
            element = document.createElement('h1');
            element.className = 'text-2xl font-bold text-neutral-900 mb-2';
            element.textContent = 'Heading 1';
            break;
          }
          case 'h2':
            element = document.createElement('h2');
            element.className = 'text-xl font-semibold text-neutral-900 mb-2';
            element.textContent = 'Heading 2';
            break;
          case 'h3':
            element = document.createElement('h3');
            element.className = 'text-lg font-medium text-neutral-900 mb-2';
            element.textContent = 'Heading 3';
            break;
          case 'bullet': {
            element = document.createElement('ul');
            element.className = 'list-disc list-inside text-neutral-700 mb-2';
            const li = document.createElement('li');
            li.textContent = 'List item';
            element.appendChild(li);
            break;
          }
          case 'number': {
            element = document.createElement('ol');
            element.className = 'list-decimal list-inside text-neutral-700 mb-2';
            const oli = document.createElement('li');
            oli.textContent = 'List item';
            element.appendChild(oli);
            break;
          }
          case 'quote':
            element = document.createElement('blockquote');
            element.className = 'border-l-4 border-neutral-300 pl-4 italic text-neutral-600 mb-2';
            element.textContent = 'Quote';
            break;
          case 'code': {
            element = document.createElement('pre');
            element.className = 'bg-neutral-100 rounded-[var(--radius-button)] p-3 font-mono text-sm mb-2';
            const code = document.createElement('code');
            code.textContent = 'Code block';
            element.appendChild(code);
            break;
          }
          default:
            element = document.createElement('p');
            element.className = 'text-neutral-700 mb-2';
            element.textContent = 'Paragraph';
        }

        // Insert the element
        range.deleteContents();
        range.insertNode(element);
        
        // Move cursor after the inserted element
        range.setStartAfter(element);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
    setShowSlashMenu(false);
  };

  const slashMenuItems = [
    { type: 'h1', label: 'Heading 1', icon: 'H1' },
    { type: 'h2', label: 'Heading 2', icon: 'H2' },
    { type: 'h3', label: 'Heading 3', icon: 'H3' },
    { type: 'bullet', label: 'Bullet List', icon: '•' },
    { type: 'number', label: 'Numbered List', icon: '1.' },
    { type: 'quote', label: 'Quote', icon: '"' },
    { type: 'code', label: 'Code Block', icon: '<>' },
  ];

  return (
    <div className="relative h-full">
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        className={`
          w-full h-full p-4 outline-none text-neutral-700
          prose prose-neutral max-w-none
          focus:outline-none
          [&>*:first-child]:mt-0
          ${className}
        `}
        style={{ minHeight: '200px' }}
        data-placeholder={localContent ? '' : placeholder}
      />

      {/* Placeholder */}
      {!localContent && (
        <div className="absolute top-4 left-4 text-neutral-400 pointer-events-none">
          {placeholder}
        </div>
      )}

      {/* Slash Menu */}
      {showSlashMenu && (
        <div 
          className="absolute z-50 bg-white rounded-[var(--radius-card)] shadow-[var(--shadow-soft-drop)] border border-neutral-200 py-2 min-w-[200px]"
          style={{ left: menuPosition.x, top: menuPosition.y }}
        >
          {slashMenuItems.map((item) => (
            <button
              key={item.type}
              onClick={() => insertBlock(item.type)}
              className="w-full px-3 py-2 text-left hover:bg-neutral-100 flex items-center gap-3 text-sm transition-colors duration-150"
            >
              <span className="w-6 text-center font-mono text-neutral-400">
                {item.icon}
              </span>
              <span className="text-neutral-700">{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}