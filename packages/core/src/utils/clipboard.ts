/**
 * Clipboard helpers with a graceful fallback for insecure origins and
 * permission rejections.
 *
 * `navigator.clipboard.writeText` rejects when the page is loaded over HTTP
 * (non-secure origin), inside an unauthenticated iframe, or when the browser
 * denies the clipboard permission by policy. In those cases we fall back to
 * the legacy `document.execCommand("copy")` path using an off-screen
 * textarea, which works in most browsers without the async Clipboard API.
 */

/**
 * Copy `text` to the clipboard using the async Clipboard API when available.
 * Returns `true` on success, `false` if the API is unavailable or rejects.
 * When it rejects, the rejection reason is stored in `outError` so callers can
 * surface a meaningful message if the fallback also fails.
 */
async function copyWithClipboardApi(
  text: string,
  outError: { value?: unknown },
): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.clipboard) {
    return false;
  }
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    // Permission denied, insecure origin, or transient failure — fall back.
    outError.value = error;
    return false;
  }
}

/**
 * Copy `text` using the legacy `document.execCommand("copy")` path with an
 * off-screen textarea. Returns `true` on success, `false` otherwise.
 */
function copyWithExecCommand(text: string): boolean {
  if (typeof document === "undefined") {
    return false;
  }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  // Move it off-screen and make it non-interactive so it never flashes or
  // steals focus.
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "-9999px";
  textarea.style.left = "-9999px";
  textarea.style.opacity = "0";
  textarea.style.width = "1px";
  textarea.style.height = "1px";
  textarea.style.border = "0";
  textarea.style.padding = "0";
  textarea.style.margin = "0";
  textarea.style.boxShadow = "none";
  textarea.style.outline = "none";
  textarea.style.background = "transparent";

  const activeElement =
    document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;

  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();

  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch {
    copied = false;
  } finally {
    textarea.remove();
    // Restore focus to the previously focused element, if it is still in the
    // document.
    if (activeElement && document.body.contains(activeElement)) {
      activeElement.focus();
    }
  }
  return copied;
}

/**
 * Copy `text` to the clipboard, preferring the async Clipboard API and
 * falling back to `document.execCommand("copy")` when it is unavailable or
 * rejects (e.g. insecure origin, unauthenticated iframe, or denied
 * permission).
 *
 * @returns `true` if the text was copied, `false` if every strategy failed.
 * @throws the original Clipboard API rejection reason when the async API
 * rejected and the fallback also failed, so callers can surface a meaningful
 * error message.
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  const apiError: { value?: unknown } = {};
  if (await copyWithClipboardApi(text, apiError)) {
    return true;
  }
  if (copyWithExecCommand(text)) {
    return true;
  }
  if (apiError.value !== undefined) {
    throw apiError.value;
  }
  return false;
}
