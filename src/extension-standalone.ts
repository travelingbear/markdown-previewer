import * as vscode from 'vscode';

let currentPanel: vscode.WebviewPanel | undefined;
let currentDocument: vscode.TextDocument | undefined;
let currentMode: 'preview-first' | 'code-first' = 'preview-first';
let currentTheme: 'light' | 'dark' = 'light';
let statusBarItem: vscode.StatusBarItem;
let scrollSyncEnabled = true;
let editorScrollListener: vscode.Disposable | undefined;
let lastEditorLine = 0;
let lastPreviewLine = 0;
let isModeSwitching = false;

export function activate(context: vscode.ExtensionContext) {
    console.log('Markdown Previewer extension is activating...');
    
    // Initialize status bar (hidden by default)
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 1000);
    statusBarItem.command = 'markdownPreviewer.toggleMode';
    updateStatusBar();
    
    // Load settings
    const config = vscode.workspace.getConfiguration('markdownPreviewer');
    const savedMode = config.get<'preview-first' | 'code-first'>('defaultMode');
    if (savedMode) {
        currentMode = savedMode;
        updateStatusBar();
    }
    
    const savedTheme = config.get<'light' | 'dark'>('defaultTheme');
    if (savedTheme) {
        currentTheme = savedTheme;
    }
    
    // Auto-preview handler
    const handleFileOpening = (editor: vscode.TextEditor | undefined) => {
        if (editor?.document.languageId === 'markdown') {
            statusBarItem.show();
            const modeText = currentMode === 'preview-first' ? 'Preview First' : 'Code First';
            vscode.window.setStatusBarMessage(`📝 Markdown Mode: ${modeText}`, 3000);
            
            if (currentMode === 'preview-first') {
                setTimeout(() => {
                    openPreview(editor.document);
                }, 200);
            }
        } else if (!currentPanel) {
            // Only hide if no preview is open
            statusBarItem.hide();
        }
    };

    // Check current editor on activation
    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor?.document.languageId === 'markdown') {
        statusBarItem.show();
    }
    handleFileOpening(activeEditor);
    const editorChangeListener = vscode.window.onDidChangeActiveTextEditor(handleFileOpening);

    const openPreviewCommand = vscode.commands.registerCommand('markdownPreviewer.openPreview', () => {
        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor || activeEditor.document.languageId !== 'markdown') {
            vscode.window.showErrorMessage('Please open a markdown file to preview');
            return;
        }
        openPreview(activeEditor.document);
    });

    const toggleThemeCommand = vscode.commands.registerCommand('markdownPreviewer.toggleTheme', () => {
        currentTheme = currentTheme === 'light' ? 'dark' : 'light';
        saveThemeSettings();
        if (currentPanel && currentDocument) {
            updatePreviewContent(currentPanel, currentDocument);
        }
        vscode.window.showInformationMessage(`Markdown Preview theme switched to ${currentTheme} mode`);
    });

    const printCommand = vscode.commands.registerCommand('markdownPreviewer.print', async () => {
        if (!currentPanel || !currentDocument) {
            vscode.window.showErrorMessage('No markdown preview is currently open');
            return;
        }
        
        try {
            const markdownContent = currentDocument.getText();
            const { html: htmlContent } = convertMarkdownToHtml(markdownContent);
            const printHtml = getPrintableHtml(htmlContent);
            
            const os = require('os');
            const path = require('path');
            const fs = require('fs');
            
            const tempDir = os.tmpdir();
            const fileName = `markdown-print-${Date.now()}.html`;
            const tempFilePath = path.join(tempDir, fileName);
            
            fs.writeFileSync(tempFilePath, printHtml);
            
            const fileUri = vscode.Uri.file(tempFilePath);
            await vscode.env.openExternal(fileUri);
            
            vscode.window.showInformationMessage('Print page opened in browser. You can now print using Cmd+P or Ctrl+P.');
            
            setTimeout(() => {
                try {
                    fs.unlinkSync(tempFilePath);
                } catch (e) {}
            }, 30000);
            
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to create print page: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    });

    const toggleModeCommand = vscode.commands.registerCommand('markdownPreviewer.toggleMode', () => {
        let markdownDocument: vscode.TextDocument | undefined;
        
        if (currentDocument) {
            markdownDocument = currentDocument;
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
        
        currentMode = currentMode === 'preview-first' ? 'code-first' : 'preview-first';
        const modeText = currentMode === 'preview-first' ? 'Preview First' : 'Code First';
        
        updateStatusBar();
        saveSettings();
        
        isModeSwitching = true;
        
        if (currentMode === 'preview-first') {
            // Store current editor position before switching
            const activeEditor = vscode.window.activeTextEditor;
            if (activeEditor && activeEditor.document === markdownDocument) {
                lastEditorLine = activeEditor.visibleRanges[0]?.start.line || 0;
            }
            openPreview(markdownDocument);
        } else {
            // Store current preview position before switching
            if (currentPanel) {
                currentPanel.dispose();
            }
            
            vscode.window.showTextDocument(markdownDocument, {
                viewColumn: vscode.ViewColumn.Active,
                preserveFocus: false
            }).then(editor => {
                // Restore editor position
                if (lastPreviewLine > 0 || lastEditorLine > 0) {
                    const line = Math.max(lastPreviewLine, lastEditorLine);
                    const position = new vscode.Position(line, 0);
                    const range = new vscode.Range(position, position);
                    editor.revealRange(range, vscode.TextEditorRevealType.AtTop);
                }
            });
        }
        
        setTimeout(() => { isModeSwitching = false; }, 300);
        
        vscode.window.setStatusBarMessage(`📝 Switched to: ${modeText}`, 2000);
        vscode.window.showInformationMessage(`Markdown Previewer mode: ${modeText}`);
    });

    context.subscriptions.push(
        openPreviewCommand, 
        toggleThemeCommand, 
        toggleModeCommand,
        printCommand,
        editorChangeListener,
        statusBarItem
    );
    
    console.log('Markdown Previewer commands registered successfully');
    vscode.window.showInformationMessage('Markdown Previewer commands ready!');
}

function openPreview(document: vscode.TextDocument) {
    if (currentPanel) {
        currentPanel.reveal();
        currentDocument = document;
        updatePreviewContent(currentPanel, document);
        return;
    }

    currentPanel = vscode.window.createWebviewPanel(
        'markdownPreview',
        `Preview: ${document.uri.path.split('/').pop()}`,
        vscode.ViewColumn.Active,
        { 
            enableScripts: true, 
            retainContextWhenHidden: true,
            localResourceRoots: [vscode.Uri.file(vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '')]
        }
    );

    // Handle messages from webview (checkbox updates, text input updates, scroll sync, save, toggle mode, and print)
    currentPanel.webview.onDidReceiveMessage(
        message => {
            if (message.type === 'checkboxToggle' && currentDocument) {
                toggleCheckboxInDocument(currentDocument, message.line, message.checked);
            } else if (message.type === 'updateTextInMarkdown' && currentDocument) {
                updateTextInMarkdown(currentDocument, message.label, message.value);
            } else if (message.type === 'previewScroll' && currentDocument && scrollSyncEnabled && !isModeSwitching) {
                lastPreviewLine = message.line;
                syncEditorToPreview(message.line);
            } else if (message.type === 'saveDocument' && currentDocument) {
                vscode.workspace.saveAll();
            } else if (message.type === 'toggleMode') {
                vscode.commands.executeCommand('markdownPreviewer.toggleMode');
            } else if (message.type === 'print') {
                vscode.commands.executeCommand('markdownPreviewer.print');
            }
        }
    );

    // Setup editor scroll sync
    setupEditorScrollSync();

    currentPanel.onDidDispose(() => {
        // Switch to code-first mode when preview is closed
        if (currentMode === 'preview-first') {
            currentMode = 'code-first';
            updateStatusBar();
            saveSettings();
            vscode.window.setStatusBarMessage('📝 Switched to: Code First', 2000);
        }
        
        currentPanel = undefined;
        currentDocument = undefined;
        if (editorScrollListener) {
            editorScrollListener.dispose();
            editorScrollListener = undefined;
        }
        
        // Ensure status bar stays visible if markdown file is still active
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor?.document.languageId === 'markdown') {
            statusBarItem.show();
        }
    });

    currentDocument = document;
    updatePreviewContent(currentPanel, document);
    
    // Ensure status bar stays visible when preview opens
    statusBarItem.show();
}

