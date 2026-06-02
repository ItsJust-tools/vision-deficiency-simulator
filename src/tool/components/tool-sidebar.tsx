"use client";

import { visionFilters } from "@/tool/types";

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
  const activeFilter = visionFilters.find((f) => f.name === activeCondition);

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
        </div>
      )}

      {/* Condition Info */}
      {imageSrc && activeFilter && (
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
              <span style={{ fontWeight: 600 }}>
                {activeFilter.description}
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
