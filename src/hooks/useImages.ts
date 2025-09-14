import { useState, useCallback, useEffect } from "react";
import type { CanvasImageData } from "@/lib/types";
import { generateId } from "@/lib/utils";

export function useImages() {
  const [images, setImages] = useState<CanvasImageData[]>([]);
  const [selectedImages, setSelectedImages] = useState<Set<string | number>>(
    new Set()
  );
  const [copiedImage, setCopiedImage] = useState<CanvasImageData | null>(null);

  const addImageToCanvas = useCallback(
    async (
      file: File,
      offsetIndex = 0,
      getCurrentCenterPosition: () => { x: number; y: number }
    ) => {
      return new Promise<void>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            const aspectRatio = img.width / img.height;
            const maxSize = 500;
            let width, height;

            if (img.width > img.height) {
              width = maxSize;
              height = maxSize / aspectRatio;
            } else {
              height = maxSize;
              width = maxSize * aspectRatio;
            }

            const center = getCurrentCenterPosition();

            const stackOffset = offsetIndex * 30;

            const newImage: CanvasImageData = {
              id: generateId("img"),
              src: e.target?.result as string,
              x: center.x - width / 2 + stackOffset,
              y: center.y - height / 2 + stackOffset,
              width,
              height,
            };

            setImages((prev) => [...prev, newImage]);
            resolve();
          };
          img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
      });
    },
    []
  );

  const handleImageSelect = (imageId: string | number, e?: any) => {
    const isCtrlKey = e?.evt.metaKey || e?.evt.ctrlKey;
    setSelectedImages((prev) => {
      const newSet = new Set(prev);
      if (isCtrlKey) {
        if (newSet.has(imageId)) {
          newSet.delete(imageId);
        } else {
          newSet.add(imageId);
        }
      } else {
        newSet.clear();
        newSet.add(imageId);
      }
      return newSet;
    });
  };

  const handleImageDragEnd = (imageId: string | number, e: any) => {
    const newPos = e.target.position();
    setImages((prev) =>
      prev.map((img) =>
        img.id === imageId ? { ...img, x: newPos.x, y: newPos.y } : img
      )
    );
  };

  const handleImageTransform = (imageId: string | number, e: any) => {
    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    node.scaleX(1);
    node.scaleY(1);

    setImages((prev) =>
      prev.map((img) =>
        img.id === imageId
          ? {
              ...img,
              x: node.x(),
              y: node.y(),
              width: Math.max(50, node.width() * scaleX),
              height: Math.max(50, node.height() * scaleY),
            }
          : img
      )
    );
  };

  const copySelectedImage = useCallback(() => {
    if (selectedImages.size === 1) {
      const selectedId = selectedImages.values().next().value;
      const imageToCopy = images.find((img) => img.id === selectedId);
      if (imageToCopy) {
        setCopiedImage(imageToCopy);
      }
    }
  }, [images, selectedImages]);

  const pasteCopiedImage = useCallback(() => {
    if (copiedImage) {
      const newImage: CanvasImageData = {
        ...copiedImage,
        id: generateId("img"),
        x: copiedImage.x + 20,
        y: copiedImage.y + 20,
      };
      setImages((prev) => [...prev, newImage]);
      setSelectedImages(new Set([newImage.id]));
    }
  }, [copiedImage]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName.toLocaleLowerCase() === "input")
        return;

      if (e.metaKey || e.ctrlKey) {
        if (e.key === "c") {
          copySelectedImage();
        } else if (e.key === "x") {
          copySelectedImage();
          if (selectedImages.size > 0) {
            setImages((prev) =>
              prev.filter((img) => !selectedImages.has(img.id))
            );
            setSelectedImages(new Set());
          }
        }
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedImages.size > 0) {
          e.preventDefault();
          setImages((prev) =>
            prev.filter((img) => !selectedImages.has(img.id))
          );
          setSelectedImages(new Set());
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedImages, copySelectedImage, setImages, setSelectedImages]);

  return {
    images,
    setImages,
    selectedImages,
    setSelectedImages,
    addImageToCanvas,
    handleImageSelect,
    handleImageDragEnd,
    handleImageTransform,
    pasteCopiedImage,
  };
}

