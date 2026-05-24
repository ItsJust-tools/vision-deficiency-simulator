"use client";

import { useCallback } from "react";

interface ToolSidebarProps {
  imageSrc?: string;
  activeCondition: string;
  intensity: number;
}

export function ToolSidebar({
  imageSrc,
  activeCondition,
  intensity,
}: ToolSidebarProps) {
  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            // Update state would go here
          }
        };
        reader.readAsDataURL(file);
      }
    },
    [],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          // Update state would go here
        }
      };
      reader.readAsDataURL(file);
    }
  }, []);

  return (
    <div className="vision-sidebar">
      {/* Upload Section */}
      {!imageSrc && (
        <div className="sidebar-section">
          <h3>Upload Image</h3>
          <p
            style={{
              fontSize: "0.6875rem",
              color: "var(--muted)",
              marginBottom: "0.75rem",
            }}
          >
            Drag and drop an image or click to browse
          </p>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            style={{ display: "none" }}
            id="sidebar-file-upload"
          />
          <label
            htmlFor="sidebar-file-upload"
            style={{
              padding: "0.75rem 1rem",
              border: "1px dashed var(--border)",
              borderRadius: "var(--radius)",
              background: "var(--card)",
              color: "var(--muted)",
              cursor: "pointer",
              width: "100%",
              textAlign: "center",
            }}
          >
            Click to upload
          </label>
        </div>
      )}

      {/* Condition Info */}
      {imageSrc && (
        <div className="sidebar-section">
          <h3>Current Condition</h3>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.75rem",
              background: "var(--card)",
              borderRadius: "var(--radius)",
              marginBottom: "0.5rem",
            }}
          >
            <span style={{ fontSize: "2rem" }}>👁️</span>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontWeight: 600 }}>{activeCondition}</span>
              <span style={{ fontSize: "0.6875rem", color: "var(--muted)" }}>
                {[
                  "normal",
                  "protanopia",
                  "deuteranopia",
                  "tritanopia",
                  "achromatopsia",
                  "cataracts",
                  "glaucoma",
                  "diabetic-retinopathy",
                ]
                  .find((c) => c === activeCondition)
                  ?.replace("-", " ")}
              </span>
            </div>
          </div>

          {/* Intensity */}
          <div style={{ marginBottom: "0.5rem" }}>
            <label
              style={{
                fontSize: "0.75rem",
                display: "block",
                marginBottom: "0.375rem",
              }}
            >
              Simulation Intensity: {intensity}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={intensity}
              onChange={(e) => {}}
              style={{ width: "100%" }}
              aria-label="Simulation intensity"
            />
          </div>
        </div>
      )}

      {/* WCAG Guidelines */}
      <div className="sidebar-section">
        <h3>WCAG Guidelines</h3>
        <div
          style={{
            fontSize: "0.6875rem",
            color: "var(--muted)",
            lineHeight: "1.6",
          }}
        >
          <div style={{ marginBottom: "0.25rem" }}>
            <strong>Normal vision:</strong> All content accessible
          </div>
          <div style={{ marginBottom: "0.25rem" }}>
            <strong>Color blindness:</strong> Test color combinations
          </div>
          <div>
            <strong>Recommended:</strong> Use non-color differentiation
            (patterns, text labels)
          </div>
        </div>
      </div>
    </div>
  );
}