function updatePreviewContent(panel: vscode.WebviewPanel, document: vscode.TextDocument) {
    const markdownContent = document.getText();
    const { html: htmlContent, lineMap } = convertMarkdownToHtml(markdownContent);
    panel.webview.html = getWebviewContent(htmlContent, lineMap);
    
    // Restore scroll position after content update
    setTimeout(() => {
        if (lastEditorLine > 0 && currentPanel) {
            currentPanel.webview.postMessage({
                type: 'scrollToLine',
                line: lastEditorLine
            });
        }
    }, 200);
}

function convertMarkdownToHtml(markdown: string): { html: string; lineMap: number[] } {
    try {
        const MarkdownIt = require('markdown-it');
        const hljs = require('highlight.js');
        
        const md = new MarkdownIt({
            html: true,
            linkify: true,
            typographer: true,
            highlight: function (str: string, lang: string) {
                if (lang && hljs.getLanguage(lang)) {
                    try {
                        return hljs.highlight(str, { language: lang }).value;
                    } catch (__) {}
                }
                return '';
            }
        });
        
        // Try to load and use plugins safely
        try {
            const taskLists = require('markdown-it-task-lists');
            if (taskLists && typeof taskLists === 'function') {
                md.use(taskLists, { enabled: true });
            }
        } catch (e) {
            console.warn('Failed to load markdown-it-task-lists:', e);
        }
        
        try {
            const mermaid = require('markdown-it-mermaid');
            if (mermaid) {
                // Try different export patterns
                const plugin = mermaid.default || mermaid;
                if (typeof plugin === 'function') {
                    md.use(plugin);
                }
            }
        } catch (e) {
            console.warn('Failed to load markdown-it-mermaid:', e);
        }
        
        // Create line mapping
        const lines = markdown.split('\n');
        const lineMap: number[] = [];
        
        // Simple line mapping - each significant line gets mapped
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.length > 0 && !line.startsWith('```') && line !== '---') {
                lineMap.push(i);
            }
        }
        
        let html = md.render(markdown);
        
        // Convert text input syntax to HTML inputs
        html = html.replace(/([\w\s]+)\s*=\s*___+/g, (match: string, label: string) => {
            const inputId = `input_${Math.random().toString(36).substr(2, 9)}`;
            return `<div class="text-input-container">
                <label for="${inputId}" class="text-input-label">${label.trim()}:</label>
                <div class="input-row">
                    <textarea id="${inputId}" class="text-input" placeholder="Enter ${label.trim().toLowerCase()}..." rows="1"></textarea>
                    <button class="update-button" onclick="updateMarkdown('${inputId}', '${label.trim()}')">Save</button>
                </div>
            </div>`;
        });
        
        // Convert local image paths to webview URIs
        if (currentPanel && currentDocument) {
            const documentDir = vscode.Uri.file(currentDocument.uri.fsPath.substring(0, currentDocument.uri.fsPath.lastIndexOf('/')));
            html = html.replace(/src="(?!https?:\/\/)([^"]+\.(gif|png|jpg|jpeg|svg|webp))"/gi, (match: string, imagePath: string) => {
                try {
                    const cleanPath = imagePath.startsWith('./') ? imagePath.substring(2) : imagePath;
                    const imageUri = vscode.Uri.joinPath(documentDir, cleanPath);
                    const webviewUri = currentPanel!.webview.asWebviewUri(imageUri);
                    return `src="${webviewUri.toString()}"`;
                } catch (e) {
                    console.warn('Failed to convert image path:', imagePath, e);
                    return match;
                }
            });
        }
        
        return { html, lineMap };
    } catch (error) {
        console.error('Markdown conversion failed:', error);
        // Fallback to basic conversion
        const lines = markdown.split('\n');
        const lineMap: number[] = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.length > 0) {
                lineMap.push(i);
            }
        }
        
        const html = markdown
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');
        return { html, lineMap };
    }
}

