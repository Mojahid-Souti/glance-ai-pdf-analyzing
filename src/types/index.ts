// src/types/index.ts
export interface Document {
    _id: string;
    userId: string;
    title: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    status: 'processing' | 'ready' | 'error';
    createdAt: string;
    updatedAt: string;
  }
  
  export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
  }
  
  export interface PineconeMetadata {
    documentId: string;
    page?: number;
    text?: string;
  }