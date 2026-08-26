import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import express, {
  Router,
  type NextFunction,
  type Request,
  type Response,
} from "express";

const SNAPSHOT_VERSION = 2;
const SNAPSHOT_ID_PATTERN = /^[A-Za-z0-9_-]{12}$/;
const MAX_SNAPSHOT_BYTES = 32 * 1024;
const MAX_PRODUCTS = 100;
const MAX_STORED_SNAPSHOTS = 10_000;

type CargoProduct = {
  name: string;
  sku: string;
  l: number;
  w: number;
  h: number;
  q: number;
  kg: number;
  rotate: boolean;
  side: boolean;
  color: string;
  group: number;
  stackable: boolean;
  maxLayers: number;
  maxTopKg: number;
};

type ContainerDiagnostic = {
  containerIndex: number;
  loadedWeightG: number;
  longitudinalCenterOffsetMm: number;
  lateralCenterOffsetMm: number;
  continuousDoorFreeMm: number;
  occupiedLengthMm: number;
};

type CargoSnapshotResult = {
  solverVersion: string;
  loadedByProduct: number[];
  warnings: string[];
  metrics: {
    volumeRatio: number;
    weightRatio: number;
    containersUsed: number;
    maxInternalGapMm: number;
    minimumSupportRatio: number;
    containerDiagnostics: ContainerDiagnostic[];
  };
};

export type CargoSnapshot = {
  version: 2;
  mode: "loose" | "pallet";
  products: CargoProduct[];
  containerType: "20GP" | "40GP" | "40HQ";
  containerQty: number;
  looseCargoMaxGapMm: number;
  priorityGroupMode: "virtual-wall" | "no-cross-stacking" | "allow-stacking";
  optimizationGoal: "complete-order" | "volume" | "weight-balance";
  simulationTimeLimit: "fast" | "balanced" | "deep";
  pallet: {
    l: number;
    w: number;
    h: number;
    qty: number;
    gap: number;
    packingMode: "single-sku" | "mixed-max";
    allowLooseCargo: boolean;
  };
  result: CargoSnapshotResult | null;
  resultHash: string | null;
};

function finiteNumber(
  value: unknown,
  field: string,
  options: { integer?: boolean; min: number; max: number }
): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`${field} must be a finite number`);
  }
  if (options.integer && !Number.isInteger(value)) {
    throw new Error(`${field} must be an integer`);
  }
  if (value < options.min || value > options.max) {
    throw new Error(`${field} is outside the allowed range`);
  }
  return value;
}

function shortText(value: unknown, field: string, maxLength: number): string {
  if (typeof value !== "string") throw new Error(`${field} must be text`);
  const normalized = value.trim();
  if (
    !normalized ||
    normalized.length > maxLength ||
    /[<>\u0000-\u001f]/u.test(normalized)
  ) {
    throw new Error(`${field} is invalid`);
  }
  return normalized;
}

function enumValue<T extends string>(
  value: unknown,
  field: string,
  allowed: readonly T[]
): T {
  if (typeof value !== "string" || !allowed.includes(value as T)) {
    throw new Error(`${field} is invalid`);
  }
  return value as T;
}

function booleanValue(value: unknown, field: string): boolean {
  if (typeof value !== "boolean") throw new Error(`${field} must be a boolean`);
  return value;
}

