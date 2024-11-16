// src/components/chat/ChatInterface.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, AlertCircle, Copy, RotateCcw, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  error?: boolean;
  timestamp: Date;
}

export default function ChatInterface({ documentId }: { documentId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateId = () => `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const handleSubmit = async (e: React.FormEvent, retryMessage?: Message) => {
    e.preventDefault();
    if ((!input.trim() && !retryMessage) || loading) return;

    const messageContent = retryMessage?.content || input;
    const messageId = generateId();

    const userMessage: Message = {
      id: messageId,
      role: 'user',
      content: messageContent,
      timestamp: new Date(),
    };

    if (!retryMessage) {
      setMessages(prev => [...prev, userMessage]);
      setInput('');
    }

    setLoading(true);
    setIsTyping(true);

    try {
      const response = await fetch(`/api/chat/${documentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageContent }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response');
      }

      const data = await response.json();
      
      // Simulate typing effect
      setIsTyping(true);
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
      
      if (retryMessage) {
        setMessages(prev => prev.map(msg => 
          msg.id === retryMessage.id 
            ? { ...msg, content: data.response, error: false }
            : msg
        ));
      } else {
        setMessages(prev => [...prev, {
          id: generateId(),
          role: 'assistant',
          content: data.response,
          timestamp: new Date()
        }]);
      }

    } catch (error) {
      console.error('Chat error:', error);
      if (!retryMessage) {
        setMessages(prev => [...prev, {
          id: generateId(),
          role: 'assistant',
          content: error instanceof Error ? error.message : 'Failed to get response',
          error: true,
          timestamp: new Date()
        }]);
      }
    } finally {
      setLoading(false);
      setIsTyping(false);
    }
  };

  const handleCopy = async (content: string, messageId: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(messageId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRetry = (message: Message) => {
    // Remove all messages after the retry message
    const messageIndex = messages.findIndex(msg => msg.id === message.id);
    setMessages(prev => prev.slice(0, messageIndex));
    handleSubmit(new Event('submit') as any, message);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Chat Header */}
      <div className="border-b p-4">
        <h2 className="text-lg font-medium">Glance AI Chatbot</h2>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 my-8">
            Ask questions about your document
          </div>
        )}
        
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} max-w-[85%] ${
              message.role === 'user' ? 'ml-auto' : 'mr-auto'
            }`}
          >
            <div className="group relative">
              <div
                className={`rounded-lg px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-[#FF6B6B] text-white'
                    : message.error
                    ? 'bg-red-50 text-red-600'
                    : 'bg-gray-100 text-gray-800'
                } break-words whitespace-pre-wrap`}
                style={{ maxWidth: '100%', wordBreak: 'break-word' }}
              >
                <div className="flex items-start gap-2">
                  {message.error && <AlertCircle className="w-4 h-4 mt-1 flex-shrink-0" />}
                  <span className="text-sm leading-relaxed">{message.content}</span>
                </div>
                
                {/* Message Actions - Now inside the message bubble */}
                <div className="flex gap-1 mt-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleCopy(message.content, message.id)}
                    className={`p-1 rounded ${
                      message.role === 'user'
                        ? 'hover:bg-white/20 text-white'
                        : 'hover:bg-gray-200 text-gray-500'
                    }`}
                    title="Copy message"
                  >
                    {copiedId === message.id ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  {message.error && (
                    <button
                      onClick={() => handleRetry(message)}
                      className="p-1 hover:bg-gray-200 rounded text-gray-500"
                      title="Retry"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Timestamp */}
              <div className={`text-xs text-gray-400 mt-1 ${
                message.role === 'user' ? 'text-right' : 'text-left'
              }`}>
                {formatDistanceToNow(message.timestamp, { addSuffix: true })}
              </div>
            </div>
          </div>
        ))}
        
        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t p-4">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your document..."
            className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]/50"
            disabled={loading || isTyping}
          />
          <button
            type="submit"
            disabled={loading || isTyping || !input.trim()}
            className="bg-[#FF6B6B] text-white rounded-lg px-4 py-2 hover:bg-[#FF8E53] transition-colors disabled:opacity-50 flex items-center justify-center min-w-[44px]"
          >
            {loading || isTyping ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}