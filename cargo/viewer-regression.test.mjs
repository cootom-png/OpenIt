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

test("600-item render cap samples both loaded containers", () => {
  const selectItems = loadSelector();
  const selected = selectItems([...items(0, 1100), ...items(1, 656)], 2, 600);
  assert.equal(selected.length, 600);
  assert.equal(selected.filter((item) => item.containerIndex === 0).length, 300);
  assert.equal(selected.filter((item) => item.containerIndex === 1).length, 300);
});

test("unused quota from a small container is reassigned", () => {
  const selectItems = loadSelector();
  const selected = selectItems([...items(0, 10), ...items(1, 1000)], 2, 600);
  assert.equal(selected.length, 600);
  assert.equal(selected.filter((item) => item.containerIndex === 0).length, 10);
  assert.equal(selected.filter((item) => item.containerIndex === 1).length, 590);
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
