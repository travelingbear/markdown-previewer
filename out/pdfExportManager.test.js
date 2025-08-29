"use strict";
/**
 * Test suite for PDF Export Manager
 * Tests PDF export functionality and HTML content generation
 */
Object.defineProperty(exports, "__esModule", { value: true });
const pdfExportManager_1 = require("./pdfExportManager");
// Mock vscode module
const mockShowSaveDialog = jest.fn();
const mockShowInformationMessage = jest.fn();
const mockShowErrorMessage = jest.fn();
const mockWithProgress = jest.fn();
jest.mock('vscode', () => ({
    window: {
        showSaveDialog: mockShowSaveDialog,
        showInformationMessage: mockShowInformationMessage,
        showErrorMessage: mockShowErrorMessage,
        withProgress: mockWithProgress
    },
    ProgressLocation: {
        Notification: 15
    },
    Uri: {
        file: jest.fn((path) => ({ fsPath: path }))
    },
    env: {
        openExternal: jest.fn()
    },
    commands: {
        executeCommand: jest.fn()
    }
}));
// Mock puppeteer
jest.mock('puppeteer', () => ({
    launch: jest.fn(() => Promise.resolve({
        newPage: jest.fn(() => Promise.resolve({
            setContent: jest.fn(),
            pdf: jest.fn()
        })),
        close: jest.fn()
    }))
}));
describe('PdfExportManager', () => {
    let pdfExportManager;
    let mockDocument;
    beforeEach(() => {
        pdfExportManager = pdfExportManager_1.PdfExportManager.getInstance();
        mockDocument = {
            uri: { fsPath: '/test/document.md' },
            fileName: 'document.md'
        };
        jest.clearAllMocks();
    });
    describe('getInstance', () => {
        it('should return singleton instance', () => {
            const instance1 = pdfExportManager_1.PdfExportManager.getInstance();
            const instance2 = pdfExportManager_1.PdfExportManager.getInstance();
            expect(instance1).toBe(instance2);
        });
    });
    describe('exportToPdf', () => {
        it('should handle user cancellation', async () => {
            mockShowSaveDialog.mockResolvedValue(undefined);
            mockWithProgress.mockImplementation(async (options, callback) => {
                await callback({ report: jest.fn() });
            });
            await pdfExportManager.exportToPdf(mockDocument, '<h1>Test</h1>');
            expect(mockShowSaveDialog).toHaveBeenCalled();
            expect(mockShowInformationMessage).not.toHaveBeenCalled();
        });
        it('should show success message after export', async () => {
            const saveUri = { fsPath: '/test/document.pdf' };
            mockShowSaveDialog.mockResolvedValue(saveUri);
            mockShowInformationMessage.mockResolvedValue('Open PDF');
            mockWithProgress.mockImplementation(async (options, callback) => {
                await callback({ report: jest.fn() });
            });
            await pdfExportManager.exportToPdf(mockDocument, '<h1>Test</h1>');
            expect(mockShowInformationMessage).toHaveBeenCalledWith(expect.stringContaining('PDF exported successfully'), 'Open PDF', 'Show in Finder');
        });
        it('should handle export errors', async () => {
            const saveUri = { fsPath: '/test/document.pdf' };
            mockShowSaveDialog.mockResolvedValue(saveUri);
            mockWithProgress.mockRejectedValue(new Error('Export failed'));
            await pdfExportManager.exportToPdf(mockDocument, '<h1>Test</h1>');
            expect(mockShowErrorMessage).toHaveBeenCalledWith(expect.stringContaining('Failed to export PDF'));
        });
    });
    describe('HTML wrapping for PDF', () => {
        it('should generate proper HTML structure', () => {
            // Access private method through any cast for testing
            const htmlContent = '<h1>Test Content</h1>';
            const wrappedHtml = pdfExportManager.wrapHtmlForPdf(htmlContent);
            expect(wrappedHtml).toContain('<!DOCTYPE html>');
            expect(wrappedHtml).toContain('<title>Markdown Export</title>');
            expect(wrappedHtml).toContain(htmlContent);
            expect(wrappedHtml).toContain('page-break-after: avoid');
        });
    });
});
//# sourceMappingURL=pdfExportManager.test.js.map