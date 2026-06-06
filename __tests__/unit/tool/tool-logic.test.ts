import { describe, it, expect } from 'vitest';
import { visionTool } from '@/tool/tool-definition';
import type { VisionState, VisionCondition, SimulationResult } from '@/tool/types';

describe('Vision tool definition', () => {
  const defaultState: VisionState = visionTool.initialState;

  it('initializes with default state', () => {
    expect(defaultState.uploadMode).toBe(true);
    expect(defaultState.imageSrc).toBe('');
    expect(defaultState.activeCondition).toBe('normal');
    expect(defaultState.intensity).toBe(50);
    expect(defaultState.results).toEqual([]);
    expect(defaultState.notes).toBe('');
  });

  it('has correct metadata', () => {
    expect(visionTool.id).toBe('vision-deficiency-simulator');
    expect(visionTool.name).toBe('Vision Deficiency Simulator');
    expect(visionTool.version).toBe('1.0.0');
  });

  it('serializes state to JSON string', () => {
    const json = visionTool.serialize(defaultState);
    expect(() => JSON.parse(json)).not.toThrow();
    const parsed = JSON.parse(json);
    expect(parsed.uploadMode).toBe(true);
    expect(parsed.activeCondition).toBe('normal');
    expect(parsed.intensity).toBe(50);
  });

  it('serializes state with results and notes', () => {
    const state: VisionState = {
      uploadMode: false,
      imageSrc: 'data:image/png;base64,fake',
      activeCondition: 'deuteranopia',
      intensity: 80,
      results: [
        {
          condition: 'deuteranopia',
          description: 'Green-blindness',
          cssFilter: 'hue-rotate(110deg) saturate(1.3)',
          intensity: 80,
        },
      ],
      notes: 'notes',
    };

    const json = visionTool.serialize(state);
    const parsed = JSON.parse(json);
    expect(parsed.results).toHaveLength(1);
    expect(parsed.results[0].condition).toBe('deuteranopia');
    expect(parsed.notes).toBe('notes');
  });

  it('deserializes valid vision state with all fields', () => {
    const result = visionTool.deserialize({
      uploadMode: false,
      imageSrc: 'data:image/png;base64,fake123',
      activeCondition: 'achromatopsia',
      intensity: 100,
      results: [
        {
          condition: 'achromatopsia',
          description: 'Complete color blindness',
          cssFilter: 'grayscale(100%)',
          intensity: 100,
        },
      ],
      notes: 'Test simulation',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.uploadMode).toBe(false);
      expect(result.data.imageSrc).toBe('data:image/png;base64,fake123');
      expect(result.data.activeCondition).toBe('achromatopsia');
      expect(result.data.intensity).toBe(100);
      expect(result.data.results).toHaveLength(1);
      expect(result.data.notes).toBe('Test simulation');
    }
  });

  it('deserializes vision state without optional fields', () => {
    const result = visionTool.deserialize({
      uploadMode: true,
      activeCondition: 'normal',
      intensity: 50,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.imageSrc).toBe('');
      expect(result.data.results).toEqual([]);
      expect(result.data.notes).toBe('');
    }
  });

  it('rejects JSON string (only accepts plain objects)', () => {
    const result = visionTool.deserialize(JSON.stringify(defaultState));
    expect(result.success).toBe(false);
  });

  it('accepts all vision conditions', () => {
    const conditions: VisionCondition[] = [
      'protanopia', 'deuteranopia', 'tritanopia',
      'achromatopsia', 'cataracts', 'glaucoma',
      'diabetic-retinopathy', 'normal',
    ];

    for (const condition of conditions) {
      const result = visionTool.deserialize({
        uploadMode: true,
        activeCondition: condition,
        intensity: 50,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.activeCondition).toBe(condition);
      }
    }
  });

  it('rejects null data', () => {
    const result = visionTool.deserialize(null);
    expect(result.success).toBe(false);
  });

  it('rejects non-object data', () => {
    const result = visionTool.deserialize('not-an-object');
    expect(result.success).toBe(false);
  });

  it('rejects invalid JSON string', () => {
    const result = visionTool.deserialize('{invalid}');
    expect(result.success).toBe(false);
  });

  it('rejects object without uploadMode', () => {
    const result = visionTool.deserialize({
      activeCondition: 'normal',
      intensity: 50,
    });
    expect(result.success).toBe(false);
  });

  it('rejects non-boolean uploadMode', () => {
    const result = visionTool.deserialize({
      uploadMode: 'yes',
      activeCondition: 'normal',
      intensity: 50,
    });
    expect(result.success).toBe(false);
  });

  it('rejects object without activeCondition', () => {
    const result = visionTool.deserialize({
      uploadMode: true,
      intensity: 50,
    });
    expect(result.success).toBe(false);
  });

  it('rejects object without intensity', () => {
    const result = visionTool.deserialize({
      uploadMode: true,
      activeCondition: 'normal',
    });
    expect(result.success).toBe(false);
  });

  it('rejects non-number intensity', () => {
    const result = visionTool.deserialize({
      uploadMode: true,
      activeCondition: 'normal',
      intensity: 'high',
    });
    expect(result.success).toBe(false);
  });

  it('accepts any string as activeCondition (no enum validation)', () => {
    const result = visionTool.deserialize({
      uploadMode: true,
      activeCondition: 'unknown-condition',
      intensity: 50,
    });
    expect(result.success).toBe(true);
  });

  it('has correct exporters configured', () => {
    const exporters = visionTool.exporters ?? [];
    expect(exporters).toHaveLength(3);
    const formats = exporters.map((e) => e.format);
    expect(formats).toContain('png');
    expect(formats).toContain('webp');
    expect(formats).toContain('pdf');
  });

  it('has correct tool config', () => {
    expect(visionTool.config.id).toBe('vision-deficiency-simulator');
    expect(visionTool.config.name).toBe('Vision Deficiency Simulator');
    expect(visionTool.config.exportFormats).toContain('json');
    expect(visionTool.config.features.export).toBe(true);
    expect(visionTool.config.theme!.accent).toBe('#10b981');
  });
});