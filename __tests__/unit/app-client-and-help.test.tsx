import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { ReactNode } from "react";
import ToolClient from "@/app/tool-client";
import ToolClientWrapper from "@/app/tool-client-wrapper";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("next/dynamic", () => ({
  default: () => () => (
    <div data-testid="dynamic-tool-client">dynamic-tool-client</div>
  ),
}));

const mockSetData = vi.fn();
const mockExportTo = vi.fn();
const mockDownloadShareFile = vi.fn();
const mockShareViaWeb = vi.fn();

vi.mock("@itsjust/core", () => ({
  useToolState: () => ({
    data: {
      uploadMode: true,
      imageSrc: "",
      activeCondition: "normal",
      intensity: 50,
      results: [],
      notes: "",
    },
    setData: mockSetData,
    isDirty: false,
    lastSaved: "just now",
  }),
  useExport: () => ({
    exportTo: mockExportTo,
    isExporting: false,
  }),
  useShare: () => ({
    downloadShareFile: mockDownloadShareFile,
    shareViaWeb: mockShareViaWeb,
  }),
}));

vi.mock("@/tool", () => ({
  toolConfig: {
    id: "vision-deficiency-simulator",
    name: "Vision Deficiency Simulator",
    version: "1.0.0",
    features: { sidebar: true },
    theme: { brand: "Vision Deficiency Simulator" },
  },
  visionTool: {
    serialize: (state: unknown) => JSON.stringify(state),
    deserialize: () => ({
      success: true,
      data: { uploadMode: true, activeCondition: "normal", intensity: 50 },
    }),
  },
  ToolCanvas: () => <div data-testid="mock-canvas">canvas</div>,
  ToolToolbar: ({
    onConditionChange,
  }: {
    onConditionChange: (condition: string) => void;
  }) => (
    <div>
      <button
        type="button"
        data-testid="condition-btn"
        onClick={() => onConditionChange("protanopia")}
      >
        Change Condition
      </button>
    </div>
  ),
  ToolSidebar: () => <div data-testid="mock-sidebar">sidebar</div>,
}));

describe("app client and help page", () => {
  beforeEach(() => {
    mockSetData.mockReset();
    Object.defineProperty(navigator, "clipboard", {
      writable: true,
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
    Object.defineProperty(navigator, "share", {
      writable: true,
      value: vi.fn().mockResolvedValue(undefined),
    });
  });

  it("renders dynamic tool client wrapper", () => {
    render(<ToolClientWrapper />);
    expect(screen.getByTestId("dynamic-tool-client")).toBeInTheDocument();
  });

  it("renders tool client components", () => {
    render(<ToolClient />);
    expect(screen.getByTestId("mock-canvas")).toBeInTheDocument();
    expect(screen.getByTestId("mock-sidebar")).toBeInTheDocument();
  });

  it("handles condition change in toolbar", () => {
    render(<ToolClient />);
    fireEvent.click(screen.getByTestId("condition-btn"));
    expect(mockSetData).toHaveBeenCalled();
  });

  it("hides share and download buttons when no image is loaded", () => {
    render(<ToolClient />);
    expect(
      screen.queryByText("Download .itsjust.json"),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Share")).not.toBeInTheDocument();
  });
});
