import path from 'path';
import sharp from 'sharp';
import { generateBackground } from '../../services/backgroundGenerator.js';
import { analyzeImage } from '../../services/imageAnalyzer.js';
import { detectSafeZone } from '../../services/safeZoneDetector.js';
import { generateLayout } from '../../services/layoutEngine.js';
import { renderSVG } from '../../services/svgRenderer.js';
import { analyzeDesign } from '../../services/designAnalyzer.js';
import { generateImagePrompt } from '../../services/promptGenerator.js';
import { fetchRelevantAssets } from '../../services/assetFetcher.js';

export const generatePrompt = async (req, res) => {
  const { category } = req.body;
  
  if (!category) {
    return res.status(400).json({ error: 'Missing required field: category' });
  }

  try {
    const prompt = await generateImagePrompt(category);
    res.json({ success: true, prompt });
  } catch (error) {
    console.error('Prompt Generation Error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate prompt' });
  }
};

export const generateInvitation = async (req, res) => {
  const { type, prompt, dimension = 'portrait' } = req.body;
  const uploadedFile = req.file;

  if (!type || !prompt) {
    return res.status(400).json({ error: 'Missing required fields: type, and prompt' });
  }

  let bgWidth = 1024;
  let bgHeight = 1024;

  if (dimension === 'portrait') {
    bgWidth = 832;
    bgHeight = 1216;
  } else if (dimension === 'landscape') {
    bgWidth = 1216;
    bgHeight = 832;
  }

  try {
    let bgPath;
    let filename;

    if (uploadedFile) {
      bgPath = uploadedFile.path;
      filename = uploadedFile.filename;
    } else {
      filename = `bg_${Date.now()}.png`;
      bgPath = path.join(process.cwd(), 'public', 'images', filename);
      console.log('Generating visual prompt via Gemini...');
      const imagePrompt = await generateImagePrompt(prompt);
      console.log(`Generated visual prompt: ${imagePrompt}`);
      console.log('Generating background...');
      await generateBackground(imagePrompt, bgPath, bgWidth, bgHeight);
    }

    // Use sharp to get actual image dimensions
    console.log('Fetching image metadata with sharp...');
    const metadata = await sharp(bgPath).metadata();
    const width = metadata.width || 1024;
    const height = metadata.height || 1024;
    console.log(`Image dimensions: ${width}x${height}`);

    // 1. Analyze Image (Still used for density/layout analysis)
    console.log('Analyzing image area density...');
    const analysis = await analyzeImage(bgPath);

    // 2. Detect Safe Zone
    console.log('Detecting safe zone...');
    const safeZone = detectSafeZone(analysis);

    // 3. Unified AI Analysis (Extraction + Layout)
    console.log('Unified AI Analysis...');
    const designSuggestions = await analyzeDesign(bgPath, prompt, safeZone);
    const blocksData = designSuggestions.blocks || [];
    const finalSafeZone = designSuggestions.safeZone || safeZone;
    console.log(`AI extracted and placed ${blocksData.length} text blocks.`);

    // 4. Generate Layout
    console.log('Finalizing layout...');
    const layout = generateLayout(finalSafeZone, blocksData);

    // 5. Render SVG (Pass accurate width/height)
    console.log('Rendering SVG...');
    const svg = renderSVG(layout, width, height);

    // 6. Fetch relevant stickers/components from inHoto API
    console.log('Fetching relevant decorative assets...');
    const assets = await fetchRelevantAssets(type);
    console.log(`Found ${assets.stickers.length} stickers, ${assets.components.length} components.`);

    res.json({
      success: true,
      background: `/images/${filename}`,
      svg,
      layout,
      safeZone: finalSafeZone,
      designSuggestions,
      blocks: blocksData,
      dimensions: { width, height },
      assets
    });
  } catch (error) {
    console.error('Generation Error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'An error occurred during invitation generation' 
    });
  }
};
