import * as vscode from 'vscode';
import { PreviewManager } from './previewManager';
import { ThemeManager } from './themeManager';
import { StatusBarManager } from './statusBarManager';

export function activate(context: vscode.ExtensionContext) {
    console.log('Markdown Previewer extension is activating...');
    vscode.window.showInformationMessage('Markdown Previewer activated!');

    const previewManager = new PreviewManager();
    const themeManager = ThemeManager.getInstance();
    const statusBarManager = StatusBarManager.getInstance();

    const handleFileOpening = (editor: vscode.TextEditor | undefined) => {
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
        let markdownDocument: vscode.TextDocument | undefined;
        
        if (previewManager.getCurrentDocument()) {
            markdownDocument = previewManager.getCurrentDocument();
        } else {
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

    context.subscriptions.push(
        openPreviewCommand, 
        toggleThemeCommand, 
        toggleModeCommand,
        editorChangeListener
    );
    
    console.log('Markdown Previewer commands registered successfully');
    vscode.window.showInformationMessage('Markdown Previewer commands ready!');
}

export function deactivate() {
    StatusBarManager.getInstance().dispose();
}