import type { DeserializeResult, Tool } from "@itsjust/core";
import toolConfig from "./tool.config";
import type { SimulationResult, VisionState } from "./types";

/** Canonical state shape description used by every failure message. */
const STATE_SHAPE =
  "{ uploadMode: boolean, imageSrc?: string, activeCondition: string, intensity: number, results?: SimulationResult[], notes?: string }";

/** Shape of a `.itsjust.json` share envelope (see `useImport`). */
const SHARE_SCHEMA_URI = "https://itsjust.tools/schema/v1";

/** Lower/upper bounds enforced by the UI intensity slider. */
const MIN_INTENSITY = 0;
const MAX_INTENSITY = 100;

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
 * Type guard for a plain object. Arrays, functions, and `null` are rejected
 * because every persisted state payload must be a JSON object.
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Type guard for a single simulation result entry.
 * Validates every field consumed by the UI so corrupted share files cannot
 * reach rendering code with the wrong shape.
 */
function isSimulationResult(value: unknown): value is SimulationResult {
  if (!isRecord(value)) return false;
  return (
    typeof value.condition === "string" &&
    typeof value.description === "string" &&
    typeof value.cssFilter === "string" &&
    typeof value.intensity === "number" &&
    Number.isFinite(value.intensity)
  );
}

/**
 * Type guard that validates an unknown value matches the {@link VisionState}
 * shape. Optional fields are checked only when present so older share files
 * without them keep loading.
 */
function isVisionState(value: unknown): value is VisionState {
  if (!isRecord(value)) return false;
  if (typeof value.uploadMode !== "boolean") return false;
  if (typeof value.activeCondition !== "string") return false;
  if (
    typeof value.intensity !== "number" ||
    !Number.isFinite(value.intensity)
  ) {
    return false;
  }
  if (
    value.showOriginal !== undefined &&
    typeof value.showOriginal !== "boolean"
  ) {
    return false;
  }
  if (value.imageSrc !== undefined && typeof value.imageSrc !== "string") {
    return false;
  }
  if (value.notes !== undefined && typeof value.notes !== "string")
    return false;
  if (value.results !== undefined) {
    if (!Array.isArray(value.results)) return false;
    if (!value.results.every(isSimulationResult)) return false;
  }
  return true;
}

/** Clamps intensity into the range the UI can represent. */
function clampIntensity(intensity: number): number {
  return Math.min(MAX_INTENSITY, Math.max(MIN_INTENSITY, intensity));
}

/**
 * Unwraps a `.itsjust.json` share envelope so a payload taken straight from
 * `useImport` without preprocessing still resolves to the inner state.
 * Returns `null` when the value is not a share envelope.
 */
function unwrapShareEnvelope(value: unknown): unknown {
  if (!isRecord(value) || value.$schema !== SHARE_SCHEMA_URI) return null;
  return value.content;
}

/**
 * Builds a fully-populated {@link VisionState} from validated input so every
 * consumer receives the exact same shape, regardless of which optional fields
 * the share file happened to include.
 */
function toVisionState(state: VisionState): VisionState {
  return {
    uploadMode: state.uploadMode,
    imageSrc: state.imageSrc || "",
    activeCondition: state.activeCondition,
    intensity: clampIntensity(state.intensity),
    showOriginal: state.showOriginal ?? false,
    results: state.results ?? [],
    notes: state.notes ?? "",
  };
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
  /**
   * Recovers state from an imported / shared payload.
   *
   * Always returns the canonical `DeserializeResult<VisionState>` union — it
   * never returns raw state and never throws, so `useImport` and error
   * boundaries can branch on `success` without try/catch of their own.
   */
  deserialize: (data): DeserializeResult<VisionState> => {
    try {
      if (typeof data === "string") {
        return {
          success: false,
          error:
            "Invalid data format: expected a parsed state object, received a string. Parse JSON before calling deserialize.",
        };
      }

      const candidate = unwrapShareEnvelope(data) ?? data;

      if (isVisionState(candidate)) {
        return { success: true, data: toVisionState(candidate) };
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
