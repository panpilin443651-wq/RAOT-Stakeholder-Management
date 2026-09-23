import { bind, bindInt, nowIso, run, get } from "@/lib/db";

export type ObjectivePayload = {
  scope: "ORG" | "UNIT";
  fiscal_year_id: number;
  org_unit_id: number;
  objective?: string | null;
  scope_text?: string | null;
  target_groups?: number[];
  expected_result?: string | null;
  action: "draft" | "approve";
};

export function validateObjective(payload: ObjectivePayload): string | null {
  if (!payload.objective?.trim()) return "กรุณาระบุ วัตถุประสงค์ของการสร้างความสัมพันธ์";
  if (!payload.scope_text?.trim()) return "กรุณาระบุ ขอบเขตของการสร้างความสัมพันธ์";
  if (!payload.target_groups?.length) return "กรุณาเลือก กลุ่มผู้มีส่วนได้ส่วนเสียเป้าหมาย อย่างน้อย 1 กลุ่ม";
  return null;
}

export function saveObjective(payload: ObjectivePayload, status: string, username: string): number {
  const existing = get<{ id: number }>(
    "SELECT id FROM engagement_objective WHERE scope = ? AND fiscal_year_id = ? AND org_unit_id = ?",
    payload.scope,
    payload.fiscal_year_id,
    payload.org_unit_id,
  );

  const values = [
    bind(payload.objective),
    bind(payload.scope_text),
    bind(JSON.stringify(payload.target_groups ?? [])),
    bind(payload.expected_result),
    bind(status),
    nowIso(),
    bind(username),
  ];

  if (existing) {
    run(
      `UPDATE engagement_objective
          SET objective = ?, scope_text = ?, target_groups = ?, expected_result = ?,
              status = ?, updated_at = ?, updated_by = ?
        WHERE id = ?`,
      ...values,
      existing.id,
    );
    return Number(existing.id);
  }

  run(
    `INSERT INTO engagement_objective
       (scope, fiscal_year_id, org_unit_id, objective, scope_text, target_groups, expected_result,
        status, updated_at, updated_by)
     VALUES (?,?,?,?,?,?,?,?,?,?)`,
    bind(payload.scope),
    bindInt(payload.fiscal_year_id),
    bindInt(payload.org_unit_id),
    ...values,
  );
  return Number(get<{ id: number }>("SELECT last_insert_rowid() AS id")!.id);
}
