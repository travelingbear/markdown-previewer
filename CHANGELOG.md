# Changelog

All notable changes to the Markdown Previewer extension will be documented in this file.

## [1.1.3] - 2024-12-19

### ✨ New Features
- **GIF Support**: Added full support for animated GIF rendering in markdown preview
  - Local GIF files now render properly with animation
  - Remote GIF URLs continue to work seamlessly
  - GIFs display correctly in both light and dark themes
  - Proper image styling with responsive sizing and rounded corners
  - Support for all common image formats: GIF, PNG, JPG, JPEG, SVG, WebP
- **Save from Preview**: Added ability to save directly from preview mode
  - Press Ctrl+S (Windows/Linux) or Cmd+S (Mac) in preview to save changes
  - No need to switch back to code mode after checking/unchecking boxes
  - Seamless workflow for interactive markdown editing

### 🔧 Technical Improvements
- **Enhanced Image Handling**: Improved local resource access for webview
  - Fixed `localResourceRoots` configuration to allow workspace file access
  - Added automatic conversion of local image paths to webview URIs
  - Enhanced image path resolution for relative paths in markdown
- **Better Image Styling**: Added consistent image styling across themes
  - Responsive image sizing (max-width: 100%)
  - Consistent margins and border-radius for all images
  - Theme-aware image presentation
- **Improved Webview Communication**: Enhanced message handling for save functionality

### 📝 Testing
- Added comprehensive GIF test file (`test-gif.md`) for validation
- Verified compatibility with existing `vscode_extension.gif` in project

## [1.1.2] - 2024-12-19

### 🔧 Bug Fixes
- **Position Sync Improvements**: Refined scroll synchronization behavior between preview and editor
  - Improved sync accuracy during mode switching
  - Reduced unwanted scroll position changes during mode transitions
  - Better position preservation when switching between preview ↔ code modes
  - Enhanced sync timing and debouncing for smoother user experience

### 📝 Technical Notes
- Position sync provides section-level alignment rather than pixel-perfect matching
- This is expected behavior due to differences between markdown source lines and HTML rendering

## [1.1.1] - 2024-12-19

### 🔧 Performance Improvements
- **Optimized Activation**: Changed from universal (`*`) to specific activation events
  - Now activates only on markdown files and extension commands
  - Improved VSCode startup performance
  - Eliminated marketplace performance warning

## [1.1.0] - 2024-12-19

### ✨ New Features
- **Position Sync**: Added bidirectional scroll synchronization between preview and code editor
  - Scroll in preview automatically syncs to corresponding line in editor
  - Scroll in editor automatically syncs to corresponding section in preview
  - Position is preserved when switching between preview ↔ code modes
  - Debounced scrolling (150ms) for smooth performance

- **Smart Mode Switching**: Preview panel closure automatically switches to "Code First" mode
  - When user closes preview panel, extension switches to code-first mode
  - Clicking preview again will reopen the preview panel
  - Provides intuitive workflow for users who prefer code-first editing

- **Theme Persistence**: Theme preference now persists across VSCode sessions
  - Light/Dark theme choice is saved in VSCode settings
  - Theme preference is restored when VSCode is reopened
  - New setting: `markdownPreviewer.defaultTheme` (light/dark)

### 🔧 Technical Improvements
- Enhanced line mapping between markdown source and HTML elements
- Improved scroll event handling with proper debouncing
- Better position tracking during mode switches
- Added theme settings persistence to VSCode configuration

### 📝 Configuration
- Added `markdownPreviewer.defaultTheme` setting for theme persistence

## [1.0.0] - 2024-12-18

### 🎉 Initial Release

#### ✨ Core Features
- **GitHub-Style Rendering**: Authentic GitHub markdown styling with professional typography
- **Dual Theme Support**: Beautiful light theme and Dracula-inspired dark theme
- **Interactive Elements**: 
  - Clickable checkboxes that update source markdown automatically
  - Full Mermaid.js diagram support (flowcharts, sequence diagrams, etc.)
- **Auto-Preview System**: Smart file opening based on user preference
- **Seamless Mode Switching**: Toggle between preview ↔ code views in same panel

#### 🎨 Themes
- **GitHub Light**: Clean, professional styling matching GitHub's markdown rendering
- **Dracula Dark**: Beautiful dark mode with authentic Dracula color palette
- **Instant Theme Switching**: Right-click in preview to toggle themes

#### 🖱️ User Interface
- **Context Menus**: Right-click functionality in both editor and preview
- **Status Bar Integration**: Visual mode indicators with click-to-toggle
- **Command Palette**: All functions accessible via Cmd+Shift+P / Ctrl+Shift+P

#### ⌨️ Commands
- `Markdown Previewer: Open Preview` - Opens preview panel
- `Markdown Previewer: Toggle Mode (Preview ↔ Code)` - Switches between modes
- `Markdown Previewer: Toggle Theme (Light/Dark)` - Switches themes

#### 🛠️ Configuration
- `markdownPreviewer.defaultMode`: Set default mode ("preview-first" or "code-first")
- `markdownPreviewer.showModeNotifications`: Show status messages when switching modes

#### 🏗️ Technical Architecture
- Standalone extension implementation for maximum compatibility
- Webpack bundled with markdown-it, task-lists, and mermaid plugins
- TypeScript with strict type checking
- Comprehensive test suite with Jest
- Production-ready VSIX package (~1MB)

#### 📦 Distribution
- Local installation via VSIX package
- Zero configuration - works out of the box
- Cross-platform compatibility (Windows, macOS, Linux)

---

## Version Format

This project follows [Semantic Versioning](https://semver.org/):
- **MAJOR.MINOR.PATCH** (e.g., 1.1.0)
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

## Categories

- ✨ **New Features**: New functionality added
- 🔧 **Technical Improvements**: Code quality, performance, architecture
- 🐛 **Bug Fixes**: Issues resolved
- 📝 **Documentation**: Documentation updates
- 🎨 **UI/UX**: User interface improvements
- ⚡ **Performance**: Performance optimizations
- 🔒 **Security**: Security improvements