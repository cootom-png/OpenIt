import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";

function loadSelector() {
  const bundle = fs.readFileSync(new URL("./assets/index-D5jndoPs.js", import.meta.url), "utf8");
  const start = bundle.indexOf("function selectSceneItemsForRendering");
  const end = bundle.indexOf("class Mm", start);
  assert.ok(start >= 0 && end > start, "render selector must exist in the production bundle");
  const context = {};
  vm.createContext(context);
  vm.runInContext(`${bundle.slice(start, end)};globalThis.selectItems=selectSceneItemsForRendering`, context);
  return context.selectItems;
}

function items(containerIndex, quantity) {
  return Array.from({ length: quantity }, (_, index) => ({ containerIndex, index }));
}

test("render quota follows each container's actual carton share", () => {
  const selectItems = loadSelector();
  const selected = selectItems([...items(0, 1100), ...items(1, 656)], 2, 600);
  assert.equal(selected.length, 600);
  assert.equal(selected.filter((item) => item.containerIndex === 0).length, 376);
  assert.equal(selected.filter((item) => item.containerIndex === 1).length, 224);
});

test("very uneven loads remain visible without overstating the small container", () => {
  const selectItems = loadSelector();
  const selected = selectItems([...items(0, 10), ...items(1, 1000)], 2, 600);
  assert.equal(selected.length, 600);
  assert.equal(selected.filter((item) => item.containerIndex === 0).length, 6);
  assert.equal(selected.filter((item) => item.containerIndex === 1).length, 594);
});

test("empty configured containers do not consume render quota", () => {
  const selectItems = loadSelector();
  const selected = selectItems([...items(0, 400), ...items(2, 400)], 3, 600);
  assert.equal(selected.length, 600);
  assert.equal(selected.filter((item) => item.containerIndex === 0).length, 300);
  assert.equal(selected.filter((item) => item.containerIndex === 1).length, 0);
  assert.equal(selected.filter((item) => item.containerIndex === 2).length, 300);
});

test("plans below the cap keep their original order", () => {
  const selectItems = loadSelector();
  const source = [...items(0, 2), ...items(1, 2)];
  const selected = selectItems(source, 2, 600);
  assert.equal(selected.length, source.length);
  selected.forEach((item, index) => assert.equal(item, source[index]));
});

test("sampling spans the full placement sequence inside every container", () => {
  const selectItems = loadSelector();
  const selected = selectItems([...items(0, 352), ...items(1, 388), ...items(2, 340)], 3, 600);
  const byContainer = [0, 1, 2].map((containerIndex) =>
    selected.filter((item) => item.containerIndex === containerIndex),
  );
  assert.deepEqual(byContainer.map((group) => group.length), [196, 215, 189]);
  assert.ok(byContainer.every((group) => group[0].index <= 1));
  assert.ok(byContainer[0].at(-1).index >= 350);
  assert.ok(byContainer[1].at(-1).index >= 386);
  assert.ok(byContainer[2].at(-1).index >= 338);
});
