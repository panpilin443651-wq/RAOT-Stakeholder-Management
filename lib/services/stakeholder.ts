import { db, bind, bindInt, nowIso, run, get } from '@/lib/db';
import { calcIssuePriority } from '@/lib/scoring';

export type IssuePayload = {
  title?: string;
  impact_org?: number | null;
  impact_stakeholder?: number | null;
  level_code?: string | null;
  level_extra_code?: string | null;
  methods?: string | null;
  frequency?: string | null;
};

export type StakeholderPayload = {
  id?: number;
  fiscal_year_id: number;
  org_unit_id: number;
  group_l1_id?: number | null;
  group_l2_id?: number | null;
  group_l3_id?: number | null;
  name: string;
  business_model?: string | null;
  coord_name?: string | null;
  coord_phone?: string | null;
  coord_email?: string | null;
  coord_line?: string | null;
  coord_note?: string | null;
  dm_name?: string | null;
  dm_phone?: string | null;
  dm_email?: string | null;
  dm_line?: string | null;
  dm_note?: string | null;
  interest_x?: number | null;
  influence_y?: number | null;
  issues?: IssuePayload[];
  action: 'draft' | 'approve';
};

export function validate(payload: StakeholderPayload): string | null {
  if (!payload.name?.trim()) return "กรุณาระบุ ชื่อ Stakeholder";
  if (!payload.coord_name?.trim()) return "กรุณาระบุ ผู้ประสานงานของ Stakeholder";
  if (!payload.dm_name?.trim()) return "กรุณาระบุ ผู้มีอำนาจตัดสินใจของ Stakeholder";
  const issues = payload.issues ?? [];
  for (const [index, issue] of issues.entries()) {
    if (!issue.title?.trim()) return `กรุณาระบุ ประเด็นที่ ${index + 1}`;
    if (!issue.level_code) return `กรุณาระบุ ระดับ (Levels) จากประเด็นที่ ${index + 1}`;
    if (!issue.methods?.trim()) return `กรุณาระบุ รูปแบบ (Methods) ของการสร้างความสัมพันธ์ ประเด็นที่ ${index + 1}`;
    if (!issue.frequency?.trim()) return `กรุณาระบุ ความถี่ของการสร้างความสัมพันธ์ ประเด็นที่ ${index + 1}`;
  }
  return null;
}

export function saveStakeholder(
  payload: StakeholderPayload,
  status: string,
  zone: number | null,
  username: string,
): number {
  const columns = [
    "fiscal_year_id", "org_unit_id", "group_l1_id", "group_l2_id", "group_l3_id",
    "name", "business_model",
    "coord_name", "coord_phone", "coord_email", "coord_line", "coord_note",
    "dm_name", "dm_phone", "dm_email", "dm_line", "dm_note",
    "interest_x", "influence_y", "zone", "status", "updated_at", "updated_by",
  ];
  const values = [
    bindInt(payload.fiscal_year_id), bindInt(payload.org_unit_id),
    bindInt(payload.group_l1_id), bindInt(payload.group_l2_id), bindInt(payload.group_l3_id),
    bind(payload.name), bind(payload.business_model),
    bind(payload.coord_name), bind(payload.coord_phone), bind(payload.coord_email),
    bind(payload.coord_line), bind(payload.coord_note),
    bind(payload.dm_name), bind(payload.dm_phone), bind(payload.dm_email),
    bind(payload.dm_line), bind(payload.dm_note),
    bindInt(payload.interest_x), bindInt(payload.influence_y), bindInt(zone),
    bind(status), nowIso(), bind(username),
  ];

  let id = payload.id;
  db.exec("BEGIN");
  try {
    if (id) {
      run(
        `UPDATE stakeholder SET ${columns.map((c) => `${c} = ?`).join(", ")} WHERE id = ?`,
        ...values,
        id,
      );
    } else {
      run(
        `INSERT INTO stakeholder (${columns.join(", ")}) VALUES (${columns.map(() => "?").join(", ")})`,
        ...values,
      );
      id = Number(get<{ id: number }>("SELECT last_insert_rowid() AS id")!.id);
    }

    run("DELETE FROM stakeholder_issue WHERE stakeholder_id = ?", id);
    (payload.issues ?? []).forEach((issue, index) => {
      run(
        `INSERT INTO stakeholder_issue
           (stakeholder_id, seq, title, impact_org, impact_stakeholder, priority,
            level_code, level_extra_code, methods, frequency)
         VALUES (?,?,?,?,?,?,?,?,?,?)`,
        id,
        index + 1,
        bind(issue.title),
        bindInt(issue.impact_org),
        bindInt(issue.impact_stakeholder),
        bindInt(calcIssuePriority(issue.impact_org ?? null, issue.impact_stakeholder ?? null)),
        bind(issue.level_code),
        bind(issue.level_extra_code),
        bind(issue.methods),
        bind(issue.frequency),
      );
    });
    db.exec("COMMIT");
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }
  return id!;
}
