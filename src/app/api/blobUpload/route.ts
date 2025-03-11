import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        return {
          // Explicitly allow video/mp4 and other common video formats
          allowedContentTypes: ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska'],
          maximumSizeInBytes: 100 * 1024 * 1024, 
        };
      },
      onUploadCompleted: async ({ blob }) => {
        console.log('Blob upload completed', blob);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 },
    );
  }
}