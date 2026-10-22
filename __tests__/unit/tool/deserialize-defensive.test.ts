import { describe, it, expect } from "vitest";
import { visionTool } from "@/tool/tool-definition";

/**
 * Deserialization is the trust boundary for shared URLs and imported share
 * files: corrupted payloads must be reported as `{ success: false, error }`
 * instead of throwing and crashing the client.
 */
describe("visionTool.deserialize - defensive handling", () => {
  const expectFailure = (input: unknown) => {
    let result: ReturnType<typeof visionTool.deserialize> | undefined;
    expect(() => {
      result = visionTool.deserialize(input);
    }).not.toThrow();
    expect(result?.success).toBe(false);
    if (result && !result.success) {
      expect(typeof result.error).toBe("string");
      expect(result.error.length).toBeGreaterThan(0);
    }
  };

  it("never throws for malformed JSON strings", () => {
    expectFailure("{invalid}");
    expectFailure('{"uploadMode": true,');
    expectFailure("");
    expectFailure("null");
  });

  it("never throws for JSON string payloads of any kind", () => {
    expectFailure(JSON.stringify(visionTool.initialState));
  });

  it("returns success:false for null, undefined, and primitives", () => {
    expectFailure(null);
    expectFailure(undefined);
    expectFailure(0);
    expectFailure(42);
    expectFailure(true);
    expectFailure(NaN);
  });

  it("returns success:false for arrays and nested arrays", () => {
    expectFailure([]);
    expectFailure([visionTool.initialState]);
    expectFailure([[{ uploadMode: true }]]);
  });

  it("returns success:false when required fields are missing", () => {
    expectFailure({});
    expectFailure({ uploadMode: true });
    expectFailure({ uploadMode: true, activeCondition: "normal" });
    expectFailure({ activeCondition: "normal", intensity: 50 });
  });

  it("returns success:false when fields have the wrong type", () => {
    expectFailure({
      uploadMode: true,
      activeCondition: "normal",
      intensity: 50,
      imageSrc: 123,
    });
    expectFailure({
      uploadMode: true,
      activeCondition: "normal",
      intensity: 50,
      notes: { text: "nope" },
    });
    expectFailure({
      uploadMode: true,
      activeCondition: "normal",
      intensity: 50,
      showOriginal: "false",
    });
    expectFailure({
      uploadMode: true,
      activeCondition: "normal",
      intensity: 50,
      results: "not-an-array",
    });
    expectFailure({
      uploadMode: true,
      activeCondition: "normal",
      intensity: 50,
      results: [{ condition: "normal" }],
    });
  });

  it("returns success:false for non-finite intensity", () => {
    expectFailure({
      uploadMode: true,
      activeCondition: "normal",
      intensity: Number.NaN,
    });
    expectFailure({
      uploadMode: true,
      activeCondition: "normal",
      intensity: Number.POSITIVE_INFINITY,
    });
  });

  it("returns success:false for hostile input with throwing getters", () => {
    const hostile = {
      get uploadMode(): boolean {
        throw new Error("boom");
      },
      activeCondition: "normal",
      intensity: 50,
    };
    expectFailure(hostile);
  });

  it("returns success:false for a throwing Proxy", () => {
    const proxy = new Proxy(
      {},
      {
        get() {
          throw new Error("proxy trap");
        },
        has() {
          throw new Error("proxy trap");
        },
      },
    );
    expectFailure(proxy);
  });

  it("still accepts a valid state object", () => {
    const result = visionTool.deserialize({
      uploadMode: true,
      activeCondition: "cataracts",
      intensity: 65,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.activeCondition).toBe("cataracts");
      expect(result.data.imageSrc).toBe("");
      expect(result.data.results).toEqual([]);
      expect(result.data.notes).toBe("");
      expect(result.data.showOriginal).toBe(false);
    }
  });

  it("accepts valid results entries", () => {
    const result = visionTool.deserialize({
      uploadMode: false,
      imageSrc: "data:image/png;base64,abc",
      activeCondition: "glaucoma",
      intensity: 30,
      showOriginal: true,
      results: [
        {
          condition: "glaucoma",
          description: "Tunnel vision",
          cssFilter: "blur(2px)",
          intensity: 30,
        },
      ],
      notes: "hello",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.results).toHaveLength(1);
      expect(result.data.imageSrc).toBe("data:image/png;base64,abc");
      expect(result.data.notes).toBe("hello");
    }
  });
});
