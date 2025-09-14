import { useState, useCallback, useEffect } from 'react';

export function useStage() {
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [stageScale, setStageScale] = useState(1);
  const [stageDimensions, setStageDimensions] = useState({ width: 0, height: 0 });

  const resetZoom = useCallback(() => {
    const center = {
      x: stageDimensions.width / 2,
      y: stageDimensions.height / 2,
    };

    const currentCenter = {
        x: (-stagePos.x + stageDimensions.width / 2) / stageScale,
        y: (-stagePos.y + stageDimensions.height / 2) / stageScale,
      };

    setStageScale(1);
    setStagePos({
      x: center.x - currentCenter.x,
      y: center.y - currentCenter.y,
    });
  }, [stageDimensions, stagePos, stageScale]);

  const handleWheel = (e: any) => {
    e.evt.preventDefault();

    const stage = e.target.getStage();
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const scaleBy = 1.1;
    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
    const clampedScale = Math.max(0.1, Math.min(5, newScale));

    setStageScale(clampedScale);

    const newPos = {
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale,
    };

    setStagePos(newPos);
  };

  const handleZoom = (direction: "in" | "out") => {
    const oldScale = stageScale;
    const center = {
      x: stageDimensions.width / 2,
      y: stageDimensions.height / 2,
    };

    const mousePointTo = {
      x: (center.x - stagePos.x) / oldScale,
      y: (center.y - stagePos.y) / oldScale,
    };

    const scaleBy = 1.2;
    const newScale =
      direction === "in" ? oldScale * scaleBy : oldScale / scaleBy;
    const clampedScale = Math.max(0.1, Math.min(5, newScale));

    setStageScale(clampedScale);

    const newPos = {
      x: center.x - mousePointTo.x * clampedScale,
      y: center.y - mousePointTo.y * clampedScale,
    };

    setStagePos(newPos);
  };

  useEffect(() => {
    const updateSize = () => {
      setStageDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return {
    stagePos,
    setStagePos,
    stageScale,
    setStageScale,
    stageDimensions,
    resetZoom,
    handleWheel,
    handleZoom,
  };
}
