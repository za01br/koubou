import React from "react";
import { Download } from "lucide-react";

interface ContextMenuProps {
  x: number;
  y: number;
  onSave: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, onSave }) => {
  return (
    <div
      style={{
        position: "absolute",
        top: y,
        left: x,
        backgroundColor: "white",
        border: "1px solid #ccc",
        borderRadius: "4px",
        padding: "4px",
        zIndex: 1000,
      }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <button
        onClick={onSave}
        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 px-3 py-1.5 hover:bg-gray-100 w-full text-left cursor-pointer"
      >
        <Download className="h-4 w-4" />
        Download
      </button>
    </div>
  );
};
