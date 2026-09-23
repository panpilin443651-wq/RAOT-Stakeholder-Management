import { neon, types } from "@neondatabase/serverless";

/**
 * ชั้นเข้าถึงฐานข้อมูล — Neon Postgres ผ่าน HTTP driver
 *
 * เดิมใช้ node:sqlite เปิดไฟล์ data/raot-sm.db ซึ่งรันบน Vercel ไม่ได้
 * เพราะดิสก์ของ serverless เขียนไม่ได้และไฟล์ก็ไม่ถูก deploy ขึ้นไปด้วย
 *
 * HTTP driver เหมาะกับ serverless เพราะยิงทีละคำสั่งโดยไม่ต้องถือ connection
 * จึงไม่มีปัญหา connection pool หมดเวลา cold start
 *
 * ต่างจากเดิมที่สำคัญ: get/all/run เป็น async แล้ว ทุกที่ที่เรียกต้อง await
 */

/**
 * Postgres คืน int8 (COUNT ฯลฯ) และ numeric เป็น string ตามค่าเริ่มต้นของ pg-types
 * ถ้าไม่บังคับให้เป็น number โค้ดที่เอาผล COUNT ไปคำนวณต่อจะพังแบบเงียบ ๆ
 * เช่น "1" + 1 = "11" — ตั้ง parser ครั้งเดียวที่นี่แทนการเติม ::int ในทุกคำสั่ง
 */
types.setTypeParser(20, (value) => (value === null ? null : Number(value))); // int8
types.setTypeParser(1700, (value) => (value === null ? null : Number(value))); // numeric

function connectionString(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "ไม่ได้ตั้งค่า DATABASE_URL — เครื่องตัวเองให้ใส่ใน .env.local " +
        "ถ้าเป็น Vercel ให้ตั้งใน Project Settings > Environment Variables",
    );
  }
  return url;
}

declare global {
  // eslint-disable-next-line no-var
  var __raotSql: ReturnType<typeof neon> | undefined;
}

/** ใช้ตัวเดียวกันทั้งกระบวนการ (Next.js dev รีโหลดโมดูลบ่อย) */
function client(): ReturnType<typeof neon> {
  return (globalThis.__raotSql ??= neon(connectionString()));
}

/**
 * SQL ทั้งโปรเจกต์เขียนด้วย placeholder แบบ ? ตามอย่าง SQLite
 * Postgres ใช้ $1..$n จึงแปลงให้ที่ชั้นนี้ เพื่อไม่ต้องแก้คำสั่ง SQL ทั้งหมด
 * ข้าม ? ที่อยู่ในสตริง '...' และในคอมเมนต์ เพราะไม่ใช่ placeholder
 */
export function toPositional(sql: string): string {
  let out = "";
  let index = 0;
  let inString = false;
  let inLineComment = false;

  for (let i = 0; i < sql.length; i += 1) {
    const char = sql[i];
    const next = sql[i + 1];

    if (inLineComment) {
      out += char;
      if (char === "\n") inLineComment = false;
      continue;
    }
    if (inString) {
      out += char;
      // '' คือ escape ของ ' ใน SQL จึงต้องข้ามไปทีเดียวสองตัว
      if (char === "'" && next === "'") {
        out += next;
        i += 1;
      } else if (char === "'") {
        inString = false;
      }
      continue;
    }
    if (char === "'") {
      inString = true;
      out += char;
      continue;
    }
    if (char === "-" && next === "-") {
      inLineComment = true;
      out += char;
      continue;
    }
    if (char === "?") {
      index += 1;
      out += `$${index}`;
      continue;
    }
    out += char;
  }
  return out;
}

export type Row = Record<string, string | number | boolean | null>;

export async function all<T = Row>(sql: string, ...params: unknown[]): Promise<T[]> {
  const rows = await client().query(toPositional(sql), params as never[]);
  return rows as T[];
}

export async function get<T = Row>(sql: string, ...params: unknown[]): Promise<T | undefined> {
  const rows = await all<T>(sql, ...params);
  return rows[0];
}

export async function run(sql: string, ...params: unknown[]): Promise<void> {
  await client().query(toPositional(sql), params as never[]);
}

/**
 * INSERT แล้วคืน id ที่เพิ่งสร้าง
 * แทน last_insert_rowid() ของ SQLite ซึ่ง Postgres ไม่มี — ใช้ RETURNING id แทน
 */
export async function insertId(sql: string, ...params: unknown[]): Promise<number> {
  const row = await get<{ id: number }>(`${sql} RETURNING id`, ...params);
  if (!row) throw new Error("INSERT ไม่คืนค่า id");
  return Number(row.id);
}

/** รันหลายคำสั่งในทรานแซกชันเดียว ใช้ตอน migrate/seed */
export async function transaction(statements: { sql: string; params?: unknown[] }[]): Promise<void> {
  const sql = client();
  await sql.transaction(
    statements.map((statement) =>
      sql.query(toPositional(statement.sql), (statement.params ?? []) as never[]),
    ),
  );
}

export function nowIso(): string {
  return new Date().toISOString();
}

/** ค่าจากฟอร์มที่ว่างให้เก็บเป็น NULL และ boolean เก็บเป็น 0/1 ตามคอลัมน์ INTEGER */
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
