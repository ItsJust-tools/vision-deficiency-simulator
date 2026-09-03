import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { copyTextToClipboard } from "../../src/utils/clipboard";

describe("copyTextToClipboard", () => {
  let originalClipboard: PropertyDescriptor | undefined;
  let originalExecCommand: typeof document.execCommand;

  beforeEach(() => {
    originalClipboard = Object.getOwnPropertyDescriptor(navigator, "clipboard");
    originalExecCommand = document.execCommand;
  });

  afterEach(() => {
    if (originalClipboard) {
      Object.defineProperty(navigator, "clipboard", originalClipboard);
    } else {
      // @ts-expect-error - removing a non-configurable property in tests
      delete navigator.clipboard;
    }
    document.execCommand = originalExecCommand;
    vi.restoreAllMocks();
  });

  it("uses the async Clipboard API when available", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    const execSpy = vi.spyOn(document, "execCommand");

    const result = await copyTextToClipboard("hello");

    expect(result).toBe(true);
    expect(writeText).toHaveBeenCalledWith("hello");
    expect(execSpy).not.toHaveBeenCalled();
  });

  it("falls back to execCommand when the Clipboard API rejects", async () => {
    const writeText = vi
      .fn()
      .mockRejectedValue(new Error("Not allowed to write"));
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    const execSpy = vi.spyOn(document, "execCommand").mockReturnValue(true);

    const result = await copyTextToClipboard("fallback");

    expect(result).toBe(true);
    expect(writeText).toHaveBeenCalledWith("fallback");
    expect(execSpy).toHaveBeenCalledWith("copy");
  });

  it("falls back to execCommand when the Clipboard API is unavailable", async () => {
    // Simulate an insecure origin where navigator.clipboard is undefined.
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: undefined,
    });
    const execSpy = vi.spyOn(document, "execCommand").mockReturnValue(true);

    const result = await copyTextToClipboard("no-api");

    expect(result).toBe(true);
    expect(execSpy).toHaveBeenCalledWith("copy");
  });

  it("throws the original error when both strategies fail", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("Permission denied"));
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    const execSpy = vi.spyOn(document, "execCommand").mockReturnValue(false);

    await expect(copyTextToClipboard("nope")).rejects.toThrow(
      "Permission denied",
    );
    expect(writeText).toHaveBeenCalled();
    expect(execSpy).toHaveBeenCalledWith("copy");
  });

  it("throws the original error when execCommand throws", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("Insecure origin"));
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    const execSpy = vi.spyOn(document, "execCommand").mockImplementation(() => {
      throw new Error("execCommand failed");
    });

    await expect(copyTextToClipboard("throws")).rejects.toThrow(
      "Insecure origin",
    );
    expect(execSpy).toHaveBeenCalledWith("copy");
  });

  it("removes the off-screen textarea after copying", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("blocked"));
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    vi.spyOn(document, "execCommand").mockReturnValue(true);

    await copyTextToClipboard("cleanup");

    expect(document.querySelector("textarea")).toBeNull();
  });
});
