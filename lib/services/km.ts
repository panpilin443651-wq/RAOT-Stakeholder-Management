import { bind, get, nowIso, run, insertId } from "@/lib/db";

/**
 * องค์ความรู้ — ผู้ดูแลระบบเพิ่ม แก้ไข และลบหัวข้อได้เอง
 * วันที่บันทึกข้อมูล (created_at) ไม่เปลี่ยนเมื่อแก้ไขเนื้อหา เพราะใช้เรียงลำดับในหน้ารายการ
 */

export type KmPayload = {
  id?: number;
  title: string;
  summary?: string | null;
  category?: string | null;
  body: string;
};

export function validateKm(payload: KmPayload): string | null {
  if (!payload.title?.trim()) return "กรุณาระบุ ชื่อหัวข้อองค์ความรู้";
  if (!payload.body?.trim()) return "กรุณาระบุ เนื้อหา";
  return null;
}

export async function saveKm(payload: KmPayload, username: string): Promise<number> {
  const now = nowIso();

  if (payload.id) {
    if (!await get("SELECT id FROM km_article WHERE id = ?", payload.id)) {
      throw new Error("ไม่พบหัวข้อองค์ความรู้ที่ต้องการแก้ไข");
    }
    await run(
      `UPDATE km_article
          SET title = ?, summary = ?, category = ?, body = ?, updated_at = ?, updated_by = ?
        WHERE id = ?`,
      bind(payload.title.trim()),
      bind(payload.summary?.trim()),
      bind(payload.category?.trim()),
      bind(payload.body),
      now,
      bind(username),
      payload.id,
    );
    return payload.id;
  }

  return insertId(
    `INSERT INTO km_article (title, summary, category, body, created_at, created_by, updated_at, updated_by)
     VALUES (?,?,?,?,?,?,?,?)`,
    bind(payload.title.trim()),
    bind(payload.summary?.trim()),
    bind(payload.category?.trim()),
    bind(payload.body),
    now,
    bind(username),
    now,
    bind(username),
  );
}

export async function deleteKm(id: number): Promise<string | null> {
  if (!await get("SELECT id FROM km_article WHERE id = ?", id)) return "ไม่พบหัวข้อองค์ความรู้ที่เลือก";
  await run("DELETE FROM km_article WHERE id = ?", id);
  return null;
}
