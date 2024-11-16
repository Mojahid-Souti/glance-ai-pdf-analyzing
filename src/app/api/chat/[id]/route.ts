// src/app/api/chat/[id]/route.ts
import OpenAI from "openai";
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { Document } from '@/models/Document';
import { connectDB } from '@/lib/db';

// Ensure OpenAI API Key is available
if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Auth Check
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Get message from request
    const { message }: { message: string } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // 3. Connect to DB and fetch document
    await connectDB();
    const document = await Document.findOne({ 
      _id: params.id, 
      userId 
    }).exec();

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found or access denied' }, 
        { status: 404 }
      );
    }

    // 4. Create chat completion
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a helpful AI assistant analyzing the PDF document "${document.title}". 
                   Provide clear, concise answers to help users understand the document's content.
                   If you're not sure about something, be honest about it.`
        },
        {
          role: "user",
          content: message
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
      presence_penalty: 0.2,
      frequency_penalty: 0.2,
    });

    // 5. Extract and validate response
    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response received from OpenAI');
    }

    // 6. Return successful response
    return NextResponse.json({ 
      response,
      documentTitle: document.title,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      const statusCode = error.status || 500;
      const message = error.message || 'OpenAI API Error';
      
      if (error.code === 'insufficient_quota') {
        return NextResponse.json(
          { error: 'API quota exceeded. Please try again later.' },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { error: message },
        { status: statusCode }
      );
    }

    if (error instanceof Error) {
      if (error.message.includes('connect')) {
        return NextResponse.json(
          { error: 'Database connection error. Please try again.' },
          { status: 503 }
        );
      }
    }

    // Generic error response
    console.error('Chat API Error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      documentId: params.id
    });

    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}

// Add response config
export const config = {
  api: {
    responseLimit: '8mb',
  },
};