function getWebviewContent(htmlContent: string, lineMap: number[]): string {
    const themeCSS = currentTheme === 'dark' ? getDarkThemeCSS() : getLightThemeCSS();
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Markdown Preview</title>
    <script src="https://cdn.jsdelivr.net/npm/mermaid@9.4.3/dist/mermaid.min.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/${currentTheme === 'dark' ? 'github-dark' : 'github'}.min.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
    <style>
        ${themeCSS}
        .task-list-item {
            list-style-type: none;
        }
        .task-list-item-checkbox {
            margin-right: 8px;
            cursor: pointer;
        }
        
        .code-block-container {
            position: relative;
        }
        
        .copy-button {
            position: absolute;
            top: 8px;
            left: 8px;
            background: ${currentTheme === 'dark' ? '#44475a' : '#f6f8fa'};
            border: 1px solid ${currentTheme === 'dark' ? '#6272a4' : '#d0d7de'};
            color: ${currentTheme === 'dark' ? '#f8f8f2' : '#24292f'};
            padding: 4px 8px;
            font-size: 12px;
            border-radius: 4px;
            cursor: pointer;
            opacity: 0;
            transition: opacity 0.2s;
        }
        
        .code-block-container:hover .copy-button {
            opacity: 1;
        }
        
        .copy-button:hover {
            background: ${currentTheme === 'dark' ? '#6272a4' : '#e1e4e8'};
        }
        
        .copy-button.copied {
            background: #28a745;
            color: white;
            border-color: #28a745;
        }
        
        .text-input-container {
            margin: 16px 0;
            padding: 12px;
            border: 1px solid ${currentTheme === 'dark' ? '#44475a' : '#d0d7de'};
            border-radius: 6px;
            background: ${currentTheme === 'dark' ? '#21222c' : '#f6f8fa'};
        }
        
        .text-input-label {
            display: block;
            font-weight: 600;
            margin-bottom: 8px;
            color: ${currentTheme === 'dark' ? '#f8f8f2' : '#24292f'};
        }
        
        .text-input {
            flex: 1;
            min-width: 150px;
            padding: 8px 12px;
            border: 1px solid ${currentTheme === 'dark' ? '#6272a4' : '#d0d7de'};
            border-radius: 4px;
            background: ${currentTheme === 'dark' ? '#282a36' : '#ffffff'};
            color: ${currentTheme === 'dark' ? '#f8f8f2' : '#24292f'};
            font-size: 14px;
            font-family: inherit;
            resize: both;
            white-space: pre-wrap;
            overflow-wrap: break-word;
        }
        
        .input-row {
            display: flex;
            flex-wrap: wrap;
            align-items: flex-start;
            gap: 8px;
        }
        
        .update-button {
            width: 70px;
            padding: 8px 12px;
            border: 1px solid ${currentTheme === 'dark' ? '#6272a4' : '#0969da'};
            border-radius: 4px;
            background: ${currentTheme === 'dark' ? '#6272a4' : '#0969da'};
            color: white;
            font-size: 12px;
            cursor: pointer;
            flex-shrink: 0;
        }
        
        .update-button:hover {
            background: ${currentTheme === 'dark' ? '#bd93f9' : '#0550ae'};
        }
        
        .update-button.saved {
            background: #28a745;
            border-color: #28a745;
        }
        
        .text-input:focus {
            outline: none;
            border-color: ${currentTheme === 'dark' ? '#bd93f9' : '#0969da'};
            box-shadow: 0 0 0 2px ${currentTheme === 'dark' ? 'rgba(189, 147, 249, 0.3)' : 'rgba(9, 105, 218, 0.3)'};
        }
    </style>
</head>
<body>
    ${htmlContent}
    <script>
        const vscode = acquireVsCodeApi();
        
        // Initialize syntax highlighting
        hljs.highlightAll();
        
        // Add copy buttons to code blocks
        document.querySelectorAll('pre code').forEach((codeBlock, index) => {
            const pre = codeBlock.parentElement;
            const container = document.createElement('div');
            container.className = 'code-block-container';
            
            const copyButton = document.createElement('button');
            copyButton.className = 'copy-button';
            copyButton.textContent = 'Copy';
            copyButton.onclick = () => {
                navigator.clipboard.writeText(codeBlock.textContent).then(() => {
                    copyButton.textContent = 'Copied!';
                    copyButton.classList.add('copied');
                    setTimeout(() => {
                        copyButton.textContent = 'Copy';
                        copyButton.classList.remove('copied');
                    }, 2000);
                });
            };
            
            pre.parentNode.insertBefore(container, pre);
            container.appendChild(pre);
            container.appendChild(copyButton);
        });
        
        // Initialize Mermaid
        mermaid.initialize({ 
            startOnLoad: true,
            theme: '${currentTheme === 'dark' ? 'dark' : 'default'}',
            flowchart: {
                useMaxWidth: true
            }
        });
        
        // Handle checkbox clicks and text input changes
        document.addEventListener('change', function(e) {
            if (e.target && e.target.type === 'checkbox' && e.target.classList.contains('task-list-item-checkbox')) {
                const listItem = e.target.closest('.task-list-item');
                if (listItem) {
                    const allItems = Array.from(document.querySelectorAll('.task-list-item'));
                    const lineIndex = allItems.indexOf(listItem);
                    
                    vscode.postMessage({
                        type: 'checkboxToggle',
                        line: lineIndex,
                        checked: e.target.checked
                    });
                }
            }
        });
        
        // Handle text input updates
        window.updateMarkdown = function(inputId, label) {
            const input = document.getElementById(inputId);
            const button = input.nextElementSibling;
            if (input && input.value.trim()) {
                vscode.postMessage({
                    type: 'updateTextInMarkdown',
                    label: label,
                    value: input.value
                });
                
                button.textContent = 'Saved!';
                button.classList.add('saved');
                setTimeout(() => {
                    button.textContent = 'Save';
                    button.classList.remove('saved');
                }, 2000);
            }
        };
        
        // Handle scroll sync
        let scrollTimeout;
        document.addEventListener('scroll', function() {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
                const elements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, ul, ol, blockquote, pre, li');
                const lineMap = ${JSON.stringify(lineMap)};
                
                let targetLine = 0;
                for (let i = 0; i < elements.length; i++) {
                    const element = elements[i];
                    const rect = element.getBoundingClientRect();
                    
                    if (rect.top >= -50) {
                        targetLine = lineMap[Math.min(i, lineMap.length - 1)] || i;
                        break;
                    }
                }
                
                vscode.postMessage({
                    type: 'previewScroll',
                    line: targetLine
                });
            }, 150);
        });
        
        // Handle keyboard shortcuts
        document.addEventListener('keydown', function(e) {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                vscode.postMessage({ type: 'saveDocument' });
            } else if (e.altKey && e.key === 'm') {
                e.preventDefault();
                vscode.postMessage({ type: 'toggleMode' });
            }
        });
        
        // Handle messages from extension
        window.addEventListener('message', event => {
            const message = event.data;
            if (message.type === 'scrollToLine') {
                const elements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, ul, ol, blockquote, pre, li');
                const lineMap = ${JSON.stringify(lineMap)};
                
                let targetElement = null;
                for (let i = 0; i < lineMap.length; i++) {
                    if (lineMap[i] >= message.line) {
                        targetElement = elements[i];
                        break;
                    }
                }
                
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'auto', block: 'start' });
                }
            } else if (message.type === 'updateInputValue') {
                const input = document.getElementById(message.inputId);
                if (input) {
                    input.value = message.value;
                }
            }
        });
    </script>
