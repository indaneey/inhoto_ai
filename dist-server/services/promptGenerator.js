import { GoogleGenAI } from '@google/genai';
let aiInstance = null;
const getAI = () => {
    if (!aiInstance) {
        const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
        if (!apiKey) {
            console.warn('GEMINI_API_KEY is not set. Prompt generation may fail.');
        }
        aiInstance = new GoogleGenAI({ apiKey: apiKey || 'dummy-key' });
    }
    return aiInstance;
};
export const generateImagePrompt = async (category) => {
    try {
        const ai = getAI();
        const textPart = `You are an expert AI image prompt engineer. 
Write a highly descriptive, visually rich prompt for an image generation model (like Stable Diffusion/Runware) to create an invitation background.
The invitation category/style is: "${category}".

STRICT RULES:
1. Do NOT include any text, words, or letters in the prompt. The image must be completely text-free.
2. Focus entirely on visual elements: colors, textures, lighting, atmosphere, style, and decorative borders.
3. Ensure there is an empty/clean center area for text to be added later.
4. Keep the prompt under 500 characters.
5. Provide ONLY the prompt string, no explanations, no markdown formatting, no quotes.`;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: textPart,
        });
        return response.text.trim();
    }
    catch (error) {
        console.error('Error generating prompt:', error);
        // Fallback prompt
        return `${category} invitation background, elegant, empty center area, minimal decorations, high resolution, 4k, professional photography, no text, no words, no letters`;
    }
};
