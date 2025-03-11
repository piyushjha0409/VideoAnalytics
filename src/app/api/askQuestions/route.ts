import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai"; // Install this package

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!); // Add your Gemini API key to .env

export async function POST(request: Request) {
  try {
    // Parse the request body
    const { context, question } = await request.json();

    // Validate required fields
    if (!context || !question) {
      return NextResponse.json(
        { error: "summary and question are required" },
        { status: 400 }
      );
    }

    // Initialize the Gemini model
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-thinking-exp",
    });

    // Construct the prompt for Gemini using the summary as context
    const prompt = `You are a helpful assistant that answers questions based on the provided video summary. Here is the summary of the video: ${context}. Question: ${question}`;

    // Generate a response using Gemini
    const result = await model.generateContent(prompt);
    const answer = await result.response.text(); // Extract the generated text

    // Return the answer in the response
    return NextResponse.json({ answer }, { status: 200 });
  } catch (error) {
    console.error("Error in POST /api/askQuestion:", error);
    return NextResponse.json(
      { error: "Failed to process the question" },
      { status: 500 }
    );
  }
}