</body>
</html>`;
}

function getPrintableHtml(htmlContent: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Markdown Print Preview</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            color: #24292f;
            background-color: #ffffff;
            max-width: 800px;
            margin: 0 auto;
            padding: 32px;
        }
        
        h1, h2, h3, h4, h5, h6 {
            margin-top: 24px;
            margin-bottom: 16px;
            font-weight: 600;
            line-height: 1.25;
            page-break-after: avoid;
        }
        
        h1 { font-size: 2em; border-bottom: 1px solid #d0d7de; padding-bottom: 0.3em; }
        h2 { font-size: 1.5em; border-bottom: 1px solid #d0d7de; padding-bottom: 0.3em; }
        h3 { font-size: 1.25em; }
        h4 { font-size: 1em; }
        h5 { font-size: 0.875em; }
        h6 { font-size: 0.85em; color: #656d76; }
        
        p { margin-top: 0; margin-bottom: 16px; orphans: 3; widows: 3; }
        
        blockquote {
            padding: 0 1em;
            color: #24292f;
            border-left: 0.25em solid #d0d7de;
            margin: 0 0 16px 0;
            background-color: #f6f8fa;
            page-break-inside: avoid;
        }
        
        code {
            padding: 0.2em 0.4em;
            margin: 0;
            font-size: 85%;
            color: #24292f;
            background-color: #f6f8fa;
            border-radius: 6px;
            font-family: ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace;
        }
        
        pre {
            padding: 16px;
            overflow: auto;
            font-size: 85%;
            line-height: 1.45;
            color: #24292f;
            background-color: #f6f8fa;
            border-radius: 6px;
            margin-bottom: 16px;
            border: 1px solid #d0d7de;
            page-break-inside: avoid;
        }
        
        pre code {
            background-color: transparent;
            border: 0;
            padding: 0;
            margin: 0;
            font-size: 100%;
        }
        
        ul, ol { padding-left: 2em; margin-top: 0; margin-bottom: 16px; }
        li { margin-top: 0.25em; }
        
        table {
            border-spacing: 0;
            border-collapse: collapse;
            margin-top: 0;
            margin-bottom: 16px;
            page-break-inside: avoid;
        }
        
        table th, table td {
            padding: 6px 13px;
            border: 1px solid #d0d7de;
        }
        
        table th {
            font-weight: 600;
            background-color: #f6f8fa;
        }
        
        strong { font-weight: 600; }
        em { font-style: italic; }
        
        a {
            color: #0969da;
            text-decoration: none;
        }
        
        a:hover {
            text-decoration: underline;
        }
        
        hr {
            height: 0.25em;
            padding: 0;
            margin: 24px 0;
            background-color: #d0d7de;
            border: 0;
        }
        
        img {
            max-width: 100%;
            height: auto;
            border-radius: 6px;
            margin: 8px 0;
            page-break-inside: avoid;
        }
        
        @media print {
            body {
                font-size: 12pt;
                line-height: 1.4;
                padding: 20px;
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
            }
            
            h1 { font-size: 18pt; }
            h2 { font-size: 16pt; }
            h3 { font-size: 14pt; }
            h4 { font-size: 13pt; }
            h5 { font-size: 12pt; }
            h6 { font-size: 11pt; }
        }
    </style>
</head>
<body>
    ${htmlContent}
    <script>
        window.onload = function() {
            setTimeout(() => {
                window.print();
            }, 1000);
        };
    </script>
</body>
</html>`;
}

