"use client";

import {
  visionFilters,
  conditionDescriptions,
  type VisionCondition,
} from "@/tool/types";

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
  const hasImage = Boolean(imageSrc);

  return (
    <div className="vision-sidebar">
      {/* Upload Section - shown when no image loaded */}
      {!hasImage && (
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
          <div
            style={{
              padding: "1rem",
              background: "var(--accent-subtle)",
              borderRadius: "var(--radius)",
              fontSize: "0.6875rem",
              color: "var(--muted)",
              lineHeight: "1.5",
            }}
          >
            <strong style={{ color: "var(--foreground)" }}>
              Supported formats:
            </strong>{" "}
            PNG, JPEG, WebP, GIF
          </div>
        </div>
      )}

      {/* Current Simulation Info */}
      {hasImage && activeFilter && (
        <div className="sidebar-section">
          <h3>Current Simulation</h3>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.75rem",
              background: "var(--card)",
              borderRadius: "var(--radius)",
              marginBottom: "0.75rem",
              border: "1px solid var(--border)",
            }}
          >
            <span style={{ fontSize: "2rem" }}>👁️</span>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.125rem",
              }}
            >
              <span style={{ fontWeight: 600, fontSize: "0.8125rem" }}>
                {activeFilter.description}
              </span>
              <span style={{ fontSize: "0.6875rem", color: "var(--muted)" }}>
                Intensity: {intensity}%
              </span>
            </div>
          </div>

          {/* Condition Details */}
          <div
            style={{
              fontSize: "0.6875rem",
              color: "var(--muted)",
              lineHeight: "1.6",
              padding: "0.5rem 0",
            }}
          >
            <p style={{ margin: 0 }}>
              {conditionDescriptions[activeCondition as VisionCondition] ||
                "Select a condition from the toolbar above to see its description here."}
            </p>
          </div>

          {/* Intensity */}
          <div style={{ marginTop: "0.5rem" }}>
            <label
              style={{
                fontSize: "0.75rem",
                display: "block",
                marginBottom: "0.375rem",
              }}
            >
              Simulation Intensity: <strong>{intensity}%</strong>
            </label>
          </div>
        </div>
      )}

      {/* All Available Conditions */}
      <div className="sidebar-section">
        <h3>Conditions</h3>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.25rem",
          }}
        >
          {visionFilters.map((filter) => (
            <div
              key={filter.name}
              style={{
                padding: "0.375rem 0.5rem",
                borderRadius: "var(--radius)",
                fontSize: "0.6875rem",
                background:
                  filter.name === activeCondition
                    ? "var(--accent-subtle)"
                    : "transparent",
                border: "1px solid",
                borderColor:
                  filter.name === activeCondition
                    ? "var(--accent)"
                    : "transparent",
                transition: "all 0.15s",
              }}
            >
              {filter.description}
            </div>
          ))}
        </div>
      </div>

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
          <div style={{ marginBottom: "0.5rem" }}>
            <strong style={{ color: "var(--foreground)" }}>
              Color is not the only indicator:
            </strong>
            <br />
            Use patterns, text labels, and icons alongside color to convey
            information. This ensures accessibility for users with color vision
            deficiencies.
          </div>
          <div style={{ marginBottom: "0.5rem" }}>
            <strong style={{ color: "var(--foreground)" }}>
              Contrast ratio (SC 1.4.3):
            </strong>
            <br />
            Ensure text has at least 4.5:1 contrast ratio (3:1 for large text).
            Use this simulator to test your color combinations.
          </div>
          <div>
            <strong style={{ color: "var(--foreground)" }}>
              Non-text contrast (SC 1.4.11):
            </strong>
            <br />
            UI components and graphical objects should maintain at least 3:1
            contrast ratio against adjacent colors.
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts */}
      <div className="sidebar-section">
        <h3>Keyboard Shortcuts</h3>
        <div
          style={{
            fontSize: "0.6875rem",
            color: "var(--muted)",
            lineHeight: "1.8",
          }}
        >
          <div>
            <kbd
              style={{
                background: "var(--muted-bg)",
                padding: "0.0625rem 0.375rem",
                borderRadius: "0.25rem",
                fontFamily: "ui-monospace, monospace",
                fontSize: "0.625rem",
                color: "var(--foreground)",
              }}
            >
              Ctrl+PgUp
            </kbd>{" "}
            Previous condition
          </div>
          <div>
            <kbd
              style={{
                background: "var(--muted-bg)",
                padding: "0.0625rem 0.375rem",
                borderRadius: "0.25rem",
                fontFamily: "ui-monospace, monospace",
                fontSize: "0.625rem",
                color: "var(--foreground)",
              }}
            >
              Ctrl+Shift+→
            </kbd>{" "}
            Next condition
          </div>
          <div>
            <kbd
              style={{
                background: "var(--muted-bg)",
                padding: "0.0625rem 0.375rem",
                borderRadius: "0.25rem",
                fontFamily: "ui-monospace, monospace",
                fontSize: "0.625rem",
                color: "var(--foreground)",
              }}
            >
              Ctrl+Shift+↑
            </kbd>{" "}
            Increase intensity
          </div>
          <div>
            <kbd
              style={{
                background: "var(--muted-bg)",
                padding: "0.0625rem 0.375rem",
                borderRadius: "0.25rem",
                fontFamily: "ui-monospace, monospace",
                fontSize: "0.625rem",
                color: "var(--foreground)",
              }}
            >
              Ctrl+Shift+↓
            </kbd>{" "}
            Decrease intensity
          </div>
          <div>
            <kbd
              style={{
                background: "var(--muted-bg)",
                padding: "0.0625rem 0.375rem",
                borderRadius: "0.25rem",
                fontFamily: "ui-monospace, monospace",
                fontSize: "0.625rem",
                color: "var(--foreground)",
              }}
            >
              Ctrl+Shift+O
            </kbd>{" "}
            Toggle original view
          </div>
          <div>
            <kbd
              style={{
                background: "var(--muted-bg)",
                padding: "0.0625rem 0.375rem",
                borderRadius: "0.25rem",
                fontFamily: "ui-monospace, monospace",
                fontSize: "0.625rem",
                color: "var(--foreground)",
              }}
            >
              Ctrl+Shift+E
            </kbd>{" "}
            Export results
          </div>
        </div>
      </div>
    </div>
  );
}

ToolSidebar.displayName = "ToolSidebar";
