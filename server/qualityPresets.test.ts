import { describe, it, expect } from "vitest";

/**
 * Test quality presets and fileParser module exports.
 * Since fileParser is a client-side module that uses browser APIs (File, etc.),
 * we test the exported constants and types by importing them directly.
 */

describe("Quality Presets", () => {
  it("QUALITY_PRESETS has correct structure", async () => {
    // Import the module - this tests that the exports are correct
    const { QUALITY_PRESETS } = await import("../client/src/lib/fileParser");
    
    expect(QUALITY_PRESETS).toBeDefined();
    expect(QUALITY_PRESETS.fast).toBeDefined();
    expect(QUALITY_PRESETS.standard).toBeDefined();
    expect(QUALITY_PRESETS.high).toBeDefined();
  });

  it("fast preset has higher deflection values (coarser mesh)", async () => {
    const { QUALITY_PRESETS } = await import("../client/src/lib/fileParser");
    
    expect(QUALITY_PRESETS.fast.linearDeflection).toBe(0.5);
    expect(QUALITY_PRESETS.fast.angularDeflection).toBe(0.5);
    expect(QUALITY_PRESETS.fast.label).toBe("快速");
  });

  it("standard preset has balanced deflection values", async () => {
    const { QUALITY_PRESETS } = await import("../client/src/lib/fileParser");
    
    expect(QUALITY_PRESETS.standard.linearDeflection).toBe(0.1);
    expect(QUALITY_PRESETS.standard.angularDeflection).toBe(0.3);
    expect(QUALITY_PRESETS.standard.label).toBe("标准");
  });

  it("high preset has lowest deflection values (finest mesh)", async () => {
    const { QUALITY_PRESETS } = await import("../client/src/lib/fileParser");
    
    expect(QUALITY_PRESETS.high.linearDeflection).toBe(0.01);
    expect(QUALITY_PRESETS.high.angularDeflection).toBe(0.1);
    expect(QUALITY_PRESETS.high.label).toBe("高精度");
  });

  it("deflection values decrease from fast to high (finer mesh)", async () => {
    const { QUALITY_PRESETS } = await import("../client/src/lib/fileParser");
    
    expect(QUALITY_PRESETS.fast.linearDeflection).toBeGreaterThan(QUALITY_PRESETS.standard.linearDeflection);
    expect(QUALITY_PRESETS.standard.linearDeflection).toBeGreaterThan(QUALITY_PRESETS.high.linearDeflection);
    expect(QUALITY_PRESETS.fast.angularDeflection).toBeGreaterThan(QUALITY_PRESETS.standard.angularDeflection);
    expect(QUALITY_PRESETS.standard.angularDeflection).toBeGreaterThan(QUALITY_PRESETS.high.angularDeflection);
  });

  it("getFileExtension correctly extracts extensions", async () => {
    const { getFileExtension } = await import("../client/src/lib/fileParser");
    
    expect(getFileExtension("model.stp")).toBe("stp");
    expect(getFileExtension("model.STEP")).toBe("step");
    expect(getFileExtension("file.name.with.dots.igs")).toBe("igs");
    expect(getFileExtension("noextension")).toBe("noextension");
    expect(getFileExtension("")).toBe("");
  });
});