function toggleCheckboxInDocument(document: vscode.TextDocument, lineIndex: number, checked: boolean) {
    const edit = new vscode.WorkspaceEdit();
    const text = document.getText();
    const lines = text.split('\n');
    
    let taskCount = 0;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const taskMatch = line.match(/^(\s*)-\s+\[([ x])\]\s+(.*)$/);
        
        if (taskMatch) {
            if (taskCount === lineIndex) {
                const newCheckState = checked ? 'x' : ' ';
                const newLine = `${taskMatch[1]}- [${newCheckState}] ${taskMatch[3]}`;
                const range = new vscode.Range(
                    new vscode.Position(i, 0),
                    new vscode.Position(i, line.length)
                );
                edit.replace(document.uri, range, newLine);
                break;
            }
            taskCount++;
        }
    }
    
    vscode.workspace.applyEdit(edit);
}

function updateTextInMarkdown(document: vscode.TextDocument, label: string, value: string) {
    const edit = new vscode.WorkspaceEdit();
    const text = document.getText();
    const searchPattern = new RegExp(`${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*=\\s*___+`, 'g');
    const replacement = `${label} = ${value}`;
    
    const newText = text.replace(searchPattern, replacement);
    const fullRange = new vscode.Range(
        new vscode.Position(0, 0),
        new vscode.Position(document.lineCount, 0)
    );
    
    edit.replace(document.uri, fullRange, newText);
    vscode.workspace.applyEdit(edit);
}

