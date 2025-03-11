import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import util from "util";
import { writeFile } from "fs/promises";
import { PrismaClient } from "@prisma/client";

const execPromise = util.promisify(exec);
const prisma = new PrismaClient();

// Function to extract frames from video at a specific interval (e.g., 1 frame every 5 seconds)
async function extractFrames(videoPath: string, outputDir: string) {
  console.log("Extracting frames...");
  const command = `ffmpeg -i "${videoPath}" -vf "fps=1/5" "${outputDir}/frame-%03d.jpg" -y`;
  await execPromise(command);
  console.log("Frames extracted successfully.");
}

// Function to extract audio from video
async function extractAudio(videoPath: string, audioPath: string) {
  console.log("Extracting audio...");
  const command = `ffmpeg -i "${videoPath}" -q:a 0 -map a "${audioPath}" -y`;
  await execPromise(command);
  console.log("Audio extracted successfully.");
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const videoFile = formData.get("file") as File;
  const s3Url = formData.get("s3Url") as string | null; // Explicitly type as string | null

  if (!videoFile) {
    return NextResponse.json(
      { error: "No video file provided" },
      { status: 400 }
    );
  }

  // Ensure videoUrl is always a string
  if (!s3Url) {
    return NextResponse.json(
      { error: "s3Url is required" },
      { status: 400 }
    );
  }

  const videoUrl = s3Url; // Now videoUrl is guaranteed to be a string

  const tempDir = path.join("/tmp", `analysis-${Date.now()}`);
  const videoPath = path.join(tempDir, "video.mp4");
  const framesDir = path.join(tempDir, "frames");
  const audioPath = path.join(tempDir, "audio.mp3");

  try {
    // Create temp directories
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
    if (!fs.existsSync(framesDir)) fs.mkdirSync(framesDir);

    // Save uploaded file locally
    const videoBuffer = Buffer.from(await videoFile.arrayBuffer());
    await writeFile(videoPath, videoBuffer);

    console.log("Video saved locally at:", videoPath);

    // Log the S3 URL
    console.log("Video uploaded to S3:", videoUrl);

    // Extract frames & audio
    await extractFrames(videoPath, framesDir); // Extract 1 frame every 5 seconds
    await extractAudio(videoPath, audioPath);

    // Get list of extracted frames
    const imageFiles = fs
      .readdirSync(framesDir)
      .map((file) => path.join(framesDir, file));
    console.log(`Extracted ${imageFiles.length} frames.`);

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-thinking-exp",
    });

    // Step 1: Transcribe Audio
    let transcription = "";
    try {
      const audioBuffer = fs.readFileSync(audioPath);
      const base64Audio = audioBuffer.toString("base64");
      const response = await model.generateContent([
        { inlineData: { mimeType: "audio/mpeg", data: base64Audio } },
        "Transcribe the spoken content in the audio in details, timing is not necessary",
      ]);
      transcription = (await response.response).text();
    } catch (error) {
      console.error("Error transcribing audio:", error);
    }

    // Step 2: Object Detection
    let detection = "";
    try {
      const base64Images = imageFiles.map((imagePath) => {
        const imageBuffer = fs.readFileSync(imagePath);
        return {
          inlineData: {
            mimeType: "image/jpeg",
            data: imageBuffer.toString("base64"),
          },
        };
      });
      const response = await model.generateContent([
        "Give me list of the names of the Objects that are being used in this video",
        ...base64Images,
      ]);
      detection = (await response.response).text();
    } catch (error) {
      console.error("Error detecting objects:", error);
    }

    // Step 3: Generate Detailed Summary
    let summary = "";
    try {
      const response = await model.generateContent([
        `Provide a detailed summary of the video based on the following:
        - Transcription: ${transcription}
        - Detected Objects: ${detection}`,
      ]);
      summary = (await response.response).text();
    } catch (error) {
      console.error("Error generating summary:", error);
    }

    // Step 4: Sentiment Analysis
    let sentiment = "";
    try {
      const response = await model.generateContent([
        `Analyze the sentiment of the following text and provide the result as "positive", "negative", or "neutral", also describe that sentiment:
        - Transcription: ${transcription}`,
      ]);
      sentiment = (await response.response).text();
    } catch (error) {
      console.error("Error analyzing sentiment:", error);
    }

    // Prepare structured analysis results
    const structuredAnalysis = {
      videoUrl, // videoUrl is now guaranteed to be a string
      transcription,
      summary,
      detection,
      sentiment,
    };

    // Save results to a temporary JSON file
    const resultsPath = path.join(tempDir, "analysis.json");
    fs.writeFileSync(resultsPath, JSON.stringify(structuredAnalysis, null, 2));

    const savedAnalysis = await prisma.videoAnalysis.upsert({
      where: { videoUrl },
      update: structuredAnalysis,
      create: structuredAnalysis,
    });

    // Cleanup temporary files
    fs.rmSync(tempDir, { recursive: true, force: true });

    return NextResponse.json(
      {
        message: "Analysis completed successfully",
        analysis: savedAnalysis,
        videoUrl,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error analyzing video:", error);
    fs.rmSync(tempDir, { recursive: true, force: true });
    return NextResponse.json(
      { error: "Failed to analyze video" },
      { status: 500 }
    );
  }
}