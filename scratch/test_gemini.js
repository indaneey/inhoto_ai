import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const aiInstance = new GoogleGenAI({ apiKey });

async function test() {
  const response = await aiInstance.models.generateContent({
    model: "gemini-2.5-pro",
    contents: "Write a short, descriptive image generation prompt for a 'Wedding' invitation background. No text or words in the image. Focus on visual elements, colors, and mood. Provide ONLY the prompt string.",
  });
  console.log(response.text);
}

test().catch(console.error);