function getLightThemeCSS(): string {
    return `
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            color: #24292f;
            background-color: #ffffff;
            max-width: none;
            margin: 0;
            padding: 32px;
        }
        
        h1, h2, h3, h4, h5, h6 {
            margin-top: 24px;
            margin-bottom: 16px;
            font-weight: 600;
            line-height: 1.25;
        }
        
        h1 { font-size: 2em; border-bottom: 1px solid #d0d7de; padding-bottom: 0.3em; }
        h2 { font-size: 1.5em; border-bottom: 1px solid #d0d7de; padding-bottom: 0.3em; }
        h3 { font-size: 1.25em; }
        h4 { font-size: 1em; }
        h5 { font-size: 0.875em; }
        h6 { font-size: 0.85em; color: #656d76; }
        
        p { margin-top: 0; margin-bottom: 16px; }
        
        blockquote {
            padding: 0 1em;
            color: #24292f;
            border-left: 0.25em solid #d0d7de;
            margin: 0 0 16px 0;
            background-color: #f6f8fa;
        }
        
        code {
            padding: 0.2em 0.4em;
            margin: 0;
            font-size: 85%;
            color: #24292f;
            background-color: #f6f8fa;
            border-radius: 6px;
            font-family: ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace;
        }
        
        pre {
            padding: 16px;
            overflow: auto;
            font-size: 85%;
            line-height: 1.45;
            color: #24292f;
            background-color: #f6f8fa;
            border-radius: 6px;
            margin-bottom: 16px;
            border: 1px solid #d0d7de;
        }
        
        pre code {
            background-color: transparent;
            border: 0;
            padding: 0;
            margin: 0;
            font-size: 100%;
        }
        
        ul, ol { padding-left: 2em; margin-top: 0; margin-bottom: 16px; }
        li { margin-top: 0.25em; }
        
        table {
            border-spacing: 0;
            border-collapse: collapse;
            margin-top: 0;
            margin-bottom: 16px;
        }
        
        table th, table td {
            padding: 6px 13px;
            border: 1px solid #d0d7de;
        }
        
        table th {
            font-weight: 600;
            background-color: #f6f8fa;
        }
        
        strong { font-weight: 600; }
        em { font-style: italic; }
        
        a {
            color: #0969da;
            text-decoration: none;
        }
        
        a:hover {
            text-decoration: underline;
        }
        
        hr {
            height: 0.25em;
            padding: 0;
            margin: 24px 0;
            background-color: #d0d7de;
            border: 0;
        }
        
        img {
            max-width: 100%;
            height: auto;
            border-radius: 6px;
            margin: 8px 0;
        }`;
}

