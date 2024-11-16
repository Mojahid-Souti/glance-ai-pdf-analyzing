// src/app/(dashboard)/dashboard/editor/page.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  Bold, Italic, Underline, List, AlignLeft, AlignCenter, 
  AlignRight, Link2, Image, Undo, Redo, Copy, Palette, 
  Brain, TextQuote, ListOrdered, Minus, Code, Save,
  Type, ChevronDown, X, Check, Loader2
} from 'lucide-react';
import { TwitterPicker } from 'react-color';
import { useChat, useCompletion } from 'ai/react';

interface Format {
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  textAlign: 'left' | 'center' | 'right';
  textColor: string;
  backgroundColor: string;
}

interface EditorProps {
  documents?: {
    _id: string;
    title: string;
    fileUrl: string;
  }[];
}

export default function EditorPage() {
  const [content, setContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [fontSize, setFontSize] = useState('16px');
  const [fontFamily, setFontFamily] = useState('Inter');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  const [isAiResponding, setIsAiResponding] = useState(false);
  const [format, setFormat] = useState<Format>({
    isBold: false,
    isItalic: false,
    isUnderline: false,
    textAlign: 'left',
    textColor: '#000000',
    backgroundColor: '#ffffff'
  });
  const [savedMessage, setSavedMessage] = useState('');
  const editorRef = useRef<HTMLDivElement>(null);
  const [activeDocument, setActiveDocument] = useState<string | null>(null);
  const responseRef = useRef<HTMLDivElement | null>(null);

  const fonts = [
    { label: 'Inter', value: 'Inter' },
    { label: 'Arial', value: 'Arial' },
    { label: 'Times New Roman', value: 'Times New Roman' },
    { label: 'Courier New', value: 'Courier New' },
    { label: 'Georgia', value: 'Georgia' },
    { label: 'Helvetica', value: 'Helvetica' },
    { label: 'Verdana', value: 'Verdana' }
  ];

  const fontSizes = [
    '12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px'
  ];

  const handleFormat = (command: string, value?: string) => {
    const selection = window.getSelection();
    const range = selection?.getRangeAt(0);
    
    if (!selection || !range) {
      alert('Please select some text first');
      return;
    }
  
    // Save the current selection
    const savedSelection = range.cloneRange();
  
    try {
      document.execCommand(command, false, value);
  
      // Update format state based on command
      switch (command) {
        case 'bold':
          setFormat(prev => ({ ...prev, isBold: document.queryCommandState('bold') }));
          break;
        case 'italic':
          setFormat(prev => ({ ...prev, isItalic: document.queryCommandState('italic') }));
          break;
        case 'underline':
          setFormat(prev => ({ ...prev, isUnderline: document.queryCommandState('underline') }));
          break;
        case 'justifyLeft':
        case 'justifyCenter':
        case 'justifyRight':
          setFormat(prev => ({ 
            ...prev, 
            textAlign: command.replace('justify', '').toLowerCase() as 'left' | 'center' | 'right' 
          }));
          break;
      }
  
      // Restore the selection
      selection.removeAllRanges();
      selection.addRange(savedSelection);
    } catch (error) {
      console.error('Format error:', error);
    }
  };

  const getDocumentContext = async (documentId: string) => {
    try {
      const response = await fetch(`/api/documents/${documentId}/content`);
      if (!response.ok) {
        throw new Error('Failed to fetch document content');
      }
      const data = await response.json();
      return data.content;
    } catch (error) {
      console.error('Error fetching document content:', error);
      return '';
    }
  };

  const handleColorChange = (color: any) => {
    const selection = window.getSelection();
    const range = selection?.getRangeAt(0);
    
    if (!selection || !range) {
      alert('Please select some text first');
      return;
    }
  
    // Save the current selection
    const savedSelection = range.cloneRange();
  
    try {
      document.execCommand('foreColor', false, color.hex);
      setFormat(prev => ({ ...prev, textColor: color.hex }));
      
      // Restore the selection
      selection.removeAllRanges();
      selection.addRange(savedSelection);
    } catch (error) {
      console.error('Color error:', error);
    } finally {
      setShowColorPicker(false);
    }
  };


  const handleSave = () => {
    const content = editorRef.current?.innerHTML || '';
    localStorage.setItem('editor-content', content);
    setSavedMessage('Content saved!');
    setTimeout(() => setSavedMessage(''), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 's':
          e.preventDefault();
          handleSave();
          break;
        case 'b':
          e.preventDefault();
          handleFormat('bold');
          break;
        case 'i':
          e.preventDefault();
          handleFormat('italic');
          break;
        case 'u':
          e.preventDefault();
          handleFormat('underline');
          break;
      }
    }
  };

  // Function to get selected text or cursor position
  const getSelection = () => {
    const selection = window.getSelection();
    const range = selection?.getRangeAt(0);
    return {
      text: selection?.toString() || '',
      range: range,
    };
  };

  // Function to insert AI response at cursor position
  const insertAiResponse = (response: string, range?: Range) => {
    if (!editorRef.current) return;

    const responseDiv = document.createElement('div');
    responseDiv.className = 'ai-response';
    responseDiv.style.padding = '1rem';
    responseDiv.style.margin = '1rem 0';
    responseDiv.style.borderLeft = '4px solid #FF6B6B';
    responseDiv.style.backgroundColor = '#FFF5F5';
    responseDiv.innerHTML = `
      <p style="color: #FF6B6B; font-weight: 600; margin-bottom: 0.5rem">AI Response:</p>
      <div>${response}</div>
    `;

    if (range) {
      // Insert after the current selection
      range.collapse(false); // Move to end of selection
      range.insertNode(responseDiv);
      
      // Add a line break after response
      const br = document.createElement('br');
      responseDiv.parentNode?.insertBefore(br, responseDiv.nextSibling);
      
      // Move cursor after response
      const newRange = document.createRange();
      newRange.setStartAfter(br);
      newRange.collapse(true);
      
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(newRange);
    } else {
      // Insert at end if no selection
      editorRef.current.appendChild(responseDiv);
      editorRef.current.appendChild(document.createElement('br'));
    }
  };

  // Replace your current handleAiRequest with this version
const handleAiRequest = async () => {
  const { text, range } = getSelection();
  if (!text.trim()) {
    alert('Please select some text or write a question first');
    return;
  }

  setIsAiResponding(true);

  try {
    // Create response container with loading state
    const responseContainer = document.createElement('div');
    responseContainer.className = 'ai-response';
    responseContainer.style.cssText = `
      padding: 1rem;
      margin: 1rem 0;
      border-left: 4px solid #FF6B6B;
      background-color: #FFF5F5;
    `;
    responseContainer.innerHTML = `
      <div class="flex items-center gap-2 mb-2">
        <span class="text-[#FF6B6B]">
          <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </span>
        <span>Processing your request...</span>
      </div>
    `;

    // Insert the container
    if (range) {
      range.collapse(false);
      range.insertNode(responseContainer);
      responseContainer.insertAdjacentHTML('afterend', '<br>');
    } else {
      editorRef.current?.appendChild(responseContainer);
      editorRef.current?.appendChild(document.createElement('br'));
    }

    // Make API request
    const response = await fetch('/api/ai/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: text,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get AI response');
    }

    const data = await response.json();

    // Update response container with AI response
    responseContainer.innerHTML = `
      <div class="flex items-center gap-2 mb-2">
        <span class="text-[#FF6B6B] font-semibold">AI Response:</span>
      </div>
      <div class="prose prose-sm max-w-none">
        ${data.response}
      </div>
    `;

    // Move cursor after response
    const selection = window.getSelection();
    if (selection && responseContainer.nextSibling) {
      const range = document.createRange();
      range.setStartAfter(responseContainer.nextSibling);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    }

  } catch (error) {
    console.error('AI request error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    insertAiResponse(`
      <div class="text-red-500">
        <p>Sorry, I encountered an error:</p>
        <p class="font-mono text-sm mt-1">${errorMessage}</p>
        <p class="mt-2">Please try again.</p>
      </div>
    `);
  } finally {
    setIsAiResponding(false);
  }
};

  const renderAiButton = () => {
    return (
      <ToolbarButton
        icon={isAiResponding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain size={16} />}
        onClick={handleAiRequest}
        tooltip="Ask AI about selection"
        className="text-[#FF6B6B]"
        disabled={isAiResponding}
      >
        {isAiResponding && (
          <span className="ml-2 text-sm">Processing...</span>
        )}
      </ToolbarButton>
    );
  };

  useEffect(() => {
    const savedContent = localStorage.getItem('editor-content');
    if (savedContent) {
      setContent(savedContent);
    }
  }, []);
  
  // Update the editor content when typing
  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const newContent = e.currentTarget.innerHTML;
    setContent(newContent);
  };
  
  return (
    <div className="h-full flex flex-col bg-white ">
      {/* Header */}
      <div className="bg-white border-b px-6 py-3 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">
          Glance Editor
        </h1>
        {savedMessage && (
          <div className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-sm flex items-center">
            <Check size={14} className="mr-1" />
            {savedMessage}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 overflow-hidden flex flex-col min-h-0 ">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex-1 flex flex-col overflow-hidden">
          {/* Primary Toolbar */}
          <div className="border-b p-2 flex items-center space-x-2 flex-wrap">
            <div className="flex items-center space-x-1 px-2">
              <select 
                value={fontFamily}
                onChange={(e) => {
                  setFontFamily(e.target.value);
                  handleFormat('fontName', e.target.value);
                }}
                className="p-1.5 border rounded-lg text-sm min-w-[120px]"
              >
                {fonts.map(font => (
                  <option key={font.value} value={font.value}>{font.label}</option>
                ))}
              </select>
              <select
                value={fontSize}
                onChange={(e) => {
                  setFontSize(e.target.value);
                  handleFormat('fontSize', e.target.value);
                }}
                className="p-1.5 border rounded-lg text-sm w-20"
              >
                {fontSizes.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>

            {/* Format Controls */}
            <ToolbarSection>
              <ToolbarButton
                icon={<Bold size={16} />}
                active={format.isBold}
                onClick={() => handleFormat('bold')}
                tooltip="Bold (Ctrl+B)"
              />
              <ToolbarButton
                icon={<Italic size={16} />}
                active={format.isItalic}
                onClick={() => handleFormat('italic')}
                tooltip="Italic (Ctrl+I)"
              />
              <ToolbarButton
                icon={<Underline size={16} />}
                active={format.isUnderline}
                onClick={() => handleFormat('underline')}
                tooltip="Underline (Ctrl+U)"
              />
            </ToolbarSection>

            {/* Color Controls */}
            <ToolbarSection>
              <div className="relative">
                <ToolbarButton
                  icon={<Palette size={16} />}
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  tooltip="Text Color"
                >
                  <div 
                    className="w-4 h-4 rounded-full ml-1 border"
                    style={{ backgroundColor: format.textColor }}
                  />
                </ToolbarButton>
                {showColorPicker && (
                  <div className="absolute top-full left-0 mt-2 z-10">
                    <div className="fixed inset-0" onClick={() => setShowColorPicker(false)} />
                    <div className="relative">
                      <TwitterPicker 
                        color={format.textColor}
                        onChange={handleColorChange}
                        triangle="hide"
                      />
                    </div>
                  </div>
                )}
              </div>
            </ToolbarSection>

            {/* Alignment Controls */}
            <ToolbarSection>
              <ToolbarButton
                icon={<AlignLeft size={16} />}
                active={format.textAlign === 'left'}
                onClick={() => handleFormat('justifyLeft')}
                tooltip="Align Left"
              />
              <ToolbarButton
                icon={<AlignCenter size={16} />}
                active={format.textAlign === 'center'}
                onClick={() => handleFormat('justifyCenter')}
                tooltip="Align Center"
              />
              <ToolbarButton
                icon={<AlignRight size={16} />}
                active={format.textAlign === 'right'}
                onClick={() => handleFormat('justifyRight')}
                tooltip="Align Right"
              />
            </ToolbarSection>

            {/* Insert Controls */}
            <ToolbarSection>
              <ToolbarButton
                icon={<Link2 size={16} />}
                onClick={() => {
                  const url = prompt('Enter URL:');
                  if (url) handleFormat('createLink', url);
                }}
                tooltip="Insert Link"
              />
              <ToolbarButton
                icon={<Image size={16} />}
                onClick={() => {
                  const url = prompt('Enter image URL:');
                  if (url) handleFormat('insertImage', url);
                }}
                tooltip="Insert Image"
              />
            </ToolbarSection>

            {/* AI and Save Controls */}
            <div className="ml-auto flex items-center space-x-2">
              <ToolbarButton
                icon={<Save size={16} />}
                onClick={handleSave}
                tooltip="Save (Ctrl+S)"
              />
              {renderAiButton()}
            </div>

          </div>

          {/* Editor Area */}
          <div 
            ref={editorRef}
            className="flex-1 p-6 overflow-auto min-h-0 prose max-w-none"
            contentEditable
            onKeyDown={handleKeyDown}
            dangerouslySetInnerHTML={{ __html: content }}
            style={{ 
              fontFamily,
              fontSize,
              lineHeight: '1.5',
              minHeight: '500px'
            }}
          />

          {/* Status Bar */}
          <div className="border-t px-4 py-2 flex justify-between items-center text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <span>{content.length} characters</span>
              <span>{content.split(/\s+/).filter(Boolean).length} words</span>
            </div>
            <div className="flex items-center space-x-2">
              <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl+S</kbd>
              <span className="text-xs">to save</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Toolbar Components
const ToolbarSection: React.FC<{children: React.ReactNode}> = ({ children }) => (
  <>
    <div className="flex items-center space-x-1">{children}</div>
    <div className="h-6 w-px bg-gray-200" />
  </>
);

interface ToolbarButtonProps {
  icon: React.ReactNode;
  onClick: () => void;
  tooltip?: string;
  active?: boolean;
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({ 
  icon, onClick, tooltip, active, children, className = '', disabled = false 
}) => (
  <button 
    className={`p-1.5 hover:bg-gray-100 rounded-lg flex items-center ${
      active ? 'bg-gray-100' : ''
    } ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    onClick={onClick}
    title={tooltip}
    disabled={disabled}
  >
    {icon}
    {children}
  </button>
);