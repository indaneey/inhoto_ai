/**
 * Renders the layout into an SVG string.
 */
export const renderSVG = (layout, canvasWidth = 1024, canvasHeight = 1024) => {
    let svg = `<svg width="100%" height="100%" viewBox="0 0 ${canvasWidth} ${canvasHeight}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">`;
    const localFonts = [
        "Amelina Script", "Brittany Signature", "White Angelica", "Adelio Darmanto", "Halimun",
        "Bodoni* 06pt", "Abeganshi", "Elsie", "Poppins Light", "Poppins Black",
        "Gilroy Light", "Gilroy ExtraBold", "Bebas Neue", "Aero", "Burbank Big Cd Bd",
        "Mega Surprise", "Dry Brush", "Carnivalee Freakshow", "Akira Expanded", "Road Rage"
    ];
    // Extract unique fonts to import (only those not in localFonts)
    const fonts = [...new Set(layout.blocks.map(b => b.style.font))];
    const externalFonts = fonts.filter(f => !localFonts.includes(f));
    if (externalFonts.length > 0) {
        const fontImports = externalFonts.map(f => `family=${f.replace(/ /g, '+')}`).join('&');
        svg += `<defs>
      <style type="text/css">
        @import url('https://fonts.googleapis.com/css2?${fontImports}&display=swap');
      </style>
    </defs>`;
    }
    layout.blocks.forEach(block => {
        const { x, y, style, lines, textAnchor } = block;
        const fontSize = style.size;
        const lineHeight = fontSize * (style.spacing || 1.2);
        // Calculate total visual height for centering
        // (lines.length - 1) * spacing + 1 * height
        const totalHeight = lines.length > 0 ? (lines.length - 1) * lineHeight + fontSize : 0;
        // SVG text baselines start at the bottom of the line.
        // To center vertically, we offset the start Y by half the total height
        // and add ~80% of font size for the first baseline (cap-height approximation).
        const startY = y - (totalHeight / 2) + (fontSize * 0.8);
        svg += `<text x="${x}" y="${startY}" width="${block.width}" height="${block.height}" text-anchor="${textAnchor || 'middle'}" originX="${block.origin?.x}" originY="${block.origin?.y}" textAlign="${block.alignment || block.textAlign || 'center'}" font-family="${style.font}" font-size="${fontSize}" fill="${style.color || '#000'}" ${style.italic ? 'font-style="italic"' : ''}>`;
        lines.forEach((line, index) => {
            svg += `<tspan x="${x}" dy="${index === 0 ? 0 : lineHeight}">${escapeHtml(line)}</tspan>`;
        });
        svg += `</text>`;
        // Add decorative divider if it's a title or names block
        if (block.type === 'title' || block.type === 'names') {
            // The block height now includes 20px for the divider, so we place it 10px above the bottom
            const dividerY = y + block.height - 10;
            let x1, x2;
            if (textAnchor === 'start') {
                x1 = x;
                x2 = x + 200;
            }
            else if (textAnchor === 'end') {
                x1 = x - 200;
                x2 = x;
            }
            else {
                x1 = x - 100;
                x2 = x + 100;
            }
            svg += `<line x1="${x1}" y1="${dividerY}" x2="${x2}" y2="${dividerY}" stroke="${style.color}" stroke-width="2" opacity="0.3" />`;
        }
    });
    svg += `</svg>`;
    return svg;
};
function escapeHtml(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
