import { bind, bindInt, bindFloat, nowIso, run, get } from "@/lib/db";

export type QuarterResultPayload = {
  plan_id: number;
  quarter: number;
  month1?: string | null;
  month2?: string | null;
  month3?: string | null;
  forecast?: string | null;
  problem?: string | null;
  solution?: string | null;
  cumulative_percent?: number | null;
  is_on_target?: number | null;
  remediation?: string | null;
  year_output?: string | null;
  year_outcome?: string | null;
  risk_result?: string | null;
  risk_output?: string | null;
  risk_outcome?: string | null;
  emergency_output?: string | null;
  emergency_outcome?: string | null;
  res_headcount_ok?: number | null;
  res_headcount_note?: string | null;
  res_capability_ok?: number | null;
  res_capability_note?: string | null;
  res_technology_ok?: number | null;
  res_technology_note?: string | null;
  res_budget_ok?: number | null;
  res_budget_note?: string | null;
  action: "draft" | "approve";
};

export function validateQuarterResult(payload: QuarterResultPayload): string | null {
  if (!Number.isInteger(payload.plan_id)) return "กรุณาระบุแผนงาน/โครงการที่ต้องการบันทึกผล";
  if (!payload.problem?.trim()) return "กรุณาระบุ ปัญหา/อุปสรรค";
  if (!payload.solution?.trim()) return "กรุณาระบุ แนวทางการแก้ไขปัญหา";
  if (payload.is_on_target === null || payload.is_on_target === undefined) {
    return "กรุณาระบุ ความสำเร็จของแผนงาน/โครงการ";
  }
  if (payload.is_on_target === 0 && !payload.remediation?.trim()) {
    return "กรณีไม่เป็นไปตามเป้าหมาย กรุณาระบุ แนวทางการแก้ไข";
  }
  if (
    payload.cumulative_percent !== null &&
    payload.cumulative_percent !== undefined &&
    (payload.cumulative_percent < 0 || payload.cumulative_percent > 100)
  ) {
    return "ผลการดำเนินงานสะสม (ร้อยละ) ต้องอยู่ระหว่าง 0 ถึง 100";
  }
  return null;
}

const COLUMNS = [
  "month1", "month2", "month3", "forecast", "problem", "solution", "cumulative_percent",
  "is_on_target", "remediation",
  "year_output", "year_outcome", "risk_result", "risk_output", "risk_outcome",
  "emergency_output", "emergency_outcome",
  "res_headcount_ok", "res_headcount_note", "res_capability_ok", "res_capability_note",
  "res_technology_ok", "res_technology_note", "res_budget_ok", "res_budget_note",
  "status", "updated_at", "updated_by",
];

export function saveQuarterResult(
  payload: QuarterResultPayload,
  status: string,
  username: string,
): number {
  const values = [
    bind(payload.month1), bind(payload.month2), bind(payload.month3),
    bind(payload.forecast), bind(payload.problem), bind(payload.solution),
    bindFloat(payload.cumulative_percent),
    bindInt(payload.is_on_target), bind(payload.remediation),
    bind(payload.year_output), bind(payload.year_outcome),
    bind(payload.risk_result), bind(payload.risk_output), bind(payload.risk_outcome),
    bind(payload.emergency_output), bind(payload.emergency_outcome),
    bindInt(payload.res_headcount_ok), bind(payload.res_headcount_note),
    bindInt(payload.res_capability_ok), bind(payload.res_capability_note),
    bindInt(payload.res_technology_ok), bind(payload.res_technology_note),
    bindInt(payload.res_budget_ok), bind(payload.res_budget_note),
    bind(status), nowIso(), bind(username),
  ];

  const existing = get<{ id: number }>(
    "SELECT id FROM plan_quarter_result WHERE plan_id = ? AND quarter = ?",
    payload.plan_id,
    payload.quarter,
  );

  if (existing) {
    run(
      `UPDATE plan_quarter_result SET ${COLUMNS.map((c) => `${c} = ?`).join(", ")} WHERE id = ?`,
      ...values,
      existing.id,
    );
    return Number(existing.id);
  }

  run(
    `INSERT INTO plan_quarter_result (plan_id, quarter, ${COLUMNS.join(", ")})
     VALUES (?, ?, ${COLUMNS.map(() => "?").join(", ")})`,
    payload.plan_id,
    payload.quarter,
    ...values,
  );
  return Number(get<{ id: number }>("SELECT last_insert_rowid() AS id")!.id);
}
