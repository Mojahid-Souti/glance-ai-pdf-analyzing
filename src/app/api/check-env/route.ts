import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    mongodbUri: !!process.env.MONGODB_URI,
    awsRegion: !!process.env.AWS_REGION,
    awsBucket: !!process.env.AWS_BUCKET_NAME,
    awsAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
    awsSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY?.slice(0, 5), // Only show first 5 chars
  });
}