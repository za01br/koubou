import { forwardRef } from "react";
import { Image as KonvaImage } from "react-konva";
import type { CanvasImageData } from "../../lib/types";
import { useImageFromSrc } from "@/hooks/useImageFromSrc";

export const CanvasImage = forwardRef<any, {
  imageData: CanvasImageData;
  isSelected: boolean;
  onSelect: (e: any) => void;
  onDragEnd: (e: any) => void;
  onTransform: (e: any) => void;
  onContextMenu: (e: any) => void;
}>(({ imageData, isSelected, onSelect, onDragEnd, onTransform, onContextMenu }, ref) => {
  const image = useImageFromSrc(imageData.src);

  return (
    <KonvaImage
      ref={ref}
      image={image}
      x={imageData.x}
      y={imageData.y}
      width={imageData.width}
      height={imageData.height}
      draggable
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={onDragEnd}
      onTransformEnd={onTransform}
      onContextMenu={onContextMenu}
      stroke={isSelected ? "#007AFF" : "transparent"}
      strokeWidth={isSelected ? 4 : 0}
    />
  );
});
