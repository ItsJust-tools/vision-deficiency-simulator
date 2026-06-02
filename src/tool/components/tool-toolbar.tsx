"use client";

import { useCallback } from "react";
import type { VisionCondition } from "@/tool/types";
import { visionFilters } from "@/tool/types";

interface ToolToolbarProps {
  onExport?: () => void;
  imageSrc?: string;
  activeCondition: VisionCondition;
  intensity: number;
  onConditionChange?: (condition: VisionCondition) => void;
  onIntensityChange?: (value: number) => void;
}

export function ToolToolbar({
  onExport,
  imageSrc,
  activeCondition,
  intensity,
  onConditionChange,
  onIntensityChange,
}: ToolToolbarProps) {
  const actions = useCallback(() => {
    return (
      <>
        {/* View Toggle */}
        {!imageSrc ? (
          <button
            type="button"
            onClick={onExport}
            aria-label="Upload image"
            style={{
              fontSize: "0.8125rem",
              fontWeight: 500,
              padding: "0.375rem 0.75rem",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              background: "var(--card)",
              color: "var(--foreground)",
              cursor: "pointer",
              fontFamily: "inherit",
              marginRight: "0.5rem",
            }}
          >
            Upload Image
          </button>
        ) : (
          <>
            {/* Condition Selector */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                margin: "0.5rem",
              }}
            >
              <label style={{ fontSize: "0.75rem" }}>Condition:</label>
              <select
                value={activeCondition}
                onChange={(e) =>
                  onConditionChange?.(e.target.value as VisionCondition)
                }
                style={{
                  padding: "0.375rem 0.5rem",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                  background: "var(--card)",
                  color: "var(--foreground)",
                  fontSize: "0.75rem",
                  minWidth: "14rem",
                }}
                aria-label="Select vision condition"
              >
                {visionFilters.map((f) => (
                  <option key={f.name} value={f.name}>
                    {f.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Intensity Slider */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                margin: "0.5rem",
              }}
            >
              <label style={{ fontSize: "0.75rem" }}>
                Intensity: {intensity}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={intensity}
                onChange={(e) => onIntensityChange?.(parseInt(e.target.value))}
                style={{ flex: 1 }}
                aria-label="Filter intensity"
              />
            </div>

            {/* Download Button */}
            <button
              type="button"
              onClick={onExport}
              aria-label="Export simulation results"
              style={{
                fontSize: "0.8125rem",
                fontWeight: 500,
                padding: "0.375rem 0.75rem",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                background: "var(--card)",
                color: "var(--foreground)",
                cursor: "pointer",
                fontFamily: "inherit",
                display: "flex",
                alignItems: "center",
                gap: "0.375rem",
              }}
            >
              Download Image
            </button>
          </>
        )}
      </>
    );
  }, [
    onExport,
    imageSrc,
    activeCondition,
    intensity,
    onConditionChange,
    onIntensityChange,
  ]);

  return (
    <div
      className="vision-toolbar"
      style={{ padding: "0.5rem", display: "flex", justifyContent: "flex-end" }}
    >
      {actions()}
    </div>
  );
}
