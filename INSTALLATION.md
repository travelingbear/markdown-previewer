# Installation Guide - Markdown Previewer Extension

## 📦 Quick Installation

### Method 1: VSCode Extensions Panel (Recommended)
1. Open VSCode
2. Press `Cmd+Shift+X` (Mac) or `Ctrl+Shift+X` (Windows/Linux)
3. Click the "..." menu in the Extensions panel
4. Select "Install from VSIX..."
5. Navigate to and select `markdown-previewer-enhanced.vsix`
6. Click "Install"
7. Reload VSCode when prompted

### Method 2: Command Line
```bash
code --install-extension markdown-previewer-enhanced.vsix
```

### Method 3: VSCode Command Palette
1. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
2. Type "Extensions: Install from VSIX..."
3. Select the command and choose the VSIX file

## ✅ Verify Installation

1. Open any `.md` file in VSCode
2. The file should automatically open in preview mode (if "Preview First" is set)
3. Check the status bar for the mode indicator: `👁️ Preview First` or `📝 Code First`
4. Right-click in the preview or editor to see context menu options

## 🎯 First Use

### Test Basic Functionality
1. **Open a markdown file** - Should auto-preview based on your mode setting
2. **Right-click in preview** - Should show "Toggle Mode" and "Toggle Theme" options
3. **Try the checkboxes** - Click any `- [ ]` checkbox in preview to see it update the source
4. **Test position sync** - Scroll in preview, then toggle to code view to see position sync

### Test New Features (v1.1.0)
1. **Position Sync**: 
   - Scroll in preview → editor should follow
   - Scroll in editor → preview should follow
   - Switch modes → position should be preserved

2. **Smart Mode Switching**:
   - Close preview panel → should auto-switch to "Code First"
   - Toggle back to preview → should reopen preview

3. **Theme Persistence**:
   - Switch to dark theme → close VSCode → reopen → should remember dark theme

## ⚙️ Configuration

Access settings via `Cmd+,` (Mac) or `Ctrl+,` (Windows/Linux), then search for "markdown previewer":

- **Default Mode**: Choose "preview-first" or "code-first"
- **Default Theme**: Choose "light" or "dark"  
- **Show Notifications**: Enable/disable mode switch notifications

## 🔧 Troubleshooting

### Extension Not Loading
- Ensure VSCode version is 1.74.0 or higher
- Try reloading VSCode: `Cmd+R` (Mac) or `Ctrl+R` (Windows/Linux)
- Check VSCode Developer Console: `Help > Toggle Developer Tools`

### Preview Not Opening
- Verify the file has `.md` extension
- Try manually: `Cmd+Shift+P` → "Markdown Previewer: Open Preview"
- Check if another markdown extension is conflicting

### Position Sync Not Working
- Ensure you're using version 1.1.0 or higher
- Try scrolling slowly and wait ~150ms for sync
- Check that both preview and editor panels are visible

### Theme Not Persisting
- Ensure you're using version 1.1.0 or higher
- Check VSCode settings for `markdownPreviewer.defaultTheme`
- Try manually setting the theme in VSCode settings

## 🆘 Support

If you encounter issues:

1. **Check the version**: Ensure you have v1.1.0 with all latest features
2. **Reload VSCode**: Often resolves temporary issues
3. **Check settings**: Verify configuration in VSCode settings
4. **Test with simple file**: Try with a basic markdown file first

## 🚀 Next Steps

Once installed, explore these features:

- **Interactive Checkboxes**: Click checkboxes in preview to update source
- **Mermaid Diagrams**: Add flowcharts and diagrams with ```mermaid blocks
- **Theme Switching**: Right-click in preview to toggle light/dark themes
- **Position Sync**: Experience seamless scrolling between preview and code
- **Smart Workflow**: Let the extension adapt to your editing preferences

---

**🎉 Enjoy your enhanced markdown editing experience!**