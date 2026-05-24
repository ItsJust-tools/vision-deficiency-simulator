import { describe, it, expect } from "vitest";
import { visionTool } from "@/tool";
import type { VisionState } from "@/tool";

describe("Vision Deficiency Simulator Tool", () => {
  describe("initialState", () => {
    it("should have default values", () => {
      const state = visionTool.initialState;
      expect(state.uploadMode).toBe(true);
      expect(state.imageSrc).toBe("");
      expect(state.activeCondition).toBe("normal");
      expect(state.intensity).toBe(50);
      expect(state.results).toEqual([]);
      expect(state.notes).toBe("");
    });
  });

  describe("serialize", () => {
    it("should serialize state correctly", () => {
      const state: VisionState = {
        uploadMode: true,
        imageSrc: "",
        activeCondition: "normal",
        intensity: 50,
        results: [],
        notes: "",
      };

      const serialized = visionTool.serialize(state);
      const parsed = JSON.parse(serialized);

      expect(parsed.uploadMode).toBe(true);
      expect(parsed.activeCondition).toBe("normal");
      expect(parsed.intensity).toBe(50);
    });

    it("should serialize with conditions and results", () => {
      const state: VisionState = {
        uploadMode: false,
        imageSrc: "data:image/png;base64,...",
        activeCondition: "protanopia",
        intensity: 75,
        results: [
          {
            condition: "protanopia",
            description: "Red-blindness (protanopia)",
            cssFilter: "hue-rotate(130deg) saturate(1.5)",
            intensity: 75,
          },
        ],
        notes: "Tested accessibility",
      };

      const serialized = visionTool.serialize(state);
      const parsed = JSON.parse(serialized);

      expect(parsed.uploadMode).toBe(false);
      expect(parsed.imageSrc).toBe("data:image/png;base64,...");
      expect(parsed.activeCondition).toBe("protanopia");
      expect(parsed.intensity).toBe(75);
      expect(parsed.notes).toBe("Tested accessibility");
    });
  });

  describe("deserialize", () => {
    it("should deserialize valid state", () => {
      const data = {
        uploadMode: false,
        imageSrc: "data:image/png;base64,...",
        activeCondition: "deuteranopia",
        intensity: 100,
        results: [],
        notes: "",
      };

      const result = visionTool.deserialize(data);
      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.data.activeCondition).toBe("deuteranopia");
      expect(result.data.intensity).toBe(100);
    });

    it("should fail to deserialize invalid state", () => {
      const result = visionTool.deserialize("invalid");
      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.error).toContain("Invalid data format");
    });

    it("should fail to deserialize missing activeCondition", () => {
      const result = visionTool.deserialize({
        uploadMode: true,
        imageSrc: "",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("tool config", () => {
    it("should have correct tool ID", () => {
      expect(visionTool.id).toBe("vision-deficiency-simulator");
    });

    it("should have correct name", () => {
      expect(visionTool.name).toBe("Vision Deficiency Simulator");
    });

    it("should have export formats configured", () => {
      expect(visionTool.config.exportFormats).toContain("json");
      expect(visionTool.config.exportFormats).toContain("png");
      expect(visionTool.config.exportFormats).toContain("pdf");
    });

    it("should have feature flags correct", () => {
      expect(visionTool.config.features.export).toBe(true);
      expect(visionTool.config.features.autoSave).toBe(false);
      expect(visionTool.config.features.undoRedo).toBe(false);
    });
  });
});
