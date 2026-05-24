import * as react from 'react';
import { ComponentType, ReactNode, RefObject, Component, ErrorInfo } from 'react';
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
declare const defaultFeatures: FeatureFlags;
type ExportFormat = 'png' | 'pdf' | 'json' | 'jpeg' | 'webp';

interface ExportOptions {
    format: ExportFormat;
    quality?: number;
    scale?: number;
    filename?: string;
    background?: string;
    padding?: number;
    orientation?: 'portrait' | 'landscape' | 'auto';
    allowSensitiveData?: boolean;
    signal?: AbortSignal;
}
interface ExportResult {
    success: boolean;
    data: Blob | string | null;
    filename: string;
    format: ExportFormat;
    error?: string;
}
interface Exporter {
    format: ExportFormat;
    export: (element: HTMLElement, options: ExportOptions, stateSerializer?: () => string) => Promise<ExportResult>;
}
type ExporterLoader = () => Promise<{
    default: Exporter;
} | {
    exporter: Exporter;
}>;
declare const formatLabels: {
    png: string;
    jpeg: string;
    webp: string;
    pdf: string;
    json: string;
};

interface ShareData {
    toolId: string;
    content: unknown;
    metadata?: {
        title?: string;
        description?: string;
        schemaVersion: string;
    };
}
interface ShareResult {
    id: string;
    url: string;
    createdAt: string;
}

interface StorageData<T> {
    data: T;
    savedAt: string;
    version: string;
    encoding?: 'plain' | 'lz-string';
}
interface AutoSaveOptions {
    enabled: boolean;
    debounceMs: number;
    maxWaitMs: number;
    key: string;
    maxHistoryEntries?: number;
    version?: string;
    storageManager?: {
        loadEntry: <T>(key: string, expectedVersion?: string) => {
            status: 'missing' | 'ok' | 'corrupt';
            data: T | null;
        };
        save: <T>(key: string, data: T, version?: string) => Promise<void>;
    };
    historyStorage?: Pick<Storage, 'getItem' | 'setItem'>;
    historyNamespace?: string;
}
declare const defaultAutoSaveOptions: AutoSaveOptions;

interface ToolState<T> {
    data: T;
    setData: (updater: T | ((prev: T) => T)) => void;
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    clearHistory: () => void;
    lastSaved: string | null;
    isDirty: boolean;
    isSaving: boolean;
    saveNow: () => Promise<void>;
}

/**
 * A plugin adds optional functionality to a tool without modifying the core shell.
 * Plugins are registered per-tool and rendered conditionally based on config.features.
 */
interface ToolPlugin {
    /** Unique plugin identifier (e.g. 'sidebar-panel', 'toolbar-extra') */
    id: string;
    /** Where the plugin should be mounted in the shell */
    slot: 'toolbar' | 'sidebar' | 'statusBar' | 'canvas';
    /** React component mounted by ToolShell */
    Component: ComponentType;
    /** Optional rendering order (lower first) */
    priority?: number;
    /** Optional predicate to control visibility */
    when?: (features: FeatureFlags) => boolean;
}

interface ToolExporterDefinition {
    format: ExportFormat;
    loader: ExporterLoader;
}
type DeserializeResult<T> = {
    success: true;
    data: T;
} | {
    success: false;
    error: string;
};
/**
 * Contract that every itsjust tool must implement.
 * Provides the framework with everything it needs for
 * state persistence, export, import, and sharing.
 *
 * @example
 * export const myTool: Tool<MyState> = {
 *   id: 'my-tool',
 *   name: 'My Tool',
 *   version: '1.0',
 *   config: toolConfig,
 *   initialState: { title: '' },
 *   serialize: (state) => JSON.stringify(state),
 *   deserialize: (data) => /* validate and parse *\/,
 *   exporters: [{ format: 'png', loader: () => import('./exporters/png') }],
 * };
 */
