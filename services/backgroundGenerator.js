import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';
import FormData from 'form-data';

/**
 * Service to generate invitation backgrounds using Stability AI.
 */
export const generateBackground = async (style, outputPath) => {
  const apiKey = process.env.STABILITY_API_KEY;
  
  if (!apiKey || apiKey === 'YOUR_STABILITY_API_KEY' || apiKey === 'MY_STABILITY_API_KEY') {
    console.warn('STABILITY_API_KEY is not configured. Using placeholder background for testing.');
    
    try {
      // Use a high-quality placeholder from Picsum for testing
      const response = await axios({
        method: 'get',
        url: 'https://picsum.photos/seed/invitation/1024/1024',
        responseType: 'arraybuffer'
      });

      await fs.ensureDir(path.dirname(outputPath));
      await fs.writeFile(outputPath, response.data);
      return outputPath;
    } catch (error) {
      throw new Error('Failed to fetch placeholder background: ' + error.message);
    }
  }

  const prompt = `${style} invitation background, elegant, empty center area, minimal decorations, high resolution, 4k, professional photography, no text, no words, no letters`;

  try {
    const response = await axios.post(
      'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image',
      {
        text_prompts: [
          {
            text: prompt,
            weight: 1
          },
          {
            text: "text, words, letters, watermark, blurry, low quality",
            weight: -1
          }
        ],
        cfg_scale: 7,
        height: 1024,
        width: 1024,
        samples: 1,
        steps: 30,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    const artifact = response.data.artifacts[0];
    const buffer = Buffer.from(artifact.base64, 'base64');
    
    await fs.ensureDir(path.dirname(outputPath));
    await fs.writeFile(outputPath, buffer);

    return outputPath;
  } catch (error) {
    console.error('Stability AI Error:', error.response?.data || error.message);
    throw new Error('Failed to generate background image');
  }
};
