export type CanvasImageData = {
  id: string | number;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isPlaceholder?: boolean;
  generationRequestId?: string;
  isGenerating?: boolean;
};
