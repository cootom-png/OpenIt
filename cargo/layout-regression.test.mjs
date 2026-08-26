import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";

const html = fs.readFileSync(new URL("./index.html", import.meta.url), "utf8");

function loadPanelHelpers() {
  const start = html.indexOf("const cargoPanelLimits=");
  const end = html.indexOf("const workspace=", start);
  assert.ok(start >= 0 && end > start, "panel sizing helpers must exist");
  const context = {};
  vm.createContext(context);
  vm.runInContext(
    `${html.slice(start, end)};globalThis.panel={limits:cargoPanelLimits,clamp:clampCargoPanelLeft,ratio:cargoPanelRatio}`,
    context
  );
  return context.panel;
}

test("desktop panel sizing keeps both panes above their minimum widths", () => {
  const { limits, clamp } = loadPanelHelpers();
  const workspaceWidth = 1432;
  assert.equal(clamp(workspaceWidth, 0), limits.left);
  assert.equal(
    clamp(workspaceWidth, workspaceWidth),
    workspaceWidth - limits.right - limits.splitter
  );
  assert.equal(
    clamp(1194, 1194 * limits.defaultRatio),
    limits.left,
    "the smallest resizable workspace must preserve both minimums"
  );
});

test("the default panel ratio is 52 percent and remains a local UI preference", () => {
  const { limits, ratio } = loadPanelHelpers();
  const workspaceWidth = 1432;
  const left = workspaceWidth * limits.defaultRatio;
  assert.equal(limits.defaultRatio, 0.52);
  assert.equal(ratio(workspaceWidth, left), 0.52);
  const snapshotFunction = html.slice(
    html.indexOf("function cargoSnapshotFromForm"),
    html.indexOf(
      "function cargoSnapshotResult",
      html.indexOf("function cargoSnapshotFromForm")
    )
  );
  assert.doesNotMatch(snapshotFunction, /cargoPanelStorageKey|leftRatio/);
});

test("the splitter exposes pointer and keyboard accessible separator semantics", () => {
  assert.match(
    html,
    /id="workspaceSplitter"[^>]*role="separator"[^>]*aria-orientation="vertical"/
  );
  assert.match(html, /workspaceSplitter\.addEventListener\('pointerdown'/);
  assert.match(html, /workspaceSplitter\.addEventListener\('keydown'/);
  assert.match(html, /workspaceSplitter\.addEventListener\('dblclick'/);
});

test("desktop product rows stay inside a scrollable compact table", () => {
  assert.match(html, /\.tablewrap\{max-width:100%;overflow-x:auto;/);
  assert.match(html, /\.products\{min-width:800px;table-layout:fixed\}/);
  assert.match(html, /<th title="允许水平旋转">旋转<\/th>/);
  assert.match(html, /<th title="允许侧面装载">侧装<\/th>/);
  assert.match(html, /<th title="允许堆叠">堆叠<\/th>/);
});
