import "server-only";
import { all, get } from "@/lib/db";

export type OrgUnit = { id: number; code: string; name: string; parent_id: number | null };
export type FiscalYear = { id: number; year: number; start_month: number; is_current: number };
export type Group = { id: number; level: number; parent_id: number | null; code: string; name: string };
export type RefItem = { code: string; name: string };

export type Stakeholder = {
  id: number;
  fiscal_year_id: number;
  org_unit_id: number;
  group_l1_id: number | null;
  group_l2_id: number | null;
  group_l3_id: number | null;
  name: string;
  business_model: string | null;
  coord_name: string | null;
  coord_phone: string | null;
  coord_email: string | null;
  coord_line: string | null;
  coord_note: string | null;
  dm_name: string | null;
  dm_phone: string | null;
  dm_email: string | null;
  dm_line: string | null;
  dm_note: string | null;
  interest_x: number | null;
  influence_y: number | null;
  zone: number | null;
  status: string;
  updated_at: string;
  updated_by: string | null;
};

export type Issue = {
  id: number;
  stakeholder_id: number;
  seq: number;
  title: string | null;
  impact_org: number | null;
  impact_stakeholder: number | null;
  priority: number | null;
  level_code: string | null;
  level_extra_code: string | null;
  methods: string | null;
  frequency: string | null;
};

export type Plan = {
  id: number;
  scope: "ORG" | "UNIT";
  fiscal_year_id: number;
  org_unit_id: number;
  stakeholder_id: number | null;
  name: string;
  objective: string | null;
  relation_level: string | null;
  relation_method: string | null;
  linked_plan_type: string | null;
  linked_plan_name: string | null;
  relation_objective: string | null;
  goal_output: string | null;
  goal_outcome: string | null;
  goal_q1: string | null;
  goal_q2: string | null;
  goal_q3: string | null;
  goal_q4: string | null;
  rm_code: string | null;
  ba_code: string | null;
  risk_approach: string | null;
  risk_factor: string | null;
  impact: number | null;
  likelihood: number | null;
  risk_level: string | null;
  risk_control: string | null;
  risk_appetite: string | null;
  risk_goal_output: string | null;
  risk_goal_outcome: string | null;
  res_headcount: string | null;
  res_capability: string | null;
  res_technology: string | null;
  res_budget: string | null;
  status: string;
  updated_at: string;
  updated_by: string | null;
};

export type QuarterResult = {
  id: number;
  plan_id: number;
  quarter: number;
  month1: string | null;
  month2: string | null;
  month3: string | null;
  forecast: string | null;
  problem: string | null;
  solution: string | null;
  cumulative_percent: number | null;
  is_on_target: number | null;
  remediation: string | null;
  year_output: string | null;
  year_outcome: string | null;
  risk_result: string | null;
  risk_output: string | null;
  risk_outcome: string | null;
  emergency_output: string | null;
  emergency_outcome: string | null;
  res_headcount_ok: number | null;
  res_headcount_note: string | null;
  res_capability_ok: number | null;
  res_capability_note: string | null;
  res_technology_ok: number | null;
  res_technology_note: string | null;
  res_budget_ok: number | null;
  res_budget_note: string | null;
  status: string;
  updated_at: string;
  updated_by: string | null;
};

export type EngagementObjective = {
  id: number;
  scope: "ORG" | "UNIT";
  fiscal_year_id: number;
  org_unit_id: number;
  objective: string | null;
  scope_text: string | null;
  target_groups: string | null;
  expected_result: string | null;
  status: string;
  updated_at: string;
  updated_by: string | null;
};

export type Expectation = {
  id: number;
  fiscal_year_id: number;
  org_unit_id: number;
  stakeholder_id: number;
  need: string | null;
  expectation: string | null;
  channel: string | null;
  response: string | null;
  note: string | null;
  status: string;
  updated_at: string;
  updated_by: string | null;
};

/* ---------------- master ---------------- */
export const listOrgUnits = () =>
  all<OrgUnit>("SELECT id, code, name, parent_id FROM org_unit ORDER BY id");

export const listFiscalYears = () =>
  all<FiscalYear>("SELECT id, year, start_month, is_current FROM fiscal_year ORDER BY year DESC");

export function currentFiscalYearRow(): FiscalYear {
  return (
    get<FiscalYear>("SELECT id, year, start_month, is_current FROM fiscal_year WHERE is_current = 1") ??
    all<FiscalYear>("SELECT id, year, start_month, is_current FROM fiscal_year ORDER BY year DESC")[0]
  );
}

export const listGroups = (level: number, parentId?: number | null) =>
  parentId === undefined
    ? all<Group>(
        "SELECT id, level, parent_id, code, name FROM stakeholder_group WHERE level = ? ORDER BY sort_order, code",
        level,
      )
    : all<Group>(
        "SELECT id, level, parent_id, code, name FROM stakeholder_group WHERE level = ? AND parent_id IS ? ORDER BY sort_order, code",
        level,
        parentId,
      );

