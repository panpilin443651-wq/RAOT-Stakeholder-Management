import { bind, bindInt, nowIso, run, get, insertId } from "@/lib/db";

export type ExpectationPayload = {
  id?: number;
  fiscal_year_id: number;
  org_unit_id: number;
  stakeholder_id: number | null;
  need?: string | null;
  expectation?: string | null;
  channel?: string | null;
  response?: string | null;
  note?: string | null;
  action: "draft" | "approve";
};

export function validateExpectation(payload: ExpectationPayload): string | null {
  if (!payload.stakeholder_id) return "กรุณาเลือก ชื่อ Stakeholder";
  if (!payload.need?.trim()) return "กรุณาระบุ ความต้องการ";
  if (!payload.expectation?.trim()) return "กรุณาระบุ ความคาดหวัง";
  return null;
}

const COLUMNS = [
  "fiscal_year_id", "org_unit_id", "stakeholder_id",
  "need", "expectation", "channel", "response", "note",
  "status", "updated_at", "updated_by",
];

export async function saveExpectation(payload: ExpectationPayload, status: string, username: string): Promise<number> {
  const values = [
    bindInt(payload.fiscal_year_id), bindInt(payload.org_unit_id), bindInt(payload.stakeholder_id),
    bind(payload.need), bind(payload.expectation), bind(payload.channel),
    bind(payload.response), bind(payload.note),
    bind(status), nowIso(), bind(username),
  ];

  if (payload.id) {
    await run(
      `UPDATE expectation SET ${COLUMNS.map((c) => `${c} = ?`).join(", ")} WHERE id = ?`,
      ...values,
      payload.id,
    );
    return payload.id;
  }
  return insertId(
    `INSERT INTO expectation (${COLUMNS.join(", ")}) VALUES (${COLUMNS.map(() => "?").join(", ")})`,
    ...values,
  );
}
