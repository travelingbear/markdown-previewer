"use strict";
/**
 * Main extension entry point for Markdown Previewer
 * Handles extension activation, command registration, and auto-preview functionality
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const previewManager_1 = require("./previewManager");
const themeManager_1 = require("./themeManager");
const statusBarManager_1 = require("./statusBarManager");
/**
 * Extension activation function
 * Called when the extension is activated (when a markdown file is opened)
 * @param context - VSCode extension context for managing subscriptions and resources
 */
function activate(context) {
    console.log('Markdown Previewer extension is activating...');
    vscode.window.showInformationMessage('Markdown Previewer activated!');
    // Initialize all managers
    const previewManager = new previewManager_1.PreviewManager();
    const themeManager = themeManager_1.ThemeManager.getInstance();
    const statusBarManager = statusBarManager_1.StatusBarManager.getInstance();
    /**
     * Handles automatic preview when markdown files are opened
     * Respects user's mode preference (preview-first vs code-first)
     * @param editor - The active text editor, may be undefined
     */
    const handleFileOpening = (editor) => {
        if (editor?.document.languageId === 'markdown') {
            const currentMode = statusBarManager.getCurrentMode();
            // Show current mode in status message
            const modeText = currentMode === 'preview-first' ? 'Preview First' : 'Code First';
            vscode.window.setStatusBarMessage(`📝 Markdown Mode: ${modeText}`, 3000);
            // Auto-preview based on mode
            if (currentMode === 'preview-first') {
                setTimeout(() => {
                    previewManager.openPreview(editor.document);
                }, 200);
            }
        }
    };
    // Initial check
    handleFileOpening(vscode.window.activeTextEditor);
    // Listen for editor changes to handle auto-preview
    const editorChangeListener = vscode.window.onDidChangeActiveTextEditor(handleFileOpening);
    /**
     * Command: Open Preview
     * Opens markdown preview panel for the current document
     */
    const openPreviewCommand = vscode.commands.registerCommand('markdownPreviewer.openPreview', () => {
        previewManager.openPreview();
    });
    /**
     * Command: Toggle Theme
     * Switches between light and dark themes for markdown preview
     */
    const toggleThemeCommand = vscode.commands.registerCommand('markdownPreviewer.toggleTheme', () => {
        themeManager.toggleTheme();
        previewManager.refreshCurrentPreview();
        const currentTheme = themeManager.getCurrentTheme();
        vscode.window.showInformationMessage(`Markdown Preview theme switched to ${currentTheme} mode`);
    });
    /**
     * Command: Toggle Mode
     * Switches between 'preview-first' and 'code-first' modes
     * Affects how markdown files are opened by default
     */
    const toggleModeCommand = vscode.commands.registerCommand('markdownPreviewer.toggleMode', () => {
        // Use the currently previewed document first, then fall back to active editor
        let markdownDocument;
        // Priority 1: Currently previewed document
        if (previewManager.getCurrentDocument()) {
            markdownDocument = previewManager.getCurrentDocument();
        }
        else {
            // Priority 2: Active markdown editor
            const activeEditor = vscode.window.activeTextEditor;
            if (activeEditor && activeEditor.document.languageId === 'markdown') {
                markdownDocument = activeEditor.document;
            }
        }
        if (!markdownDocument) {
            vscode.window.showWarningMessage('Please open a markdown file to toggle preview mode');
            return;
        }
        statusBarManager.toggleMode();
        const currentMode = statusBarManager.getCurrentMode();
        const modeText = currentMode === 'preview-first' ? 'Preview First' : 'Code First';
        // Switch current markdown file based on new mode
        previewManager.switchMode(currentMode, markdownDocument);
        // Show mode change confirmation
        vscode.window.setStatusBarMessage(`📝 Switched to: ${modeText}`, 2000);
        vscode.window.showInformationMessage(`Markdown Previewer mode: ${modeText}`);
    });
    context.subscriptions.push(openPreviewCommand, toggleThemeCommand, toggleModeCommand, editorChangeListener);
    console.log('Markdown Previewer commands registered successfully');
    vscode.window.showInformationMessage('Markdown Previewer commands ready!');
}
exports.activate = activate;
/**
 * Extension deactivation function
 * Called when the extension is deactivated
 * Cleans up resources and disposes of managers
 */
function deactivate() {
    statusBarManager_1.StatusBarManager.getInstance().dispose();
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map