/**
 * Filename sanitization utilities.
 *
 * Generated export filenames (PNG, JSON, PDF, SVG, TXT, WebP, share files) may
 * be derived from user-provided titles or uploaded file names. Such names can
 * contain characters that are invalid or unsafe on different operating systems
 * (`\`, `/`, `:`, `*`, `?`, `"`, `<`, `>`, `|`, control characters, or leading
 * dots), which can cause silent download failures or corrupted file names on
 * Windows and Linux filesystems.
 *
 * This module provides a single, strict sanitizer used across all export paths
 * so filenames are always safe to write to disk.
 */

/** Maximum length (in code units) enforced for a sanitized filename. */
export const MAX_FILENAME_LENGTH = 100;

/**
 * Characters that are invalid in filenames on Windows and/or problematic on
 * POSIX filesystems. Each occurrence is replaced with a hyphen.
 */
const INVALID_CHARS_RE = /[/\\?%*:|"<>]/g;

/** Control characters (C0 and C1) that are unsafe in filenames. */
const CONTROL_CHARS_RE = /[\u0000-\u001f\u007f-\u009f]/g;

/** Leading dots (hidden files on POSIX) and surrounding whitespace. */
const LEADING_DOTS_AND_SPACE_RE = /^[.\s]+/;

/** Trailing whitespace and dots (Windows strips these). */
const TRAILING_DOTS_AND_SPACE_RE = /[.\s]+$/;

/** Runs of whitespace collapsed to a single space. */
const WHITESPACE_RUNS_RE = /\s+/g;

/**
 * Sanitize a filename so it is safe to use across Windows, macOS, and Linux.
 *
 * - Replaces invalid OS characters (`/ \ ? % * : | " < >`) with `-`.
 * - Strips control characters.
 * - Removes leading dots (hidden files) and leading/trailing whitespace.
 * - Collapses whitespace runs.
 * - Enforces a maximum length of {@link MAX_FILENAME_LENGTH} characters.
 *
 * @param filename - The raw filename to sanitize.
 * @returns A safe filename, or a fallback when the input is empty/blank.
 */
export function sanitizeFilename(
  filename: string,
  fallback = "export",
): string {
  if (!filename || typeof filename !== "string") return fallback;

  let safe = filename
    .replace(INVALID_CHARS_RE, "-")
    .replace(CONTROL_CHARS_RE, "")
    .replace(WHITESPACE_RUNS_RE, " ")
    .replace(LEADING_DOTS_AND_SPACE_RE, "")
    .replace(TRAILING_DOTS_AND_SPACE_RE, "")
    .trim();

  if (!safe) return fallback;

  if (safe.length > MAX_FILENAME_LENGTH) {
    safe = safe.slice(0, MAX_FILENAME_LENGTH).trim();
  }

  // Guard against a filename that collapses to only dots/whitespace after
  // truncation (e.g. a long run of dots).
  if (!safe || /^[.\s]+$/.test(safe)) return fallback;

  return safe;
}