function getDarkThemeCSS(): string {
    return `
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            color: #f0f6fc;
            background-color: #0d1117;
            max-width: none;
            margin: 0;
            padding: 32px;
        }
        
        h1, h2, h3, h4, h5, h6 {
            margin-top: 24px;
            margin-bottom: 16px;
            font-weight: 600;
            line-height: 1.25;
            color: #f0f6fc;
        }
        
        h1 { font-size: 2em; border-bottom: 1px solid #30363d; padding-bottom: 0.3em; }
        h2 { font-size: 1.5em; border-bottom: 1px solid #30363d; padding-bottom: 0.3em; }
        h3 { font-size: 1.25em; }
        h4 { font-size: 1em; }
        h5 { font-size: 0.875em; }
        h6 { font-size: 0.85em; color: #8b949e; }
        
        p { margin-top: 0; margin-bottom: 16px; }
        
        blockquote {
            padding: 0 1em;
            color: #f0f6fc;
            border-left: 0.25em solid #bd93f9;
            margin: 0 0 16px 0;
            background-color: #21222c;
        }
        
        code {
            padding: 0.2em 0.4em;
            margin: 0;
            font-size: 85%;
            color: #ff79c6;
            background-color: #282a36;
            border-radius: 6px;
            font-family: ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace;
        }
        
        pre {
            padding: 16px;
            overflow: auto;
            font-size: 85%;
            line-height: 1.45;
            color: #f8f8f2;
            background-color: #282a36;
            border-radius: 6px;
            margin-bottom: 16px;
            border: 1px solid #44475a;
        }
        
        pre code {
            background-color: transparent;
            border: 0;
            padding: 0;
            margin: 0;
            font-size: 100%;
            color: #f8f8f2;
        }
        
        ul, ol { padding-left: 2em; margin-top: 0; margin-bottom: 16px; }
        li { margin-top: 0.25em; }
        
        table {
            border-spacing: 0;
            border-collapse: collapse;
            margin-top: 0;
            margin-bottom: 16px;
        }
        
        table th, table td {
            padding: 6px 13px;
            border: 1px solid #30363d;
        }
        
        table th {
            font-weight: 600;
            background-color: #21262d;
        }
        
        strong { font-weight: 600; color: #50fa7b; }
        em { font-style: italic; color: #f1fa8c; }
        
        a {
            color: #8be9fd;
            text-decoration: none;
        }
        
        a:hover {
            text-decoration: underline;
            color: #bd93f9;
        }
        
        hr {
            height: 0.25em;
            padding: 0;
            margin: 24px 0;
            background-color: #30363d;
            border: 0;
        }
        
        img {
            max-width: 100%;
            height: auto;
            border-radius: 6px;
            margin: 8px 0;
        }`;
}

