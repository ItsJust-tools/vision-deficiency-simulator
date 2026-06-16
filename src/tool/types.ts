export type VisionCondition =
  | "protanopia"
  | "deuteranopia"
  | "tritanopia"
  | "achromatopsia"
  | "cataracts"
  | "glaucoma"
  | "diabetic-retinopathy"
  | "normal";

export interface VisionFilter {
  name: VisionCondition;
  description: string;
  cssFilter: string;
  /**
   * SVG feColorMatrix values for more accurate color-blindness simulation.
   * Each row is [R,G,B,A] coefficients. Applied as a 5x4 color matrix.
   * Based on the Brettel-Vienot-Mollon (BVM) color-blindness simulation model.
   */
  colorMatrix?: number[][];
}

export interface SimulationResult {
  condition: VisionCondition;
  description: string;
  cssFilter: string;
  intensity: number; // 0-100
}

export interface VisionState {
  uploadMode: boolean;
  imageSrc?: string; // Data URL from upload
  activeCondition: VisionCondition;
  intensity: number; // 0-100
  showOriginal: boolean; // toggle to show unfiltered image
  results: SimulationResult[];
  notes: string;
}

/**
 * Color-blindness simulation matrices based on the Brettel-Vienot-Mollon (BVM) model.
 * These provide significantly more accurate simulations than simple hue-rotate/saturate.
 *
 * Each matrix is a 5x4 color matrix (4 rows × 5 columns) for SVG feColorMatrix.
 * The last column is the alpha/offset.
 *
 * References:
 * - Brettel, Vienot, & Mollon (1997) "Computerized simulation of color appearance for dichromats"
 * - https://www.inf.ufrgs.br/~oliveira/pubs_files/CVD_Simulation/CVD_Simulation.html
 */
export const colorMatrices: Record<string, number[][]> = {
  protanopia: [
    [0.152, 1.052, -0.204, 0, 0],
    [0.152, 1.052, -0.204, 0, 0],
    [-0.003, 0.003, 1.0, 0, 0],
    [0, 0, 0, 1, 0],
  ],
  deuteranopia: [
    [0.367, 0.861, -0.228, 0, 0],
    [0.367, 0.861, -0.228, 0, 0],
    [-0.004, 0.004, 1.0, 0, 0],
    [0, 0, 0, 1, 0],
  ],
  tritanopia: [
    [1.0, 0.152, -0.152, 0, 0],
    [-0.146, 0.78, 0.366, 0, 0],
    [-0.146, 0.78, 0.366, 0, 0],
    [0, 0, 0, 1, 0],
  ],
  achromatopsia: [
    [0.299, 0.587, 0.114, 0, 0],
    [0.299, 0.587, 0.114, 0, 0],
    [0.299, 0.587, 0.114, 0, 0],
    [0, 0, 0, 1, 0],
  ],
};

export const visionFilters: VisionFilter[] = [
  {
    name: "protanopia",
    description: "Red-blindness (protanopia)",
    cssFilter: "url(#protanopia-matrix)",
    colorMatrix: colorMatrices.protanopia,
  },
  {
    name: "deuteranopia",
    description: "Green-blindness (deuteranopia)",
    cssFilter: "url(#deuteranopia-matrix)",
    colorMatrix: colorMatrices.deuteranopia,
  },
  {
    name: "tritanopia",
    description: "Blue-blindness (tritanopia)",
    cssFilter: "url(#tritanopia-matrix)",
    colorMatrix: colorMatrices.tritanopia,
  },
  {
    name: "achromatopsia",
    description: "Complete color blindness (achromatopsia)",
    cssFilter: "url(#achromatopsia-matrix)",
    colorMatrix: colorMatrices.achromatopsia,
  },
  {
    name: "cataracts",
    description: "Age-related cataracts",
    cssFilter: "blur(1px) sepia(0.5) brightness(1.1) hue-rotate(30deg)",
  },
  {
    name: "glaucoma",
    description: "Advanced glaucoma",
    cssFilter: "brightness(1.0) contrast(1.05)",
  },
  {
    name: "diabetic-retinopathy",
    description: "Diabetic retinopathy",
    cssFilter: "contrast(1.1) brightness(0.9) hue-rotate(-5deg)",
  },
  { name: "normal", description: "Normal vision", cssFilter: "none" },
];

export const conditionDescriptions: Record<VisionCondition, string> = {
  protanopia: "Red-blindness (protanopia) - affects red color perception",
  deuteranopia:
    "Green-blindness (deuteranopia) - affects green color perception",
  tritanopia:
    "Blue-blindness (tritanopia) - affects blue/yellow color perception",
  achromatopsia:
    "Complete color blindness (achromatopsia) - no color perception",
  cataracts:
    "Age-related cataracts - causes clouding and yellowing of the lens",
  glaucoma: "Advanced glaucoma - causes peripheral vision loss",
  "diabetic-retinopathy":
    "Diabetic retinopathy - affects blood vessels in the retina",
  normal: "Normal vision - no simulation applied",
};
