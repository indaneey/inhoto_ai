import sharp from 'sharp';
/**
 * Analyzes the background image to find empty areas using edge detection.
 * Note: Using 'sharp' as a more portable alternative to native OpenCV in this environment,
 * but following the logic requested (Grayscale -> Canny/Edge -> Grid -> Density).
 */
export const analyzeImage = async (imagePath) => {
    const image = sharp(imagePath);
    const metadata = await image.metadata();
    const { width, height } = metadata;
    // Perform edge detection using sharp's canny-like edge operator
    // We'll use a Sobel operator which is similar for density analysis
    const edgeBuffer = await image
        .greyscale()
        .convolve({
        width: 3,
        height: 3,
        kernel: [-1, -1, -1, -1, 8, -1, -1, -1, -1]
    })
        .raw()
        .toBuffer();
    const cols = 12;
    const rows = 20;
    const cellW = Math.floor(width / cols);
    const cellH = Math.floor(height / rows);
    const grid = [];
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            let edgeSum = 0;
            const startX = c * cellW;
            const startY = r * cellH;
            for (let y = startY; y < startY + cellH; y++) {
                for (let x = startX; x < startX + cellW; x++) {
                    const idx = y * width + x;
                    edgeSum += edgeBuffer[idx] > 50 ? 1 : 0; // Threshold
                }
            }
            const density = edgeSum / (cellW * cellH);
            grid.push({
                x: startX,
                y: startY,
                width: cellW,
                height: cellH,
                density,
                isEmpty: density < 0.05 // Threshold for "empty"
            });
        }
    }
    return {
        width,
        height,
        grid
    };
};
