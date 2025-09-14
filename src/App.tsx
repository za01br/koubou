import React, { useState, useRef, useCallback, useEffect } from "react";
import { Stage, Layer, Rect, Transformer } from "react-konva";
import { Toaster, toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Minus, Mouse, Hand, Upload, Send, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { CanvasImage } from "@/components/canvas/CanvasImage";
import { ConfigDialog } from "@/components/canvas/ConfigDialog";
import { LoadingSpinner } from "@/components/canvas/LoadingSpinner";
import { ContextMenu } from "@/components/canvas/ContextMenu";
import { useStage } from "@/hooks/useStage";
import { useCanvas } from "@/hooks/useCanvas";
import { useImages } from "@/hooks/useImages";
import { useGeneration } from "@/hooks/useGeneration";
import { createDotPattern } from "@/lib/utils";

function App() {
  const [, setIsInputFocused] = useState(false);
  const [inputText, setInputText] = useState("");
  const [configOpen, setConfigOpen] = useState(true);
  const [activeConfigTab, setActiveConfigTab] = useState("about");
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem("apiKey") || "";
  });
  const [hasShownToast, setHasShownToast] = useState(false);

  useEffect(() => {
    if (apiKey) {
      localStorage.setItem("apiKey", apiKey);
    } else {
      localStorage.removeItem("apiKey");
    }
  }, [apiKey]);

  useEffect(() => {
    if (!configOpen && !hasShownToast) {
      toast(
        <div>
          Remember to download your images.
          <br />
          No data is stored by default.
        </div>,
        {
          action: {
            label: "Close",
            onClick: () => toast.dismiss(),
          },
        }
      );
      setHasShownToast(true);
    }
  }, [configOpen, hasShownToast]);


  const stageRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const trRef = useRef<any>(null);
  const imageRefs = useRef<Map<string | number, any>>(new Map());

  const {
    stagePos,
    setStagePos,
    stageScale,
    stageDimensions,
    resetZoom,
    handleWheel,
    handleZoom,
  } = useStage();

  const {
    images,
    setImages,
    selectedImages,
    setSelectedImages,
    addImageToCanvas,
    handleImageSelect,
    handleImageDragEnd,
    handleImageTransform,
  } = useImages();

  const getCurrentCenterPosition = useCallback(() => {
    return {
      x: (-stagePos.x + stageDimensions.width / 2) / stageScale,
      y: (-stagePos.y + stageDimensions.height / 2) / stageScale,
    };
  }, [
    stagePos.x,
    stagePos.y,
    stageScale,
    stageDimensions.width,
    stageDimensions.height,
  ]);

  const {
    tool,
    setTool,
    isSelecting,
    selectionRect,
    handleMouseMove,
    handleMouseUp,
    handleStageMouseDown,
    getCursor,
    contextMenu,
    handleContextMenu,
    hideContextMenu,
  } = useCanvas(stageRef, stagePos, stageScale, images, setSelectedImages);

  const { isGenerating, shouldBlur, callGenerateImage } = useGeneration(
    apiKey,
    setConfigOpen,
    images,
    setImages,
    getCurrentCenterPosition
  );

  useEffect(() => {
    if (trRef.current) {
      const selectedNodes = Array.from(selectedImages)
        .map((id) => imageRefs.current.get(id))
        .filter(Boolean);
      trRef.current.nodes(selectedNodes);
      trRef.current.getLayer().batchDraw();
    }
  }, [selectedImages]);

  const handleSendMessage = useCallback(async () => {
    const text = inputText.trim();
    if (!text) return;

    if (!apiKey) {
      setConfigOpen(true);
      return;
    }

    const selectedIds = new Set<string | number>(Array.from(selectedImages));
    setInputText("");
    await callGenerateImage(text, selectedIds);
  }, [inputText, selectedImages, apiKey, callGenerateImage]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith("image/")) {
        await addImageToCanvas(file, i, getCurrentCenterPosition);
      }
    }
    if (e.target) e.target.value = "";
  };

  const handleDragEnd = (e: any) => {
    if (tool === "hand") {
      setStagePos(e.currentTarget.position());
    }
  };

  const dotPattern = createDotPattern();
  const backgroundStyle: React.CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundImage: `url(${dotPattern})`,
    backgroundSize: `${30 * stageScale}px ${30 * stageScale}px`,
    backgroundPosition: `${stagePos.x % (30 * stageScale)}px ${
      stagePos.y % (30 * stageScale)
    }px`,
    pointerEvents: "none",
    zIndex: 0,
  };

  

  return (
    <div
      style={{
        overflow: "hidden",
        height: "100vh",
        width: "100vw",
        position: "relative",
      }}
      onMouseDown={hideContextMenu}
    >
      <Toaster position="top-center" />
      <img
        src="/logo.png"
        alt="Logo"
        style={{
          position: "fixed",
          top: "20px",
          left: "20px",
          zIndex: 1,
          width: "34px",
          cursor: "pointer",
        }}
        onClick={() => window.location.reload()}
      />

      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        multiple
        accept="image/*"
        onChange={handleFileUpload}
      />

      {isGenerating && <LoadingSpinner />}

      <div style={backgroundStyle} />

      <motion.div
        animate={{ filter: shouldBlur ? "blur(4px)" : "blur(0px)" }}
        transition={{ duration: 0.3 }}
        style={{ position: "relative", zIndex: 1 }}
      >
        <Stage
          ref={stageRef}
          width={stageDimensions.width}
          height={stageDimensions.height}
          x={stagePos.x}
          y={stagePos.y}
          scaleX={stageScale}
          scaleY={stageScale}
          draggable={tool === "hand"}
          onDragEnd={handleDragEnd}
          onWheel={handleWheel}
          onMouseDown={handleStageMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          style={{ cursor: getCursor() }}
        >
          <Layer>
            {images.map((image) => (
              <CanvasImage
                key={image.id}
                ref={(node) => {
                  if (node) {
                    imageRefs.current.set(image.id, node);
                  } else {
                    imageRefs.current.delete(image.id);
                  }
                }}
                imageData={image}
                isSelected={selectedImages.has(image.id)}
                onSelect={(e: any) => handleImageSelect(image.id, e)}
                onDragEnd={(e: any) => handleImageDragEnd(image.id, e)}
                onTransform={(e: any) => handleImageTransform(image.id, e)}
                onContextMenu={(e: any) => handleContextMenu(e, image)}
              />
            ))}

            <Transformer
              ref={trRef}
              boundBoxFunc={(oldBox, newBox) => {
                if (newBox.width < 50 || newBox.height < 50) {
                  return oldBox;
                }
                return newBox;
              }}
            />

            {isSelecting && (
              <Rect
                x={selectionRect.x}
                y={selectionRect.y}
                width={selectionRect.width}
                height={selectionRect.height}
                fill="rgba(0, 162, 255, 0.1)"
                stroke="#00a2ff"
                strokeWidth={1 / stageScale}
                dash={[5 / stageScale, 5 / stageScale]}
              />
            )}
          </Layer>
        </Stage>
      </motion.div>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onSave={contextMenu.onSave}
        />
      )}

      <ConfigDialog
        open={configOpen}
        onOpenChange={setConfigOpen}
        activeTab={activeConfigTab}
        setActiveTab={setActiveConfigTab}
        apiKey={apiKey}
        setApiKey={setApiKey}
      />

      <div
        className="fixed bottom-20 left-1/2 transform -translate-x-1/2 flex items-center gap-2"
        style={{ zIndex: 10 }}
      >
        <div className="flex items-center bg-white border border-gray-200 rounded-lg shadow-sm">
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyPress}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
            placeholder="What do you want to create?"
            className="border-0 focus:ring-2 min-w-[300px]"
            disabled={isGenerating}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => void handleSendMessage()}
            className="h-10 w-10 rounded-r-lg rounded-l-none cursor-pointer"
            disabled={isGenerating}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div
        className="fixed bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-4"
        style={{ zIndex: 10 }}
      >
        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
          <Button
            variant={tool === "mouse" ? "default" : "ghost"}
            size="icon"
            onClick={() => setTool("mouse")}
            className="h-8 w-8 cursor-pointer"
          >
            <Mouse className="h-4 w-4" />
          </Button>
          <Button
            variant={tool === "hand" ? "default" : "ghost"}
            size="icon"
            onClick={() => setTool("hand")}
            className="h-8 w-8 cursor-pointer"
          >
            <Hand className="h-4 w-4" />
          </Button>
          <div className="w-px h-6 bg-gray-200 mx-1" />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            className="h-8 w-8 cursor-pointer"
          >
            <Upload className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setConfigOpen(true)}
            className="h-8 w-8 cursor-pointer"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleZoom("out")}
            className="h-8 w-8 cursor-pointer"
          >
            <Minus className="h-4 w-4" />
          </Button>

          <button
            onClick={resetZoom}
            className="min-w-[60px] text-center text-sm font-medium text-gray-700 px-2 hover:bg-gray-100 rounded cursor-pointer transition-colors"
          >
            {Math.round(stageScale * 100)}%
          </button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleZoom("in")}
            className="h-8 w-8 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default App;
