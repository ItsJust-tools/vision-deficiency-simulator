# Changelog

All notable changes to the Vision Deficiency Simulator will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Keyboard shortcuts for cycling vision conditions (Ctrl+Shift+←/→) and adjusting intensity (Ctrl+Shift+↑/↓)
- Condition descriptions and WCAG contrast guidelines in the sidebar
- Available conditions list with active highlighting in the sidebar
- Supported formats hint in the upload section
- `displayName` to ToolCanvas and ToolSidebar components
- Keyboard shortcut reference in the sidebar

### Changed

- Sidebar layout improved with dedicated sections for current simulation, all conditions, WCAG guidelines, and shortcuts
- Condition info card now shows intensity and has a border for better visual separation

### Removed

- Removed unused `lz-string` dependency from package.json

## [1.0.0] - 2026-05-24

### Added

- Initial release of Vision Deficiency Simulator
- 7 vision condition simulations (protanopia, deuteranopia, tritanopia, achromatopsia, cataracts, glaucoma, diabetic retinopathy)
- Screenshot upload via drag-and-drop or browse button
- Intensity control slider (0-100%)
- Export as PNG, WebP, PDF, and JSON
- Share functionality via `.itsjust.json` files
- Accessibility testing features for WCAG compliance
- Client-side processing for privacy-first operation

### Changed

- N/A

### Deprecated

- N/A

### Removed

- N/A

### Fixed

- N/A

### Security

- N/A
