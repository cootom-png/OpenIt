import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";

function loadRenderingHelpers() {
  const bundle = fs.readFileSync(new URL("./assets/index-D5jndoPs.js", import.meta.url), "utf8");
  const start = bundle.indexOf("function compactSceneItemsForRendering");
  const end = bundle.indexOf("class Mm", start);
  assert.ok(start >= 0 && end > start, "render compactor must exist in the production bundle");
  const context = {};
  vm.createContext(context);
  vm.runInContext(`const Ee=.001;${bundle.slice(start, end)};globalThis.helpers={compact:compactSceneItemsForRendering,dividers:buildBatchDividerPositions}`, context);
  return context.helpers;
}

function box({ x, y = 0, z = 0, sku = "BX-1001", length = 520, width = 380, height = 310, sequence = 1 }) {
  return {
    containerIndex: 0,
    kind: "cargo",
    sku,
    color: "#3478df",
    orientation: "LWH",
    originMm: { x, y, z },
    centerMm: { x: x + length / 2, y: y + width / 2, z: z + height / 2 },
    dimensionsMm: { length, width, height },
    loadSequence: sequence,
  };
}

test("23 by 6 by 8 grid renders every carton as 48 contiguous row batches", () => {
  const { compact } = loadRenderingHelpers();
  const source = [];
  let sequence = 1;
  for (let z = 0; z < 8; z += 1) {
    for (let y = 0; y < 6; y += 1) {
      for (let x = 0; x < 23; x += 1) {
        source.push(box({ x: x * 520, y: y * 380, z: z * 310, sequence: sequence++ }));
      }
    }
  }
  const batches = compact(source);
  assert.equal(source.length, 1104);
  assert.equal(batches.length, 48);
  assert.equal(batches.reduce((sum, batch) => sum + batch.batchCount, 0), 1104);
  assert.ok(batches.every((batch) => batch.batchCount === 23));
  assert.ok(batches.every((batch) => batch.dimensionsMm.length === 11960));
  assert.equal(Math.max(...batches.map((batch) => batch.originMm.x + batch.dimensionsMm.length)), 11960);
  assert.equal(Math.max(...batches.map((batch) => batch.originMm.y + batch.dimensionsMm.width)), 2280);
  assert.equal(Math.max(...batches.map((batch) => batch.originMm.z + batch.dimensionsMm.height)), 2480);
});

test("a physical gap prevents cartons from merging", () => {
  const { compact } = loadRenderingHelpers();
  const batches = compact([box({ x: 0, sequence: 1 }), box({ x: 570, sequence: 2 })]);
  assert.equal(batches.length, 2);
  assert.ok(batches.every((batch) => batch.batchCount === 1));
});

test("different SKUs and dimensions remain separate", () => {
  const { compact } = loadRenderingHelpers();
  const batches = compact([
    box({ x: 0, sequence: 1 }),
    box({ x: 520, sku: "OTHER", sequence: 2 }),
    box({ x: 1040, length: 680, sequence: 3 }),
  ]);
  assert.equal(batches.length, 3);
});

test("batch metadata retains unit dimensions and sequence range", () => {
  const { compact } = loadRenderingHelpers();
  const [batch] = compact([
    box({ x: 0, sequence: 41 }),
    box({ x: 520, sequence: 42 }),
    box({ x: 1040, sequence: 43 }),
  ]);
  assert.equal(batch.batchCount, 3);
  assert.equal(batch.loadSequenceStart, 41);
  assert.equal(batch.loadSequenceEnd, 43);
  assert.equal(batch.unitDimensionsMm.length, 520);
  assert.equal(batch.dimensionsMm.length, 1560);
  assert.equal(batch.centerMm.x, 780);
});

test("one line-segment geometry contains every internal carton divider", () => {
  const { compact, dividers } = loadRenderingHelpers();
  const [batch] = compact(Array.from({ length: 23 }, (_, x) => box({ x: x * 520, sequence: x + 1 })));
  const positions = dividers(batch);
  assert.equal(positions.length, 22 * 8 * 3);
  assert.ok(Math.abs(Math.min(...positions.filter((_, index) => index % 3 === 0)) + 5.46) < 1e-9);
  assert.ok(Math.abs(Math.max(...positions.filter((_, index) => index % 3 === 0)) - 5.46) < 1e-9);
  assert.ok(positions.every((value, index) => Math.abs(value) <= [5.98, 0.155, 0.19][index % 3] + 1e-9));
});

test("CB-3012 row dividers stay inside a 14-carton render batch", () => {
  const { compact, dividers } = loadRenderingHelpers();
  const [batch] = compact(Array.from({ length: 14 }, (_, x) => box({
    x: x * 680,
    length: 680,
    width: 420,
    height: 760,
    sku: "CB-3012",
    sequence: x + 1,
  })));
  const positions = dividers(batch);
  assert.equal(batch.dimensionsMm.length, 9520);
  assert.equal(positions.length, 13 * 8 * 3);
  assert.ok(positions.every((value, index) => Math.abs(value) <= [4.76, 0.38, 0.21][index % 3] + 1e-9));
});
