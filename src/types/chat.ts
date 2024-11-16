// src/types/chat.ts
export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp?: string;
  }
  
  export interface ChatResponse {
    response: string;
    documentTitle: string;
    timestamp: string;
  }
  
  export interface ChatError {
    error: string;
    code?: string;
    details?: string;
  }