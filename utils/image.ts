
const TARGET_WIDTH = 28;
const TARGET_HEIGHT = 28;

/**
 * Preprocesses the image from a source canvas to a 28x28 grayscale,
 * centered, and inverted image, returning it as a base64 encoded PNG.
 * This format mimics the MNIST dataset.
 *
 * @param sourceCanvas The HTMLCanvasElement containing the user's drawing.
 * @returns A base64 encoded string of the processed PNG image.
 */
export function preprocessCanvasImage(sourceCanvas: HTMLCanvasElement): string {
  const sourceCtx = sourceCanvas.getContext('2d', { willReadFrequently: true });
  if (!sourceCtx) {
    throw new Error('Could not get 2D context from source canvas');
  }

  // Find bounding box of the drawing
  const imageData = sourceCtx.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);
  const data = imageData.data;
  let minX = sourceCanvas.width, minY = sourceCanvas.height, maxX = -1, maxY = -1;

  for (let y = 0; y < sourceCanvas.height; y++) {
    for (let x = 0; x < sourceCanvas.width; x++) {
      const alpha = data[(y * sourceCanvas.width + x) * 4 + 3];
      if (alpha > 0) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  if (maxX === -1) { // Canvas is empty
    return '';
  }

  // Add some padding to the bounding box
  const padding = 20;
  minX = Math.max(0, minX - padding);
  minY = Math.max(0, minY - padding);
  maxX = Math.min(sourceCanvas.width, maxX + padding);
  maxY = Math.min(sourceCanvas.height, maxY + padding);

  const digitWidth = maxX - minX;
  const digitHeight = maxY - minY;

  // Create a temporary canvas to hold the centered and scaled digit
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = TARGET_WIDTH;
  tempCanvas.height = TARGET_HEIGHT;
  const tempCtx = tempCanvas.getContext('2d');
  if (!tempCtx) {
    throw new Error('Could not get 2D context from temporary canvas');
  }

  // Clear with black background (as MNIST)
  tempCtx.fillStyle = 'black';
  tempCtx.fillRect(0, 0, TARGET_WIDTH, TARGET_HEIGHT);

  // Calculate scaling factor to fit the digit into a 20x20 box inside the 28x28 canvas
  const scale = Math.min((TARGET_WIDTH - 8) / digitWidth, (TARGET_HEIGHT - 8) / digitHeight);
  const scaledWidth = digitWidth * scale;
  const scaledHeight = digitHeight * scale;

  // Center the digit
  const dx = (TARGET_WIDTH - scaledWidth) / 2;
  const dy = (TARGET_HEIGHT - scaledHeight) / 2;

  // Draw the cropped and scaled digit onto the temp canvas
  // This will make the digit white on a black background
  tempCtx.drawImage(
    sourceCanvas,
    minX, minY, digitWidth, digitHeight,
    dx, dy, scaledWidth, scaledHeight
  );

  // The output is already a white digit on a black background, perfect for the model.
  // Return the data as a base64 PNG string
  return tempCanvas.toDataURL('image/png').split(',')[1];
}
