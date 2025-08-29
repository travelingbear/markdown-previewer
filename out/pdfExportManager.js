"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfExportManager = void 0;
const vscode = require("vscode");
const path = require("path");
const themeManager_1 = require("./themeManager");
/**
 * Manages PDF export functionality for markdown documents
 * Uses puppeteer to convert HTML preview to PDF format
 */
class PdfExportManager {
    /**
     * Get singleton instance of PdfExportManager
     */
    static getInstance() {
        if (!PdfExportManager.instance) {
            PdfExportManager.instance = new PdfExportManager();
        }
        return PdfExportManager.instance;
    }
    /**
     * Export markdown document to PDF
     * @param document - The markdown document to export
     * @param htmlContent - The rendered HTML content
     */
    async exportToPdf(document, htmlContent) {
        try {
            console.log('Starting PDF export...');
            // Show progress indicator
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "Exporting to PDF...",
                cancellable: false
            }, async (progress) => {
                try {
                    progress.report({ increment: 0, message: "Initializing..." });
                    console.log('Progress: Initializing...');
                    // Get save location from user
                    const saveUri = await vscode.window.showSaveDialog({
                        defaultUri: vscode.Uri.file(path.join(path.dirname(document.uri.fsPath), path.basename(document.fileName, '.md') + '.pdf')),
                        filters: {
                            'PDF Files': ['pdf']
                        }
                    });
                    if (!saveUri) {
                        console.log('User cancelled PDF export');
                        return; // User cancelled
                    }
                    console.log('Save path:', saveUri.fsPath);
                    progress.report({ increment: 30, message: "Generating PDF..." });
                    // Generate PDF using puppeteer
                    await this.generatePdf(htmlContent, saveUri.fsPath);
                    progress.report({ increment: 100, message: "Complete!" });
                    console.log('PDF generation complete');
                    // Show success message with option to open
                    const action = await vscode.window.showInformationMessage(`PDF exported successfully to ${path.basename(saveUri.fsPath)}`, 'Open PDF', 'Show in Finder');
                    if (action === 'Open PDF') {
                        vscode.env.openExternal(saveUri);
                    }
                    else if (action === 'Show in Finder') {
                        vscode.commands.executeCommand('revealFileInOS', saveUri);
                    }
                }
                catch (progressError) {
                    console.error('Error in progress callback:', progressError);
                    throw progressError;
                }
            });
        }
        catch (error) {
            console.error('PDF Export Error:', error);
            console.error('Error type:', typeof error);
            console.error('Error constructor:', error?.constructor?.name);
            let errorMessage = 'Unknown error occurred during PDF export';
            if (error instanceof Error) {
                errorMessage = error.message;
                console.error('Error stack:', error.stack);
            }
            else if (typeof error === 'string') {
                errorMessage = error;
            }
            else if (error && typeof error === 'object') {
                errorMessage = JSON.stringify(error, null, 2);
            }
            vscode.window.showErrorMessage(`Failed to export PDF: ${errorMessage}`);
        }
    }
    /**
     * Generate PDF from HTML content using puppeteer
     * @param htmlContent - The HTML content to convert
     * @param outputPath - Path where PDF should be saved
     */
    async generatePdf(htmlContent, outputPath) {
        console.log('generatePdf called with output path:', outputPath);
        let puppeteer;
        try {
            puppeteer = require('puppeteer');
            console.log('Puppeteer loaded successfully');
        }
        catch (error) {
            console.error('Failed to load puppeteer:', error);
            throw new Error('Puppeteer not installed. Run: npm install puppeteer');
        }
        let browser;
        try {
            console.log('Launching puppeteer browser...');
            // Launch browser in headless mode with macOS-friendly settings
            browser = await puppeteer.launch({
                headless: 'new',
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--disable-gpu'
                ]
            });
            console.log('Browser launched successfully');
            const page = await browser.newPage();
            console.log('New page created');
            // Set content with proper styling
            const fullHtml = this.wrapHtmlForPdf(htmlContent);
            console.log('HTML wrapped for PDF, length:', fullHtml.length);
            await page.setContent(fullHtml, { waitUntil: 'networkidle0' });
            console.log('Content set on page');
            // Generate PDF with proper formatting
            console.log('Generating PDF to:', outputPath);
            await page.pdf({
                path: outputPath,
                format: 'A4',
                margin: {
                    top: '20mm',
                    right: '20mm',
                    bottom: '20mm',
                    left: '20mm'
                },
                printBackground: true,
                preferCSSPageSize: true
            });
            console.log('PDF generated successfully');
        }
        catch (pdfError) {
            console.error('Error during PDF generation:', pdfError);
            if (pdfError && pdfError.constructor && pdfError.constructor.name === 'ErrorEvent') {
                throw new Error(`Browser launch failed: ${pdfError.message || 'Puppeteer could not start browser'}`);
            }
            throw pdfError;
        }
        finally {
            if (browser) {
                console.log('Closing browser...');
                await browser.close();
                console.log('Browser closed');
            }
        }
    }
    /**
     * Wrap HTML content with proper PDF styling
     * @param htmlContent - The HTML content to wrap
     * @returns Complete HTML document ready for PDF conversion
     */
    wrapHtmlForPdf(htmlContent) {
        const themeManager = themeManager_1.ThemeManager.getInstance();
        const currentTheme = themeManager.getCurrentTheme();
        // Use light theme for PDF by default (better for printing)
        const pdfTheme = 'light';
        const styles = themeManager.getThemeStyles(pdfTheme);
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Markdown Export</title>
    <style>
        ${styles}
        
        /* PDF-specific styles */
        body {
            font-size: 12pt;
            line-height: 1.6;
            max-width: none;
            margin: 0;
            padding: 0;
        }
        
        /* Page break handling */
        h1, h2, h3, h4, h5, h6 {
            page-break-after: avoid;
            break-after: avoid;
        }
        
        pre, blockquote {
            page-break-inside: avoid;
            break-inside: avoid;
        }
        
        /* Print-friendly colors */
        code {
            background-color: #f6f8fa !important;
            color: #24292e !important;
        }
        
        pre {
            background-color: #f6f8fa !important;
            border: 1px solid #e1e4e8 !important;
        }
        
        blockquote {
            border-left: 4px solid #dfe2e5 !important;
            color: #6a737d !important;
        }
    </style>
</head>
<body>
    ${htmlContent}
</body>
</html>`;
    }
}
exports.PdfExportManager = PdfExportManager;
//# sourceMappingURL=pdfExportManager.js.map