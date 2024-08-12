import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai'; // Import the Gemini API

// System prompt for the AI, providing guidelines on how to respond to users
const systemPrompt = "I am an AI support assistant designed to help you with your inquiries, troubleshoot issues, and provide guidance. My goal is to assist you by answering your questions, offering solutions, and providing clear, concise, and helpful information in a friendly and professional manner.";

// POST function to handle incoming requests
export async function POST(req) {
  try {
    // Initialize the Google Generative AI client with the API key
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

    // Get the model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const data = await req.json(); // Parse the JSON body of the incoming request
    const userMessage = data[data.length - 1].content; // Extract the latest user message

    // Prepare the request body in the correct format
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: `${systemPrompt} ${userMessage}`
            }
          ]
        }
      ]
    };

    // Generate content using the model
    const result = await model.generateContent(requestBody);

    // Extract the generated text from the response
    const generatedText = result.response.text();

    // Create a ReadableStream to handle the streaming response
    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();
        const text = encoder.encode(generatedText);
        controller.enqueue(text);
        controller.close();
      },
    });

    return new NextResponse(stream); // Return the stream as the response

  } catch (error) {
    console.error('Error in API route:', error.message);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
