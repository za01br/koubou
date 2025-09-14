import useImage from "use-image";

export function useImageFromSrc(src: string | undefined | null) {
  const [image] = useImage(src || "");
  return image;
}
