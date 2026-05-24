# Vision Deficiency Simulator

A client-side WCAG accessibility tool for simulating vision deficiencies. Test how your designs, UI, and content appear to users with different visual conditions.

[![Version](https://img.shields.io/badge/Version-1.0.0-blue.svg)](https://github.com/ItsJust-tools/vision-deficiency-simulator)

## Features

- 🌈 **7 Vision Condition Simulations**:
  - Normal vision (control)
  - Protanopia (red-blindness)
  - Deuteranopia (green-blindness)
  - Tritanopia (blue-blindness)
  - Achromatopsia (complete color blindness)
  - Cataracts (age-related clouding)
  - Glaucoma (peripheral vision loss)
  - Diabetic retinopathy

- 📷 **Screenshot Upload**: Drag and drop or browse for images to test
- 🎨 **Intensity Control**: Adjust simulation intensity from 0-100%
- 💾 **Export Results**: Download annotated screenshots as PNG
- 📤 **Share**: Share state via `.itsjust.json` files

## Usage

```bash
git clone https://github.com/ItsJust-tools/vision-deficiency-simulator.git
cd vision-deficiency-simulator

# Development
npm run dev

# Production build
npm run build

# Run tests
npm test
```

## Environment Variables

```bash
# For production deployment
NEXT_PUBLIC_URL=https://vision-deficiency-simulator.itsjust.tools
```

## Accessibility Testing

This tool helps you:
- Ensure color combinations are accessible for users with color vision deficiencies
- Test UI designs that rely on non-color differentiation
- Verify patterns and shapes are visible for all users
- Meet WCAG 2.1 AA and AAA compliance requirements

## Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Run tests
npm test

# Run E2E tests
npm run test:e2e
```

## License

MIT - See LICENSE file for details.

## Contributing

Contributions welcome! Please read the contributing guidelines before submitting pull requests.

## Support

- Open an issue on GitHub for bugs
- Discuss features in the issues

---

Built with ❤️ for accessibility.
