import type { ToolConfig } from "@itsjust/core";
import packageJson from "../../package.json";

export const templateBaseVersion = packageJson.version;

const toolConfig = {
  id: "vision-deficiency-simulator",
  name: "Vision Deficiency Simulator",
  description:
    "Simulate vision deficiencies for accessibility testing. See how your designs look to users with different visual conditions.",
  version: "1.0.0",
  exportFormats: ["json", "png", "pdf"],
  features: {
    export: true,
    autoSave: false,
    undoRedo: false,
    sidebar: true,
    statusBar: true,
    darkMode: true,
  },
  theme: {
    accent: "#10b981",
    accentHover: "#059669",
    accentSubtle: "rgba(16, 185, 129, 0.08)",
    brand: "Vision Deficiency Simulator",
    icon: "👁️",
  },
  shortcuts: [
    {
      title: "Vision Deficiency Simulator",
      shortcuts: [
        {
          keys: "Ctrl+Shift+E",
          label: "Export",
          description: "export results as JSON",
        },
        {
          keys: "Ctrl+Shift+Left",
          label: "Previous condition",
          description: "cycle to the previous vision condition",
        },
        {
          keys: "Ctrl+Shift+Right",
          label: "Next condition",
          description: "cycle to the next vision condition",
        },
        {
          keys: "Ctrl+Shift+Up",
          label: "Increase intensity",
          description: "increase simulation intensity by 10%",
        },
        {
          keys: "Ctrl+Shift+Down",
          label: "Decrease intensity",
          description: "decrease simulation intensity by 10%",
        },
      ],
    },
  ],
} satisfies ToolConfig;

export default toolConfig;