interface Tool<TState = unknown> {
    /** Unique identifier — used for storage keys and share files */
    id: string;
    /** Human-readable name */
    name: string;
    /** Schema version — bumped when share format changes */
    version: string;
    /** Full tool configuration */
    config: ToolConfig;
    /** State shown when the tool loads for the first time */
    initialState: TState;
    /** Convert state to a string for export / share */
    serialize(state: TState): string;
    /** Recover state from an imported / shared payload */
    deserialize(data: unknown): DeserializeResult<TState>;
    /** Declarative exporter registrations (replaces global registerExporterLoader side-effects) */
    exporters?: ToolExporterDefinition[];
}

declare class ExportEngine {
    private exporters;
    private localLoaders;
    private cachedFormats;
    private maxExporterCacheSize;
    constructor(localLoaders?: Partial<Record<ExportFormat, ExporterLoader>>, maxExporterCacheSize?: number);
    registerExporter(exporter: Exporter): void;
    getSupportedFormats(): ExportFormat[];
    private touchCache;
    loadExporter(format: ExportFormat): Promise<Exporter | undefined>;
    export(element: HTMLElement, options: ExportOptions, stateSerializer?: () => string): Promise<ExportResult>;
    exportAndDownload(element: HTMLElement, options: ExportOptions, stateSerializer?: () => string): Promise<ExportResult>;
}
declare function createExportEngine(localLoaders?: Partial<Record<ExportFormat, ExporterLoader>>, maxExporterCacheSize?: number): ExportEngine;

type StorageLoadStatus = 'missing' | 'ok' | 'corrupt';
interface StorageLoadResult<T> {
    status: StorageLoadStatus;
    data: T | null;
}
declare class StorageManager {
    private prefix;
    private defaultVersion?;
    private compressionThresholdBytes;
    constructor(prefix?: string, defaultVersion?: string, compressionThresholdBytes?: number);
    private key;
    save<T>(key: string, data: T, version?: string): Promise<void>;
    loadEntry<T>(key: string, expectedVersion?: string): StorageLoadResult<T>;
    load<T>(key: string, expectedVersion?: string): T | null;
    remove(key: string): void;
}
declare const storageManager: StorageManager;

/**
 * Hook that manages tool state with undo/redo, auto-save to localStorage,
 * and dirty-state tracking. Callers must treat state as immutable — never
 * mutate objects in-place or the dirty check will break.
 *
 * @param initial - The initial state value shown on first load.
 * @param options - Auto-save key, debounce, history limits, and schema version.
 *
 * @example
 * const state = useToolState({ text: '' }, { key: 'my-tool', debounceMs: 1000 });
 * state.setData(prev => ({ ...prev, text: 'hello' }));
 * state.undo();
 */
declare function useToolState<T>(initial: T, options?: Partial<AutoSaveOptions>): ToolState<T>;

type ImportResult = {
    success: true;
    data: unknown;
    fileName?: string;
    format?: ExportFormat;
    isItsJustFile?: boolean;
    toolId?: string;
} | {
    success: false;
    error: string;
    fileName?: string;
    format?: ExportFormat;
    isItsJustFile?: boolean;
};
type ImportFormat = ExportFormat | 'itsjust';
interface UseImportOptions {
    /** Accepted file formats (default: json) */
    acceptedFormats?: ImportFormat[];
    /** Called when a file is selected and imported (client-side only) */
    onImport?: (result: ImportResult) => void;
    /** Called when import fails */
    onImportError?: (error: string, fileName?: string) => void;
    /** Maximum file size in bytes (default: 5MB) */
    maxFileSize?: number;
}
declare function useImport({ acceptedFormats, onImport, onImportError, maxFileSize, }?: UseImportOptions): {
    isImporting: boolean;
    lastImport: ImportResult | null;
    importFromFile: (file: File) => Promise<ImportResult>;
    importFromEvent: (event: React.ChangeEvent<HTMLInputElement>) => Promise<ImportResult>;
    clearImport: () => void;
};

