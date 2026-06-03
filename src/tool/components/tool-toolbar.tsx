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
  return (
    <nav
      className="vision-toolbar"
      aria-label="Simulation controls"
      style={{
        padding: "0.5rem",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: "0.5rem",
        justifyContent: "flex-end",
      }}
    >
      {!imageSrc ? (
        <UploadButton onExport={onExport} />
      ) : (
        <>
          <ConditionSelector
            activeCondition={activeCondition}
            onConditionChange={onConditionChange}
          />
          <IntensitySlider
            intensity={intensity}
            onIntensityChange={onIntensityChange}
          />
          <ExportButton onExport={onExport} />
        </>
      )}
    </nav>
  );
}

function UploadButton({ onExport }: { onExport?: () => void }) {
  return (
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
      }}
    >
      Upload Image
    </button>
  );
}

function ConditionSelector({
  activeCondition,
  onConditionChange,
}: {
  activeCondition: VisionCondition;
  onConditionChange?: (condition: VisionCondition) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Vision condition"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        margin: "0.5rem",
      }}
    >
      <label htmlFor="condition-select" style={{ fontSize: "0.75rem" }}>
        Condition:
      </label>
      <select
        id="condition-select"
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
  );
}

function IntensitySlider({
  intensity,
  onIntensityChange,
}: {
  intensity: number;
  onIntensityChange?: (value: number) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Intensity control"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        margin: "0.5rem",
      }}
    >
      <label htmlFor="intensity-slider" style={{ fontSize: "0.75rem" }}>
        Intensity: {intensity}%
      </label>
      <input
        id="intensity-slider"
        type="range"
        min="0"
        max="100"
        value={intensity}
        onChange={(e) => onIntensityChange?.(parseInt(e.target.value, 10))}
        style={{ flex: 1, minWidth: "6rem" }}
        aria-label="Filter intensity"
        aria-valuenow={intensity}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  );
}

function ExportButton({ onExport }: { onExport?: () => void }) {
  return (
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
  );
}