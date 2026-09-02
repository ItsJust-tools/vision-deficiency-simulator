import { describe, it, expect } from "vitest";
import {
  sanitizeFilename,
  MAX_FILENAME_LENGTH,
} from "../../src/utils/sanitize-filename";

describe("sanitizeFilename", () => {
  it("returns the fallback for empty input", () => {
    expect(sanitizeFilename("")).toBe("export");
    expect(sanitizeFilename("   ")).toBe("export");
    expect(sanitizeFilename(undefined as unknown as string)).toBe("export");
  });

  it("replaces invalid OS characters with hyphens", () => {
    expect(sanitizeFilename('a/b\\c:d*e?f"g<h>i|j')).toBe(
      "a-b-c-d-e-f-g-h-i-j",
    );
  });

  it("replaces percent signs", () => {
    expect(sanitizeFilename("100%report")).toBe("100-report");
  });

  it("strips control characters", () => {
    expect(sanitizeFilename("report\u0000\u001fname")).toBe("reportname");
  });

  it("removes leading dots (hidden files)", () => {
    expect(sanitizeFilename("..hidden")).toBe("hidden");
    expect(sanitizeFilename(".env")).toBe("env");
  });

  it("trims leading and trailing whitespace", () => {
    expect(sanitizeFilename("  my report  ")).toBe("my report");
  });

  it("collapses whitespace runs", () => {
    expect(sanitizeFilename("my   report   file")).toBe("my report file");
  });

  it("enforces a maximum length of 100 characters", () => {
    const long = "a".repeat(200);
    const result = sanitizeFilename(long);
    expect(result.length).toBeLessThanOrEqual(MAX_FILENAME_LENGTH);
    expect(result).toBe("a".repeat(100));
  });

  it("returns fallback when input collapses to only dots", () => {
    expect(sanitizeFilename("....")).toBe("export");
  });

  it("preserves a valid filename unchanged", () => {
    expect(sanitizeFilename("vision-report-2024.png")).toBe(
      "vision-report-2024.png",
    );
  });

  it("handles a filename that is only invalid characters", () => {
    expect(sanitizeFilename("///***:::")).toBe("---------");
  });
});
