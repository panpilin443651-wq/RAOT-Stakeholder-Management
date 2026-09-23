import { all, get, run, bindInt, insertId } from "@/lib/db";
import { FISCAL_YEAR_START_MONTH } from "@/lib/fiscal";

/**
 * ปีงบประมาณเป็นข้อมูลหลักที่กระทบทุกเมนู — ทุกฟอร์มผูกกับ fiscal_year_id
 * จึงให้เพิ่ม/เปลี่ยนปีปัจจุบันได้เฉพาะผู้ดูแลระบบ และลบได้เฉพาะปีที่ยังไม่มีข้อมูล
 */

/** ช่วงปี พ.ศ. ที่ยอมรับ — กันพิมพ์ ค.ศ. หรือพิมพ์ตกหล่น */
export const MIN_YEAR = 2500;
export const MAX_YEAR = 2700;

/** ตารางที่อ้างถึงปีงบประมาณ ใช้ทั้งนับข้อมูลที่ผูกอยู่และกันการลบ */
const REFERENCING_TABLES = [
  { table: "stakeholder", label: "ผู้มีส่วนได้ส่วนเสีย" },
  { table: "engagement_objective", label: "วัตถุประสงค์และขอบเขต" },
  { table: "plan", label: "แผนงาน/โครงการ" },
  { table: "expectation", label: "ความต้องการความคาดหวัง" },
] as const;

export type FiscalYearPayload = {
  year: number | string;
  start_month?: number | string | null;
  make_current?: boolean;
};

export type FiscalYearRow = {
  id: number;
  year: number;
  start_month: number;
  is_current: number;
  /** จำนวนข้อมูลที่ผูกกับปีนี้ทั้งหมด — ถ้ามากกว่า 0 จะลบไม่ได้ */
  usage: number;
};

/** ปีงบประมาณทั้งหมด พร้อมจำนวนข้อมูลที่ผูกอยู่ ใช้ในหน้าตั้งค่า */
export async function listFiscalYearsWithUsage(): Promise<FiscalYearRow[]> {
  const usage = REFERENCING_TABLES.map(
    (t) => `(SELECT COUNT(*) FROM ${t.table} x WHERE x.fiscal_year_id = f.id)`,
  ).join(" + ");
  return await all<FiscalYearRow>(
    `SELECT f.id, f.year, f.start_month, f.is_current, ${usage} AS usage
       FROM fiscal_year f
      ORDER BY f.year DESC`,
  );
}

export async function validateFiscalYear(payload: FiscalYearPayload): Promise<string | null> {
  const year = bindInt(payload.year);
  if (year === null) return "กรุณาระบุ ปีงบประมาณ";
  if (year < MIN_YEAR || year > MAX_YEAR) {
    return `ปีงบประมาณต้องเป็น พ.ศ. ระหว่าง ${MIN_YEAR} ถึง ${MAX_YEAR}`;
  }
  if (await get("SELECT id FROM fiscal_year WHERE year = ?", year)) {
    return `มีปีงบประมาณ ${year} อยู่แล้ว`;
  }

  const startMonth = bindInt(payload.start_month ?? FISCAL_YEAR_START_MONTH);
  if (startMonth === null || startMonth < 1 || startMonth > 12) {
    return "เดือนเริ่มต้นปีงบประมาณต้องอยู่ระหว่าง 1 ถึง 12";
  }
  return null;
}

/** เพิ่มปีงบประมาณใหม่ คืนค่า id ของปีที่เพิ่ม */
export async function createFiscalYear(payload: FiscalYearPayload): Promise<number> {
  const year = bindInt(payload.year)!;
  const startMonth = bindInt(payload.start_month ?? FISCAL_YEAR_START_MONTH)!;

  const id = await insertId("INSERT INTO fiscal_year (year, start_month, is_current) VALUES (?,?,0)", year, startMonth);

  if (payload.make_current) await setCurrentFiscalYear(id);
  return id;
}

/** กำหนดปีปัจจุบัน — มีได้ปีเดียวเสมอ */
export async function setCurrentFiscalYear(id: number): Promise<string | null> {
  if (!await get("SELECT id FROM fiscal_year WHERE id = ?", id)) return "ไม่พบปีงบประมาณที่เลือก";
  await run("UPDATE fiscal_year SET is_current = 0 WHERE is_current = 1");
  await run("UPDATE fiscal_year SET is_current = 1 WHERE id = ?", id);
  return null;
}

/** ลบปีงบประมาณ — ทำได้เฉพาะปีที่ยังไม่มีข้อมูลผูกอยู่ และไม่ใช่ปีปัจจุบัน */
export async function deleteFiscalYear(id: number): Promise<string | null> {
  const row = await get<{ id: number; year: number; is_current: number }>(
    "SELECT id, year, is_current FROM fiscal_year WHERE id = ?",
    id,
  );
  if (!row) return "ไม่พบปีงบประมาณที่เลือก";
  if (row.is_current) return "ลบปีปัจจุบันไม่ได้ — กรุณาย้ายปีปัจจุบันไปปีอื่นก่อน";

  const counted = await Promise.all(
    REFERENCING_TABLES.map(async (t) => ({
      label: t.label,
      count: Number(
        (await get<{ n: number }>(`SELECT COUNT(*) AS n FROM ${t.table} WHERE fiscal_year_id = ?`, id))?.n ?? 0,
      ),
    })),
  );
  const blocking = counted.filter((t) => t.count > 0);

  if (blocking.length > 0) {
    const detail = blocking.map((t) => `${t.label} ${t.count} รายการ`).join(" · ");
    return `ลบปี ${row.year} ไม่ได้ เพราะมีข้อมูลผูกอยู่แล้ว (${detail})`;
  }

  await run("DELETE FROM fiscal_year WHERE id = ?", id);
  return null;
}
