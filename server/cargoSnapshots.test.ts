import { mkdtemp, readFile, rm } from "node:fs/promises";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import path from "node:path";
import express from "express";
import { afterEach, describe, expect, it } from "vitest";
import {
  CargoSnapshotStore,
  createCargoSnapshotRouter,
  normalizeCargoSnapshot,
} from "./cargoSnapshots";

const temporaryDirectories: string[] = [];
const temporaryServers: Server[] = [];

afterEach(async () => {
  await Promise.all(
    temporaryServers
      .splice(0)
      .map(
        server =>
          new Promise<void>((resolve, reject) =>
            server.close(error => (error ? reject(error) : resolve()))
          )
      )
  );
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map(directory => rm(directory, { recursive: true, force: true }))
  );
});

async function startSnapshotServer(directory: string): Promise<string> {
  const app = express();
  app.use(createCargoSnapshotRouter({ directory }));
  const server = createServer(app);
  temporaryServers.push(server);
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address() as AddressInfo;
  return `http://127.0.0.1:${address.port}`;
}

function validSnapshot() {
  return {
    version: 2,
    mode: "loose",
    products: [
      {
        name: "A款收纳箱",
        sku: "BX-1001",
        l: 520,
        w: 380,
        h: 310,
        q: 420,
        kg: 8.5,
        rotate: true,
        side: true,
        color: "#3478d4",
        group: 1,
        stackable: true,
        maxLayers: 8,
        maxTopKg: 300,
      },
      {
        name: "C款边柜",
        sku: "CB-3012",
        l: 680,
        w: 420,
        h: 760,
        q: 96,
        kg: 22,
        rotate: true,
        side: false,
        color: "#e18b32",
        group: 2,
        stackable: false,
        maxLayers: 1,
        maxTopKg: 0,
      },
    ],
    containerType: "40HQ",
    containerQty: 2,
    looseCargoMaxGapMm: 50,
    priorityGroupMode: "virtual-wall",
    optimizationGoal: "complete-order",
    simulationTimeLimit: "balanced",
    pallet: {
      l: 1200,
      w: 1000,
      h: 1800,
      qty: 20,
      gap: 50,
      packingMode: "mixed-max",
      allowLooseCargo: true,
    },
    result: {
      solverVersion: "loading-strategy/0.5.0",
      loadedByProduct: [420, 80],
      warnings: ["CB-3012 有 16 箱未装入：不可堆叠约束。"],
      metrics: {
        volumeRatio: 0.72,
        weightRatio: 0.31,
        containersUsed: 2,
        maxInternalGapMm: 40,
        minimumSupportRatio: 1,
        containerDiagnostics: [
          {
            containerIndex: 0,
            loadedWeightG: 4_100_000,
            longitudinalCenterOffsetMm: -120,
            lateralCenterOffsetMm: 18,
            continuousDoorFreeMm: 420,
            occupiedLengthMm: 11_612,
          },
          {
            containerIndex: 1,
            loadedWeightG: 1_230_000,
            longitudinalCenterOffsetMm: -820,
            lateralCenterOffsetMm: -12,
            continuousDoorFreeMm: 2_100,
            occupiedLengthMm: 9_932,
          },
        ],
      },
    },
    resultHash: "dsSHcLf6rsqu",
  };
}

describe("cargo snapshot normalization", () => {
  it("keeps every reproducibility input and normalizes the version", () => {
    expect(
      normalizeCargoSnapshot({ ...validSnapshot(), version: 999 })
    ).toEqual(validSnapshot());
  });

  it("upgrades old condition-only snapshots with safe defaults", () => {
    const legacy = validSnapshot() as any;
    legacy.version = 1;
    delete legacy.priorityGroupMode;
    delete legacy.result;
    delete legacy.resultHash;
    legacy.products.forEach((product: any) => {
      delete product.group;
      delete product.stackable;
      delete product.maxLayers;
      delete product.maxTopKg;
    });

    const normalized = normalizeCargoSnapshot(legacy);
    expect(normalized.version).toBe(2);
    expect(normalized.priorityGroupMode).toBe("virtual-wall");
    expect(normalized.products[0]).toMatchObject({
      group: 1,
      stackable: true,
      maxLayers: 99,
      maxTopKg: 100_000,
    });
    expect(normalized.result).toBeNull();
    expect(normalized.resultHash).toBeNull();
  });

  it("rejects unsafe text and out-of-range conditions", () => {
    const unsafe = validSnapshot();
    unsafe.products[0].name = "<script>alert(1)</script>";
    expect(() => normalizeCargoSnapshot(unsafe)).toThrow(/name is invalid/);

    const invalidQuantity = validSnapshot();
    invalidQuantity.containerQty = 21;
    expect(() => normalizeCargoSnapshot(invalidQuantity)).toThrow(
      /containerQty/
    );
  });
});

describe("CargoSnapshotStore", () => {
  it("creates a compact deterministic id and restores the same configuration", async () => {
    const directory = await mkdtemp(
      path.join(tmpdir(), "openit-cargo-snapshot-")
    );
    temporaryDirectories.push(directory);
    const store = new CargoSnapshotStore(directory);

    const first = await store.save(validSnapshot());
    const second = await store.save(validSnapshot());

    expect(first.id).toMatch(/^[A-Za-z0-9_-]{12}$/);
    expect(second.id).toBe(first.id);
    expect(await store.get(first.id)).toEqual(validSnapshot());
    expect(
      JSON.parse(
        await readFile(path.join(directory, `${first.id}.json`), "utf8")
      )
    ).toEqual(validSnapshot());
  });

  it("does not allow path traversal ids", async () => {
    const directory = await mkdtemp(
      path.join(tmpdir(), "openit-cargo-snapshot-")
    );
    temporaryDirectories.push(directory);
    const store = new CargoSnapshotStore(directory);
    expect(await store.get("../../secrets")).toBeNull();
  });
});

describe("cargo snapshot HTTP API", () => {
  it("creates and retrieves a shareable snapshot", async () => {
    const directory = await mkdtemp(
      path.join(tmpdir(), "openit-cargo-snapshot-api-")
    );
    temporaryDirectories.push(directory);
    const baseUrl = await startSnapshotServer(directory);

    const createResponse = await fetch(`${baseUrl}/api/cargo-snapshots`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validSnapshot()),
    });
    expect(createResponse.status).toBe(201);
    const created = (await createResponse.json()) as {
      id: string;
      resultHash: string;
    };
    expect(created.resultHash).toBe(validSnapshot().resultHash);

    const readResponse = await fetch(
      `${baseUrl}/api/cargo-snapshots/${created.id}`
    );
    expect(readResponse.status).toBe(200);
    expect(readResponse.headers.get("cache-control")).toContain("immutable");
    expect(await readResponse.json()).toEqual(validSnapshot());
  });

  it("rejects oversized public writes before snapshot processing", async () => {
    const directory = await mkdtemp(
      path.join(tmpdir(), "openit-cargo-snapshot-api-")
    );
    temporaryDirectories.push(directory);
    const baseUrl = await startSnapshotServer(directory);

    const response = await fetch(`${baseUrl}/api/cargo-snapshots`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ padding: "x".repeat(50 * 1024) }),
    });

    expect(response.status).toBe(413);
    expect(await response.json()).toEqual({
      error: "Cargo snapshot is too large",
    });
  });
});
