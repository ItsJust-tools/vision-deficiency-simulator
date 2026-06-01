"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { visionFilters, type VisionCondition } from "@/tool/types";

interface ToolCanvasProps {
  imageSrc?: string;
  activeCondition: string;
  intensity: number;
  canvasRef?: React.RefObject<HTMLDivElement | null>;
  onUpload?: (imageSrc: string) => void;
}

export function ToolCanvas({
  imageSrc,
  activeCondition,
  intensity,
  canvasRef,
  onUpload,
}: ToolCanvasProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [fileName, setFileName] = useState("");

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (imageSrc) {
      setFileName("uploaded-image");
    } else {
      setFileName("No image uploaded");
    }
  }, [imageSrc]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const activeFilter = visionFilters.find(
    (f) => f.name === activeCondition,
  ) || { name: "normal" as VisionCondition, description: "", cssFilter: "none" };

  const isGlaucoma = activeCondition === "glaucoma";

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setFileName(file.name);
            onUpload?.(event.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      }
    },
    [onUpload],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setFileName(file.name);
            onUpload?.(event.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      }
    },
    [onUpload],
  );

  return (
    <div
      ref={canvasRef}
      className="vision-canvas"
      role="application"
      aria-label="Vision Deficiency Simulator"
    >
      {/* Upload/View Toggle */}
      <div className="vision-header">
        {!imageSrc ? (
          <div className="upload-mode">
            <div className="upload-instruction">
              <p>Drag & drop an image here, or</p>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                style={{ display: "none" }}
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                style={{
                  padding: "0.75rem 1.5rem",
                  background: "var(--accent)",
                  color: "#fff",
                  cursor: "pointer",
                  borderRadius: "var(--radius)",
                  fontWeight: 500,
                  display: "inline-block",
                }}
              >
                Browse files
              </label>
            </div>
          </div>
        ) : (
          <>
            {/* Image Display with Overlay */}
            <div
              className="image-container"
              style={{
                position: "relative",
                maxWidth: "100%",
                maxHeight: "80vh",
                overflow: "hidden",
              }}
            >
              <img
                src={imageSrc}
                alt="Uploaded image"
                style={{
                  maxWidth: "100%",
                  maxHeight: "80vh",
                  objectFit: "contain",
                }}
              />
              {/* Vision Filter Overlay */}
              {isGlaucoma ? (
                <>
                  <div
                    ref={overlayRef}
                    className="vision-overlay"
                    style={{
                      position: "absolute",
                      inset: 0,
                      pointerEvents: "none",
                      filter: activeFilter.cssFilter,
                      opacity: intensity / 100,
                    }}
                  />
                  <div
                    className="glaucoma-overlay"
                    style={{
                      position: "absolute",
                      inset: 0,
                      pointerEvents: "none",
                      background: `radial-gradient(circle at center, transparent ${100 - intensity}%, rgba(0,0,0,0.85) 100%)`,
                      opacity: intensity / 100,
                    }}
                  />
                </>
              ) : (
                <div
                  ref={overlayRef}
                  className="vision-overlay"
                  style={{
                    position: "absolute",
                    inset: 0,
                    pointerEvents: "none",
                    filter: activeFilter.cssFilter,
                    opacity: intensity / 100,
                  }}
                />
              )}
            </div>

            {/* Info */}
            <div className="image-info">
              <span className="file-name">{fileName}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}