// src/app/api/ai/analyze/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import OpenAI from 'openai';

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prompt } = await req.json();
    
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Create chat completion
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful AI assistant providing clear and detailed responses."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const response = completion.choices[0]?.message?.content;
    
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    // Return the response
    return NextResponse.json({ response });

  } catch (error) {
    console.error('AI analysis error:', error);
    
    if (error instanceof OpenAI.APIError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status || 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}