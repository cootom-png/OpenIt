import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";

function loadLooseCargoSolver() {
  const bundle = fs.readFileSync(new URL("./assets/index-D5jndoPs.js", import.meta.url), "utf8");
  const solverSource = bundle.slice(bundle.indexOf("const gl ="), bundle.indexOf("const se ="));
  const context = {};
  vm.createContext(context);
  vm.runInContext(`${solverSource};globalThis.solveLooseCargo=bl`, context);
  return context.solveLooseCargo;
}

const container = {
  innerLengthMm: 12032,
  innerWidthMm: 2352,
  innerHeightMm: 2698,
  maxPayloadG: 28800000,
  quantity: 1,
};

const products = [
  {
    sku: "BX-1001",
    lengthMm: 520,
    widthMm: 380,
    heightMm: 310,
    weightG: 8500,
    quantity: 420,
    allowHorizontalRotation: true,
    allowSideLoading: true,
    allowUpsideDown: false,
    mustStayUpright: false,
    stackable: true,
  },
  {
    sku: "SKU-1002",
    lengthMm: 800,
    widthMm: 800,
    heightMm: 250,
    weightG: 10000,
    quantity: 100,
    allowHorizontalRotation: true,
    allowSideLoading: false,
    allowUpsideDown: false,
    mustStayUpright: true,
    stackable: true,
  },
];

function solve(maxGapMm) {
  return loadLooseCargoSolver()({
    products,
    containerTypes: [container],
    minimumSupportRatio: 1,
    looseCargoMaxGapMm: maxGapMm,
  });
}

test("50 mm gap compacts mixed cartons into adjacent longitudinal sections", () => {
  const result = solve(50);
  assert.equal(result.placements.length, 520);
  assert.deepEqual(result.unloaded, []);
  assert.equal(result.metrics.looseCargoMaxGapMm, 50);
  assert.equal(result.metrics.oversizedGapCount, 0);

  for (const placement of result.placements) {
    assert.ok(placement.x >= 0 && placement.y >= 0 && placement.z >= 0);
    assert.ok(placement.x + placement.orientation.lengthMm <= container.innerLengthMm);
    assert.ok(placement.y + placement.orientation.widthMm <= container.innerWidthMm);
    assert.ok(placement.z + placement.orientation.heightMm <= container.innerHeightMm);
  }

  for (let index = 0; index < result.placements.length; index += 1) {
    const box = result.placements[index];
    const boxEnd = {
      x: box.x + box.orientation.lengthMm,
      y: box.y + box.orientation.widthMm,
      z: box.z + box.orientation.heightMm,
    };
    for (let otherIndex = index + 1; otherIndex < result.placements.length; otherIndex += 1) {
      const other = result.placements[otherIndex];
      const overlaps =
        box.x < other.x + other.orientation.lengthMm && boxEnd.x > other.x &&
        box.y < other.y + other.orientation.widthMm && boxEnd.y > other.y &&
        box.z < other.z + other.orientation.heightMm && boxEnd.z > other.z;
      assert.equal(overlaps, false, `${box.sku} and ${other.sku} overlap`);
    }
    if (box.z === 0) continue;
    const supportedArea = result.placements.reduce((area, support) => {
      if (support.z + support.orientation.heightMm !== box.z) return area;
      const overlapLength = Math.max(
        0,
        Math.min(boxEnd.x, support.x + support.orientation.lengthMm) - Math.max(box.x, support.x),
      );
      const overlapWidth = Math.max(
        0,
        Math.min(boxEnd.y, support.y + support.orientation.widthMm) - Math.max(box.y, support.y),
      );
      return area + overlapLength * overlapWidth;
    }, 0);
    assert.equal(supportedArea, box.orientation.lengthMm * box.orientation.widthMm);
  }

  const largeSectionEnd = Math.max(
    ...result.placements
      .filter((placement) => placement.sku === "SKU-1002")
      .map((placement) => placement.x + placement.orientation.lengthMm),
  );
  const smallSectionStart = Math.min(
    ...result.placements
      .filter((placement) => placement.sku === "BX-1001")
      .map((placement) => placement.x),
  );
  assert.equal(largeSectionEnd, smallSectionStart);
});

test("configured gap changes whether a 280 mm section remainder may be reused", () => {
  const compact = solve(50);
  const relaxed = solve(300);
  const compactSmallStart = Math.min(
    ...compact.placements.filter((placement) => placement.sku === "BX-1001").map((placement) => placement.x),
  );
  const relaxedSmallStart = Math.min(
    ...relaxed.placements.filter((placement) => placement.sku === "BX-1001").map((placement) => placement.x),
  );
  assert.equal(compactSmallStart, 4000);
  assert.equal(relaxedSmallStart, 0);
});