export const listAllGroups = () =>
  all<Group>("SELECT id, level, parent_id, code, name FROM stakeholder_group ORDER BY level, sort_order, code");

export const listRiskRm = () =>
  all<RefItem>("SELECT code, name FROM ref_risk_rm ORDER BY sort_order, code");
export const listRiskBa = () =>
  all<RefItem>("SELECT code, name FROM ref_risk_ba ORDER BY sort_order, code");
export const listLevels = () =>
  all<RefItem>("SELECT code, name FROM ref_engagement_level ORDER BY sort_order, code");

/* ---------------- stakeholder ---------------- */
export type StakeholderRow = Stakeholder & {
  org_unit_name: string;
  group_name: string | null;
  issue_count: number;
};

export function listStakeholders(filters: {
  fiscalYearId?: number;
  orgUnitId?: number;
  groupL1Id?: number;
  q?: string;
} = {}): StakeholderRow[] {
  const where: string[] = [];
  const params: unknown[] = [];
  if (filters.fiscalYearId) {
    where.push("s.fiscal_year_id = ?");
    params.push(filters.fiscalYearId);
  }
  if (filters.orgUnitId) {
    where.push("s.org_unit_id = ?");
    params.push(filters.orgUnitId);
  }
  if (filters.groupL1Id) {
    where.push("s.group_l1_id = ?");
    params.push(filters.groupL1Id);
  }
  if (filters.q) {
    where.push("s.name LIKE ?");
    params.push(`%${filters.q}%`);
  }
  return all<StakeholderRow>(
    `SELECT s.*, o.name AS org_unit_name,
            g.name AS group_name,
            (SELECT COUNT(*) FROM stakeholder_issue i WHERE i.stakeholder_id = s.id) AS issue_count
       FROM stakeholder s
       JOIN org_unit o ON o.id = s.org_unit_id
       LEFT JOIN stakeholder_group g ON g.id = s.group_l1_id
      ${where.length ? "WHERE " + where.join(" AND ") : ""}
      ORDER BY s.zone IS NULL, s.zone, s.name`,
    ...params,
  );
}

export const getStakeholder = (id: number) =>
  get<Stakeholder>("SELECT * FROM stakeholder WHERE id = ?", id);

export const listIssues = (stakeholderId: number) =>
  all<Issue>("SELECT * FROM stakeholder_issue WHERE stakeholder_id = ? ORDER BY seq", stakeholderId);

/* ---------------- plan ---------------- */
export type PlanRow = Plan & { org_unit_name: string; stakeholder_name: string | null };

export function listPlans(scope: "ORG" | "UNIT", filters: { fiscalYearId?: number; orgUnitId?: number } = {}): PlanRow[] {
  const where = ["p.scope = ?"];
  const params: unknown[] = [scope];
  if (filters.fiscalYearId) {
    where.push("p.fiscal_year_id = ?");
    params.push(filters.fiscalYearId);
  }
  if (filters.orgUnitId) {
    where.push("p.org_unit_id = ?");
    params.push(filters.orgUnitId);
  }
  return all<PlanRow>(
    `SELECT p.*, o.name AS org_unit_name, s.name AS stakeholder_name
       FROM plan p
       JOIN org_unit o ON o.id = p.org_unit_id
       LEFT JOIN stakeholder s ON s.id = p.stakeholder_id
      WHERE ${where.join(" AND ")}
      ORDER BY p.id DESC`,
    ...params,
  );
}

export const getPlan = (id: number) => get<PlanRow>(
  `SELECT p.*, o.name AS org_unit_name, s.name AS stakeholder_name
     FROM plan p
     JOIN org_unit o ON o.id = p.org_unit_id
     LEFT JOIN stakeholder s ON s.id = p.stakeholder_id
    WHERE p.id = ?`,
  id,
);

export const getQuarterResult = (planId: number, quarter: number) =>
  get<QuarterResult>("SELECT * FROM plan_quarter_result WHERE plan_id = ? AND quarter = ?", planId, quarter);

export const listQuarterResults = (planId: number) =>
  all<QuarterResult>("SELECT * FROM plan_quarter_result WHERE plan_id = ? ORDER BY quarter", planId);

/** ผลสะสมของไตรมาสก่อนหน้า ใช้แสดงในช่อง "ผลการดำเนินงาน ไตรมาสที่ N" (อ่านอย่างเดียว) */
export function previousQuartersSummary(planId: number, quarter: number): string {
  if (quarter <= 1) return "";
  const rows = all<QuarterResult>(
    "SELECT * FROM plan_quarter_result WHERE plan_id = ? AND quarter < ? ORDER BY quarter",
    planId,
    quarter,
  );
  return rows
    .map((r) => {
      const parts = [r.month1, r.month2, r.month3].filter(Boolean).join(" / ");
      return `ไตรมาส ${r.quarter}: ${parts || "-"}${
        r.cumulative_percent != null ? ` (สะสม ${r.cumulative_percent}%)` : ""
      }`;
    })
    .join("\n");
}

