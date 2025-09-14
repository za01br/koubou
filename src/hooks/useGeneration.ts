import { useState, useMemo, useCallback, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { toast } from "sonner";
import type { CanvasImageData } from '@/lib/types';
import { generateId, makePlaceholderSVGDataUrl, dataUrlToBase64AndMime } from '@/lib/utils';
import { BillingErrorToast } from '@/components/canvas/BillingErrorToast';

export function useGeneration(apiKey: string, setConfigOpen: (open: boolean) => void, images: CanvasImageData[], setImages: (images: CanvasImageData[] | ((prev: CanvasImageData[]) => CanvasImageData[])) => void, getCurrentCenterPosition: () => { x: number; y: number }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [shouldBlur, setShouldBlur] = useState(false);
  const generationMapRef = useRef<Record<string, string | number>>({});

  const aiClient = useMemo(() => {
    if (!apiKey) return null;
    try {
      return new GoogleGenAI({ apiKey });
    } catch (err) {
      console.error("Failed to construct GoogleGenAI client:", err);
      return null;
    }
  }, [apiKey]);

  const callGenerateImage = useCallback(
    async (prompt: string, selectedIds: Set<string | number>) => {
      if (!aiClient) {
        setConfigOpen(true);
        console.warn("API key missing. Opened configuration.");
        return;
      }

      setIsGenerating(true);
      setShouldBlur(true);

      const placeholderId = generateId("placeholder");
      const placeholderSrc = makePlaceholderSVGDataUrl(500, 500);

      const center = getCurrentCenterPosition();
      const placeholderImage: CanvasImageData = {
        id: placeholderId,
        src: placeholderSrc,
        x: center.x - 250,
        y: center.y - 250,
        width: 500,
        height: 500,
        isPlaceholder: true,
        isGenerating: true,
      };

      setImages((prev) => [...prev, placeholderImage]);

      const requestId = generateId("genreq");
      generationMapRef.current[requestId] = placeholderId;

      try {
        let contents: any;
        if (selectedIds && selectedIds.size > 0) {
          const textPart = { text: prompt };
          const inlineParts: any[] = [];

          for (const id of selectedIds) {
            const srcImage = images.find((im) => im.id === id);
            if (!srcImage) continue;
            const parsed = dataUrlToBase64AndMime(srcImage.src);
            if (!parsed) {
              console.warn(
                "Skipping selected image - not a base64 data URL",
                id
              );
              continue;
            }
            inlineParts.push({
              inlineData: {
                mimeType: parsed.mimeType,
                data: parsed.base64,
              },
            });
          }

          contents = [textPart, ...inlineParts];
        } else {
          contents = { text: prompt };
        }

        const modelName = "gemini-2.5-flash-image-preview";
        const response = await aiClient.models.generateContent({
          model: modelName,
          contents,
        });

        const candidates = (response as any)?.candidates || [];
        if (
          !candidates ||
          candidates.length === 0 ||
          !candidates[0]?.content?.parts ||
          candidates[0].content.parts.length === 0
        ) {
          console.warn("No content returned from model", response);
          return;
        }

        const parts = candidates[0].content.parts;
        const imagePart = parts.find(
          (p: any) => p.inlineData && p.inlineData.data
        );
        if (!imagePart) {
          console.warn("No inlineData image part in response", parts);
          return;
        }

        const returnedBase64 = imagePart.inlineData.data;
        const returnedMime = imagePart.inlineData.mimeType || "image/png";

        const dataUrl = `data:${returnedMime};base64,${returnedBase64}`;

        const placeholderImageId = generationMapRef.current[requestId];

        const img = new Image();
        img.onload = () => {
          const aspectRatio = img.width / img.height;
          let width, height;
          const maxSize = 500;

          if (img.width > img.height) {
            width = maxSize;
            height = maxSize / aspectRatio;
          } else {
            height = maxSize;
            width = maxSize * aspectRatio;
          }

          setTimeout(() => {
            setImages((prev) =>
              prev.map((imgObj) =>
                imgObj.id === placeholderImageId
                  ? {
                      ...imgObj,
                      src: dataUrl,
                      width,
                      height,
                      x: center.x - width / 2,
                      y: center.y - height / 2,
                      isPlaceholder: false,
                      isGenerating: false,
                      generationRequestId: undefined,
                    }
                  : imgObj
              )
            );

            setTimeout(() => {
              setShouldBlur(false);
              setIsGenerating(false);
            }, 300);

            delete generationMapRef.current[requestId];
          }, 500);
        };

        img.onerror = (err) => {
          console.error("Failed to load returned image", err);
          setIsGenerating(false);
          setShouldBlur(false);
        };
        img.src = dataUrl;
      } catch (err) {
        console.error("Generation error:", err);
        if (err instanceof Error && err.message.includes("429")) {
          toast.error(BillingErrorToast());
        }
        setIsGenerating(false);
        setShouldBlur(false);
      }
    },
    [aiClient, images, getCurrentCenterPosition, setConfigOpen, setImages]
  );

  return { isGenerating, shouldBlur, callGenerateImage };
}
