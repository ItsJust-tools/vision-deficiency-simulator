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
  /** If set, renders a CSS mask overlay instead of applying filter CSS */
  maskOverlay?: boolean;
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
  results: SimulationResult[];
  notes: string;
}

export const visionFilters: VisionFilter[] = [
  {
    name: "protanopia",
    description: "Red-blindness (protanopia)",
    cssFilter: "hue-rotate(130deg) saturate(1.5)",
  },
  {
    name: "deuteranopia",
    description: "Green-blindness (deuteranopia)",
    cssFilter: "hue-rotate(110deg) saturate(1.3)",
  },
  {
    name: "tritanopia",
    description: "Blue-blindness (tritanopia)",
    cssFilter: "hue-rotate(-150deg) saturate(1.2)",
  },
  {
    name: "achromatopsia",
    description: "Complete color blindness (achromatopsia)",
    cssFilter: "grayscale(100%)",
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
    maskOverlay: true,
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
