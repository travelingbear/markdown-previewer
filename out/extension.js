"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const previewManager_1 = require("./previewManager");
const themeManager_1 = require("./themeManager");
const statusBarManager_1 = require("./statusBarManager");
function activate(context) {
    console.log('Markdown Previewer extension is activating...');
    vscode.window.showInformationMessage('Markdown Previewer activated!');
    const previewManager = new previewManager_1.PreviewManager();
    const themeManager = themeManager_1.ThemeManager.getInstance();
    const statusBarManager = statusBarManager_1.StatusBarManager.getInstance();
    const handleFileOpening = (editor) => {
        if (editor?.document.languageId === 'markdown') {
            const currentMode = statusBarManager.getCurrentMode();
            const modeText = currentMode === 'preview-first' ? 'Preview First' : 'Code First';
            vscode.window.setStatusBarMessage(`📝 Markdown Mode: ${modeText}`, 3000);
            if (currentMode === 'preview-first') {
                setTimeout(() => {
                    previewManager.openPreview(editor.document);
                }, 200);
            }
        }
    };
    handleFileOpening(vscode.window.activeTextEditor);
    const editorChangeListener = vscode.window.onDidChangeActiveTextEditor(handleFileOpening);
    const openPreviewCommand = vscode.commands.registerCommand('markdownPreviewer.openPreview', () => {
        previewManager.openPreview();
    });
    const toggleThemeCommand = vscode.commands.registerCommand('markdownPreviewer.toggleTheme', () => {
        themeManager.toggleTheme();
        previewManager.refreshCurrentPreview();
        const currentTheme = themeManager.getCurrentTheme();
        vscode.window.showInformationMessage(`Markdown Preview theme switched to ${currentTheme} mode`);
    });
    const toggleModeCommand = vscode.commands.registerCommand('markdownPreviewer.toggleMode', () => {
        let markdownDocument;
        if (previewManager.getCurrentDocument()) {
            markdownDocument = previewManager.getCurrentDocument();
        }
        else {
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
        previewManager.switchMode(currentMode, markdownDocument);
        vscode.window.setStatusBarMessage(`📝 Switched to: ${modeText}`, 2000);
        vscode.window.showInformationMessage(`Markdown Previewer mode: ${modeText}`);
    });
    context.subscriptions.push(openPreviewCommand, toggleThemeCommand, toggleModeCommand, editorChangeListener);
    console.log('Markdown Previewer commands registered successfully');
    vscode.window.showInformationMessage('Markdown Previewer commands ready!');
}
exports.activate = activate;
function deactivate() {
    statusBarManager_1.StatusBarManager.getInstance().dispose();
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map