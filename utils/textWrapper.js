/**
 * Utility for wrapping text into multiple lines for SVG rendering.
 */
export const wrapText = (text, maxCharsPerLine) => {
  const words = text?.split(' ');
  const lines = [];
  let currentLine = '';

  words?.forEach(word => {
    if ((currentLine + word).length <= maxCharsPerLine) {
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  });
  
  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
};

/**
 * Estimates the height of a text block based on font size and line count.
 */
export const estimateBlockHeight = (lines, fontSize, spacing = 1.2) => {
  return lines.length * fontSize * spacing;
};
