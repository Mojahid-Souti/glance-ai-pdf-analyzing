'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  Bold, Italic, Underline, List, AlignLeft, AlignCenter, 
  AlignRight, Link2, Image, Undo, Redo, Copy, Palette, 
  Brain, TextQuote, ListOrdered, Minus, Code, Save,
  Type, ChevronDown, X, Check, Loader2, Wand2,
  MessageSquare, Sparkles, FileText, Bookmark,
  RotateCcw, PenTool, GripVertical, Settings,
  Heading1, Heading2, Quote, ListChecks
} from 'lucide-react';
import { TwitterPicker } from 'react-color';
import toast from 'react-hot-toast';

// Types
interface Format {
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  textAlign: 'left' | 'center' | 'right';
  textColor: string;
  backgroundColor: string;
  fontSize: string;
  fontFamily: string;
}

interface AIFeature {
  icon: React.ReactNode;
  label: string;
  prompt: string;
  description: string;
  category: 'enhance' | 'analyze' | 'transform';
}

const AI_FEATURES: AIFeature[] = [
  // Enhancement Features
  {
    icon: <Sparkles className="w-4 h-4" />,
    label: 'Improve Writing',
    prompt: 'Enhance this text while maintaining its core message. Make it more professional and engaging: ',
    description: 'Enhance clarity and professionalism',
    category: 'enhance'
  },
  {
    icon: <PenTool className="w-4 h-4" />,
    label: 'Rephrase',
    prompt: 'Rephrase this text in a different way while keeping the same meaning: ',
    description: 'Alternative wording',
    category: 'transform'
  },
  {
    icon: <MessageSquare className="w-4 h-4" />,
    label: 'Explain',
    prompt: 'Explain this concept in detail, breaking it down into clear, understandable parts: ',
    description: 'Detailed explanation',
    category: 'analyze'
  },
  {
    icon: <FileText className="w-4 h-4" />,
    label: 'Summarize',
    prompt: 'Provide a concise summary of the main points in this text: ',
    description: 'Brief summary',
    category: 'analyze'
  },
  {
    icon: <ListChecks className="w-4 h-4" />,
    label: 'Key Points',
    prompt: 'Extract and list the key points from this text: ',
    description: 'Extract main points',
    category: 'analyze'
  },
  {
    icon: <Quote className="w-4 h-4" />,
    label: 'Academic Style',
    prompt: 'Convert this text into a formal academic style: ',
    description: 'Academic formatting',
    category: 'transform'
  }
];

const FONTS = [
  { label: 'Inter', value: 'Inter' },
  { label: 'Arial', value: 'Arial' },
  { label: 'Times New Roman', value: 'Times New Roman' },
  { label: 'Courier New', value: 'Courier New' },
  { label: 'Georgia', value: 'Georgia' },
  { label: 'Helvetica', value: 'Helvetica' },
  { label: 'Verdana', value: 'Verdana' }
];

const FONT_SIZES = [
  '12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px'
];

