# Changelog

## [1.1.0] - 2026-06-16

### Added

- **Accurate color-blindness simulation**: Replaced simple `hue-rotate`/`saturate` CSS filters with Brettel-Vienot-Mollon (BVM) color matrix models using SVG `feColorMatrix` for protanopia, deuteranopia, tritanopia, and achromatopsia simulations. These provide significantly more accurate results.
- **Results tracking**: Simulation results are now automatically recorded when switching between vision conditions, enabling better export and review.
- **Missing `@itsjust/core` and `lz-string` dependencies**: Added to package.json for proper workspace resolution.

### Fixed

- **`isVisionState` type guard**: Added missing `showOriginal` field validation to prevent deserialization of incomplete state objects.

### Changed

- Bumped version to 1.1.0.
- Updated README to document the improved BVM color matrix simulation technique.

## [1.0.0] - Initial release
