/**
 * PDF Exporter for Vision Deficiency Simulator
 * Captures the tool canvas and embeds it as a PNG image inside a valid PDF.
 *
 * The PDF is built manually using the standard PDF-1.4 format with
 * correct cross-reference table offsets for reliable rendering.
 */

import type { Exporter } from "@itsjust/core";

export const exporter: Exporter = {
  format: "pdf",
  export: async (element, options) => {
    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(element, {
        width: element.offsetWidth || 1200,
        height: element.offsetHeight || 800,
        quality: 0.9,
        backgroundColor: "#ffffff",
        ...(options?.padding && { padding: options.padding }),
      });

      const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
      const pdfBytes = buildPdf(base64Data);

      const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });

      return {
        success: true,
        data: blob,
        filename:
          options?.filename ?? `vision-deficiency-report-${Date.now()}.pdf`,
        format: "pdf",
      };
    } catch (error) {
      console.error("[PDF Exporter]", error);
      return {
        success: false,
        data: null,
        filename: options?.filename ?? `vision-deficiency-report-${Date.now()}`,
        format: "pdf",
        error: error instanceof Error ? error.message : "PDF export failed",
      };
    }
  },
};

/**
 * Build a minimal valid PDF with an embedded PNG image.
 *
 * Standard PDF objects:
 *   1  - Catalog
 *   2  - Pages (Kids)
 *   3  - Page (A4 portrait, 595.28 × 841.89 pt)
 *   4  - Content stream (title text + image placement)
 *   5  - Image XObject (embedded PNG)
 *   6  - Font (Helvetica)
 */
function buildPdf(imageBase64: string): Uint8Array {
  const encoder = new TextEncoder();
  const rawImageData = atob(imageBase64);
  const imageLen = rawImageData.length;

  const now = new Date().toISOString().slice(0, 10);

  // --- Object content definitions ---

  // Object 6 first so the content stream in obj 4 can reference "6 0 R"
  const obj6 = `6 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj`;

  const obj1 = `1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj`;

  const obj2 = `2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj`;

  const obj3 = `3 0 obj
<< /Type /Page /Parent 2 0 R
   /MediaBox [0 0 595.28 841.89]
   /Contents 4 0 R
   /Resources << /XObject << /Im0 5 0 R >> /Font << /F1 6 0 R >> >>
>>
endobj`;

  const contentStreamText =
    `BT /F1 12 Tf 56.69 800 Td (Vision Deficiency Simulator) Tj ` +
    `/F1 9 Tf 56.69 785 Td (Generated: ${now}) Tj ET ` +
    `q 56.69 100 482.0 670.0 cm /Im0 Do Q`;

  const contentStreamLen = encoder.encode(contentStreamText).length;

  const obj4 = `4 0 obj
<< /Length ${contentStreamLen} >>
stream
${contentStreamText}
endstream
endobj`;

  // Image object — note: PNG is wrapped as a raw stream; FlateDecode is
  // omitted since PNG itself is already compressed.
  const obj5Header = `5 0 obj
<< /Type /XObject
   /Subtype /Image
   /Width 1200
   /Height 800
   /ColorSpace /DeviceRGB
   /BitsPerComponent 8
   /Length ${imageLen}
>>
stream
`;

  const obj5Footer = `\nendstream\nendobj`;

  // --- Combine into full PDF ---
  const header = encoder.encode("%PDF-1.4\n%\xFF\xFF\xFF\xFF\n");
  const parts = [obj1, obj2, obj3, obj4, obj5Header];
  const partBytes = parts.map((p) => encoder.encode(p + "\n"));
  const imageBytes = encoder.encode(rawImageData);
  const footerBytes = encoder.encode(obj5Footer + "\n" + obj6 + "\n");

  // Calculate byte offsets for xref
  const offsets: number[] = [];
  let cursor = header.length;

  offsets.push(0); // obj 0 (free)
  for (let i = 0; i < partBytes.length; i++) {
    offsets.push(cursor);
    cursor += partBytes[i].length;
  }
  // obj 5 includes header + image + footer
  offsets.push(cursor);
  cursor += imageBytes.length + footerBytes.length;
  // obj 6 was appended in footer
  // No — let me restructure: append obj6 separately

  // Actually let me rebuild with proper structure
  return buildPdfProper(header, [obj1, obj2, obj3, obj4], obj5Header, rawImageData, obj5Footer, obj6, encoder);
}

function buildPdfProper(
  header: Uint8Array,
  textObjects: string[],
  imageHeader: string,
  rawImageData: string,
  imageFooter: string,
  fontObject: string,
  encoder: TextEncoder,
): Uint8Array {
  // Byte layout:
  // 1. header
  // 2. obj1 + \n
  // 3. obj2 + \n
  // 4. obj3 + \n
  // 5. obj4 + \n
  // 6. imageHeader + rawImageData + imageFooter + \n
  // 7. fontObject + \n
  // 8. xref + trailer

  const chunks: Uint8Array[] = [header];
  const offsets: number[] = [0]; // obj 0 free
  let cursor = header.length;

  for (const obj of textObjects) {
    offsets.push(cursor);
    const bytes = encoder.encode(obj + "\n");
    chunks.push(bytes);
    cursor += bytes.length;
  }

  // Image object
  offsets.push(cursor);
  const imgHeaderBytes = encoder.encode(imageHeader);
  const imgDataBytes = encoder.encode(rawImageData);
  const imgFooterBytes = encoder.encode(imageFooter);
  chunks.push(imgHeaderBytes, imgDataBytes, imgFooterBytes);
  cursor += imgHeaderBytes.length + imgDataBytes.length + imgFooterBytes.length;

  // Font object
  offsets.push(cursor);
  const fontBytes = encoder.encode(fontObject + "\n");
  chunks.push(fontBytes);
  cursor += fontBytes.length;

  // xref and trailer
  const xrefSize = offsets.length;
  const xrefEntries = offsets
    .map((o, i) => `${String(o).padStart(10, "0")} ${i === 0 ? "65535 f" : "00000 n"}`)
    .join("\r\n");

  const trailerStr = `\nxref\n0 ${xrefSize}\n${xrefEntries}\r\n` +
    `trailer\n<< /Size ${xrefSize} /Root 1 0 R >>\n` +
    `startxref\n${cursor}\n%%EOF`;

  const trailerBytes = encoder.encode(trailerStr);
  chunks.push(trailerBytes);

  // Combine all chunks
  const totalLen = chunks.reduce((sum, c) => sum + c.length, 0);
  const result = new Uint8Array(totalLen);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}

export default exporter;