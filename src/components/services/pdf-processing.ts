// src/services/pdf-processing.ts
import { Pinecone } from '@pinecone-database/pinecone';
import { OpenAIEmbeddings } from '@langchain/openai';
import { PineconeStore } from '@langchain/pinecone';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

export class PDFProcessor {
  private pinecone: Pinecone;
  private embeddings: OpenAIEmbeddings;

  constructor() {
    this.pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });

    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    });
  }

  async processPDF(fileBuffer: Buffer, documentId: string): Promise<void> {
    try {
      // Create temporary file
      const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'pdf-'));
      const tempPath = path.join(tempDir, `${documentId}.pdf`);
      
      // Write buffer to temporary file
      await fs.writeFile(tempPath, fileBuffer);

      // Load PDF
      const loader = new PDFLoader(tempPath);
      const rawDocs = await loader.load();

      // Split text into chunks
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });

      const docs = await textSplitter.splitDocuments(rawDocs);

      // Get Pinecone index
      const index = this.pinecone.index(process.env.PINECONE_INDEX_NAME!);

      // Initialize vector store
      const vectorStore = new PineconeStore(this.embeddings, {
        pineconeIndex: index,
        namespace: documentId,
      });

      // Add documents to vector store
      await vectorStore.addDocuments(docs);

      // Clean up temp files
      await fs.unlink(tempPath);
      await fs.rmdir(tempDir);

    } catch (error) {
      console.error('Error processing PDF:', error);
      throw error;
    }
  }
}