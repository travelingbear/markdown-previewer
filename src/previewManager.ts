/**
 * Preview Manager - Core markdown preview functionality
 * Handles webview creation, content rendering, and mode switching
 * Integrates with ThemeManager for styling and supports PDF export
 */

import * as vscode from 'vscode';
import { ThemeManager } from './themeManager';

/**
 * Manages markdown preview functionality including:
 * - Webview panel creation and management
 * - Markdown to HTML conversion using markdown-it
 * - Theme integration and content updates
 * - Mode switching between preview and code views
 */
export class PreviewManager {
    /** Current active webview panel for markdown preview */
    private static currentPanel: vscode.WebviewPanel | undefined;
    
    /** Document currently being previewed */
    private static currentDocument: vscode.TextDocument | undefined;
    
    /** Flag indicating if currently in preview mode */
    private static isInPreviewMode: boolean = false;
    
    /** Markdown-it instance for converting markdown to HTML */
    private readonly md: any;
    
    /** Theme manager instance for styling */
    private readonly themeManager: ThemeManager;

    /**
     * Initialize PreviewManager with markdown-it configuration
     * Sets up HTML rendering, link detection, and typography
     */
    constructor() {
        const MarkdownIt = require('markdown-it');
        const taskLists = require('markdown-it-task-lists');
        const mermaid = require('markdown-it-mermaid');
        
        this.md = new MarkdownIt({
            html: true,
            linkify: true,
            typographer: true
        })
        .use(taskLists, { enabled: true })
        .use(mermaid);
        
        this.themeManager = ThemeManager.getInstance();
        this.setupThemeListener();
    }

    /**
     * Opens markdown preview in a webview panel
     * Creates new panel or reuses existing one
     * @param document - Optional document to preview, defaults to active editor
     */
    public openPreview(document?: vscode.TextDocument) {
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

        PreviewManager.currentPanel = vscode.window.createWebviewPanel(
            'markdownPreview',
            `Preview: ${targetDocument.fileName}`,
            vscode.ViewColumn.Active,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );
        
        // Set webview ID for context menu
        (PreviewManager.currentPanel as any).webviewId = 'markdownPreview';

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
    private setupThemeListener() {
        this.themeManager.onThemeChange(() => {
            this.refreshCurrentPreview();
        });
    }

    /**
     * Refreshes the current preview with updated content
     * Used when themes change or content is modified
     */
    public refreshCurrentPreview() {
        if (PreviewManager.currentPanel && PreviewManager.currentDocument) {
            this.updateContent(PreviewManager.currentDocument);
        }
    }

    /**
     * Switches between preview and code modes
     * @param mode - Target mode: 'preview-first' shows preview, 'code-first' shows editor
     * @param document - Document to switch mode for
     */
    public switchMode(mode: 'preview-first' | 'code-first', document: vscode.TextDocument) {
        if (mode === 'preview-first') {
            // Switch to preview mode
            this.openPreview(document);
        } else {
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
    public isCurrentlyInPreviewMode(): boolean {
        return PreviewManager.isInPreviewMode;
    }

    /**
     * Gets the currently previewed document
     * @returns Current document or undefined if no preview active
     */
    public getCurrentDocument(): vscode.TextDocument | undefined {
        return PreviewManager.currentDocument;
    }

    /**
     * Updates webview content with rendered markdown
     * @param document - Document to render and display
     */
    private updateContent(document: vscode.TextDocument) {
        if (!PreviewManager.currentPanel) return;

        const markdownContent = document.getText();
        const htmlContent = this.md.render(markdownContent);
        
        PreviewManager.currentPanel.webview.html = this.getWebviewContent(htmlContent);
    }

    /**
     * Get HTML content for PDF export
     * @param document - The markdown document to convert
     * @returns Promise<string> - The rendered HTML content
     */
    public async getHtmlContent(document: vscode.TextDocument): Promise<string> {
        const markdownContent = document.getText();
        return this.md.render(markdownContent);
    }

    /**
     * Generates complete HTML document for webview
     * Includes theme-specific CSS and proper HTML structure
     * @param htmlContent - Rendered markdown HTML content
     * @returns Complete HTML document string
     */
    private getWebviewContent(htmlContent: string): string {
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
    <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
    <style>
        ${themeCSS}
        /* Checkbox styling */
        .task-list-item {
            list-style-type: none;
        }
        .task-list-item-checkbox {
            margin-right: 8px;
        }
    </style>
</head>
<body>
    ${htmlContent}
    <script>
        mermaid.initialize({ 
            startOnLoad: true,
            theme: '${currentTheme === 'dark' ? 'dark' : 'default'}'
        });
    </script>
</body>
</html>`;
    }
}