/* ---------------- objective ---------------- */
export const getObjective = (scope: "ORG" | "UNIT", fiscalYearId: number, orgUnitId: number) =>
  get<EngagementObjective>(
    "SELECT * FROM engagement_objective WHERE scope = ? AND fiscal_year_id = ? AND org_unit_id = ?",
    scope,
    fiscalYearId,
    orgUnitId,
  );

export const listObjectives = (scope: "ORG" | "UNIT", fiscalYearId?: number) =>
  all<EngagementObjective & { org_unit_name: string }>(
    `SELECT e.*, o.name AS org_unit_name
       FROM engagement_objective e JOIN org_unit o ON o.id = e.org_unit_id
      WHERE e.scope = ?${fiscalYearId ? " AND e.fiscal_year_id = ?" : ""}
      ORDER BY o.id`,
    ...(fiscalYearId ? [scope, fiscalYearId] : [scope]),
  );

/* ---------------- expectation ---------------- */
export const listExpectations = (filters: { fiscalYearId?: number; orgUnitId?: number } = {}) => {
  const where: string[] = [];
  const params: unknown[] = [];
  if (filters.fiscalYearId) {
    where.push("e.fiscal_year_id = ?");
    params.push(filters.fiscalYearId);
  }
  if (filters.orgUnitId) {
    where.push("e.org_unit_id = ?");
    params.push(filters.orgUnitId);
  }
  return all<Expectation & { stakeholder_name: string; org_unit_name: string; group_name: string | null }>(
    `SELECT e.*, s.name AS stakeholder_name, o.name AS org_unit_name, g.name AS group_name
       FROM expectation e
       JOIN stakeholder s ON s.id = e.stakeholder_id
       JOIN org_unit o ON o.id = e.org_unit_id
       LEFT JOIN stakeholder_group g ON g.id = s.group_l1_id
      ${where.length ? "WHERE " + where.join(" AND ") : ""}
      ORDER BY e.id DESC`,
    ...params,
  );
};

export const getExpectation = (id: number) =>
  get<Expectation>("SELECT * FROM expectation WHERE id = ?", id);

/* ---------------- องค์ความรู้ ---------------- */
export type KmArticle = {
  id: number;
  title: string;
  summary: string | null;
  category: string | null;
  body: string;
  created_at: string;
  created_by: string | null;
  updated_at: string;
  updated_by: string | null;
};

/** หัวเรื่ององค์ความรู้ (ไม่ดึงเนื้อหาเต็ม) เรียงตามวันที่บันทึกข้อมูลล่าสุดก่อน */
export type KmSummary = Omit<KmArticle, "body">;

export function listKmArticles(filters: { q?: string; category?: string } = {}): KmSummary[] {
  const where: string[] = [];
  const params: unknown[] = [];

  if (filters.q?.trim()) {
    // ค้นจากชื่อเรื่อง คำโปรย หมวดหมู่ และเนื้อหา
    where.push("(title LIKE ? OR summary LIKE ? OR category LIKE ? OR body LIKE ?)");
    const like = `%${filters.q.trim()}%`;
    params.push(like, like, like, like);
  }
  if (filters.category?.trim()) {
    where.push("category = ?");
    params.push(filters.category.trim());
  }

  return all<KmSummary>(
    `SELECT id, title, summary, category, created_at, created_by, updated_at, updated_by
       FROM km_article
       ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
      ORDER BY created_at DESC, id DESC`,
    ...params,
  );
}

export const listKmCategories = () =>
  all<{ category: string }>(
    "SELECT DISTINCT category FROM km_article WHERE category IS NOT NULL AND category <> '' ORDER BY category",
  ).map((r) => r.category);

export const getKmArticle = (id: number) =>
  get<KmArticle>("SELECT * FROM km_article WHERE id = ?", id);

/** ประเด็นความต้องการของผู้มีส่วนได้ส่วนเสียหลายรายพร้อมกัน (ใช้ในหน้าทะเบียนและรายงาน) */
export function issuesByStakeholder(stakeholderIds: number[]): Map<number, Issue[]> {
  const grouped = new Map<number, Issue[]>();
  if (stakeholderIds.length === 0) return grouped;

  const placeholders = stakeholderIds.map(() => "?").join(",");
  const rows = all<Issue>(
    `SELECT * FROM stakeholder_issue WHERE stakeholder_id IN (${placeholders}) ORDER BY stakeholder_id, seq`,
    ...stakeholderIds,
  );
  for (const row of rows) {
    const list = grouped.get(row.stakeholder_id) ?? [];
    list.push(row);
    grouped.set(row.stakeholder_id, list);
  }
  return grouped;
}
