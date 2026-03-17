import { GoogleGenAI, Type } from '@google/genai';
import fs from 'fs';

let aiInstance = null;
const getAI = () => {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not set. AI features may fail.');
    }
    aiInstance = new GoogleGenAI({ apiKey: apiKey || 'dummy-key' });
  }
  return aiInstance;
};

export const analyzeDesign = async (imagePath, prompt, safeZone) => {
  try {
    const ai = getAI();
    // Use a stable, high-performance model supporting responseSchema

    const imageBytes = fs.readFileSync(imagePath);
    const base64EncodeString = imageBytes.toString('base64');
    const ext = imagePath.split('.').pop().toLowerCase();
    const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';

    const imagePart = {
      inlineData: {
        mimeType,
        data: base64EncodeString,
      },
    };

    const fontsList = [
      "Amelina Script", "Brittany Signature", "White Angelica", "Adelio Darmanto", "Halimun",
      "Bodoni* 06pt", "Abeganshi", "Elsie", "Poppins Light", "Poppins Black",
      "Gilroy Light", "Gilroy ExtraBold", "Bebas Neue", "Aero", "Burbank Big Cd Bd",
      "Mega Surprise", "Dry Brush", "Carnivalee Freakshow", "Akira Expanded", "Road Rage"
    ];

    const textPart = `You are an expert design assistant. Analyze this background image for an invitation and extract content from the prompt.
      
      USER PROMPT: "${prompt}"
      SAFE ZONE: x:${safeZone.x}, y:${safeZone.y}, width:${safeZone.width}, height:${safeZone.height}
      
      TASK:
      1. EXTRACT CONTENT: Identify all names, dates, venues, etc. Treat each as a generic text block.
      2. DESIGN LAYOUT: Determine x/y position (center), fontSize, fontFamily, color (hex), alignment, width, height and origin.x, origin.y (center, left, right, top, bottom).
      
      AVAILABLE FONTS: ${fontsList.join(", ")}
      
      STRICT ARTISTIC RULES:
      - ABSOLUTE ZERO OVERLAP: Text blocks must NEVER touch each other. Keep significant padding.
      - NEGATIVE SPACE ONLY: Place text in plain/empty areas. NEVER overlay on busy background subjects.
      - FONT SELECTION: Use ONLY the available fonts listed above.
      - LEGIBILITY: Ensure high contrast.
      
      Return as a JSON object with a 'blocks' array.`;

      const response = await  ai.models.generateContent({ 
        model: "gemini-2.5-pro",
        contents: [imagePart, textPart],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              blocks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    text: { type: Type.STRING },
                    type: { type: Type.STRING },
                    x: { type: Type.NUMBER },
                    y: { type: Type.NUMBER },
                    fontSize: { type: Type.NUMBER },
                    fontFamily: { type: Type.STRING },
                    color: { type: Type.STRING },
                    alignment: { type: Type.STRING, enum: ["center", "left", "right"] },
                    width: { type: Type.NUMBER },
                    height: { type: Type.NUMBER },
                    origin: {
                      type: Type.OBJECT,
                      properties: {
                        x: { type: ['center', 'left', 'right'] },
                        y: { type: ['center', 'top', 'bottom'] }
                      },
                      required: ["x", "y"]
                    }
                  },
                  required: ["text", "type", "x", "y", "fontSize", "fontFamily", "color", "alignment", "origin", "width", "height"]
                }
              }
            },
            required: ["blocks"]
          }
        }
      });

    const responseText = response.text;
    console.log('AI Unified Response:', responseText);

     // Robust parsing: strip markdown if present
    const cleanJsonString = (str) => {
      // First, find the first '{' and last '}' to isolate potential JSON
      const start = str.indexOf('{');
      const end = str.lastIndexOf('}');
      if (start === -1 || end === -1) return str.replace(/```json\n?|```/g, '').trim();
      return str.substring(start, end + 1);
    };

    let data;
    try {
      data = JSON.parse(cleanJsonString(responseText));
    } catch (e) {
      console.error('Failed to parse JSON, raw text was:', responseText);
      throw new Error(`Invalid JSON response from AI: ${e.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error in unified AI design analysis:', error.message || error);
    // Return a fallback block so the app doesn't show an empty screen
    return { 
      blocks: [
        {
          text: "Invitation",
          type: "title",
          x: safeZone.x + safeZone.width / 2,
          y: safeZone.y + 100,
          fontSize: 32,
          fontFamily: "Playfair Display",
          color: "#1a1a1a",
          alignment: "center"
        }
      ] 
    };
  }
};