export function normalizeCargoSnapshot(value: unknown): CargoSnapshot {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("snapshot must be an object");
  const input = value as Record<string, unknown>;
  if (
    !Array.isArray(input.products) ||
    input.products.length < 1 ||
    input.products.length > MAX_PRODUCTS
  ) {
    throw new Error(
      `products must contain between 1 and ${MAX_PRODUCTS} items`
    );
  }
  const palletInput = input.pallet;
  if (
    !palletInput ||
    typeof palletInput !== "object" ||
    Array.isArray(palletInput)
  ) {
    throw new Error("pallet must be an object");
  }
  const pallet = palletInput as Record<string, unknown>;
  const products = input.products.map((entry, index) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry))
      throw new Error(`products[${index}] is invalid`);
    const product = entry as Record<string, unknown>;
    const color = shortText(product.color, `products[${index}].color`, 20);
    if (!/^#[0-9a-f]{6}$/iu.test(color))
      throw new Error(`products[${index}].color is invalid`);
    return {
      name: shortText(product.name, `products[${index}].name`, 80),
      sku: shortText(product.sku, `products[${index}].sku`, 50),
      l: finiteNumber(product.l, `products[${index}].l`, {
        integer: true,
        min: 1,
        max: 50_000,
      }),
      w: finiteNumber(product.w, `products[${index}].w`, {
        integer: true,
        min: 1,
        max: 50_000,
      }),
      h: finiteNumber(product.h, `products[${index}].h`, {
        integer: true,
        min: 1,
        max: 50_000,
      }),
      q: finiteNumber(product.q, `products[${index}].q`, {
        integer: true,
        min: 1,
        max: 1_000_000,
      }),
      kg: finiteNumber(product.kg, `products[${index}].kg`, {
        min: 0.001,
        max: 100_000,
      }),
      rotate: booleanValue(product.rotate, `products[${index}].rotate`),
      side: booleanValue(product.side, `products[${index}].side`),
      color,
      group:
        product.group === undefined
          ? 1
          : finiteNumber(product.group, `products[${index}].group`, {
              integer: true,
              min: 1,
              max: 99,
            }),
      stackable:
        product.stackable === undefined
          ? true
          : booleanValue(product.stackable, `products[${index}].stackable`),
      maxLayers:
        product.maxLayers === undefined
          ? 99
          : finiteNumber(product.maxLayers, `products[${index}].maxLayers`, {
              integer: true,
              min: 1,
              max: 99,
            }),
      maxTopKg:
        product.maxTopKg === undefined
          ? 100_000
          : finiteNumber(product.maxTopKg, `products[${index}].maxTopKg`, {
              min: 0,
              max: 100_000,
            }),
    };
  });

  let result: CargoSnapshotResult | null = null;
  if (input.result !== undefined && input.result !== null) {
    if (typeof input.result !== "object" || Array.isArray(input.result))
      throw new Error("result must be an object");
    const resultInput = input.result as Record<string, unknown>;
    if (
      !Array.isArray(resultInput.loadedByProduct) ||
      resultInput.loadedByProduct.length !== products.length
    ) {
      throw new Error("result.loadedByProduct must match products");
    }
    if (
      !Array.isArray(resultInput.warnings) ||
      resultInput.warnings.length > 50
    ) {
      throw new Error("result.warnings is invalid");
    }
    const metricsInput = resultInput.metrics;
    if (
      !metricsInput ||
      typeof metricsInput !== "object" ||
      Array.isArray(metricsInput)
    ) {
      throw new Error("result.metrics must be an object");
    }
    const metrics = metricsInput as Record<string, unknown>;
    if (
      !Array.isArray(metrics.containerDiagnostics) ||
      metrics.containerDiagnostics.length > 20
    ) {
      throw new Error("result.metrics.containerDiagnostics is invalid");
    }
    result = {
      solverVersion: shortText(
        resultInput.solverVersion,
        "result.solverVersion",
        80
      ),
      loadedByProduct: resultInput.loadedByProduct.map((count, index) =>
        finiteNumber(count, `result.loadedByProduct[${index}]`, {
          integer: true,
          min: 0,
          max: products[index].q,
        })
      ),
      warnings: resultInput.warnings.map((warning, index) =>
        shortText(warning, `result.warnings[${index}]`, 500)
      ),
      metrics: {
        volumeRatio: finiteNumber(
          metrics.volumeRatio,
          "result.metrics.volumeRatio",
          {
            min: 0,
            max: 1,
          }
        ),
        weightRatio: finiteNumber(
          metrics.weightRatio,
          "result.metrics.weightRatio",
          {
            min: 0,
            max: 1,
          }
        ),
        containersUsed: finiteNumber(
          metrics.containersUsed,
          "result.metrics.containersUsed",
          { integer: true, min: 0, max: 20 }
        ),
        maxInternalGapMm: finiteNumber(
          metrics.maxInternalGapMm,
          "result.metrics.maxInternalGapMm",
          { min: 0, max: 50_000 }
        ),
        minimumSupportRatio: finiteNumber(
          metrics.minimumSupportRatio,
          "result.metrics.minimumSupportRatio",
          { min: 0, max: 1 }
        ),
        containerDiagnostics: metrics.containerDiagnostics.map(
          (entry, index) => {
            if (!entry || typeof entry !== "object" || Array.isArray(entry))
              throw new Error(
                `result.metrics.containerDiagnostics[${index}] is invalid`
              );
            const diagnostic = entry as Record<string, unknown>;
            const field = `result.metrics.containerDiagnostics[${index}]`;
            return {
              containerIndex: finiteNumber(
                diagnostic.containerIndex,
                `${field}.containerIndex`,
                { integer: true, min: 0, max: 19 }
              ),
              loadedWeightG: finiteNumber(
                diagnostic.loadedWeightG,
                `${field}.loadedWeightG`,
                { min: 0, max: 100_000_000 }
              ),
              longitudinalCenterOffsetMm: finiteNumber(
                diagnostic.longitudinalCenterOffsetMm,
                `${field}.longitudinalCenterOffsetMm`,
                { min: -50_000, max: 50_000 }
              ),
              lateralCenterOffsetMm: finiteNumber(
                diagnostic.lateralCenterOffsetMm,
                `${field}.lateralCenterOffsetMm`,
                { min: -50_000, max: 50_000 }
              ),
              continuousDoorFreeMm: finiteNumber(
                diagnostic.continuousDoorFreeMm,
                `${field}.continuousDoorFreeMm`,
                { min: 0, max: 50_000 }
              ),
              occupiedLengthMm: finiteNumber(
                diagnostic.occupiedLengthMm,
                `${field}.occupiedLengthMm`,
                { min: 0, max: 50_000 }
              ),
            };
          }
        ),
      },
    };
  }
  const resultHash = result
    ? createHash("sha256")
        .update(JSON.stringify(result))
        .digest("base64url")
        .slice(0, 12)
    : null;

  return {
    version: SNAPSHOT_VERSION,
    mode: enumValue(input.mode, "mode", ["loose", "pallet"] as const),
    products,
    containerType: enumValue(input.containerType, "containerType", [
      "20GP",
      "40GP",
      "40HQ",
    ] as const),
    containerQty: finiteNumber(input.containerQty, "containerQty", {
      integer: true,
      min: 1,
      max: 20,
    }),
    looseCargoMaxGapMm: finiteNumber(
      input.looseCargoMaxGapMm,
      "looseCargoMaxGapMm",
      { integer: true, min: 0, max: 10_000 }
    ),
    priorityGroupMode:
      input.priorityGroupMode === undefined
        ? "virtual-wall"
        : enumValue(input.priorityGroupMode, "priorityGroupMode", [
            "virtual-wall",
            "no-cross-stacking",
            "allow-stacking",
          ] as const),
    optimizationGoal: enumValue(input.optimizationGoal, "optimizationGoal", [
      "complete-order",
      "volume",
      "weight-balance",
    ] as const),
    simulationTimeLimit: enumValue(
      input.simulationTimeLimit,
      "simulationTimeLimit",
      ["fast", "balanced", "deep"] as const
    ),
    pallet: {
      l: finiteNumber(pallet.l, "pallet.l", {
        integer: true,
        min: 1,
        max: 50_000,
      }),
      w: finiteNumber(pallet.w, "pallet.w", {
        integer: true,
        min: 1,
        max: 50_000,
      }),
      h: finiteNumber(pallet.h, "pallet.h", {
        integer: true,
        min: 1,
        max: 50_000,
      }),
      qty: finiteNumber(pallet.qty, "pallet.qty", {
        integer: true,
        min: 1,
        max: 10_000,
      }),
      gap: finiteNumber(pallet.gap, "pallet.gap", {
        integer: true,
        min: 0,
        max: 10_000,
      }),
      packingMode: enumValue(pallet.packingMode, "pallet.packingMode", [
        "single-sku",
        "mixed-max",
      ] as const),
      allowLooseCargo: booleanValue(
        pallet.allowLooseCargo,
        "pallet.allowLooseCargo"
      ),
    },
    result,
    resultHash,
  };
}

