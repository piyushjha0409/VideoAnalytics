import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai"; // Install this package

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!); // Add your Gemini API key to .env

export async function POST(request: Request) {
  try {
    const { videoUrl, question } = await request.json();

    if (!videoUrl || !question) {
      return NextResponse.json(
        { error: "videoUrl and question are required" },
        { status: 400 }
      );
    }


    // Initialize the Gemini model
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-thinking-exp",
    });

    // Construct the prompt for Gemini
    const prompt = `You are a helpful assistant that answers questions about a video related to visions, incidents or it can be facts. Here is the video url for more details: ${videoUrl}. Question: ${question}`;

    // Generate a response using Gemini
    const result = await model.generateContent(prompt);
    const answer = await result.response.text(); // Extract the generated text

    return NextResponse.json({ answer }, { status: 200 });
  } catch (error) {
    console.error("Error in POST /api/askQuestion:", error);
    return NextResponse.json(
      { error: "Failed to process the question" },
      { status: 500 }
    );
  }
}


