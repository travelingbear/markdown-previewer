# Markdown Previewer Extension

A VSCode extension that provides enhanced markdown preview functionality with GitHub-style rendering, auto-preview capabilities, and intuitive mode switching.

![vscode](vscode_extension.gif)

**Latest Update**: Version 1.5.1 fixes preview title updates, file tree navigation, and double-click file opening in preview mode.

## Features

### **Auto-Preview System**
- **Smart File Opening**: Click any `.md` file in the file browser
  - "Preview First" mode: Opens as rendered preview
  - "Code First" mode: Opens as raw markdown
- **Seamless Mode Switching**: Toggle between preview ↔ code in the same panel

### **Interactive Elements**
- **Copy Code Buttons**: One-click copy functionality on all code blocks with visual feedback
- **Print Support**: Browser-based printing with color syntax highlighting and optimized layout
- **Live Checkboxes**: Click checkboxes in preview to update source markdown automatically
- **Text Input Fields**: Interactive text inputs using `Label = ___` syntax with real-time updates
- **Save from Preview**: Press Ctrl+S (Cmd+S on Mac) to save directly from preview mode
- **Mermaid.js Diagrams**: Full support for flowcharts, sequence diagrams, and more
- **GIF Support**: Full animated GIF rendering for both local and remote images
- **Enhanced Scroll Sync**: Accurate bidirectional scroll synchronization with section-level precision between preview and code editor
- **Smart Mode Switching**: Preview closure automatically switches to code-first mode

### **Image & GIF Support**
- **Animated GIFs**: Full support for animated GIF rendering with proper animation
- **Local & Remote**: Support for both local files and remote URLs
- **All Formats**: GIF, PNG, JPG, JPEG, SVG, WebP with responsive sizing
- **Theme Compatible**: Images display in both light and dark themes

### **Intuitive Context Menus**
- **Right-click in Preview**:
  - Toggle Mode (Preview ↔ Code)
  - Toggle Theme (Light/Dark)
  - Print Document
- **Right-click in Markdown Editor**:
  - Toggle Mode (Preview ↔ Code)
  - Open Preview

### **Keyboard Shortcuts & Commands**
- **Alt+M / Option+M**: Quick toggle between Preview ↔ Code modes
- **Command Palette** via `Cmd+Shift+P` (Mac) / `Ctrl+Shift+P` (Windows):
  - "Markdown Previewer: Open Preview"
  - "Markdown Previewer: Toggle Mode (Preview ↔ Code)"
  - "Markdown Previewer: Toggle Theme (Light/Dark)"
  - "Markdown Previewer: Print"

## Installation & Usage

### Development Mode
1. Clone this repository
2. Open in VSCode
3. Run `npm install` to install dependencies
4. Press `F5` to launch in Extension Development Host
5. Open any `.md` file to see the extension in action!

### Using the Extension
1. **Open a markdown file** - It will automatically open in preview mode (if "Preview First" is set)
2. **Copy code easily**: Hover over any code block and click the "Copy" button that appears
3. **Add text inputs**: Use `Label = ___` syntax to create interactive text input fields
4. **Right-click for options**:
   - In preview: Toggle to code view or switch themes
   - In editor: Toggle to preview or open preview panel
5. **Use keyboard shortcuts**: Press **Alt+M** (Windows/Linux) or **Option+M** (Mac) to toggle modes
6. **Use Command Palette**: `Cmd+Shift+P` → "Markdown Previewer" commands

## Configuration

The extension provides these settings:

- `markdownPreviewer.defaultMode`: Set default mode ("preview-first" or "code-first")
- `markdownPreviewer.defaultTheme`: Set default theme ("light" or "dark")
- `markdownPreviewer.showModeNotifications`: Show status messages when switching modes

## License

This project is open source and available under the MIT License.