function updateStatusBar(): void {
    const icon = currentMode === 'preview-first' ? '$(eye)' : '$(code)';
    const text = currentMode === 'preview-first' ? 'Preview First' : 'Code First';
    
    statusBarItem.text = `${icon} ${text}`;
    statusBarItem.tooltip = `Current mode: ${text}. Click to toggle.`;
}

function saveSettings(): void {
    const config = vscode.workspace.getConfiguration('markdownPreviewer');
    config.update('defaultMode', currentMode, vscode.ConfigurationTarget.Global);
}

function saveThemeSettings(): void {
    const config = vscode.workspace.getConfiguration('markdownPreviewer');
    config.update('defaultTheme', currentTheme, vscode.ConfigurationTarget.Global);
}

function setupEditorScrollSync() {
    if (editorScrollListener) {
        editorScrollListener.dispose();
    }
    
    let scrollTimeout: NodeJS.Timeout;
    editorScrollListener = vscode.window.onDidChangeTextEditorVisibleRanges(e => {
        if (e.textEditor.document === currentDocument && scrollSyncEnabled && !isModeSwitching) {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                const line = e.visibleRanges[0]?.start.line || 0;
                lastEditorLine = line;
                if (currentPanel) {
                    syncPreviewToEditor(line);
                }
            }, 100);
        }
    });
}

function syncEditorToPreview(line: number) {
    scrollSyncEnabled = false;
    lastEditorLine = line;
    
    const editor = vscode.window.visibleTextEditors.find(e => e.document === currentDocument);
    if (editor) {
        const position = new vscode.Position(line, 0);
        const range = new vscode.Range(position, position);
        editor.revealRange(range, vscode.TextEditorRevealType.AtTop);
    }
    
    setTimeout(() => { scrollSyncEnabled = true; }, 200);
}

function syncPreviewToEditor(line: number) {
    if (currentPanel && !isModeSwitching) {
        scrollSyncEnabled = false;
        lastPreviewLine = line;
        
        currentPanel.webview.postMessage({
            type: 'scrollToLine',
            line: line
        });
        
        setTimeout(() => { scrollSyncEnabled = true; }, 300);
    }
}

export function deactivate() {
    if (currentPanel) {
        currentPanel.dispose();
    }
    if (statusBarItem) {
        statusBarItem.dispose();
    }
    if (editorScrollListener) {
        editorScrollListener.dispose();
    }
}