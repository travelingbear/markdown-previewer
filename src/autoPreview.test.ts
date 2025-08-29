import * as vscode from 'vscode';
import { PreviewManager } from './previewManager';
import { StatusBarManager } from './statusBarManager';

// Mock VSCode API
const mockShowTextDocument = jest.fn();
const mockCreateWebviewPanel = jest.fn();
const mockShowInformationMessage = jest.fn();

Object.defineProperty(vscode.window, 'showTextDocument', {
    value: mockShowTextDocument
});

Object.defineProperty(vscode.window, 'createWebviewPanel', {
    value: mockCreateWebviewPanel
});

Object.defineProperty(vscode.window, 'showInformationMessage', {
    value: mockShowInformationMessage
});

describe('Auto-Preview System (Phase 5)', () => {
    let previewManager: PreviewManager;
    let statusBarManager: StatusBarManager;
    let mockDocument: vscode.TextDocument;

    beforeEach(() => {
        jest.clearAllMocks();
        previewManager = new PreviewManager();
        statusBarManager = StatusBarManager.getInstance();
        
        mockDocument = {
            languageId: 'markdown',
            fileName: 'test.md',
            getText: () => '# Test Markdown'
        } as vscode.TextDocument;

        // Mock webview panel
        const mockPanel = {
            reveal: jest.fn(),
            dispose: jest.fn(),
            onDidDispose: jest.fn(),
            webview: { html: '' }
        };
        mockCreateWebviewPanel.mockReturnValue(mockPanel);
    });

    describe('Mode-based file opening', () => {
        test('should open preview when in preview-first mode', () => {
            statusBarManager.setMode('preview-first');
            
            previewManager.openPreview(mockDocument);
            
            expect(mockCreateWebviewPanel).toHaveBeenCalledWith(
                'markdownPreview',
                expect.stringContaining('test.md'),
                vscode.ViewColumn.Active,
                expect.any(Object)
            );
        });

        test('should not auto-open preview when in code-first mode', () => {
            statusBarManager.setMode('code-first');
            
            // Simulate file opening - should not create preview
            expect(previewManager.isCurrentlyInPreviewMode()).toBe(false);
        });
    });

    describe('Mode switching', () => {
        test('should switch from code to preview mode', () => {
            statusBarManager.setMode('code-first');
            
            previewManager.switchMode('preview-first', mockDocument);
            
            expect(mockCreateWebviewPanel).toHaveBeenCalled();
        });

        test('should switch from preview to code mode', () => {
            statusBarManager.setMode('preview-first');
            previewManager.openPreview(mockDocument);
            
            previewManager.switchMode('code-first', mockDocument);
            
            expect(mockShowTextDocument).toHaveBeenCalledWith(
                mockDocument,
                vscode.ViewColumn.Active
            );
        });
    });

    describe('Preview state tracking', () => {
        test('should track preview mode state correctly', () => {
            expect(previewManager.isCurrentlyInPreviewMode()).toBe(false);
            
            previewManager.openPreview(mockDocument);
            expect(previewManager.isCurrentlyInPreviewMode()).toBe(true);
        });
    });
});