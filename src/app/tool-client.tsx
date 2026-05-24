'use client';

import { useCallback, useRef } from 'react';
import { downloadShareFile, shareViaWeb } from '@itsjust/core';
import { visionTool, ToolCanvas, ToolToolbar, ToolSidebar, templateMetadata } from '@/tool';
import { useToolState, useExport } from '@itsjust/core';

export default function ToolClient() {
  const canvasRef = useRef<HTMLDivElement>(null);

  const state = useToolState<typeof visionTool.initialState>(visionTool.initialState, {
    key: 'vision-deficiency-simulator',
    maxHistory: 100,
    autoSaveDelay: 0,
  });

  const { exportTo, supportedFormats, isExporting } = useExport(
    canvasRef,
    toolConfig,
    state.serialize,
  );

  const toolConfig = visionTool.config;

  const handleExport = useCallback(async (format: string) => {
    await exportTo(format);
  }, [exportTo]);

  return (
    <>
      <ToolToolbar
        onExport={() => handleExport('json')}
        imageSrc={state.data.imageSrc}
        activeCondition={state.data.activeCondition}
        intensity={state.data.intensity}
        onConditionChange={(condition) => state.setData((prev) => ({ ...prev, activeCondition: condition }))}
        onIntensityChange={(value) => state.setData((prev) => ({ ...prev, intensity: value }))}
      />
      <ToolCanvas
        imageSrc={state.data.imageSrc}
        activeCondition={state.data.activeCondition}
        intensity={state.data.intensity}
        canvasRef={canvasRef}
      />
      <ToolSidebar
        imageSrc={state.data.imageSrc}
        activeCondition={state.data.activeCondition}
        intensity={state.data.intensity}
      />
      {/* Share Actions - visible only when data is ready */}
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
        <button
          type="button"
          onClick={async () => {
            await downloadShareFile({
              toolId: toolConfig.id,
              content: state.serialize(),
              metadata: { schemaVersion: '1.0' },
            });
          }}
          disabled={isExporting}
          style={{
            padding: '0.375rem 0.75rem',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            background: 'var(--card)',
            color: 'var(--foreground)',
            cursor: isExporting ? 'not-allowed' : 'pointer',
            fontSize: '0.8125rem',
            fontWeight: 500,
            fontFamily: 'inherit',
          }}
          aria-disabled={isExporting}
        >
          Download .itsjust.json
        </button>
        <button
          type="button"
          onClick={async () => {
            await shareViaWeb({
              toolId: toolConfig.id,
              content: state.serialize(),
              metadata: { schemaVersion: '1.0' },
            });
          }}
          disabled={isExporting}
          style={{
            padding: '0.375rem 0.75rem',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            background: 'var(--card)',
            color: 'var(--foreground)',
            cursor: isExporting ? 'not-allowed' : 'pointer',
            fontSize: '0.8125rem',
            fontWeight: 500,
            fontFamily: 'inherit',
          }}
          aria-disabled={isExporting}
        >
          Share
        </button>
      </div>
    </>
  );
}