interface ToolbarActions {
    /** Undo the latest state change. */
    onUndo?: () => void;
    /** Redo a previously undone state change. */
    onRedo?: () => void;
    /** Export the current tool content in the selected format. */
    onExport?: (format: ExportFormat) => void;
    /** Reset tool state to defaults. */
    onReset?: () => void;
    /** Toggle sidebar visibility. */
    onToggleSidebar?: () => void;
    /** Current undo availability. */
    canUndo?: boolean;
    /** Current redo availability. */
    canRedo?: boolean;
    /** Formats currently exportable by the tool. */
    supportedFormats?: ExportFormat[];
    /** Handle clicks on the toolbar brand label. */
    onBrandClick?: () => void;
    /** Current value for inline brand editing. */
    brandValue?: string;
    /** Whether inline brand editing is active. */
    isBrandEditing?: boolean;
    /** Update the inline brand value. */
    onBrandChange?: (value: string) => void;
    /** Commit inline brand editing. */
    onBrandCommit?: () => void;
    /** Cancel inline brand editing. */
    onBrandCancel?: () => void;
    /** Open the keyboard shortcuts overlay. */
    onShowShortcuts?: () => void;
}

/**
 * Props for the main application shell that wraps every itsjust tool.
 * Provides layout, keyboard shortcuts, theme handling, and responsive sidebar.
 */
interface ToolShellProps {
    config: ToolConfig;
    readOnly?: boolean;
    actions?: ToolbarActions;
    sidebarOpen?: boolean;
    onSidebarChange?: (open: boolean) => void;
    toolbar?: ReactNode;
    sidebar?: ReactNode;
    canvas?: ReactNode;
    statusBar?: ReactNode;
    slots?: {
        toolbar?: ReactNode;
        sidebar?: ReactNode;
        canvas?: ReactNode;
        statusBar?: ReactNode;
    };
    /** Declarative plugins for additional toolbar, sidebar, statusBar or canvas content.
     *  Pass a stable array (useMemo or define outside the component) to avoid unnecessary re-renders. */
    plugins?: ToolPlugin[];
}
/**
 * The root layout component for any itsjust tool.
 * Renders a toolbar, optional sidebar, main canvas, and status bar.
 * Handles mobile responsiveness, keyboard shortcuts, and dark mode.
 */
declare function ToolShell({ config, readOnly, actions, sidebarOpen: controlledSidebarOpen, onSidebarChange, toolbar, sidebar, canvas, statusBar, slots, plugins, }: ToolShellProps): react_jsx_runtime.JSX.Element;
declare namespace ToolShell {
    var displayName: string;
}

interface UseToolResult<TState> {
    /** Managed tool state (undo/redo/auto-save) */
    state: ReturnType<typeof useToolState<TState>>;
    /** Ready-to-use toolbar actions for <ToolShell> */
    toolbarActions: ToolbarActions;
    /** Import a file (pass to <ImportExport>) */
    importFromFile: (file: File) => Promise<ImportResult>;
    /** Whether an import is in progress */
    isImporting: boolean;
    /** Whether an export is in progress */
    isExporting: boolean;
    /** Abort the current export operation */
    abortExport: () => void;
    /** Export handler (pass to <ImportExport>) */
    handleExport: (format: ExportFormat) => Promise<{
        success: boolean;
        error?: string;
    }>;
    /** Formats this tool supports */
    supportedFormats: ExportFormat[];
    /** Show a toast notification */
    toast: (message: string, type?: 'success' | 'error') => void;
}
/**
 * Unified hook that wires up state, export, import, share, undo/redo,
 * and command-palette actions for any tool that implements the {@link Tool} contract.
 *
 * @example
 * const tool = useTool(myToolDefinition, canvasRef);
 *
 * return (
 *   <ToolShell config={myToolDefinition.config} actions={tool.toolbarActions} commandActions={tool.commandActions}>
 *     …
 *   </ToolShell>
 * );
 */
declare function useTool<TState>(tool: Tool<TState>, canvasRef: React.RefObject<HTMLElement | null>): UseToolResult<TState>;

/**
 * Hook that provides client-side export functionality. Lazy-loads format-specific
 * exporters (image capture, print) on first use so they don't bloat the initial bundle.
 *
 * @param canvasRef - Ref to the DOM element that should be captured for image/PDF exports.
 * @param config - Tool configuration including which export formats are enabled.
 * @param stateSerializer - Optional serializer for JSON/state exports.
 * @param exporters - Declarative exporter registrations with lazy loaders.
 *
 * @example
 * const { exportTo, isExporting, supportedFormats } = useExport(canvasRef, config, serialize);
 * exportTo('png');
 */
