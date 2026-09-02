import type { StorageData } from "../types";
import { compressToUTF16, decompressFromUTF16 } from "lz-string";
import {
  safeGetItem,
  safeRemoveItem,
  safeSetItem,
  type SafeStorageOptions,
} from "./safe-storage";

export type StorageLoadStatus = "missing" | "ok" | "corrupt";

export interface StorageLoadResult<T> {
  status: StorageLoadStatus;
  data: T | null;
}

export interface StorageManagerOptions extends SafeStorageOptions {
  /**
   * Storage area to use. Defaults to `localStorage`. Overridable for tests
   * or for callers that prefer `sessionStorage`.
   */
  storage?: Storage;
}

export class StorageManager {
  private prefix: string;
  private defaultVersion?: string;
  private compressionThresholdBytes: number;
  private storage: Storage;
  private options: SafeStorageOptions;

  constructor(
    prefix = "itsjust",
    defaultVersion = "1.0.0",
    compressionThresholdBytes = 2048,
    options: StorageManagerOptions = {},
  ) {
    this.prefix = prefix;
    this.defaultVersion = defaultVersion;
    this.compressionThresholdBytes = Math.max(0, compressionThresholdBytes);
    this.storage =
      options.storage ??
      (typeof localStorage !== "undefined" ? localStorage : ({} as Storage));
    this.options = options;
  }

  private key(k: string): string {
    return `${this.prefix}:${k}`;
  }

  async save<T>(key: string, data: T, version?: string): Promise<void> {
    const serialized = JSON.stringify(data);
    let storedData: unknown = data;
    let encoding: StorageData<unknown>["encoding"] = "plain";
    if (serialized.length >= this.compressionThresholdBytes) {
      const compressed = compressToUTF16(serialized);
      if (compressed.length < serialized.length) {
        storedData = compressed;
        encoding = "lz-string";
      }
    }
    const entry: StorageData<unknown> = {
      data: storedData,
      savedAt: new Date().toISOString(),
      version: version ?? this.defaultVersion ?? "1.0.0",
      encoding,
    };
    const result = safeSetItem(
      this.storage,
      this.key(key),
      JSON.stringify(entry),
      this.options,
    );
    if (!result.ok) {
      if (result.kind === "quota-exceeded") {
        console.warn(`[StorageManager] Quota exceeded saving "${key}"`);
        // Re-throw so callers that rely on failure detection (e.g. dirty-state
        // tracking) can observe the failure, while the onQuotaExceeded callback
        // already surfaced a non-intrusive warning toast.
        throw new DOMException("Storage write failed", "QuotaExceededError");
      }
      // Non-quota failure (e.g. SecurityError in private browsing). Preserve the
      // original error so callers can inspect it.
      const error = result.error ?? new Error("Storage write failed");
      console.warn(`[StorageManager] Failed to save "${key}":`, error);
      throw error;
    }
  }

  loadEntry<T>(key: string, expectedVersion?: string): StorageLoadResult<T> {
    const read = safeGetItem(this.storage, this.key(key), this.options);
    if (!read.ok) {
      // Storage is unavailable (e.g. private browsing). Treat as missing so the
      // app degrades gracefully instead of throwing.
      return { status: "missing", data: null };
    }
    const raw = read.value;
    if (!raw) return { status: "missing", data: null };
    try {
      const entry: StorageData<unknown> = JSON.parse(raw);
      if (expectedVersion && entry.version !== expectedVersion) {
        console.warn(
          `[StorageManager] Version mismatch for "${key}": expected ${expectedVersion}, got ${entry.version}`,
        );
      }
      if (entry.encoding === "lz-string") {
        if (typeof entry.data !== "string") {
          return { status: "corrupt", data: null };
        }
        const decompressed = decompressFromUTF16(entry.data);
        if (decompressed == null) {
          return { status: "corrupt", data: null };
        }
        return { status: "ok", data: JSON.parse(decompressed) as T };
      }
      return { status: "ok", data: entry.data as T };
    } catch (error) {
      console.warn(`[StorageManager] Failed to load "${key}":`, error);
      return { status: "corrupt", data: null };
    }
  }

  load<T>(key: string, expectedVersion?: string): T | null {
    return this.loadEntry<T>(key, expectedVersion).data;
  }

  remove(key: string): void {
    safeRemoveItem(this.storage, this.key(key), this.options);
  }
}

export const storageManager = new StorageManager();
