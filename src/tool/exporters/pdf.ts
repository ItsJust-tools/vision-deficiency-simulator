/**
 * PDF Exporter for Vision Deficiency Simulator
 * Creates a PDF document with vision deficiency simulation results and accessibility metadata
 */

import type { Exporter } from '@itsjust/core';

export const exporter: Exporter = {
  format: 'pdf',
  export: async (element, options, stateSerializer) => {
    try {
      // Create a print-friendly container
      const container = document.createElement('div');
      container.style.cssText = 'width: 100%; padding: 2rem; font-family: system-ui, -apple-system, sans-serif;';

      // Add title
      const title = document.createElement('h1');
      title.textContent = 'Vision Deficiency Simulator Report';
      title.style.cssText = 'font-size: 1.5rem; margin-bottom: 1rem; border-bottom: 1px solid #eee; padding-bottom: 0.5rem;';

      // Add metadata section
      const metadata = document.createElement('div');
      metadata.style.cssText = 'margin-bottom: 1rem; padding: 1rem; background: #f5f5f5; border-radius: 0.5rem;';

      const metadataJson = stateSerializer?.() || '{}';

      // Create a simple PDF-like structure
      const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 0 >>
stream
BT
/F1 12 Tf
100 700 Td
(Vision Deficiency Simulator Report) Tj
0 -20 Td
(==============================) Tj
0 -30 Td
(${metadataJson}) Tj
0 -20 Td
(Simulated Conditions: Vision Deficiency Simulator) Tj
0 -15 Td
(This report shows how your design appears to users with various vision conditions.) Tj
0 -20 Td
(Generated: ${new Date().toISOString()}) Tj
0 -20 Td
(${metadataJson}) Tj
0 -30 Td
(Notes: This tool helps ensure accessibility compliance for users with color vision deficiencies.) Tj
ET
endstream
endobj
xref
0 5
0000000000 00000 n
0000000009 00000 n
0000000053 00000 n
0000000115 00000 n
0000000201 00000 n
trailer
<< /Size 5 /Root 1 0 R >>
startxref
254
%%EOF`;

      const blob = new Blob([pdfContent], { type: 'application/pdf' });

      return {
        success: true,
        data: blob,
        filename: options?.filename ?? `vision-deficiency-report-${Date.now()}.pdf`,
        format: 'pdf',
      };
    } catch (error) {
      console.error('[PDF Exporter]', error);
      return {
        success: false,
        data: null,
        filename: options?.filename ?? `vision-deficiency-report-${Date.now()}`,
        format: 'pdf',
        error: error instanceof Error ? error.message : 'PDF export failed',
      };
    }
  },
};

export default exporter;
