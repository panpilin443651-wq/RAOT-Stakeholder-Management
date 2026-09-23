import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";

const DB_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "raot-sm.db");
const SCHEMA_PATH = path.join(process.cwd(), "lib", "schema.sql");

declare global {
  // eslint-disable-next-line no-var
  var __raotDb: DatabaseSync | undefined;
}

function open(): DatabaseSync {
  fs.mkdirSync(DB_DIR, { recursive: true });
  const database = new DatabaseSync(DB_PATH);
  database.exec("PRAGMA foreign_keys = ON;");
  database.exec(fs.readFileSync(SCHEMA_PATH, "utf8"));
  return database;
}

/** ใช้ตัวเดียวกันทั้งกระบวนการ (Next.js dev รีโหลดโมดูลบ่อย) */
export const db: DatabaseSync = globalThis.__raotDb ?? (globalThis.__raotDb = open());

export type Row = Record<string, string | number | bigint | null | Uint8Array>;

/**
 * node:sqlite คืนแถวเป็นอ็อบเจกต์ null-prototype ซึ่ง React Server Components
 * ส่งต่อไปยัง Client Component ไม่ได้ จึงต้องแปลงเป็นอ็อบเจกต์ธรรมดาก่อนเสมอ
 */
function plain<T>(row: unknown): T {
  return Object.assign({}, row) as T;
}

export function all<T = Row>(sql: string, ...params: unknown[]): T[] {
  return db.prepare(sql).all(...(params as never[])).map((row) => plain<T>(row));
}

export function get<T = Row>(sql: string, ...params: unknown[]): T | undefined {
  const row = db.prepare(sql).get(...(params as never[]));
  return row === undefined ? undefined : plain<T>(row);
}

export function run(sql: string, ...params: unknown[]) {
  return db.prepare(sql).run(...(params as never[]));
}

export function nowIso(): string {
  return new Date().toISOString();
}

/** node:sqlite ไม่รับ undefined/boolean — แปลงให้เป็นค่าที่เก็บได้ */
export function bind(value: unknown): string | number | null {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value === "boolean") return value ? 1 : 0;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  return String(value);
}

/** แปลงค่าจากฟอร์มเป็นจำนวนเต็ม หรือ null */
export function bindInt(value: unknown): number | null {
  if (value === undefined || value === null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

export function bindFloat(value: unknown): number | null {
  if (value === undefined || value === null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}
