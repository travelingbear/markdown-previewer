/**
 * Status Bar Manager - Handles mode switching and status bar integration
 * Manages the status bar item that shows current preview mode
 * Provides persistent mode settings and visual feedback
 */

import * as vscode from 'vscode';

/** Type definition for preview modes */
export type PreviewMode = 'preview-first' | 'code-first';

/**
 * Manages status bar functionality including:
 * - Status bar item creation and updates
 * - Mode switching between preview-first and code-first
 * - Persistent settings storage and retrieval
 * - Visual feedback for current mode state
 */
export class StatusBarManager {
    /** Singleton instance */
    private static instance: StatusBarManager;
    
    /** VSCode status bar item for displaying current mode */
    private statusBarItem: vscode.StatusBarItem;
    
    /** Current preview mode setting */
    private currentMode: PreviewMode = 'preview-first';
    
    /** Callback function for mode change events */
    private onModeChangeCallback?: (mode: PreviewMode) => void;

    /**
     * Private constructor for singleton pattern
     * Creates status bar item and loads saved settings
     */
    private constructor() {
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Left, 
            1000
        );
        this.statusBarItem.command = 'markdownPreviewer.toggleMode';
        this.updateStatusBar();
        this.loadSettings();
    }

    /**
     * Gets singleton instance of StatusBarManager
     * @returns StatusBarManager instance
     */
    public static getInstance(): StatusBarManager {
        if (!StatusBarManager.instance) {
            StatusBarManager.instance = new StatusBarManager();
        }
        return StatusBarManager.instance;
    }

    /**
     * Updates status bar item text and icon based on current mode
     * Shows eye icon for preview-first, code icon for code-first
     */
    private updateStatusBar(): void {
        const icon = this.currentMode === 'preview-first' ? '$(eye)' : '$(code)';
        const text = this.currentMode === 'preview-first' ? 'Preview First' : 'Code First';
        
        this.statusBarItem.text = `${icon} ${text}`;
        this.statusBarItem.tooltip = `Current mode: ${text}. Click to toggle.`;
    }

    public show(): void {
        this.statusBarItem.show();
    }

    public hide(): void {
        this.statusBarItem.hide();
    }

    public toggleMode(): void {
        this.currentMode = this.currentMode === 'preview-first' ? 'code-first' : 'preview-first';
        this.updateStatusBar();
        this.saveSettings();
        
        if (this.onModeChangeCallback) {
            this.onModeChangeCallback(this.currentMode);
        }
    }

    public getCurrentMode(): PreviewMode {
        return this.currentMode;
    }

    public setMode(mode: PreviewMode): void {
        this.currentMode = mode;
        this.updateStatusBar();
        this.saveSettings();
        
        if (this.onModeChangeCallback) {
            this.onModeChangeCallback(this.currentMode);
        }
    }

    public onModeChange(callback: (mode: PreviewMode) => void): void {
        this.onModeChangeCallback = callback;
    }

    private saveSettings(): void {
        const config = vscode.workspace.getConfiguration('markdownPreviewer');
        config.update('defaultMode', this.currentMode, vscode.ConfigurationTarget.Global);
    }

    private loadSettings(): void {
        const config = vscode.workspace.getConfiguration('markdownPreviewer');
        const savedMode = config.get<PreviewMode>('defaultMode');
        if (savedMode) {
            this.currentMode = savedMode;
            this.updateStatusBar();
        }
    }

    public dispose(): void {
        this.statusBarItem.dispose();
    }
}