// src/lib/pdf-processor.ts
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { Document } from '@langchain/core/documents';
import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import pdf from 'pdf-parse';

export async function extractTextFromPDF(pdfUrl: string): Promise<string> {
  try {
    // Download PDF file
    const response = await fetch(pdfUrl);
    if (!response.ok) throw new Error('Failed to download PDF');
    const pdfBuffer = Buffer.from(await response.arrayBuffer());

    // Extract text using pdf-parse
    const data = await pdf(pdfBuffer);
    
    if (!data.text || data.text.trim().length === 0) {
      throw new Error('No text content found in PDF');
    }

    // Clean and format the text
    const cleanedText = data.text
      .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
      .replace(/\n+/g, '\n') // Replace multiple newlines with single newline
      .trim();

    return cleanedText;

  } catch (error) {
    console.error('Error extracting PDF text:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

// Optional: Add text chunking for large documents
export function splitIntoChunks(text: string, maxChunkSize: number = 2000): string[] {
  const chunks: string[] = [];
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  let currentChunk = '';

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = '';
    }
    currentChunk += sentence + ' ';
  }

  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}