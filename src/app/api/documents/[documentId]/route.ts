import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectDB } from '@/lib/db';
import { Document } from '@/models/Document';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function DELETE(
  req: Request,
  context: { params: { documentId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { documentId } = await context.params;

    const document = await Document.findOne({
      _id: documentId,
      userId,
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Extract file key from URL
    const fileUrl = new URL(document.fileUrl);
    const fileKey = decodeURIComponent(fileUrl.pathname.slice(1));

    // Delete from S3
    try {
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME!,
          Key: fileKey,
        })
      );
    } catch (error) {
      console.error('S3 deletion error:', error);
    }

    // Delete from database
    await Document.findByIdAndDelete(documentId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request, context: { params: { documentId: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { documentId } = await context.params;

    const document = await Document.findOne({
      _id: documentId,
      userId,
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    return NextResponse.json(document);
  } catch (error) {
    console.error('Fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch document' },
      { status: 500 }
    );
  }
}

// PATCH handler for toggling star
export async function PATCH(
  req: Request,
  context: { params: { documentId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { documentId } = await context.params;

    const document = await Document.findOne({
      _id: documentId,
      userId,
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Toggle star status
    document.isStarred = !document.isStarred;
    await document.save();

    return NextResponse.json(document);
  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