export class CargoSnapshotStore {
  constructor(
    private readonly directory: string,
    private readonly maxSnapshots = MAX_STORED_SNAPSHOTS
  ) {}

  async save(value: unknown): Promise<{ id: string; snapshot: CargoSnapshot }> {
    const snapshot = normalizeCargoSnapshot(value);
    const serialized = JSON.stringify(snapshot);
    if (Buffer.byteLength(serialized, "utf8") > MAX_SNAPSHOT_BYTES)
      throw new Error("snapshot is too large");
    const id = createHash("sha256")
      .update(serialized)
      .digest("base64url")
      .slice(0, 12);
    await mkdir(this.directory, { recursive: true });
    const destination = path.join(this.directory, `${id}.json`);
    try {
      const existing = await readFile(destination, "utf8");
      if (existing !== serialized) throw new Error("snapshot id collision");
    } catch (error: any) {
      if (error?.code !== "ENOENT") throw error;
      const storedSnapshots = (
        await readdir(this.directory, {
          withFileTypes: true,
        })
      ).filter(entry => entry.isFile() && entry.name.endsWith(".json"));
      if (storedSnapshots.length >= this.maxSnapshots) {
        throw new Error("cargo snapshot storage has reached capacity");
      }
      const temporary = path.join(
        this.directory,
        `.${id}-${process.pid}-${Date.now()}.tmp`
      );
      await writeFile(temporary, serialized, { encoding: "utf8", flag: "wx" });
      try {
        await rename(temporary, destination);
      } catch (renameError: any) {
        if (renameError?.code !== "EEXIST") throw renameError;
      }
    }
    return { id, snapshot };
  }

