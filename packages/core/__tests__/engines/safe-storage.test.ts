import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  safeGetItem,
  safeSetItem,
  safeRemoveItem,
  classifyStorageError,
} from "../../src/engines/safe-storage";

describe("safe-storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("reads a value successfully", () => {
    localStorage.setItem("k", "v");
    const result = safeGetItem(localStorage, "k");
    expect(result).toEqual({ ok: true, value: "v", kind: null });
  });

  it("returns null for a missing key", () => {
    const result = safeGetItem(localStorage, "missing");
    expect(result).toEqual({ ok: true, value: null, kind: null });
  });

  it("writes a value successfully", () => {
    const result = safeSetItem(localStorage, "k", "v");
    expect(result).toEqual({ ok: true, kind: null });
    expect(localStorage.getItem("k")).toBe("v");
  });

  it("removes a key successfully", () => {
    localStorage.setItem("k", "v");
    const result = safeRemoveItem(localStorage, "k");
    expect(result).toEqual({ ok: true, kind: null });
    expect(localStorage.getItem("k")).toBeNull();
  });

  it("classifies QuotaExceededError", () => {
    const err = new DOMException("Quota exceeded", "QuotaExceededError");
    expect(classifyStorageError(err)).toBe("quota-exceeded");
  });

  it("classifies SecurityError", () => {
    const err = new DOMException("Access denied", "SecurityError");
    expect(classifyStorageError(err)).toBe("security");
  });

  it("classifies unknown errors", () => {
    expect(classifyStorageError(new Error("boom"))).toBe("unknown");
  });

  it("classifies quota-like plain errors", () => {
    expect(classifyStorageError(new Error("QuotaExceededError"))).toBe(
      "quota-exceeded",
    );
  });

  it("returns a failure result instead of throwing on setItem", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Quota exceeded", "QuotaExceededError");
    });
    const result = safeSetItem(localStorage, "k", "v");
    expect(result.ok).toBe(false);
    expect(result.kind).toBe("quota-exceeded");
  });

  it("invokes onQuotaExceeded callback on quota error", () => {
    const onQuotaExceeded = vi.fn();
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Quota exceeded", "QuotaExceededError");
    });
    safeSetItem(localStorage, "k", "v", { onQuotaExceeded });
    expect(onQuotaExceeded).toHaveBeenCalledWith("k");
  });

  it("invokes onError callback for non-quota errors", () => {
    const onError = vi.fn();
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("Access denied", "SecurityError");
    });
    const result = safeGetItem(localStorage, "k", { onError });
    expect(result.ok).toBe(false);
    expect(result.kind).toBe("security");
    expect(onError).toHaveBeenCalledWith("k", expect.any(DOMException));
  });

  it("does not throw on removeItem failure", () => {
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
      throw new DOMException("Access denied", "SecurityError");
    });
    const result = safeRemoveItem(localStorage, "k");
    expect(result.ok).toBe(false);
    expect(result.kind).toBe("security");
  });
});
