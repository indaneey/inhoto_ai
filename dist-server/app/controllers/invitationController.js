import path from 'path';
import sharp from 'sharp';
import { generateBackground } from '../../services/backgroundGenerator.js';
import { analyzeImage } from '../../services/imageAnalyzer.js';
import { detectSafeZone } from '../../services/safeZoneDetector.js';
import { generateLayout } from '../../services/layoutEngine.js';
import { renderSVG } from '../../services/svgRenderer.js';
import { analyzeDesign } from '../../services/designAnalyzer.js';
export const generateInvitation = async (req, res) => {
    const { type, prompt } = req.body;
    const uploadedFile = req.file;
    if (!type || !prompt) {
        return res.status(400).json({ error: 'Missing required fields: type, and prompt' });
    }
    try {
        let bgPath;
        let filename;
        if (uploadedFile) {
            bgPath = uploadedFile.path;
            filename = uploadedFile.filename;
        }
        else {
            filename = `bg_${Date.now()}.png`;
            bgPath = path.join(process.cwd(), 'public', 'images', filename);
            console.log('Generating background...');
            await generateBackground(prompt, bgPath);
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
        console.log(`AI extracted and placed ${blocksData.length} text blocks.`);
        // 4. Generate Layout
        console.log('Finalizing layout...');
        const layout = generateLayout(safeZone, blocksData);
        // 5. Render SVG (Pass accurate width/height)
        console.log('Rendering SVG...');
        const svg = renderSVG(layout, width, height);
        res.json({
            success: true,
            background: `/images/${filename}`,
            svg,
            layout,
            safeZone,
            designSuggestions,
            blocks: blocksData,
            dimensions: { width, height }
        });
    }
    catch (error) {
        console.error('Generation Error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'An error occurred during invitation generation'
        });
    }
};
