// src/app/api/chat/[id]/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { Document as MongoDocument } from '@/models/Document';
import { ChatOpenAI } from "@langchain/openai";
import { extractTextFromPDF, splitIntoChunks } from '@/lib/pdf-processor';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message } = await req.json();
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Get document
    const document = await MongoDocument.findOne({ 
      _id: params.id,
      userId 
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Extract text from PDF
    console.log('Extracting text from:', document.fileUrl);
    const pdfText = await extractTextFromPDF(document.fileUrl);
    
    // Split text into chunks if it's too long
    const chunks = splitIntoChunks(pdfText, 2000);
    const relevantChunks = chunks.slice(0, 3); // Use first 3 chunks for context
    
    // Initialize ChatOpenAI
    const chat = new ChatOpenAI({
      modelName: "gpt-4",
      temperature: 0.7,
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    // Create chat completion
    const response = await chat.invoke([
      { 
        role: "system", 
        content: `You are an AI assistant analyzing a PDF document titled "${document.title}". 
                 Use the following document content to answer questions accurately.
                 If the answer cannot be found in the content, say so.

                 Document Content:
                 ${relevantChunks.join('\n\n')}`
      },
      { role: "user", content: message }
    ]);

    return NextResponse.json({ response: response.content });

  } catch (error) {
    console.error('Chat error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}