import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";

function loadLooseCargoSolver() {
  const bundle = fs.readFileSync(
    new URL("./assets/index-D5jndoPs.js", import.meta.url),
    "utf8"
  );
  const solverSource = bundle.slice(
    bundle.indexOf("const gl ="),
    bundle.indexOf("const se =")
  );
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
    assert.ok(
      placement.x + placement.orientation.lengthMm <= container.innerLengthMm
    );
    assert.ok(
      placement.y + placement.orientation.widthMm <= container.innerWidthMm
    );
    assert.ok(
      placement.z + placement.orientation.heightMm <= container.innerHeightMm
    );
  }

  for (let index = 0; index < result.placements.length; index += 1) {
    const box = result.placements[index];
    const boxEnd = {
      x: box.x + box.orientation.lengthMm,
      y: box.y + box.orientation.widthMm,
      z: box.z + box.orientation.heightMm,
    };
    for (
      let otherIndex = index + 1;
      otherIndex < result.placements.length;
      otherIndex += 1
    ) {
      const other = result.placements[otherIndex];
      const overlaps =
        box.x < other.x + other.orientation.lengthMm &&
        boxEnd.x > other.x &&
        box.y < other.y + other.orientation.widthMm &&
        boxEnd.y > other.y &&
        box.z < other.z + other.orientation.heightMm &&
        boxEnd.z > other.z;
      assert.equal(overlaps, false, `${box.sku} and ${other.sku} overlap`);
    }
    if (box.z === 0) continue;
    const supportedArea = result.placements.reduce((area, support) => {
      if (support.z + support.orientation.heightMm !== box.z) return area;
      const overlapLength = Math.max(
        0,
        Math.min(boxEnd.x, support.x + support.orientation.lengthMm) -
          Math.max(box.x, support.x)
      );
      const overlapWidth = Math.max(
        0,
        Math.min(boxEnd.y, support.y + support.orientation.widthMm) -
          Math.max(box.y, support.y)
      );
      return area + overlapLength * overlapWidth;
    }, 0);
    assert.equal(
      supportedArea,
      box.orientation.lengthMm * box.orientation.widthMm
    );
  }

  const largeSectionEnd = Math.max(
    ...result.placements
      .filter(placement => placement.sku === "SKU-1002")
      .map(placement => placement.x + placement.orientation.lengthMm)
  );
  const smallSectionStart = Math.min(
    ...result.placements
      .filter(placement => placement.sku === "BX-1001")
      .map(placement => placement.x)
  );
  assert.equal(largeSectionEnd, smallSectionStart);
});

test("configured gap changes whether a 280 mm section remainder may be reused", () => {
  const compact = solve(50);
  const relaxed = solve(300);
  const compactSmallStart = Math.min(
    ...compact.placements
      .filter(placement => placement.sku === "BX-1001")
      .map(placement => placement.x)
  );
  const relaxedSmallStart = Math.min(
    ...relaxed.placements
      .filter(placement => placement.sku === "BX-1001")
      .map(placement => placement.x)
  );
  assert.equal(compactSmallStart, 4000);
  assert.equal(relaxedSmallStart, 0);
});

function solveScreenshotCase({ rotate, side }) {
  return loadLooseCargoSolver()({
    products: [
      {
        sku: "BX-1001",
        lengthMm: 320,
        widthMm: 900,
        heightMm: 310,
        weightG: 8500,
        quantity: 600,
        allowHorizontalRotation: rotate,
        allowSideLoading: side,
        allowUpsideDown: false,
        mustStayUpright: !side,
        stackable: true,
      },
    ],
    containerTypes: [container],
    minimumSupportRatio: 1,
    looseCargoMaxGapMm: 50,
  });
}

test("horizontal rotation fills the screenshot case side lane", () => {
  const result = solveScreenshotCase({ rotate: true, side: false });
  assert.equal(result.placements.length, 600);
  assert.deepEqual(result.unloaded, []);
  assert.ok(
    result.placements.some(placement => placement.orientation.code === "WLH")
  );
});

test("side loading fills the screenshot case when horizontal rotation is disabled", () => {
  const result = solveScreenshotCase({ rotate: false, side: true });
  assert.equal(result.placements.length, 600);
  assert.deepEqual(result.unloaded, []);
  assert.ok(
    result.placements.some(placement => placement.orientation.sideLoaded)
  );
});

function strategyProduct(overrides = {}) {
  return {
    sku: "BOX",
    lengthMm: 200,
    widthMm: 200,
    heightMm: 200,
    weightG: 1000,
    quantity: 1,
    allowHorizontalRotation: false,
    allowSideLoading: false,
    allowUpsideDown: false,
    mustStayUpright: true,
    stackable: true,
    priorityGroup: 1,
    ...overrides,
  };
}