export default function EditorPage() {
  // State
  const [content, setContent] = useState('');
  const [format, setFormat] = useState<Format>({
    isBold: false,
    isItalic: false,
    isUnderline: false,
    textAlign: 'left',
    textColor: '#000000',
    backgroundColor: '#ffffff',
    fontSize: '16px',
    fontFamily: 'Inter'
  });
  const [showAiMenu, setShowAiMenu] = useState(false);
  const [isAiResponding, setIsAiResponding] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [aiHistory, setAiHistory] = useState<Array<{
    prompt: string;
    response: string;
    timestamp: number;
  }>>([]);
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const [savedMessage, setSavedMessage] = useState('');

  // Refs
  const editorRef = useRef<HTMLDivElement>(null);
  const aiMenuRef = useRef<HTMLDivElement>(null);
  const colorPickerRef = useRef<HTMLDivElement>(null);

  // Format handling
  const handleFormat = (command: string, value?: string) => {
    const selection = window.getSelection();
    const range = selection?.getRangeAt(0);
    
    if (!selection || !range) {
      toast.error('Please select some text first');
      return;
    }

    // Save the current selection
    const savedSelection = range.cloneRange();
    
    try {
      // Apply formatting
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

      // Restore selection
      selection.removeAllRanges();
      selection.addRange(savedSelection);
      
      // Save state for undo
      if (editorRef.current) {
        setContent(editorRef.current.innerHTML);
      }
    } catch (error) {
      console.error('Format error:', error);
      toast.error('Failed to apply formatting');
    }
  };

  // Color handling
  const handleColorChange = (color: { hex: string }) => {
    const selection = window.getSelection();
    const range = selection?.getRangeAt(0);
    
    if (!selection || !range) {
      toast.error('Please select some text first');
      return;
    }

    // Save the current selection
    const savedSelection = range.cloneRange();

    try {
      document.execCommand('foreColor', false, color.hex);
      setFormat(prev => ({ ...prev, textColor: color.hex }));
      setShowColorPicker(false);

      // Restore selection
      selection.removeAllRanges();
      selection.addRange(savedSelection);
      
      // Update content
      if (editorRef.current) {
        setContent(editorRef.current.innerHTML);
      }
    } catch (error) {
      console.error('Color error:', error);
      toast.error('Failed to apply color');
    }
  };

  // AI Features
  const handleAiFeature = async (feature: AIFeature) => {
    const selection = window.getSelection();
    const range = selection?.getRangeAt(0);
    
    if (!selection || !range || selection.isCollapsed) {
      toast.error('Please select some text first');
      return;
    }

    const text = selection.toString().trim();
    if (!text) {
      toast.error('Please select some text first');
      return;
    }

    setIsAiResponding(true);
    setShowAiMenu(false);

    try {
      // Insert loading indicator
      const loadingId = `ai-loading-${Date.now()}`;
      insertLoadingIndicator(range, loadingId);

      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `${feature.prompt}${text}`,
        })
      });

      if (!response.ok) {
        throw new Error('AI request failed');
      }

      const data = await response.json();
      
      // Remove loading indicator
      removeLoadingIndicator(loadingId);

      // Insert response
      insertAiResponse(data.response, range, feature);

      // Update history
      setAiHistory(prev => [...prev, {
        prompt: text,
        response: data.response,
        timestamp: Date.now()
      }]);

      toast.success('AI response added');

    } catch (error) {
      console.error('AI feature error:', error);
      toast.error(error instanceof Error ? error.message : 'AI request failed');
    } finally {
      setIsAiResponding(false);
    }
  };

  // UI Components
  const insertLoadingIndicator = (range: Range, id: string) => {
    const loader = document.createElement('div');
    loader.id = id;
    loader.className = 'ai-loading';
    loader.innerHTML = `
      <div class="flex items-center gap-2 p-4 bg-gray-50 rounded-lg animate-pulse">
        <Loader2 class="w-4 h-4 animate-spin text-[#FF6B6B]" />
        <span class="text-sm text-gray-600">Generating response...</span>
      </div>
    `;

    range.collapse(false);
    range.insertNode(loader);
  };

  const removeLoadingIndicator = (id: string) => {
    const loader = document.getElementById(id);
    if (loader) {
      loader.remove();
    }
  };

  const insertAiResponse = (response: string, range: Range, feature: AIFeature) => {
    const responseDiv = document.createElement('div');
    responseDiv.className = 'ai-response opacity-0 transform translate-y-2';
    responseDiv.style.cssText = `
      margin: 1rem 0;
      padding: 1.5rem;
      border-radius: 0.75rem;
      border: 1px solid rgba(255, 107, 107, 0.2);
      background: linear-gradient(to right bottom, rgba(255, 107, 107, 0.05), rgba(255, 107, 107, 0.02));
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    `;

    responseDiv.innerHTML = `
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2 text-[#FF6B6B]">
          ${feature.icon}
          <span class="font-semibold text-sm">${feature.label}</span>
        </div>
        <div class="flex items-center gap-2">
          <button class="p-1 hover:bg-gray-100 rounded" title="Copy response">
            <Copy class="w-4 h-4 text-gray-400" />
          </button>
          <button class="p-1 hover:bg-gray-100 rounded" title="Remove response">
            <X class="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>
      <div class="prose prose-sm max-w-none">
        ${response}
      </div>
    `;

    // Add event listeners
    const copyBtn = responseDiv.querySelector('button[title="Copy response"]');
    const removeBtn = responseDiv.querySelector('button[title="Remove response"]');

    copyBtn?.addEventListener('click', () => {
      navigator.clipboard.writeText(response);
      toast.success('Response copied to clipboard');
    });

    removeBtn?.addEventListener('click', () => {
      responseDiv.remove();
    });

    // Insert and animate
    range.collapse(false);
    range.insertNode(responseDiv);
    responseDiv.insertAdjacentHTML('afterend', '<br>');

    setTimeout(() => {
      responseDiv.classList.remove('opacity-0', 'translate-y-2');
    }, 10);
  };

  // Save & Load
  const saveState = () => {
    if (!editorRef.current) return;
    setUndoStack(prev => [...prev, editorRef.current?.innerHTML || '']);
    setRedoStack([]);
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const previousState = undoStack[undoStack.length - 1];
    setUndoStack(prev => prev.slice(0, -1));
    setRedoStack(prev => [...prev, editorRef.current?.innerHTML || '']);
    if (editorRef.current) {
      editorRef.current.innerHTML = previousState;
    }
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const nextState = redoStack[redoStack.length - 1];
    setRedoStack(prev => prev.slice(0, -1));
    setUndoStack(prev => [...prev, editorRef.current?.innerHTML || '']);
    if (editorRef.current) {
      editorRef.current.innerHTML = nextState;
    }
  };

  const handleSave = () => {
    const content = editorRef.current?.innerHTML || '';
    localStorage.setItem('editor-content', content);
    toast.success('Content saved');
    setSavedMessage('Saved!');
    setTimeout(() => setSavedMessage(''), 2000);
  };

  // Event handlers
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
        case 'z':
          e.preventDefault();
          if (e.shiftKey) {
            handleRedo();
          } else {
            handleUndo();
          }
          break;
      }
    }
  };

  const handleAiRequest = async () => {
    const selection = window.getSelection();
    const range = selection?.getRangeAt(0);
    
    if (!selection || !range || selection.isCollapsed) {
      toast.error('Please select some text first');
      return;
    }

    const text = selection.toString().trim();
    if (!text) {
      toast.error('Please select some text first');
      return;
    }

    setIsAiResponding(true);

    try {
      // Save the current cursor position
      const savedRange = range.cloneRange();

      // Create and insert loading indicator
      const loadingId = `ai-loading-${Date.now()}`;
      const loadingDiv = document.createElement('div');
      loadingDiv.id = loadingId;
      loadingDiv.className = 'ai-loading my-2 p-4 bg-gray-50 rounded-lg animate-pulse';
      loadingDiv.innerHTML = `
        <div class="flex items-center gap-2">
          <svg class="animate-spin h-4 w-4 text-[#FF6B6B]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span class="text-sm text-gray-600">Processing your request...</span>
        </div>
      `;

      // Insert loading indicator after the selected text
      range.collapse(false);
      range.insertNode(loadingDiv);

      // Make API request
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text }),
      });

      if (!response.ok) {
        throw new Error('AI request failed');
      }

      const data = await response.json();

      // Remove loading indicator
      const loadingElement = document.getElementById(loadingId);
      if (loadingElement) {
        loadingElement.remove();
      }

      // Create response element
      const responseDiv = document.createElement('div');
      responseDiv.className = 'ai-response my-4 p-4 rounded-lg border border-[#FF6B6B]/20 bg-[#FF6B6B]/5';
      responseDiv.innerHTML = `
        <div class="flex items-center gap-2 mb-2 text-[#FF6B6B]">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
          </svg>
          <span class="font-semibold">AI Response:</span>
        </div>
        <div class="prose prose-sm max-w-none">
          ${data.response}
        </div>
      `;

      // Insert response
      savedRange.collapse(false);
      savedRange.insertNode(responseDiv);

      // Add spacing after response
      responseDiv.insertAdjacentHTML('afterend', '<br>');

      // Update content state
      if (editorRef.current) {
        setContent(editorRef.current.innerHTML);
      }

    } catch (error) {
      console.error('AI request error:', error);
      toast.error(error instanceof Error ? error.message : 'AI request failed');
    } finally {
      setIsAiResponding(false);
    }
  };

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
  };

  useEffect(() => {
    const savedContent = localStorage.getItem('editor-content');
    if (savedContent && editorRef.current) {
      editorRef.current.innerHTML = savedContent;
      setContent(savedContent);
    }
  }, []);

  return (
    <div className="h-full flex flex-col bg-white">
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
      <div className="flex-1 p-4 overflow-hidden flex flex-col min-h-0">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="border-b p-2 flex flex-wrap gap-2">
            {/* Font Controls */}
            <ToolbarSection>
              <select 
                value={format.fontFamily}
                onChange={(e) => {
                  setFormat(prev => ({ ...prev, fontFamily: e.target.value }));
                  handleFormat('fontName', e.target.value);
                }}
                className="p-1.5 border rounded-lg text-sm min-w-[120px] focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]/20"
              >
                {FONTS.map(font => (
                  <option key={font.value} value={font.value}>{font.label}</option>
                ))}
              </select>
              <select
                value={format.fontSize}
                onChange={(e) => {
                  setFormat(prev => ({ ...prev, fontSize: e.target.value }));
                  handleFormat('fontSize', e.target.value);
                }}
                className="p-1.5 border rounded-lg text-sm w-20 focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]/20"
              >
                {FONT_SIZES.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </ToolbarSection>

            {/* Text Formatting */}
            <ToolbarSection>
              <ToolbarButton
                icon={<Bold size={16} />}
                onClick={() => handleFormat('bold')}
                active={format.isBold}
                tooltip="Bold (Ctrl+B)"
              />
              <ToolbarButton
                icon={<Italic size={16} />}
                onClick={() => handleFormat('italic')}
                active={format.isItalic}
                tooltip="Italic (Ctrl+I)"
              />
              <ToolbarButton
                icon={<Underline size={16} />}
                onClick={() => handleFormat('underline')}
                active={format.isUnderline}
                tooltip="Underline (Ctrl+U)"
              />
            </ToolbarSection>

            {/* Paragraph Formatting */}
            <ToolbarSection>
              <ToolbarButton
                icon={<AlignLeft size={16} />}
                onClick={() => handleFormat('justifyLeft')}
                active={format.textAlign === 'left'}
                tooltip="Align Left"
              />
              <ToolbarButton
                icon={<AlignCenter size={16} />}
                onClick={() => handleFormat('justifyCenter')}
                active={format.textAlign === 'center'}
                tooltip="Align Center"
              />
              <ToolbarButton
                icon={<AlignRight size={16} />}
                onClick={() => handleFormat('justifyRight')}
                active={format.textAlign === 'right'}
                tooltip="Align Right"
              />
            </ToolbarSection>

            {/* Lists and Indentation */}
            <ToolbarSection>
              <ToolbarButton
                icon={<List size={16} />}
                onClick={() => handleFormat('insertUnorderedList')}
                tooltip="Bullet List"
              />
              <ToolbarButton
                icon={<ListOrdered size={16} />}
                onClick={() => handleFormat('insertOrderedList')}
                tooltip="Numbered List"
              />
              <ToolbarButton
                icon={<TextQuote size={16} />}
                onClick={() => handleFormat('indent')}
                tooltip="Increase Indent"
              />
              <ToolbarButton
                icon={<Minus size={16} />}
                onClick={() => handleFormat('outdent')}
                tooltip="Decrease Indent"
              />
            </ToolbarSection>

            {/* Color Picker */}
            <ToolbarSection>
              <div className="relative" ref={colorPickerRef}>
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
                  <div className="absolute top-full left-0 mt-2 z-50">
                    <TwitterPicker 
                      color={format.textColor}
                      onChange={handleColorChange}
                      triangle="hide"
                    />
                  </div>
                )}
              </div>
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
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        const img = e.target?.result as string;
                        handleFormat('insertImage', img);
                      };
                      reader.readAsDataURL(file);
                    }
                  };
                  input.click();
                }}
                tooltip="Insert Image"
              />
              <ToolbarButton
                icon={<Code size={16} />}
                onClick={() => handleFormat('formatBlock', 'pre')}
                tooltip="Code Block"
              />
            </ToolbarSection>

            {/* History Controls */}
            <ToolbarSection>
              <ToolbarButton
                icon={<Undo size={16} />}
                onClick={handleUndo}
                disabled={undoStack.length === 0}
                tooltip="Undo (Ctrl+Z)"
              />
              <ToolbarButton
                icon={<Redo size={16} />}
                onClick={handleRedo}
                disabled={redoStack.length === 0}
                tooltip="Redo (Ctrl+Shift+Z)"
              />
            </ToolbarSection>

            {/* AI Features */}
            <div className="ml-auto flex items-center space-x-2">
              <ToolbarButton
                icon={<Save size={16} />}
                onClick={handleSave}
                tooltip="Save (Ctrl+S)"
              />
              <div className="relative" ref={aiMenuRef}>
                <ToolbarButton
                  icon={isAiResponding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain size={16} />}
                  onClick={() => setShowAiMenu(!showAiMenu)}
                  tooltip="AI Features"
                  className="text-[#FF6B6B]"
                  disabled={isAiResponding}
                >
                  <ChevronDown className="w-4 h-4 ml-1" />
                </ToolbarButton>
                
                {/* AI Menu */}
                {showAiMenu && (
                  <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-2 w-64 z-50">
                    {Object.entries(
                      AI_FEATURES.reduce((acc, feature) => ({
                        ...acc,
                        [feature.category]: [...(acc[feature.category] || []), feature]
                      }), {} as Record<string, AIFeature[]>)
                    ).map(([category, features]) => (
                      <div key={category}>
                        <div className="px-3 py-1 text-xs font-medium text-gray-500 uppercase">
                          {category}
                        </div>
                        {features.map((feature, index) => (
                          <button
                            key={index}
                            onClick={() => handleAiFeature(feature)}
                            className="w-full px-3 py-2 flex items-center gap-3 rounded-md hover:bg-gray-50 transition-colors"
                          >
                            <div className="text-[#FF6B6B]">{feature.icon}</div>
                            <div className="text-left">
                              <div className="font-medium text-sm">{feature.label}</div>
                              <div className="text-xs text-gray-500">{feature.description}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Editor Area */}
          <div 
            ref={editorRef}
            className="flex-1 p-6 overflow-auto min-h-0 prose max-w-none focus:outline-none"
            contentEditable
            onKeyDown={handleKeyDown}
            dangerouslySetInnerHTML={{ __html: content }}
            style={{ 
              fontFamily: format.fontFamily,
              fontSize: format.fontSize,
              lineHeight: '1.5',
              minHeight: '500px'
            }}
            spellCheck="false"
          />

          {/* Status Bar */}
          <div className="border-t px-4 py-2 flex justify-between items-center text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <span>
                {editorRef.current?.textContent?.length || 0} characters
              </span>
              <span>
                {editorRef.current?.textContent?.split(/\s+/).filter(Boolean).length || 0} words
              </span>
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
  <div className="flex items-center space-x-1 px-2 border-r border-gray-200 last:border-r-0">
    {children}
  </div>
);

interface ToolbarButtonProps {
  icon: React.ReactNode;
  onClick: () => void;
  tooltip?: string;
  active?: boolean;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({ 
  icon, onClick, tooltip, active, disabled, className = '', children 
}) => (
  <button 
    className={`
      p-1.5 rounded-lg flex items-center gap-1
      ${active ? 'bg-gray-100' : 'hover:bg-gray-50'}
      ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}
      ${className}
      transition-colors duration-200
    `}
    onClick={onClick}
    title={tooltip}
    disabled={disabled}
  >
    {icon}
    {children}
  </button>
);