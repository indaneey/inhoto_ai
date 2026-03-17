import { GoogleGenAI, Type } from '@google/genai';

let aiInstance = null;
const getAI = () => {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    aiInstance = new GoogleGenAI({ apiKey: apiKey || 'dummy-key' });
  }
  return aiInstance;
};

/**
 * Extracts structured invitation blocks and style context from raw user text.
 * @param {string} rawText - The unformatted text provided by the user (mixing style and content).
 * @returns {Promise<{blocks: Array, styleContext: string}>} - Extracted data.
 */
export const extractBlocks = async (rawText) => {
  if (!rawText || rawText.trim().length < 5) {
    throw new Error('Instruction is too short.');
  }

  try {
    const ai = getAI();

    const prompt = `You are an expert design assistant. The user will provide a single prompt that contains BOTH invitation content AND style preferences.
    
    TASK:
    1. Extract invitation details into blocks: (type: title, names, family, date, venue, phone, extra).
    2. Extract a summary of style/layout: (colors, fonts, positions).
    
    TEXT: "${rawText}"
    
    Return STRICTLY JSON according to the provided schema.`;

    const result = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: {
          blocks: {
            type: "array",
            items: {
              type: "object",
              properties: {
                type: { type: "string" },
                text: { type: "string" }
              },
              required: ["type", "text"]
            }
          },
          styleContext: { type: "string" }
        },
        required: ["blocks", "styleContext"]
      }
    }
  });

  const rawResponse = result.text;
    console.log('AI Extraction Raw Response:', rawResponse);

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
      data = JSON.parse(cleanJsonString(rawResponse));
    } catch (e) {
      console.error('Failed to parse JSON, raw text was:', rawResponse);
      throw new Error(`Invalid JSON response from AI: ${e.message}`);
    }

    // RESILIENCE MAPPING
    // 1. If AI returns 'details' object instead of 'blocks' array
    if (data.details && !data.blocks) {
      console.log('Mapping "details" object to "blocks" array');
      data.blocks = Object.entries(data.details)
        .filter(([_, value]) => value !== null && value !== "")
        .map(([key, value]) => ({ type: key, text: String(value) }));
    }

    // 2. If AI returns 'style' instead of 'styleContext'
    if (data.style && !data.styleContext) {
      console.log('Mapping "style" to "styleContext"');
      data.styleContext = typeof data.style === 'string' 
        ? data.style 
        : JSON.stringify(data.style);
    }

    // 3. Final validation/defaults
    if (!data.blocks || !Array.isArray(data.blocks)) {
      data.blocks = [];
    }
    
    if (!data.styleContext) {
      data.styleContext = 'Luxury, elegant layout.';
    }

    return data;
  } catch (error) {
    console.error('Error in extractBlocks:', error);
    throw new Error(`Failed to parse invitation instructions: ${error.message}`);
  }
};
