/**
 * Merges empty grid cells into the largest possible rectangle.
 */
export const detectSafeZone = (analysis) => {
  const { width, height, grid } = analysis;
  const cols = 12;
  const rows = 20;

  // Simple heuristic: find the largest contiguous block of empty cells in the center
  // For a production system, this would use a more complex "maximal rectangle" algorithm.
  
  let maxRect = { x: 0, y: 0, width: 0, height: 0, area: 0 };

  // Focus on center-ish areas first
  for (let rStart = 2; rStart < rows - 2; rStart++) {
    for (let cStart = 2; cStart < cols - 2; cStart++) {
      for (let rEnd = rStart; rEnd < rows - 2; rEnd++) {
        for (let cEnd = cStart; cEnd < cols - 2; cEnd++) {
          
          let allEmpty = true;
          for (let r = rStart; r <= rEnd; r++) {
            for (let c = cStart; c <= cEnd; c++) {
              if (!grid[r * cols + c].isEmpty) {
                allEmpty = false;
                break;
              }
            }
            if (!allEmpty) break;
          }

          if (allEmpty) {
            const rectW = (cEnd - cStart + 1) * grid[0].width;
            const rectH = (rEnd - rStart + 1) * grid[0].height;
            const area = rectW * rectH;

            if (area > maxRect.area) {
              maxRect = {
                x: cStart * grid[0].width,
                y: rStart * grid[0].height,
                width: rectW,
                height: rectH,
                area
              };
            }
          }
        }
      }
    }
  }

  // Fallback if no safe zone found or if it's too small (less than 20% of the image area)
  const minRequiredArea = width * height * 0.2;
  if (maxRect.area < minRequiredArea) {
    return {
      x: width * 0.15,
      y: height * 0.15,
      width: width * 0.7,
      height: height * 0.7
    };
  }

  return {
    x: maxRect.x,
    y: maxRect.y,
    width: maxRect.width,
    height: maxRect.height
  };
};
