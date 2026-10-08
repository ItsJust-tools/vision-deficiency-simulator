import manifest from "./manifest";
import { describe, it, expect } from "vitest";

describe("manifest", () => {
  it("includes a maskable icon definition", () => {
    const data = manifest();
    expect(data.icons).toBeDefined();
    const maskableIcon = data.icons?.find((icon) => icon.purpose === "maskable" || icon.purpose?.includes("maskable"));
    expect(maskableIcon).toBeDefined();
  });

  it("includes an any purpose icon definition", () => {
    const data = manifest();
    const anyIcon = data.icons?.find((icon) => icon.purpose === "any" || !icon.purpose || icon.purpose?.includes("any"));
    expect(anyIcon).toBeDefined();
  });
});
