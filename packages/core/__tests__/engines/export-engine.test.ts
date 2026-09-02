import { describe, it, expect, vi } from "vitest";
import { ExportEngine } from "../../src/engines/export-engine";
import type { Exporter, ExportOptions } from "../../src/types";

describe("ExportEngine", () => {
  it("lists built-in formats", () => {
    const engine = new ExportEngine();
    const formats = engine.getSupportedFormats();
    expect(formats).toContain("json");
  });

  it("registers a custom exporter", () => {
    const engine = new ExportEngine();
    const customExporter: Exporter = {
      format: "json",
      export: async (_el, _opts, serializer) => ({
        success: true,
        data: serializer?.() ?? "{}",
        filename: "custom.json",
        format: "json",
      }),
    };

    engine.registerExporter(customExporter);
    expect(engine.getSupportedFormats()).toContain("json");
  });

  it("returns error for unsupported format", async () => {
    const engine = new ExportEngine();
    const result = await engine.export(document.createElement("div"), {
      format: "xml",
    } as unknown as ExportOptions);
    expect(result.success).toBe(false);
    expect(result.error).toContain("No exporter");
  });

  it("returns error for format without loader", async () => {
    const engine = new ExportEngine();
    const result = await engine.export(document.createElement("div"), {
      format: "webp",
    } as ExportOptions);
    expect(result.success).toBe(false);
    expect(result.error).toContain("No exporter");
  });

  it("registers and uses a lazy-loaded exporter", async () => {
    const engine = new ExportEngine();
    const customExporter: Exporter = {
      format: "json",
      export: async () => ({
        success: true,
        data: '{"test":true}',
        filename: "test.json",
        format: "json",
      }),
    };

    engine.registerExporter(customExporter);
    const result = await engine.export(document.createElement("div"), {
      format: "json",
    } as ExportOptions);
    expect(result.success).toBe(true);
  });

  it("triggers download and revokes blob URL after delay", async () => {
    vi.useFakeTimers();
    const engine = new ExportEngine();
    const originalCreateObjectURL = URL.createObjectURL;
    const originalRevokeObjectURL = URL.revokeObjectURL;
    URL.createObjectURL = vi.fn(() => "blob:test");
    URL.revokeObjectURL = vi.fn();

    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});

    await engine.exportAndDownload(
      document.createElement("div"),
      { format: "json", filename: "test.json" },
      () => '{"test":true}',
    );

    expect(clickSpy).toHaveBeenCalled();
    expect(URL.revokeObjectURL).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(10000);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:test");

    clickSpy.mockRestore();
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
    vi.useRealTimers();
  });

  it("sanitizes the download filename against invalid OS characters", async () => {
    const engine = new ExportEngine();
    const originalCreateObjectURL = URL.createObjectURL;
    URL.createObjectURL = vi.fn(() => "blob:sanitized");

    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});
    const appendSpy = vi
      .spyOn(document.body, "appendChild")
      .mockImplementation(() => document.createElement("a"));

    await engine.exportAndDownload(
      document.createElement("div"),
      { format: "json", filename: 'my:report/2024*"final".json' },
      () => '{"test":true}',
    );

    const anchor = appendSpy.mock.calls[0]?.[0] as HTMLAnchorElement;
    expect(anchor.download).toBe("my-report-2024--final-.json");

    clickSpy.mockRestore();
    appendSpy.mockRestore();
    URL.createObjectURL = originalCreateObjectURL;
  });
});
