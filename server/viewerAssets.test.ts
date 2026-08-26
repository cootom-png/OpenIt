import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "..");
const read = (file: string) => readFileSync(path.join(root, file), "utf8");

describe("self-hosted CAD viewer assets", () => {
  it("does not use the retired CloudFront CAD asset host", () => {
    const sources = [
      read("client/src/lib/fileParser.ts"),
      read("client/src/lib/cadFontConfig.ts"),
      read("client/src/components/DwgViewerComponent.tsx"),
    ];
    expect(sources.join("\n")).not.toContain("d2xsxph8kpxj0f.cloudfront.net");
    expect(sources.join("\n")).not.toContain("mlightcad.gitlab.io/cad-data");
  });

  it("uses same-origin WASM and CAD data paths", () => {
    expect(read("client/src/lib/fileParser.ts")).toContain(
      '"/assets/vendor/v1/occt-import-js/occt-import-js.wasm"'
    );
    expect(read("client/src/lib/cadFontConfig.ts")).toContain(
      '"/assets/vendor/v1/cad-data/"'
    );
  });

  it("only declares audited open-source font packages", () => {
    const syncScript = read("scripts/sync-viewer-assets.mjs");
    expect(syncScript).toContain("@fontsource/noto-sans-sc");
    expect(syncScript).toContain("@fontsource/noto-sans-mono");
    expect(syncScript).not.toMatch(
      /arial\.woff|simhei\.woff|simsun\.woff|simkai\.woff/
    );
  });
});
