/**
 * Defensive wrappers around the Web Storage API (`localStorage` / `sessionStorage`).
 *
 * Browsers in Private/Incognito mode, or devices with low disk space, can throw
 * `DOMException: QuotaExceededError` or `SecurityError` on `setItem`/`getItem`/
 * `removeItem`. Unhandled storage exceptions can break the application state flow
 * or cause UI freezes.
 *
 * These helpers wrap every storage call in a `try/catch`, classify the failure,
 * and optionally invoke an `onQuotaExceeded` callback so the UI can surface a
 * non-intrusive warning toast.
 */

export type StorageErrorKind = "quota-exceeded" | "security" | "unknown";

export interface StorageWriteResult {
  ok: boolean;
  kind: StorageErrorKind | null;
  /** The original caught error, when `ok` is `false`. */
  error?: unknown;
}

export interface StorageReadResult<T> {
  ok: boolean;
  value: T | null;
  kind: StorageErrorKind | null;
  /** The original caught error, when `ok` is `false`. */
  error?: unknown;
}

export interface SafeStorageOptions {
  /** Invoked when a `QuotaExceededError` is caught. Use to show a warning toast. */
  onQuotaExceeded?: (key: string) => void;
  /** Invoked for any other storage failure (e.g. `SecurityError` in private mode). */
  onError?: (key: string, error: unknown) => void;
}

/** Classify a caught storage error into a stable kind. */
export function classifyStorageError(error: unknown): StorageErrorKind {
  if (error instanceof DOMException) {
    if (error.name === "QuotaExceededError") return "quota-exceeded";
    if (error.name === "SecurityError") return "security";
  }
  // Some browsers throw plain `Error` objects with a matching message.
  if (error instanceof Error) {
    const msg = error.message || "";
    if (/quota|quotaexceeded/i.test(msg)) return "quota-exceeded";
    if (/security|denied|access is denied/i.test(msg)) return "security";
  }
  return "unknown";
}

function notify(
  options: SafeStorageOptions | undefined,
  key: string,
  kind: StorageErrorKind,
  error: unknown,
): void {
  if (kind === "quota-exceeded") {
    options?.onQuotaExceeded?.(key);
  } else {
    options?.onError?.(key, error);
  }
}

/**
 * Defensively read a value from a storage area.
 * Returns `{ ok: false, value: null, kind }` instead of throwing.
 */
export function safeGetItem(
  storage: Storage,
  key: string,
  options?: SafeStorageOptions,
): StorageReadResult<string> {
  try {
    const value = storage.getItem(key);
    return { ok: true, value, kind: null };
  } catch (error) {
    const kind = classifyStorageError(error);
    notify(options, key, kind, error);
    return { ok: false, value: null, kind, error };
  }
}

/**
 * Defensively write a value to a storage area.
 * Returns `{ ok: false, kind }` instead of throwing.
 */
export function safeSetItem(
  storage: Storage,
  key: string,
  value: string,
  options?: SafeStorageOptions,
): StorageWriteResult {
  try {
    storage.setItem(key, value);
    return { ok: true, kind: null };
  } catch (error) {
    const kind = classifyStorageError(error);
    notify(options, key, kind, error);
    return { ok: false, kind, error };
  }
}

/**
 * Defensively remove a key from a storage area.
 * Returns `{ ok: false, kind }` instead of throwing.
 */
export function safeRemoveItem(
  storage: Storage,
  key: string,
  options?: SafeStorageOptions,
): StorageWriteResult {
  try {
    storage.removeItem(key);
    return { ok: true, kind: null };
  } catch (error) {
    const kind = classifyStorageError(error);
    notify(options, key, kind, error);
    return { ok: false, kind, error };
  }
}
