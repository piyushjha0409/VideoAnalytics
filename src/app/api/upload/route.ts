import { NextResponse } from "next/server";
import {
  S3Client,
  PutObjectCommandInput,
  PutObjectCommand,
  ObjectCannedACL,
} from "@aws-sdk/client-s3";

// Initialize the S3 client with IAM credentials
const s3Client = new S3Client({
  region: "eu-north-1", // AWS Region (e.g., "us-east-1")
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!, // IAM User Access Key
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!, // IAM User Secret Key
  },
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Ensure the uploaded file is a video
    if (!file.type.startsWith("video/")) {
      return NextResponse.json(
        { error: "Only video files are allowed" },
        { status: 400 }
      );
    }

    // Prepare upload parameters
    const uploadParams: PutObjectCommandInput = {
      Bucket: process.env.AWS_S3_BUCKET_NAME!, // Your AWS S3 Bucket Name
      Key: `videos/${Date.now()}-${file.name}`, // Unique file path in the bucket
      Body: Buffer.from(await file.arrayBuffer()), // Convert file to buffer
      ContentType: file.type, // Maintain correct video format
      ACL: ObjectCannedACL.private, // Keep it private (change to "public-read" if needed)
    };

    // Upload video to S3
    const command = new PutObjectCommand(uploadParams);
    await s3Client.send(command);

    // Generate file URL (adjust if using private files)
    const fileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.eu-north-1.amazonaws.com/${uploadParams.Key}`;

    return NextResponse.json({ url: fileUrl }, { status: 200 });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
