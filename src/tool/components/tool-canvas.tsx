"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import {
  visionFilters,
  colorMatrices,
  type VisionCondition,
} from "@/tool/types";

interface ToolCanvasProps {
  imageSrc?: string;
  activeCondition: string;
  intensity: number;
  showOriginal: boolean;
  canvasRef?: React.RefObject<HTMLDivElement | null>;
  onUpload?: (imageSrc: string) => void;
}

/**
 * Extract a display-friendly filename from a data URL or path.
 * Falls back to "Image loaded" when the source is a data URL.
 */
function getDisplayFilename(imageSrc?: string): string {
  if (!imageSrc) return "No image uploaded";
  if (imageSrc.startsWith("data:")) return "Image loaded";
  // Extract filename from path
  const parts = imageSrc.split("/");
  const last = parts[parts.length - 1] ?? "";
  return last || "Image loaded";
}

export function ToolCanvas({
  imageSrc,
  activeCondition,
  intensity,
  showOriginal,
  canvasRef,
  onUpload,
}: ToolCanvasProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const fileName = getDisplayFilename(imageSrc);

  const activeFilter = visionFilters.find(
    (f) => f.name === activeCondition,
  ) || {
    name: "normal" as VisionCondition,
    description: "",
    cssFilter: "none",
  };

  const isGlaucoma = activeCondition === "glaucoma";

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
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
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
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
      {/* SVG filter definitions for color-blindness simulation matrices */}
      <svg
        style={{ position: "absolute", width: 0, height: 0 }}
        aria-hidden="true"
      >
        <defs>
          {Object.entries(colorMatrices).map(([name, matrix]) => (
            <filter key={name} id={`${name}-matrix`}>
              <feColorMatrix
                type="matrix"
                values={matrix.map((row) => row.join(" ")).join(" ")}
              />
            </filter>
          ))}
        </defs>
      </svg>
      {/* Upload/View Toggle */}
      <div className="vision-header">
        {!imageSrc ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "1rem",
              minHeight: "16rem",
              padding: "3rem 2rem",
              borderRadius: "var(--radius)",
              border: isDragOver
                ? "2px dashed var(--accent)"
                : "2px dashed var(--border)",
              background: isDragOver ? "var(--accent-subtle)" : "var(--card)",
              transition:
                "background-color 0.15s ease, border-color 0.15s ease",
            }}
            className="upload-mode"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            aria-label="Upload image area. Drag and drop or click to browse files."
            role="region"
          >
            <div className="upload-instruction">
              <p style={{ textAlign: "center" }}>
                Drop a screenshot or design here to test accessibility
              </p>
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
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    document.getElementById("file-upload")?.click();
                  }
                }}
              >
                Browse files
              </label>
            </div>
            <div
              style={{
                fontSize: "0.75rem",
                color: "var(--muted)",
                textAlign: "center",
              }}
            >
              Supported: PNG, JPEG, WebP, GIF
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
              <Image
                src={imageSrc}
                alt={
                  showOriginal
                    ? "Original image (no filter)"
                    : `Uploaded image shown with ${activeFilter.description} simulation at ${intensity}% intensity`
                }
                width={1200}
                height={800}
                style={{
                  maxWidth: "100%",
                  maxHeight: "80vh",
                  objectFit: "contain",
                }}
                unoptimized
              />
              {/* Vision Filter Overlay — hidden when viewing original */}
              {!showOriginal &&
                (isGlaucoma ? (
                  <>
                    <div
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
                    className="vision-overlay"
                    style={{
                      position: "absolute",
                      inset: 0,
                      pointerEvents: "none",
                      filter: activeFilter.cssFilter,
                      opacity: intensity / 100,
                    }}
                  />
                ))}
            </div>

            {/* Info */}
            <div
              className="image-info"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span
                className="file-name"
                style={{ fontSize: "0.75rem", color: "var(--muted)" }}
              >
                {fileName}
              </span>
              <span
                style={{
                  fontSize: "0.6875rem",
                  color: showOriginal ? "var(--accent)" : "var(--muted)",
                }}
              >
                {showOriginal
                  ? "Original view (no filter)"
                  : `${activeFilter.description} — ${intensity}%`}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

ToolCanvas.displayName = "ToolCanvas";