function solveStrategy(productsToLoad, options = {}) {
  return loadLooseCargoSolver()({
    products: productsToLoad,
    containerTypes: [
      {
        innerLengthMm: options.length ?? 400,
        innerWidthMm: options.width ?? 200,
        innerHeightMm: options.height ?? 400,
        maxPayloadG: 100000,
        quantity: options.containerQty ?? 1,
      },
    ],
    minimumSupportRatio: 1,
    looseCargoMaxGapMm: 50,
    priorityGroupMode: options.priorityGroupMode ?? "virtual-wall",
  });
}

test("allow-stacking priority groups may use the earlier group's upper surface", () => {
  const result = solveStrategy(
    [
      strategyProduct({ sku: "GROUP-1", priorityGroup: 1 }),
      strategyProduct({ sku: "GROUP-2", priorityGroup: 2 }),
    ],
    { priorityGroupMode: "allow-stacking" }
  );
  const secondGroup = result.placements.find(
    placement => placement.sku === "GROUP-2"
  );
  assert.deepEqual({ x: secondGroup.x, z: secondGroup.z }, { x: 0, z: 200 });
});

test("no-cross-stacking keeps a later priority group off an earlier group", () => {
  const result = solveStrategy(
    [
      strategyProduct({ sku: "GROUP-1", priorityGroup: 1 }),
      strategyProduct({ sku: "GROUP-2", priorityGroup: 2 }),
    ],
    { priorityGroupMode: "no-cross-stacking" }
  );
  const secondGroup = result.placements.find(
    placement => placement.sku === "GROUP-2"
  );
  assert.deepEqual({ x: secondGroup.x, z: secondGroup.z }, { x: 200, z: 0 });
});

test("virtual-wall places every later priority group beyond the prior group section", () => {
  const result = solveStrategy(
    [
      strategyProduct({ sku: "GROUP-1", priorityGroup: 1 }),
      strategyProduct({ sku: "GROUP-2", priorityGroup: 2, quantity: 2 }),
    ],
    { length: 600, width: 400, priorityGroupMode: "virtual-wall" }
  );
  const firstGroupEnd = Math.max(
    ...result.placements
      .filter(placement => placement.priorityGroup === 1)
      .map(placement => placement.x + placement.orientation.lengthMm)
  );
  assert.ok(
    result.placements
      .filter(placement => placement.priorityGroup === 2)
      .every(placement => placement.x >= firstGroupEnd)
  );
});

test("non-stackable cargo cannot support another carton", () => {
  const result = solveStrategy(
    [
      strategyProduct({ sku: "BASE", stackable: false }),
      strategyProduct({ sku: "NEXT" }),
    ],
    { priorityGroupMode: "allow-stacking" }
  );
  const next = result.placements.find(placement => placement.sku === "NEXT");
  assert.deepEqual({ x: next.x, z: next.z }, { x: 200, z: 0 });
});

test("maximum stack layers prevents a second vertical layer", () => {
  const result = solveStrategy(
    [strategyProduct({ sku: "ONE-LAYER", quantity: 2, maxStackLayers: 1 })],
    { priorityGroupMode: "allow-stacking" }
  );
  assert.ok(result.placements.every(placement => placement.z === 0));
});

test("top-load limit prevents an overweight carton from stacking", () => {
  const result = solveStrategy(
    [
      strategyProduct({ sku: "LIMITED-BASE", maxTopLoadG: 5000 }),
      strategyProduct({ sku: "HEAVY", weightG: 10000 }),
    ],
    { priorityGroupMode: "allow-stacking" }
  );
  const heavy = result.placements.find(placement => placement.sku === "HEAVY");
  assert.deepEqual({ x: heavy.x, z: heavy.z }, { x: 200, z: 0 });
});

test("containers are filled sequentially and expose center-of-mass diagnostics", () => {
  const result = solveStrategy([strategyProduct({ quantity: 5 })], {
    containerQty: 2,
    priorityGroupMode: "allow-stacking",
  });
  assert.equal(
    result.placements.filter(placement => placement.containerIndex === 0)
      .length,
    4
  );
  assert.equal(
    result.placements.filter(placement => placement.containerIndex === 1)
      .length,
    1
  );
  assert.equal(result.metrics.containerDiagnostics.length, 2);
  assert.equal(
    result.metrics.containerDiagnostics[1].continuousDoorFreeMm,
    200
  );
  assert.equal(
    result.metrics.containerDiagnostics[1].longitudinalCenterOffsetMm,
    -100
  );
});

test("unloaded cargo includes a specific reproducible reason", () => {
  const result = solveStrategy([
    strategyProduct({ sku: "TOO-LARGE", lengthMm: 800 }),
  ]);
  assert.equal(result.unloaded[0].reasonCode, "DIMENSION_LIMIT");
  assert.match(result.unloaded[0].reason, /内部尺寸/);
  assert.ok(result.warnings.some(warning => warning.includes("TOO-LARGE")));
});
