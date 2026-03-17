/**
 * Mathematical utilities for layout calculations.
 */
export const calculateVerticalDistribution = (safeZone, totalContentHeight, blockCount) => {
  const availableSpace = safeZone.height - totalContentHeight;
  const spacing = Math.max(10, blockCount > 1 ? availableSpace / (blockCount + 1) : availableSpace / 2);
  
  return {
    startPadding: spacing,
    interBlockSpacing: spacing
  };
};

export const getCenterPoint = (safeZone) => {
  return {
    x: safeZone.x + safeZone.width / 2,
    y: safeZone.y + safeZone.height / 2
  };
};
