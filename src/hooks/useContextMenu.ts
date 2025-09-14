
import { useState } from "react";

export const useContextMenu = () => {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; onSave: () => void } | null>(null);

  const showContextMenu = (x: number, y: number, onSave: () => void) => {
    setContextMenu({ x, y, onSave });
  };

  const hideContextMenu = () => {
    setContextMenu(null);
  };

  return { contextMenu, showContextMenu, hideContextMenu };
};
