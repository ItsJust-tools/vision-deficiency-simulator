"use client";

import { useCallback, useRef } from "react";
import type { VisionCondition } from "@/tool/types";
import { visionFilters } from "@/tool/types";

interface ToolToolbarProps {
  onExport?: () => void;
  onUpload?: (imageSrc: string) => void;
  imageSrc?: string;
  activeCondition: VisionCondition;
  intensity: number;
  showOriginal: boolean;
  onConditionChange?: (condition: VisionCondition) => void;
  onIntensityChange?: (value: number) => void;
  onReset?: () => void;
  onToggleOriginal?: () => void;
}

export function ToolToolbar({
  onExport,
  onUpload,
  imageSrc,
  activeCondition,
  intensity,
  showOriginal,
  onConditionChange,
  onIntensityChange,
  onReset,
  onToggleOriginal,
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
        <UploadButton onUpload={onUpload} />
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
          <CompareButton
            showOriginal={showOriginal}
            onToggle={onToggleOriginal}
          />
          <ExportButton onExport={onExport} />
          <ResetButton onReset={onReset} />
        </>
      )}
    </nav>
  );
}

function UploadButton({ onUpload }: { onUpload?: (imageSrc: string) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(
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
      // Reset input so re-selecting the same file triggers onChange
      e.target.value = "";
    },
    [onUpload],
  );

  return (
    <>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        ref={fileInputRef}
        style={{ display: "none" }}
        id="toolbar-file-upload"
        aria-hidden="true"
      />
      <label
        htmlFor="toolbar-file-upload"
        tabIndex={0}
        role="button"
        aria-label="Upload image to simulate vision deficiencies"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            fileInputRef.current?.click();
          }
        }}
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
          display: "inline-block",
          userSelect: "none",
        }}
      >
        Upload Image
      </label>
    </>
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
        onChange={(e) => onConditionChange?.(e.target.value as VisionCondition)}
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

function CompareButton({
  showOriginal,
  onToggle,
}: {
  showOriginal: boolean;
  onToggle?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={showOriginal ? "Show simulated view" : "Show original image for comparison"}
      aria-pressed={showOriginal}
      title="Toggle original view (Ctrl+Shift+O)"
      style={{
        fontSize: "0.8125rem",
        fontWeight: 500,
        padding: "0.375rem 0.75rem",
        border: showOriginal
          ? "2px solid var(--accent)"
          : "1px solid var(--border)",
        borderRadius: "var(--radius)",
        background: showOriginal ? "var(--accent-subtle)" : "var(--card)",
        color: showOriginal ? "var(--accent)" : "var(--foreground)",
        cursor: "pointer",
        fontFamily: "inherit",
        display: "flex",
        alignItems: "center",
        gap: "0.375rem",
        transition: "all 0.15s ease",
      }}
    >
      {showOriginal ? "🔍 Original" : "👁️ Compare"}
    </button>
  );
}

function ResetButton({ onReset }: { onReset?: () => void }) {
  return (
    <button
      type="button"
      onClick={onReset}
      aria-label="Upload a new image"
      title="Upload a new image"
      style={{
        fontSize: "0.8125rem",
        fontWeight: 500,
        padding: "0.375rem 0.75rem",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        background: "transparent",
        color: "var(--muted)",
        cursor: "pointer",
        fontFamily: "inherit",
        display: "flex",
        alignItems: "center",
        gap: "0.375rem",
        opacity: 0.8,
        transition: "opacity 0.15s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.8")}
    >
      ✕ New image
    </button>
  );
}
