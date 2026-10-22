import type { Tool } from "@itsjust/core";
import toolConfig from "./tool.config";
import type { SimulationResult, VisionState } from "./types";

/** Canonical state shape description used by every failure message. */
const STATE_SHAPE =
  "{ uploadMode: boolean, imageSrc?: string, activeCondition: string, intensity: number, results?: SimulationResult[], notes?: string }";

/**
 * Produces a human-readable description of an arbitrary thrown value.
 * Never throws, even when the value is hostile (e.g. a Proxy whose
 * `toString`/`message` accessors throw).
 */
function describeError(error: unknown): string {
  try {
    if (error instanceof Error && typeof error.message === "string") {
      return error.message;
    }
    return String(error);
  } catch {
    return "unknown error";
  }
}

/**
 * Type guard for a single simulation result entry.
 * Validates every field consumed by the UI so corrupted share files cannot
 * reach rendering code with the wrong shape.
 */
function isSimulationResult(value: unknown): value is SimulationResult {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.condition === "string" &&
    typeof v.description === "string" &&
    typeof v.cssFilter === "string" &&
    typeof v.intensity === "number" &&
    Number.isFinite(v.intensity)
  );
}

/**
 * Type guard that validates an unknown value matches the {@link VisionState}
 * shape. Optional fields are checked only when present so older share files
 * without them keep loading.
 */
function isVisionState(value: unknown): value is VisionState {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }
  const v = value as Record<string, unknown>;
  if (typeof v.uploadMode !== "boolean") return false;
  if (typeof v.activeCondition !== "string") return false;
  if (typeof v.intensity !== "number" || !Number.isFinite(v.intensity)) {
    return false;
  }
  if (v.showOriginal !== undefined && typeof v.showOriginal !== "boolean") {
    return false;
  }
  if (v.imageSrc !== undefined && typeof v.imageSrc !== "string") return false;
  if (v.notes !== undefined && typeof v.notes !== "string") return false;
  if (v.results !== undefined) {
    if (!Array.isArray(v.results)) return false;
    if (!v.results.every(isSimulationResult)) return false;
  }
  return true;
}

export const visionTool: Tool<VisionState> = {
  id: toolConfig.id,
  name: toolConfig.name,
  version: toolConfig.version,
  config: toolConfig,
  initialState: {
    uploadMode: true,
    imageSrc: "",
    activeCondition: "normal",
    intensity: 50,
    showOriginal: false,
    results: [],
    notes: "",
  },
  serialize: (state) =>
    JSON.stringify(
      {
        uploadMode: state.uploadMode,
        imageSrc: state.imageSrc,
        activeCondition: state.activeCondition,
        intensity: state.intensity,
        showOriginal: state.showOriginal,
        results: state.results,
        notes: state.notes,
      },
      null,
      2,
    ),
  deserialize: (data) => {
    // Deserialization must never throw: malformed share files, wrong shapes,
    // nulls, and hostile input (throwing getters, Proxies) are all reported
    // through the DeserializeResult contract instead.
    try {
      if (typeof data === "string") {
        return {
          success: false,
          error:
            "Invalid data format: expected a parsed state object, received a string. Parse JSON before calling deserialize.",
        };
      }

      if (isVisionState(data)) {
        return {
          success: true,
          data: {
            uploadMode: data.uploadMode,
            imageSrc: data.imageSrc || "",
            activeCondition: data.activeCondition,
            intensity: data.intensity,
            showOriginal: data.showOriginal ?? false,
            results: data.results || [],
            notes: data.notes || "",
          },
        };
      }

      return {
        success: false,
        error: `Invalid data format: expected ${STATE_SHAPE}`,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to deserialize vision state: ${describeError(error)}`,
      };
    }
  },
  exporters: [
    { format: "png", loader: () => import("./exporters/png") },
    { format: "webp", loader: () => import("./exporters/webp") },
    { format: "pdf", loader: () => import("./exporters/pdf") },
  ],
};
