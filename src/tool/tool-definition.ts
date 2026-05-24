import type { Tool } from '@itsjust/core';
import toolConfig from './tool.config';
import type { VisionState } from './types';

function isVisionState(value: unknown): value is VisionState {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as { uploadMode?: unknown; imageSrc?: unknown; activeCondition?: unknown; intensity?: unknown; results?: unknown; notes?: unknown };
  if (typeof v.uploadMode !== 'boolean') return false;
  if (typeof v.activeCondition !== 'string') return false;
  if (typeof v.intensity !== 'number') return false;
  return true;
}

export const visionTool: Tool<VisionState> = {
  id: toolConfig.id,
  name: toolConfig.name,
  version: toolConfig.version,
  config: toolConfig,
  initialState: {
    uploadMode: true,
    imageSrc: '',
    activeCondition: 'normal',
    intensity: 50,
    results: [],
    notes: '',
  },
  serialize: (state) =>
    JSON.stringify({
      uploadMode: state.uploadMode,
      imageSrc: state.imageSrc,
      activeCondition: state.activeCondition,
      intensity: state.intensity,
      results: state.results,
      notes: state.notes,
    }, null, 2),
  deserialize: (data) => {
    if (isVisionState(data)) {
      return {
        success: true,
        data: {
          uploadMode: data.uploadMode,
          imageSrc: data.imageSrc || '',
          activeCondition: data.activeCondition,
          intensity: data.intensity,
          results: data.results || [],
          notes: data.notes || '',
        },
      };
    }
    return {
      success: false,
      error: 'Invalid data format: expected { uploadMode: boolean, imageSrc?: string, activeCondition: string, intensity: number, results?: SimulationResult[], notes?: string }',
    };
  },
  exporters: [],
};
