/**
 * PNG Exporter for Vision Deficiency Simulator
 * Captures the tool canvas as a PNG image with accessibility simulation metadata
 */

import type { Exporter } from "@itsjust/core";

export const exporter: Exporter = {
  format: "png",
  export: async (element, options, stateSerializer) => {
    try {
      const { toBlob } = await import("html-to-image");
      const blob = await toBlob(element, {
        width: element.offsetWidth,
        height: element.offsetHeight,
        quality: 0.9,
        backgroundColor: "#ffffff",
        ...(options?.padding && { padding: options.padding }),
      });

      return {
        success: true,
        data: blob,
        filename:
          options?.filename ?? `vision-deficiency-sim-${Date.now()}.png`,
        format: "png",
      };
    } catch (error) {
      console.error("[PNG Exporter]", error);
      return {
        success: false,
        data: null,
        filename: options?.filename ?? `vision-deficiency-sim-${Date.now()}`,
        format: "png",
        error: error instanceof Error ? error.message : "Export failed",
      };
    }
  },
};

export default exporter;
