import * as _testing_library_react from '@testing-library/react';
import { RenderOptions } from '@testing-library/react';
import * as _testing_library_dom_types_queries from '@testing-library/dom/types/queries';
import React from 'react';
import * as react_jsx_runtime from 'react/jsx-runtime';

interface ToolTheme {
    accent?: string;
    accentHover?: string;
    accentSubtle?: string;
    brand?: string;
    brandUrl?: string;
    icon?: string;
}
interface ShortcutDef {
    keys: string;
    label: string;
    description?: string;
}
interface ShortcutGroup {
    title: string;
    shortcuts: ShortcutDef[];
}
interface ToolConfig {
    id: string;
    name: string;
    description: string;
    version: string;
    exportFormats: ExportFormat[];
    features: FeatureFlags;
    ogImage?: string;
    theme?: ToolTheme;
    shortcuts?: ShortcutGroup[];
}
interface FeatureFlags {
    export: boolean;
    autoSave: boolean;
    undoRedo: boolean;
    sidebar: boolean;
    statusBar: boolean;
    darkMode: boolean;
}
type ExportFormat = 'png' | 'pdf' | 'json' | 'jpeg' | 'webp';

declare const testConfig: ToolConfig;
declare function renderTool(ui: React.ReactElement, options?: Omit<RenderOptions, 'wrapper'>): _testing_library_react.RenderResult<typeof _testing_library_dom_types_queries, HTMLElement, HTMLElement>;
interface MockToolState<T> {
    data: T;
    setData: (updater: T | ((prev: T) => T)) => void;
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    clearHistory: () => void;
    lastSaved: string | null;
    isDirty: boolean;
    saveNow: () => Promise<void>;
}
declare function createMockToolState<T>(initial: T): MockToolState<T>;

declare function MockThemeProvider({ theme, children, }: {
    theme?: 'light' | 'dark';
    children: React.ReactNode;
}): react_jsx_runtime.JSX.Element;
declare function MockIntlProvider({ locale, messages, children, }: {
    locale?: string;
    messages?: Record<string, unknown>;
    children: React.ReactNode;
}): react_jsx_runtime.JSX.Element;

export { MockIntlProvider, MockThemeProvider, createMockToolState, renderTool, testConfig };
