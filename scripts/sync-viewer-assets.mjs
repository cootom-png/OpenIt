import { createHash } from "node:crypto";
import { copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const assetVersion = "v1";
const vendorRoot = path.join(root, "client/public/assets/vendor");
const output = path.join(vendorRoot, assetVersion);
const assets = [
  [
    "node_modules/occt-import-js/dist/occt-import-js.wasm",
    "occt-import-js/occt-import-js.wasm",
    "LGPL-2.1-or-later",
    "occt-import-js",
  ],
  [
    "assets/viewer-fonts/noto-sans-sc-400.woff",
    "cad-data/fonts/noto-sans-sc-400.woff",
    "OFL-1.1",
    "@fontsource/noto-sans-sc@5.2.8",
  ],
  [
    "assets/viewer-fonts/noto-sans-400.woff",
    "cad-data/fonts/noto-sans-400.woff",
    "OFL-1.1",
    "@fontsource/noto-sans@5.2.8",
  ],
  [
    "assets/viewer-fonts/noto-sans-mono-400.woff",
    "cad-data/fonts/noto-sans-mono-400.woff",
    "OFL-1.1",
    "@fontsource/noto-sans-mono@5.2.8",
  ],
];
const fontCatalog = [
  {
    file: "noto-sans-sc-400.woff",
    name: [
      "Noto Sans CJK SC",
      "Noto Sans SC",
      "simkai",
      "simhei",
      "simsun",
      "gbcbig",
      "hztxt",
    ],
    type: "mesh",
  },
  {
    file: "noto-sans-400.woff",
    name: ["Noto Sans", "arial", "Arial", "Helvetica"],
    type: "mesh",
  },
  {
    file: "noto-sans-mono-400.woff",
    name: ["Noto Sans Mono", "monotxt", "txt", "simplex", "Courier New"],
    type: "mesh",
  },
];

await rm(vendorRoot, { recursive: true, force: true });
const manifest = [];
for (const [sourceName, targetName, license, packageName] of assets) {
  const source = path.join(root, sourceName);
  const target = path.join(output, targetName);
  const bytes = await readFile(source);
  await mkdir(path.dirname(target), { recursive: true });
  await copyFile(source, target);
  manifest.push({
    path: `/assets/vendor/${assetVersion}/${targetName}`,
    package: packageName,
    license,
    bytes: bytes.length,
    sha256: createHash("sha256").update(bytes).digest("hex"),
  });
}
await writeFile(
  path.join(output, "cad-data/fonts/fonts.json"),
  `${JSON.stringify(fontCatalog, null, 2)}\n`
);
const licenseTarget = path.join(output, "cad-data/LICENSES/Noto-OFL-1.1.txt");
await mkdir(path.dirname(licenseTarget), { recursive: true });
await copyFile(
  path.join(root, "assets/viewer-fonts/OFL-1.1.txt"),
  licenseTarget
);
const occtLicenseDir = path.join(output, "occt-import-js/LICENSES");
await mkdir(occtLicenseDir, { recursive: true });
await copyFile(
  path.join(
    root,
    "node_modules/occt-import-js/dist/license.occt-import-js.txt"
  ),
  path.join(occtLicenseDir, "occt-import-js-LGPL-2.1.txt")
);
await copyFile(
  path.join(root, "node_modules/occt-import-js/dist/license.occt.txt"),
  path.join(occtLicenseDir, "Open-CASCADE-LGPL-exception.txt")
);
await writeFile(
  path.join(output, "asset-manifest.json"),
  `${JSON.stringify({ generatedBy: "scripts/sync-viewer-assets.mjs", assets: manifest }, null, 2)}\n`
);
console.log(`Synced ${manifest.length} self-hosted viewer assets.`);
