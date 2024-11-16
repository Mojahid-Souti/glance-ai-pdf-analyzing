// src/app/api/queryPinecone/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { Pinecone } from '@pinecone-database/pinecone';
import { OpenAIEmbeddings } from '@langchain/openai';
import { PineconeStore } from '@langchain/pinecone';
import { Document as LangchainDocument } from '@langchain/core/documents';
import OpenAI from 'openai';

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Initialize Pinecone
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

// Define proper types for documents
interface DocumentMetadata {
  documentId: string;
  page?: number;
}

interface PineconeDocument extends LangchainDocument {
  metadata: DocumentMetadata;
}

export async function POST(req: Request) {
  try {
    // Auth check
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { question, documentId } = await req.json();

    if (!question || !documentId) {
      return NextResponse.json(
        { error: 'Question and documentId are required' },
        { status: 400 }
      );
    }

    // Initialize embeddings
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY
    });

    // Get Pinecone index
    const index = pinecone.index(process.env.PINECONE_INDEX_NAME!);

    // Initialize vector store
    const vectorStore = new PineconeStore(embeddings, {
      pineconeIndex: index,
      namespace: documentId,
    });

    // Search for relevant content
    const results = await vectorStore.similaritySearch(question, 4);
    const context = results
      .map((doc) => (doc as unknown as PineconeDocument).pageContent)
      .join('\n\n');

    // Use OpenAI for chat completion
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a helpful AI assistant. Use the following context to answer the question. 
                   If the answer cannot be found in the context, say so.
                   Context: ${context}`
        },
        {
          role: "user",
          content: question
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const answer = completion.choices[0]?.message?.content;

    if (!answer) {
      throw new Error('No response from OpenAI');
    }

    return NextResponse.json({ answer });

  } catch (error) {
    console.error('Pinecone query error:', error);
    return NextResponse.json(
      { error: 'Failed to process question' },
      { status: 500 }
    );
  }
}