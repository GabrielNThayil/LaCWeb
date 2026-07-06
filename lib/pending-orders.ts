import "server-only";

import fs from "fs";
import path from "path";

// ─── Pending orders storage (shared between order and verify routes) ──────
const TEMP_DATA_DIR = path.join(process.cwd(), "data", "pending");

export function ensureTempDir(): void {
  if (!fs.existsSync(TEMP_DATA_DIR)) {
    fs.mkdirSync(TEMP_DATA_DIR, { recursive: true });
  }
}

export function readPendingOrder(orderId: string): unknown | null {
  const file = path.join(TEMP_DATA_DIR, `${orderId}.json`);
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

export function writePendingOrder(orderId: string, data: unknown): void {
  ensureTempDir();
  const file = path.join(TEMP_DATA_DIR, `${orderId}.json`);
  fs.writeFileSync(file, JSON.stringify(data), "utf8");
}

export function deletePendingOrder(orderId: string): void {
  const file = path.join(TEMP_DATA_DIR, `${orderId}.json`);
  if (fs.existsSync(file)) fs.unlinkSync(file);
}