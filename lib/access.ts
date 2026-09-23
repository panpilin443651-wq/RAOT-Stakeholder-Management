import "server-only";
import { get } from "@/lib/db";
import { canEditOrgUnit, NO_UNIT_PERMISSION, type Actor } from "@/lib/masters";

/**
 * ตรวจว่าแถวที่มีอยู่แล้วเป็นของส่วนงานที่ผู้ใช้แก้ไขได้หรือไม่
 *
 * ต้องตรวจฝั่งเซิร์ฟเวอร์เสมอ การซ่อนปุ่มบนหน้าจอกันได้แค่การกดพลาด
 * แต่กันการยิง API ตรง ๆ ไม่ได้
 */

const OWNER_SQL = {
  stakeholder: "SELECT org_unit_id FROM stakeholder WHERE id = ?",
  plan: "SELECT org_unit_id FROM plan WHERE id = ?",
  expectation: "SELECT org_unit_id FROM expectation WHERE id = ?",
} as const;

export type OwnedTable = keyof typeof OWNER_SQL;

/** ส่วนงานเจ้าของแถว — undefined เมื่อไม่พบแถวนั้น */
export function ownerUnitOf(table: OwnedTable, id: number): number | undefined {
  // id มาจาก JSON body หรือ URL จึงเชื่อชนิดตามที่ประกาศไม่ได้
  // ค่าที่ไม่ใช่จำนวนเต็ม (undefined/NaN/ออบเจกต์) bind เข้า SQLite ไม่ได้และจะโยน error เป็น 500
  // ถือว่า "ไม่พบแถว" ให้ผู้เรียกตอบ 404 ตามปกติ
  if (!Number.isInteger(id)) return undefined;
  return get<{ org_unit_id: number }>(OWNER_SQL[table], id)?.org_unit_id;
}

/**
 * ตรวจสิทธิ์แก้ไขแถวที่มีอยู่แล้ว
 * คืน null เมื่อผ่าน หรืออ็อบเจกต์ { error, status } เมื่อไม่ผ่าน
 * แยก 404 (ไม่มีแถวนั้น) ออกจาก 403 (มีแต่เป็นของส่วนงานอื่น)
 */
export type Denial = { error: string; status: 403 | 404 };

export function checkRecordUnit(user: Actor, table: OwnedTable, id: number): Denial | null {
  const ownerUnit = ownerUnitOf(table, id);
  if (ownerUnit === undefined) return { error: "ไม่พบข้อมูลที่ต้องการแก้ไข", status: 404 };
  if (!canEditOrgUnit(user, ownerUnit)) return { error: NO_UNIT_PERMISSION, status: 403 };
  return null;
}

/** ส่วนงานเจ้าของแผนงานที่ผลไตรมาสนี้ผูกอยู่ */
export function planOwnerUnit(planId: number): number | undefined {
  return ownerUnitOf("plan", planId);
}
