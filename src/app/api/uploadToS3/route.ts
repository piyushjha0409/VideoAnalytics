import { S3Client, PutObjectCommand, ObjectCannedACL } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';

const s3Client = new S3Client({
  region: 'eu-north-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

export async function POST(request: Request) {
  try {
    const { blobUrl, fileName, contentType } = await request.json();
    
    if (!blobUrl || !fileName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const response = await fetch(blobUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch file from Vercel Blob: ${response.statusText}`);
    }
    
    const fileBuffer = await response.arrayBuffer();
    
    const key = `uploads/${Date.now()}-${fileName}`;
    
    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME || '',
      Key: key,
      Body: Buffer.from(fileBuffer),
      ContentType: contentType || 'application/octet-stream',
      ACL: ObjectCannedACL.private,
    };
    
    await s3Client.send(new PutObjectCommand(uploadParams));
    
    const s3Url = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.eu-north-1.amazonaws.com/${key}`;
        
    return NextResponse.json({ success: true, s3Url });
  } catch (error) {
    console.error('S3 transfer error:', error);
    return NextResponse.json(
      { error: (error as Error).message }, 
      { status: 500 }
    );
  }
}