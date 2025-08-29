"use strict";
/**
 * Status Bar Manager - Handles mode switching and status bar integration
 * Manages the status bar item that shows current preview mode
 * Provides persistent mode settings and visual feedback
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusBarManager = void 0;
const vscode = require("vscode");
/**
 * Manages status bar functionality including:
 * - Status bar item creation and updates
 * - Mode switching between preview-first and code-first
 * - Persistent settings storage and retrieval
 * - Visual feedback for current mode state
 */
class StatusBarManager {
    /**
     * Private constructor for singleton pattern
     * Creates status bar item and loads saved settings
     */
    constructor() {
        /** Current preview mode setting */
        this.currentMode = 'preview-first';
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 1000);
        this.statusBarItem.command = 'markdownPreviewer.toggleMode';
        this.updateStatusBar();
        this.loadSettings();
    }
    /**
     * Gets singleton instance of StatusBarManager
     * @returns StatusBarManager instance
     */
    static getInstance() {
        if (!StatusBarManager.instance) {
            StatusBarManager.instance = new StatusBarManager();
        }
        return StatusBarManager.instance;
    }
    /**
     * Updates status bar item text and icon based on current mode
     * Shows eye icon for preview-first, code icon for code-first
     */
    updateStatusBar() {
        const icon = this.currentMode === 'preview-first' ? '$(eye)' : '$(code)';
        const text = this.currentMode === 'preview-first' ? 'Preview First' : 'Code First';
        this.statusBarItem.text = `${icon} ${text}`;
        this.statusBarItem.tooltip = `Current mode: ${text}. Click to toggle.`;
    }
    show() {
        this.statusBarItem.show();
    }
    hide() {
        this.statusBarItem.hide();
    }
    toggleMode() {
        this.currentMode = this.currentMode === 'preview-first' ? 'code-first' : 'preview-first';
        this.updateStatusBar();
        this.saveSettings();
        if (this.onModeChangeCallback) {
            this.onModeChangeCallback(this.currentMode);
        }
    }
    getCurrentMode() {
        return this.currentMode;
    }
    setMode(mode) {
        this.currentMode = mode;
        this.updateStatusBar();
        this.saveSettings();
        if (this.onModeChangeCallback) {
            this.onModeChangeCallback(this.currentMode);
        }
    }
    onModeChange(callback) {
        this.onModeChangeCallback = callback;
    }
    saveSettings() {
        const config = vscode.workspace.getConfiguration('markdownPreviewer');
        config.update('defaultMode', this.currentMode, vscode.ConfigurationTarget.Global);
    }
    loadSettings() {
        const config = vscode.workspace.getConfiguration('markdownPreviewer');
        const savedMode = config.get('defaultMode');
        if (savedMode) {
            this.currentMode = savedMode;
            this.updateStatusBar();
        }
    }
    dispose() {
        this.statusBarItem.dispose();
    }
}
exports.StatusBarManager = StatusBarManager;
//# sourceMappingURL=statusBarManager.js.map