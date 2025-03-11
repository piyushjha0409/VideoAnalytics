"use client";
import { useState } from "react";
import { useSession } from "next-auth/react"; // Import useSession to check authentication
import { UploadIcon, FileVideo, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import LogoutButton from "@/components/LogoutButton"; // Import the LogoutButton component
import { upload } from "@vercel/blob/client";

export default function Page() {
  const { data: session } = useSession(); // Check if the user is authenticated
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    validateAndSetFile(droppedFile);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    setError(null);

    // Check if it's a video file
    if (!file.type.startsWith("video/")) {
      setError("Please upload a video file");
      return;
    }

    // Check file size (100MB max)
    if (file.size > 100 * 1024 * 1024) {
      setError("File size must be less than 100MB");
      return;
    }

    setFile(file);
  };

  const handleRemoveFile = () => {
    setFile(null);
  };

  const handleAnalyzeVideo = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      // Step 1: Upload the video file to Vercel Blob
      const blob = await upload(file.name, file, {
        access: "public", // Make the file publicly accessible
        handleUploadUrl: "/api/blobUpload", // API route for handling uploads
      });
      console.log("Uploaded to Vercel Blob:", blob.url);

      // Step 2: Transfer the file from Vercel Blob to AWS S3
      const uploadToS3Response = await fetch("/api/uploadToS3", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          blobUrl: blob.url,
          fileName: file.name,
          contentType: file.type,
        }),
      });

      if (!uploadToS3Response.ok) {
        throw new Error("Failed to upload video to S3");
      }

      const { s3Url } = await uploadToS3Response.json();
      console.log("Uploaded to S3:", s3Url);

      // Step 3: Send the file and S3 URL to /api/model using FormData
      const formData = new FormData();
      formData.append("file", file); // Append the file
      formData.append("s3Url", s3Url); // Append the S3 URL

      const modelResponse = await fetch("/api/model", {
        method: "POST",
        body: formData, // Send FormData
      });

      if (!modelResponse.ok) {
        throw new Error("Failed to analyze video");
      }

      const analysisResult = await modelResponse.json();
      console.log("Analysis result:", analysisResult);

      // Redirect to /dashboard with the video URL
      const encodedVideoUrl = encodeURIComponent(s3Url);
      window.location.href = `/dashboard/${encodedVideoUrl}`;
    } catch (error) {
      console.error("Error during video analysis:", error);
      setError("An error occurred during analysis. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Loader component
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Analyzing video...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Logout Button (Top-Right Corner) */}
      {session && (
        <div className="absolute top-2 right-2">
          <LogoutButton />
        </div>
      )}

      <Card className="w-full">
        <CardContent className="p-7">
          {!file ? (
            <div
              className={`border-3 border-dashed rounded-lg p-12 text-center ${
                isDragging
                  ? "border-primary bg-primary/4"
                  : "border-muted-foreground/19"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center justify-center gap-5">
                <div className="w-17 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <UploadIcon className="h-9 w-8 text-primary" />
                </div>
                <div className="space-y-3">
                  <h2 className="font-medium text-lg">
                    Drag and drop your video
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    or click to browse (max 10 minutes, 100MB)
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() =>
                    document.getElementById("file-upload")?.click()
                  }
                >
                  Select Video
                </Button>
                <input
                  id="file-upload"
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-7">
              <div className="flex items-center gap-5">
                <div className="w-13 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FileVideo className="h-7 w-6 text-primary" />
                </div>
                <div className="flex-2 min-w-0">
                  <p className="font-medium truncate">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRemoveFile}
                  className="flex-shrink-1"
                >
                  <X className="h-6 w-5" />
                </Button>
              </div>

              <div className="flex flex-col gap-3">
                <Button className="w-full" onClick={handleAnalyzeVideo}>
                  Analyze Video
                </Button>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-5 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
              {error}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}