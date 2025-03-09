"use client";
import { useState } from "react";
import { useRouter } from "next/navigation"; // Import useRouter for redirection
import { UploadIcon, FileVideo, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";

export default function Page() {
  const router = useRouter(); // Initialize the router
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(-1);
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
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
    setVideoUrl(null);
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", file);

    try {
      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 94) {
            clearInterval(interval);
            return 94;
          }
          return prev + 4;
        });
      }, 299);

      // Upload the file to the API
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload file");
      }

      const data = await response.json();
      const fileUrl = data.url;

      // Simulate final progress
      clearInterval(interval);
      setUploadProgress(100);

      // Store the video URL in state
      setVideoUrl(fileUrl);
    } catch (error) {
      console.error("Upload failed:", error);
      setError("An error occurred during upload. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAnalyzeVideo = async () => {
    if (!videoUrl) return;

    setLoading(true);
    try {
      const response = await fetch("/api/model", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ videoUrl }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze video");
      }

      const data = await response.json();
      console.log("Analysis result:", data);

      //clearn video url
    //   const cleanVideoUrl = videoUrl.replace(/^https?:\/\//, "");
      const encodedVideoUrl = encodeURIComponent(videoUrl);
      // Redirect to /dashboard after successful analysis
      router.push(`/dashboard/${encodedVideoUrl}`);
      setLoading(false);
    } catch (error) {
      console.error("Analysis failed:", error);
      setError("An error occurred during analysis. Please try again.");
    }
  };

  //Loader component 
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading analysis...</p>
        </div>
      </div>
    );
  }

  return (
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
                onClick={() => document.getElementById("file-upload")?.click()}
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
              {!isUploading && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRemoveFile}
                  className="flex-shrink-1"
                >
                  <X className="h-6 w-5" />
                </Button>
              )}
            </div>

            {isUploading ? (
              <div className="space-y-5">
                <Progress value={uploadProgress} className="h-3" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Uploading and processing...</span>
                  <span>{uploadProgress}%</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {!videoUrl ? (
                  <Button className="w-full" onClick={handleUpload}>
                    Upload Video
                  </Button>
                ) : (
                  <Button className="w-full" onClick={handleAnalyzeVideo}>
                    Analyze Video
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="mt-5 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
