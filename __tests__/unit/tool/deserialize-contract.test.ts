import { describe, it, expect, expectTypeOf } from "vitest";
import type { DeserializeResult } from "@itsjust/core";
import { visionTool } from "@/tool/tool-definition";
import type { VisionState } from "@/tool/types";

/**
 * Issue #48: `deserialize` must satisfy the canonical discriminated union
 * contract `DeserializeResult<TState>` instead of returning raw state or
 * throwing. These tests pin both the static type and the runtime shape.
 */
describe("visionTool.deserialize - DeserializeResult contract", () => {
  it("is statically typed as DeserializeResult<VisionState>", () => {
    expectTypeOf(visionTool.deserialize).returns.toEqualTypeOf<
      DeserializeResult<VisionState>
    >();
    // The tool itself must remain assignable to the core contract.
    expectTypeOf(visionTool.deserialize).toBeFunction();
  });

  it("returns exactly { success: true, data } on success", () => {
    const result = visionTool.deserialize({
      uploadMode: true,
      activeCondition: "normal",
      intensity: 50,
      showOriginal: false,
    });

    expect(Object.keys(result).sort()).toEqual(["data", "success"]);
    expect(result.success).toBe(true);
    if (!result.success) throw new Error("expected success");
    expect(result.data).toEqual({
      uploadMode: true,
      imageSrc: "",
      activeCondition: "normal",
      intensity: 50,
      showOriginal: false,
      results: [],
      notes: "",
    });
  });

  it("returns exactly { success: false, error } on failure", () => {
    const result = visionTool.deserialize({ nope: true });

    expect(Object.keys(result).sort()).toEqual(["error", "success"]);
    expect(result.success).toBe(false);
    if (result.success) throw new Error("expected failure");
    expect(typeof result.error).toBe("string");
    expect(result.error.length).toBeGreaterThan(0);
  });

  it("never returns a bare state object", () => {
    const valid = {
      uploadMode: true,
      activeCondition: "glaucoma",
      intensity: 40,
    };
    const result = visionTool.deserialize(valid);

    expect(result).not.toBe(valid);
    expect(result).toHaveProperty("success");
  });

  it("unwraps a .itsjust.json share envelope", () => {
    const result = visionTool.deserialize({
      $schema: "https://itsjust.tools/schema/v1",
      version: "1.0.0",
      toolId: "vision-deficiency-simulator",
      content: {
        uploadMode: false,
        imageSrc: "data:image/png;base64,abc",
        activeCondition: "tritanopia",
        intensity: 70,
        showOriginal: true,
        results: [],
        notes: "shared",
      },
    });

    expect(result.success).toBe(true);
    if (!result.success) throw new Error("expected success");
    expect(result.data.activeCondition).toBe("tritanopia");
    expect(result.data.notes).toBe("shared");
  });

  it("rejects a share envelope with invalid content", () => {
    const result = visionTool.deserialize({
      $schema: "https://itsjust.tools/schema/v1",
      version: "1.0.0",
      content: { uploadMode: "yes" },
    });

    expect(result.success).toBe(false);
    if (result.success) throw new Error("expected failure");
    expect(result.error).toContain("Invalid data format");
  });

  it("clamps intensity into the 0-100 UI range", () => {
    const low = visionTool.deserialize({
      uploadMode: true,
      activeCondition: "normal",
      intensity: -25,
    });
    const high = visionTool.deserialize({
      uploadMode: true,
      activeCondition: "normal",
      intensity: 250,
    });

    expect(low.success && low.data.intensity).toBe(0);
    expect(high.success && high.data.intensity).toBe(100);
  });

  it("narrows correctly through a switch on success", () => {
    const result = visionTool.deserialize({
      uploadMode: true,
      activeCondition: "cataracts",
      intensity: 65,
    });

    switch (result.success) {
      case true:
        expect(result.data.activeCondition).toBe("cataracts");
        break;
      case false:
        throw new Error(`unexpected failure: ${result.error}`);
    }
  });
});
