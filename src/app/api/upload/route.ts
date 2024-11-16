// src/app/api/upload/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { S3Client, PutObjectCommand, S3ServiceException, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Document } from '@/models/Document';
import { connectDB } from '@/lib/db';
import { MongooseError } from 'mongoose';

// Define custom error types
class UploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UploadError';
  }
}

// Initialize S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const MAX_FILE_SIZE = 30 * 1024 * 1024; // 30MB

export async function POST(req: Request) {
  try {
    // Auth check
    const { userId } = await auth();
    if (!userId) {
      throw new UploadError('Unauthorized');
    }

    // Get form data
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    // Validate file
    if (!file) {
      throw new UploadError('No file provided');
    }

    if (!file.type.includes('pdf')) {
      throw new UploadError('Only PDF files are allowed');
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new UploadError('File size exceeds 30MB limit');
    }

    // Convert file to buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    
    // Generate unique fileKey
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const fileKey = `${userId}/${timestamp}-${randomString}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    try {
      // Upload to S3
      await s3Client.send(new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: fileKey,
        Body: fileBuffer,
        ContentType: file.type,
        ACL: 'public-read',
      }));

      const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;

      // Connect to MongoDB
      await connectDB();

      // Save to MongoDB
      const document = await Document.create({
        userId,
        title: file.name,
        fileName: file.name,
        fileKey,          // Add the fileKey
        fileUrl,
        fileSize: file.size,
        status: 'ready',
      });

      return NextResponse.json(document);

    } catch (error) {
      // If MongoDB fails, try to delete the file from S3
      if (error instanceof MongooseError) {
        try {
          await s3Client.send(new DeleteObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME!,
            Key: fileKey,
          }));
        } catch (s3Error) {
          console.error('Failed to delete S3 object after MongoDB error:', s3Error);
        }
      }

      // Handle specific error types
      if (error instanceof S3ServiceException) {
        throw new UploadError(`S3 upload failed: ${error.message}`);
      }
      if (error instanceof MongooseError) {
        throw new UploadError(`Database error: ${error.message}`);
      }
      throw new UploadError('Failed to process upload');
    }

  } catch (error) {
    console.error('Upload error:', error);

    if (error instanceof UploadError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};