import blockStyles from '../styles/blockStyles.json' with { type: 'json' };
import { wrapText, estimateBlockHeight } from '../utils/textWrapper.js';
import { calculateVerticalDistribution } from '../utils/layoutMath.js';
/**
 * Engine to calculate positions and styles for all content blocks.
 */
export const generateLayout = (safeZone, blocks) => {
    console.log('generateLayout called with blocks:', blocks);
    const processedBlocks = blocks.map(block => {
        // 1. Determine style from block info (AI provided) or fallbacks
        const baseStyle = blockStyles[block.type] || blockStyles.family || { size: 24, font: 'Montserrat', color: '#1a1a1a', spacing: 1.2 };
        // Prioritize AI provided values
        const fontSize = block.fontSize || baseStyle.size;
        const fontFamily = block.fontFamily || baseStyle.font;
        const color = block.color || baseStyle.color;
        const style = {
            ...baseStyle,
            size: fontSize,
            font: fontFamily,
            color: color,
            spacing: baseStyle.spacing || 1.2
        };
        // 2. Wrap text
        // 0.5 is a rough estimate for average character width to font size ratio
        const maxChars = Math.max(10, Math.floor(safeZone.width / (style.size * 0.5)));
        const lines = wrapText(block.content || block.text, maxChars);
        // Improved height estimation: (N-1) intervals + 1 font height
        const lineHeight = style.size * style.spacing;
        const height = lines.length > 0 ? (lines.length - 1) * lineHeight + style.size : 0;
        // 3. Map alignment to SVG text-anchor
        let textAnchor = "middle";
        if (block.alignment === 'left')
            textAnchor = "start";
        else if (block.alignment === 'right')
            textAnchor = "end";
        return {
            ...block,
            style,
            lines,
            height,
            textAnchor,
            // Ensure X/Y are within safeZone or use center as fallback
            x: block.x || block.position?.x || (safeZone.x + safeZone.width / 2),
            y: block.y || block.position?.y || (safeZone.y + safeZone.height / 2)
        };
    });
    return {
        safeZone,
        blocks: processedBlocks,
        totalHeight: processedBlocks.reduce((sum, b) => sum + b.height, 0)
    };
};