declare function useExport(canvasRef: React.RefObject<HTMLElement | null>, config: ToolConfig, stateSerializer?: () => string, exporters?: Array<{
    format: ExportFormat;
    loader: ExporterLoader;
}>): {
    exportTo: (format: ExportFormat, options?: Partial<ExportOptions>) => Promise<ExportResult | null>;
    abortExport: () => void;
    isExporting: boolean;
    supportedFormats: ExportFormat[];
};

interface ShareFileResult extends ShareResult {
    isFile: boolean;
    blob?: Blob;
}
/**
 * Client-side only share functionality - no server required.
 * Supports:
 * - Download as .itsjust.json file
 * - Web Share API (native sharing on mobile/desktop)
 * - Copy to clipboard
 */
declare function useShare(): {
    createShareFile: (data: ShareData) => Blob;
    downloadShareFile: (data: ShareData, filename?: string) => Promise<void>;
    shareViaWeb: (data: ShareData, filename?: string) => Promise<boolean>;
    copyShareToClipboard: (data: ShareData) => Promise<boolean>;
    isCreating: boolean;
    shareResult: ShareFileResult | null;
    error: string | null;
    clearShare: () => void;
};

declare function useStorage(prefix?: string): {
    save: <T>(key: string, data: T) => Promise<void>;
    load: <T>(key: string) => T | null;
    clear: (key: string) => void;
};

interface UseDragAndDropImportOptions {
    onImport?: (file: File) => void | Promise<unknown>;
    acceptedFormats?: string[];
    targetRef?: RefObject<HTMLElement | null>;
}
declare function useDragAndDropImport({ onImport, acceptedFormats, targetRef, }?: UseDragAndDropImportOptions): {
    isDragging: boolean;
};

declare function useRelativeTime(dateIso: string | null): string;

declare function useKeyboardShortcuts(actions: ToolbarActions, onShowShortcuts: () => void): void;

/**
 * usePlugins — Build a plugin map from a declarative plugin list.
 *
 * @example
 * const plugins = usePlugins([
 *   { id: 'sidebar-panel', slot: 'sidebar', render: () => <MySidebar /> },
 * ]);
 */
declare function usePlugins(plugins: ToolPlugin[], features: FeatureFlags): Record<"toolbar" | "sidebar" | "statusBar" | "canvas", ToolPlugin[]>;

type Theme = 'light' | 'dark' | 'system';
type ContrastMode = 'normal' | 'more' | 'system';
interface ThemeContextValue {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    contrast: ContrastMode;
    setContrast: (contrast: ContrastMode) => void;
    resolvedTheme: 'light' | 'dark';
    resolvedContrast: 'normal' | 'more';
}
declare function ThemeProvider({ children, toolTheme, }: {
    children: React.ReactNode;
    toolTheme?: ToolTheme;
}): react_jsx_runtime.JSX.Element;
declare namespace ThemeProvider {
    var displayName: string;
}
declare function useTheme(): ThemeContextValue;

declare function ThemeScript({ toolTheme }: {
    toolTheme?: ToolTheme;
}): react_jsx_runtime.JSX.Element;

interface Toast {
    id: number;
    message: string;
    type: 'success' | 'error' | 'info';
    exiting?: boolean;
}
interface ToastContextValue {
    toast: (message: string, type?: Toast['type']) => void;
}
declare function useToast(): ToastContextValue;
declare function ToastProvider({ children }: {
    children: ReactNode;
}): react_jsx_runtime.JSX.Element;
declare namespace ToastProvider {
    var displayName: string;
}

interface KeyboardShortcutsOverlayProps {
    groups: ShortcutGroup[];
    onClose: () => void;
}
declare function KeyboardShortcutsOverlay({ groups, onClose }: KeyboardShortcutsOverlayProps): react_jsx_runtime.JSX.Element;
declare namespace KeyboardShortcutsOverlay {
    var displayName: string;
}

