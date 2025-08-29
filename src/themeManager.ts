/**
 * Theme Manager - Handles light/dark theme switching and CSS generation
 * Provides GitHub-style light theme and Dracula-inspired dark theme
 * Supports both automatic theme detection and manual theme switching
 */

import * as vscode from 'vscode';

/**
 * Manages theme functionality for markdown preview including:
 * - Automatic theme detection based on VSCode color theme
 * - Manual theme switching between light and dark modes
 * - CSS generation for both themes with GitHub/Dracula styling
 * - Theme change event handling and notifications
 */
export class ThemeManager {
    /** Singleton instance */
    private static instance: ThemeManager;
    
    /** Current active theme */
    private currentTheme: 'light' | 'dark' = 'light';
    
    /** Whether to automatically detect theme from VSCode */
    private useAutoTheme: boolean = true;
    
    /** Callback function for theme change events */
    private onThemeChangeCallback?: () => void;

    /**
     * Private constructor for singleton pattern
     * Initializes theme detection and sets up listeners
     */
    private constructor() {
        this.detectTheme();
        this.setupThemeListener();
    }

    /**
     * Gets singleton instance of ThemeManager
     * @returns ThemeManager instance
     */
    public static getInstance(): ThemeManager {
        if (!ThemeManager.instance) {
            ThemeManager.instance = new ThemeManager();
        }
        return ThemeManager.instance;
    }

    /**
     * Detects current theme from VSCode color theme
     * Only applies when auto-theme is enabled
     */
    private detectTheme(): void {
        if (this.useAutoTheme) {
            const colorTheme = vscode.window.activeColorTheme;
            this.currentTheme = colorTheme.kind === vscode.ColorThemeKind.Dark ? 'dark' : 'light';
        }
    }

    /**
     * Sets up listener for VSCode theme changes
     * Automatically updates preview theme when VSCode theme changes
     */
    private setupThemeListener(): void {
        vscode.window.onDidChangeActiveColorTheme(() => {
            this.detectTheme();
            if (this.onThemeChangeCallback) {
                this.onThemeChangeCallback();
            }
        });
    }

    /**
     * Gets the current active theme
     * @returns Current theme ('light' or 'dark')
     */
    public getCurrentTheme(): 'light' | 'dark' {
        return this.currentTheme;
    }

    /**
     * Toggles between light and dark themes
     * Disables auto-theme when manually toggled
     */
    public toggleTheme(): void {
        this.useAutoTheme = false;
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        if (this.onThemeChangeCallback) {
            this.onThemeChangeCallback();
        }
    }

    public setAutoTheme(auto: boolean): void {
        this.useAutoTheme = auto;
        if (auto) {
            this.detectTheme();
            if (this.onThemeChangeCallback) {
                this.onThemeChangeCallback();
            }
        }
    }

    public isAutoTheme(): boolean {
        return this.useAutoTheme;
    }

    public onThemeChange(callback: () => void): void {
        this.onThemeChangeCallback = callback;
    }

    /**
     * Generates CSS for GitHub-style light theme
     * Includes typography, colors, and layout matching GitHub's markdown rendering
     * @returns CSS string for light theme
     */
    public getLightThemeCSS(): string {
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
        }`;
    }

    /**
     * Generates CSS for Dracula-inspired dark theme
     * Uses Dracula color palette with GitHub-style layout and typography
     * @returns CSS string for dark theme
     */
    public getDarkThemeCSS(): string {
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
        }`;
    }

    /**
     * Get theme styles for a specific theme (used by PDF export)
     * @param theme - The theme to get styles for
     * @returns CSS styles for the specified theme
     */
    public getThemeStyles(theme: 'light' | 'dark'): string {
        return theme === 'dark' ? this.getDarkThemeCSS() : this.getLightThemeCSS();
    }
}