import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import prisma from "@/lib/prismaClient";

export async function POST(request: Request) {
  try {
    const { videoUrl } = await request.json();

    if (!videoUrl) {
      return NextResponse.json(
        { error: "Video URL is required" },
        { status: 400 }
      );
    }

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-thinking-exp",
    });

    // Generate comprehensive analysis
        const prompt = `
          Analyze the video at ${videoUrl} and provide the analysis in the following structured format in a very detailed manner:

    {
      "transcription": "Full detailed transcription of all spoken content in the video",
      "summary": "Detailed summary of the key points and topics covered in the video",
      "detection": "Breif Description of important objects, scenes, and activities shown in the video",
      "sentiment": "Breif Analysis of the emotional tone and sentiment of speakers in the video (if applicable)"
    }

    Please ensure all fields are properly populated as strings with no markdown formatting.
        `;

//     const prompt = `
// Analyze the video at ${videoUrl} and provide the following in JSON format:
// 1. Transcription of spoken content.
// 2. Summary of key points/topics covered.
// 3. Detection of important objects/activities shown in the video.
// 4. Sentiment analysis of speakers.
// `;

    const result = await model.generateContent(prompt);
    const analysis = result.response.text();

    console.log("analysis", analysis);

    const parseAnalysisOutput = (analysis: string) => {
      // First, try to see if it's already a JSON string
      try {
        const jsonParsed = JSON.parse(analysis);
        if (
          jsonParsed.transcription &&
          jsonParsed.summary &&
          jsonParsed.detection &&
          jsonParsed.sentiment
        ) {
          return jsonParsed;
        }
      } catch (e) {
        // Not valid JSON, continue with regex approach
        console.error(e);
      }

      // More flexible pattern matching that handles various potential formats
      const structuredAnalysis = {
        // Try multiple potential formats for transcription
        transcription: (analysis.match(
          /(?:"transcription"|Transcription|TRANSCRIPTION)(?:[^:]*):(?:\s*```)?([^`]*?)(?:```|\n\n|(?=(?:"summary"|Summary|SUMMARY)))/is
        ) ||
          analysis.match(
            /(?:"transcription"|Transcription|TRANSCRIPTION)(?:[^:]*):(?:\s*)([^]*?)(?=(?:"summary"|Summary|SUMMARY))/is
          ))?.[1]?.trim(),

        summary: (analysis.match(
          /(?:"summary"|Summary|SUMMARY)(?:[^:]*):(?:\s*```)?([^`]*?)(?:```|\n\n|(?=(?:"detection"|Detection|DETECTION)))/is
        ) ||
          analysis.match(
            /(?:"summary"|Summary|SUMMARY)(?:[^:]*):(?:\s*)([^]*?)(?=(?:"detection"|Detection|DETECTION))/is
          ))?.[1]?.trim(),

        detection: (analysis.match(
          /(?:"detection"|Detection|DETECTION)(?:[^:]*):(?:\s*```)?([^`]*?)(?:```|\n\n|(?=(?:"sentiment"|Sentiment|SENTIMENT)))/is
        ) ||
          analysis.match(
            /(?:"detection"|Detection|DETECTION)(?:[^:]*):(?:\s*)([^]*?)(?=(?:"sentiment"|Sentiment|SENTIMENT))/is
          ))?.[1]?.trim(),

        sentiment: (analysis.match(
          /(?:"sentiment"|Sentiment|SENTIMENT)(?:[^:]*):(?:\s*```)?([^`]*?)(?:```|\n\n|$)/is
        ) ||
          analysis.match(
            /(?:"sentiment"|Sentiment|SENTIMENT)(?:[^:]*):(?:\s*)([^]*?)(?=(?:Important|IMPORTANT|$))/is
          ))?.[1]?.trim(),
      };

      // Check if we have valid data
      const hasValidData = Object.values(structuredAnalysis).some((v) => v);

      if (!hasValidData) {
        // Fall back to simple section extraction if more complex patterns fail
        const sections = analysis.split(/\n\s*\n|\r\n\s*\r\n/);

        if (sections.length >= 4) {
          return {
            transcription: sections[0].replace(/^[^:]*:\s*/, "").trim(),
            summary: sections[1].replace(/^[^:]*:\s*/, "").trim(),
            detection: sections[2].replace(/^[^:]*:\s*/, "").trim(),
            sentiment: sections[3].replace(/^[^:]*:\s*/, "").trim(),
          };
        }
      }

      return structuredAnalysis;
    };

    const structuredAnalysis = parseAnalysisOutput(analysis);
    console.log("Structured Analysis:", structuredAnalysis);

    // Save analysis to MongoDB
    await prisma.videoAnalysis.upsert({
      where: { videoUrl },
      update: {
        transcription: structuredAnalysis.transcription,
        summary: structuredAnalysis.summary,
        detection: structuredAnalysis.detection,
        sentiment: structuredAnalysis.sentiment,
      },
      create: {
        videoUrl,
        transcription: structuredAnalysis.transcription,
        summary: structuredAnalysis.summary,
        detection: structuredAnalysis.detection,
        sentiment: structuredAnalysis.sentiment,
      },
    });

    return NextResponse.json({ structuredAnalysis }, { status: 200 });
  } catch (error) {
    console.error("Error analyzing video:", error);
    return NextResponse.json(
      { error: "Failed to analyze video" },
      { status: 500 }
    );
  }
}
