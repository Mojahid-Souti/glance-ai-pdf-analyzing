// src/app/api/documents/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectDB } from '@/lib/db';
import { Document } from '@/models/Document';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    console.log('Fetching documents for user:', userId); // Debug log

    const documents = await Document.find({ userId }).sort({ createdAt: -1 });
    console.log('Found documents:', documents.length); // Debug log

    return NextResponse.json(documents);
  } catch (error) {
    console.error('Documents fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}