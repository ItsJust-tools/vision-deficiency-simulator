/**
 * useFileUpload — shared file upload hook for the Vision Deficiency Simulator
 *
 * Extracts the common FileReader logic used in both the canvas and toolbar
 * upload components into a single reusable hook.
 */

import { useCallback, useRef } from "react";

export function useFileUpload(onUpload?: (imageSrc: string) => void) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const readFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onUpload?.(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    },
    [onUpload],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        readFile(file);
      }
      e.target.value = "";
    },
    [readFile],
  );

  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return { fileInputRef, readFile, handleFileChange, openFileDialog };
}
