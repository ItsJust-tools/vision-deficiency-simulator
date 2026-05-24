/**
 * WebP Exporter for Vision Deficiency Simulator
 * Captures the tool canvas as a WebP image with accessibility simulation metadata
 */

import type { Exporter } from '@itsjust/core';

export const exporter: Exporter = {
  format: 'webp',
  export: async (element, options, stateSerializer) => {
    try {
      const { toBlob } = await import('html-to-image');
      const blob = await toBlob(element, {
        width: element.offsetWidth,
        height: element.offsetHeight,
        quality: 0.85,
        backgroundColor: '#ffffff',
        ...(options?.padding && { padding: options.padding }),
      });

      return {
        success: true,
        data: blob,
        filename: options?.filename ?? `vision-deficiency-sim-${Date.now()}.webp`,
        format: 'webp',
      };
    } catch (error) {
      console.error('[WebP Exporter]', error);
      return {
        success: false,
        data: null,
        filename: options?.filename ?? `vision-deficiency-sim-${Date.now()}`,
        format: 'webp',
        error: error instanceof Error ? error.message : 'Export failed',
      };
    }
  },
};

export default exporter;