interface ImportExportProps {
    /** Supported formats for this tool */
    formats: ExportFormat[];
    /** Called when user wants to export */
    onExport?: (format: ExportFormat) => void;
    /** Called when a file is selected for import */
    onImport?: (file: File) => void | Promise<unknown>;
    /** Currently importing state */
    isImporting?: boolean;
    /** Currently exporting state */
    isExporting?: boolean;
    /** Called when user wants to create a shareable URL */
    onShare?: () => void | Promise<unknown>;
    /** Currently creating a share URL */
    isSharing?: boolean;
}
declare function ImportExport({ formats, onExport, onImport, isImporting, isExporting, onShare, isSharing, }: ImportExportProps): react_jsx_runtime.JSX.Element;
declare namespace ImportExport {
    var displayName: string;
}

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
}
interface ErrorBoundaryState {
    hasError: boolean;
}
declare class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps);
    static getDerivedStateFromError(): ErrorBoundaryState;
    componentDidCatch(error: Error, info: ErrorInfo): void;
    render(): string | number | bigint | boolean | Iterable<ReactNode> | Promise<string | number | bigint | boolean | react.ReactPortal | react.ReactElement<unknown, string | react.JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | react_jsx_runtime.JSX.Element | null | undefined;
}

declare const strings: {
    readonly en: {
        readonly import: "Import";
        readonly export: "Export";
        readonly share: "Share";
        readonly undo: "Undo";
        readonly redo: "Redo";
        readonly reset: "Reset";
        readonly resetConfirm: "Reset all data? This clears the current state, but you can undo it right away.";
        readonly save: "Save";
        readonly saving: "Saving...";
        readonly saved: "Saved";
        readonly unsaved: "Unsaved";
        readonly ready: "Ready";
        readonly closeSidebar: "Close sidebar";
        readonly toggleSidebar: "Toggle sidebar";
        readonly showOptions: "Show options";
        readonly hideOptions: "Hide options";
        readonly keyboardShortcuts: "Keyboard shortcuts";
        readonly closeShortcuts: "Close shortcuts";
        readonly pressToToggle: "Press Ctrl/Cmd + ? to toggle";
        readonly exportFailed: "Export failed";
        readonly exportSuccess: (format: string) => string;
        readonly importFailed: "Import failed";
        readonly dropFileToImport: "Drop file to import";
        readonly options: "Options";
        readonly switchToDarkMode: "Switch to dark mode";
        readonly switchToLightMode: "Switch to light mode";
        readonly enableHighContrast: "Enable high contrast";
        readonly disableHighContrast: "Disable high contrast";
        readonly dismissNotification: "Dismiss notification";
        readonly skipToContent: "Skip to content";
        readonly toolToolbar: "Tool toolbar";
        readonly importExport: "Import and Export";
        readonly rename: "Rename";
    };
};
type Locale = keyof typeof strings;
type StringKey = keyof (typeof strings)['en'];
/**
 * Retrieve a localized string. Falls back to English.
 * For parameterized strings, pass arguments after the key.
 */
declare function t(key: StringKey, locale?: Locale, ...args: string[]): string;

export { type AutoSaveOptions, ErrorBoundary, ExportEngine, type ExportFormat, type ExportOptions, type ExportResult, type Exporter, type ExporterLoader, type FeatureFlags, ImportExport, type ImportExportProps, type ImportResult, KeyboardShortcutsOverlay, type ShareData, type ShareResult, type ShortcutDef, type ShortcutGroup, type StorageData, StorageManager, ThemeProvider, ThemeScript, ToastProvider, type Tool, type ToolConfig, type ToolExporterDefinition, ToolShell, type ToolState, type ToolTheme, type ToolbarActions, type UseImportOptions, type UseToolResult, createExportEngine, defaultAutoSaveOptions, defaultFeatures, formatLabels, storageManager, t, useDragAndDropImport, useExport, useImport, useKeyboardShortcuts, usePlugins, useRelativeTime, useShare, useStorage, useTheme, useToast, useTool, useToolState };