  async get(id: string): Promise<CargoSnapshot | null> {
    if (!SNAPSHOT_ID_PATTERN.test(id)) return null;
    try {
      const serialized = await readFile(
        path.join(this.directory, `${id}.json`),
        "utf8"
      );
      return normalizeCargoSnapshot(JSON.parse(serialized));
    } catch (error: any) {
      if (error?.code === "ENOENT") return null;
      throw error;
    }
  }
}

export function createCargoSnapshotRouter(
  options: { directory?: string } = {}
): Router {
  const directory =
    options.directory ||
    process.env.CARGO_SNAPSHOT_DIR ||
    path.join(process.cwd(), "data", "cargo-snapshots");
  const store = new CargoSnapshotStore(directory);
  const router = Router();

  router.post(
    "/api/cargo-snapshots",
    express.json({ limit: "40kb", strict: true }),
    async (req, res) => {
      try {
        const { id, snapshot } = await store.save(req.body);
        res.status(201).json({ id, resultHash: snapshot.resultHash });
      } catch (error: any) {
        res
          .status(400)
          .json({ error: error?.message || "Invalid cargo snapshot" });
      }
    }
  );

  router.get("/api/cargo-snapshots/:id", async (req, res) => {
    try {
      const snapshot = await store.get(req.params.id);
      if (!snapshot)
        return res.status(404).json({ error: "Cargo snapshot not found" });
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      res.setHeader("X-Content-Type-Options", "nosniff");
      return res.json(snapshot);
    } catch (error: any) {
      console.error("[cargo-snapshots] Read failed:", error?.message || error);
      return res.status(500).json({ error: "Unable to read cargo snapshot" });
    }
  });

  router.use((error: any, _req: Request, res: Response, next: NextFunction) => {
    if (error?.type === "entity.too.large") {
      return res.status(413).json({ error: "Cargo snapshot is too large" });
    }
    if (error instanceof SyntaxError) {
      return res.status(400).json({ error: "Cargo snapshot JSON is invalid" });
    }
    return next(error);
  });

  return router;
}
