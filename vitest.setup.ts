import "@testing-library/jest-dom";

// jsdom does not implement document.execCommand. Provide a no-op stub so
// clipboard fallback code can be exercised in tests.
if (
  typeof document !== "undefined" &&
  typeof document.execCommand !== "function"
) {
  Object.defineProperty(document, "execCommand", {
    configurable: true,
    writable: true,
    value: () => false,
  });
}
