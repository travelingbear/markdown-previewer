"use strict";
/**
 * Preview Manager - Core markdown preview functionality
 * Handles webview creation, content rendering, and mode switching
 * Integrates with ThemeManager for styling and supports PDF export
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PreviewManager = void 0;
const vscode = require("vscode");
const themeManager_1 = require("./themeManager");
const markdownIt = require('markdown-it');
/**
 * Manages markdown preview functionality including:
 * - Webview panel creation and management
 * - Markdown to HTML conversion using markdown-it
 * - Theme integration and content updates
 * - Mode switching between preview and code views
 */
class PreviewManager {
    /**
     * Initialize PreviewManager with markdown-it configuration
     * Sets up HTML rendering, link detection, and typography
     */
    constructor() {
        this.md = new markdownIt({
            html: true,
            linkify: true,
            typographer: true
        });
        this.themeManager = themeManager_1.ThemeManager.getInstance();
        this.setupThemeListener();
    }
    /**
     * Opens markdown preview in a webview panel
     * Creates new panel or reuses existing one
     * @param document - Optional document to preview, defaults to active editor
     */
    openPreview(document) {
        const activeEditor = vscode.window.activeTextEditor;
        const targetDocument = document || activeEditor?.document;
        if (!targetDocument || targetDocument.languageId !== 'markdown') {
            vscode.window.showErrorMessage('Please open a markdown file to preview');
            return;
        }
        if (PreviewManager.currentPanel) {
            PreviewManager.currentPanel.reveal();
            PreviewManager.currentDocument = targetDocument;
            this.updateContent(targetDocument);
            PreviewManager.isInPreviewMode = true;
            return;
        }
        PreviewManager.currentPanel = vscode.window.createWebviewPanel('markdownPreview', `Preview: ${targetDocument.fileName}`, vscode.ViewColumn.Active, {
            enableScripts: true,
            retainContextWhenHidden: true
        });
        // Set webview ID for context menu
        PreviewManager.currentPanel.webviewId = 'markdownPreview';
        PreviewManager.currentPanel.onDidDispose(() => {
            PreviewManager.currentPanel = undefined;
            PreviewManager.currentDocument = undefined;
            PreviewManager.isInPreviewMode = false;
        });
        PreviewManager.currentDocument = targetDocument;
        PreviewManager.isInPreviewMode = true;
        this.updateContent(targetDocument);
    }
    /**
     * Sets up listener for theme changes
     * Automatically refreshes preview when theme is toggled
     */
    setupThemeListener() {
        this.themeManager.onThemeChange(() => {
            this.refreshCurrentPreview();
        });
    }
    /**
     * Refreshes the current preview with updated content
     * Used when themes change or content is modified
     */
    refreshCurrentPreview() {
        if (PreviewManager.currentPanel && PreviewManager.currentDocument) {
            this.updateContent(PreviewManager.currentDocument);
        }
    }
    /**
     * Switches between preview and code modes
     * @param mode - Target mode: 'preview-first' shows preview, 'code-first' shows editor
     * @param document - Document to switch mode for
     */
    switchMode(mode, document) {
        if (mode === 'preview-first') {
            // Switch to preview mode
            this.openPreview(document);
        }
        else {
            // Switch to code mode - close preview and show text editor
            if (PreviewManager.currentPanel) {
                PreviewManager.currentPanel.dispose();
            }
            // Ensure the document is shown in the active column
            vscode.window.showTextDocument(document, {
                viewColumn: vscode.ViewColumn.Active,
                preserveFocus: false
            });
        }
    }
    /**
     * Checks if currently in preview mode
     * @returns true if preview is active, false otherwise
     */
    isCurrentlyInPreviewMode() {
        return PreviewManager.isInPreviewMode;
    }
    /**
     * Gets the currently previewed document
     * @returns Current document or undefined if no preview active
     */
    getCurrentDocument() {
        return PreviewManager.currentDocument;
    }
    /**
     * Updates webview content with rendered markdown
     * @param document - Document to render and display
     */
    updateContent(document) {
        if (!PreviewManager.currentPanel)
            return;
        const markdownContent = document.getText();
        const htmlContent = this.md.render(markdownContent);
        PreviewManager.currentPanel.webview.html = this.getWebviewContent(htmlContent);
    }
    /**
     * Get HTML content for PDF export
     * @param document - The markdown document to convert
     * @returns Promise<string> - The rendered HTML content
     */
    async getHtmlContent(document) {
        const markdownContent = document.getText();
        return this.md.render(markdownContent);
    }
    /**
     * Generates complete HTML document for webview
     * Includes theme-specific CSS and proper HTML structure
     * @param htmlContent - Rendered markdown HTML content
     * @returns Complete HTML document string
     */
    getWebviewContent(htmlContent) {
        const currentTheme = this.themeManager.getCurrentTheme();
        const themeCSS = currentTheme === 'dark'
            ? this.themeManager.getDarkThemeCSS()
            : this.themeManager.getLightThemeCSS();
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Markdown Preview</title>
    <style>
        ${themeCSS}
    </style>
</head>
<body>
    ${htmlContent}
</body>
</html>`;
    }
}
exports.PreviewManager = PreviewManager;
/** Flag indicating if currently in preview mode */
PreviewManager.isInPreviewMode = false;
//# sourceMappingURL=previewManager.js.map