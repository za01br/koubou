import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function createDotPattern() {
    const dotSize = 2;
    const spacing = 30;

    const canvas = document.createElement("canvas");
    canvas.width = spacing;
    canvas.height = spacing;
    const ctx = canvas.getContext("2d")!;

    ctx.fillStyle = "transparent";
    ctx.fillRect(0, 0, spacing, spacing);

    ctx.fillStyle = "#e5e7eb";
    ctx.beginPath();
    ctx.arc(spacing / 2, spacing / 2, dotSize / 2, 0, 2 * Math.PI);
    ctx.fill();

    return canvas.toDataURL();
}

export function makePlaceholderSVGDataUrl(w = 700, h = 700) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}'>
    <rect width='100%' height='100%' fill='#f3f4f6'/>
    <circle cx='50%' cy='50%' r='30' fill='none' stroke='#9ca3af' stroke-width='4'>
      <animate attributeName='stroke-dasharray' dur='2s' values='0 188;94 94;0 188' repeatCount='indefinite'/>
      <animate attributeName='stroke-dashoffset' dur='2s' values='0;-94;-188' repeatCount='indefinite'/>
    </circle>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function dataUrlToBase64AndMime(dataUrl: string) {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.*)$/);
  if (!match) return null;
  return { mimeType: match[1], base64: match[2] };
}

export function generateId(prefix = "id") {
  return `${prefix}_${Date.now()}_${Math.round(Math.random() * 1000000)}`;
}
