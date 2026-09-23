import "server-only";
import { all, get } from "@/lib/db";
import { issueBand, zoneBand, BAND_STYLE, BANDS, type Band } from "@/lib/scoring";

export type SubGroup = {
  id: number;
  code: string;
  name: string;
  definition: string | null;
  stakeholders: number;
};

export type GroupStat = {
  id: number;
  code: string;
  name: string;
  icon: string | null;
  definition: string | null;
  stakeholders: number;
  issues: number;
  subgroups: SubGroup[];
};

/**
 * สถิติรายกลุ่มหลัก พร้อมกลุ่มย่อยและนิยาม ใช้ทั้งการ์ดนิยามและกราฟหน้าแรก
 * ส่ง orgUnitId มาเมื่อผู้ใช้เห็นได้เฉพาะส่วนงานตัวเอง
 */
export function groupStats(fiscalYearId: number, orgUnitId?: number): GroupStat[] {
  // เงื่อนไขนี้ต่อท้าย subquery ของทะเบียน จึงต้องส่งพารามิเตอร์คู่กันทุกครั้ง
  const unitFilter = orgUnitId ? " AND %s.org_unit_id = ?" : "";
  const unitParam = orgUnitId ? [orgUnitId] : [];

  const mains = all<Omit<GroupStat, "subgroups">>(
    `SELECT g.id, g.code, g.name, g.icon, g.definition,
            (SELECT COUNT(*) FROM stakeholder s
              WHERE s.group_l1_id = g.id AND s.fiscal_year_id = ?${unitFilter.replace("%s", "s")}) AS stakeholders,
            (SELECT COUNT(*) FROM stakeholder_issue i
               JOIN stakeholder s2 ON s2.id = i.stakeholder_id
              WHERE s2.group_l1_id = g.id AND s2.fiscal_year_id = ?${unitFilter.replace("%s", "s2")}) AS issues
       FROM stakeholder_group g
      WHERE g.level = 1
      ORDER BY g.sort_order, g.code`,
    fiscalYearId, ...unitParam, fiscalYearId, ...unitParam,
  );

  const subs = all<SubGroup & { parent_id: number }>(
    `SELECT g.id, g.parent_id, g.code, g.name, g.definition,
            (SELECT COUNT(*) FROM stakeholder s
              WHERE s.group_l2_id = g.id AND s.fiscal_year_id = ?${unitFilter.replace("%s", "s")}) AS stakeholders
       FROM stakeholder_group g
      WHERE g.level = 2
      ORDER BY g.sort_order, g.code`,
    fiscalYearId, ...unitParam,
  );

  return mains.map((m) => ({
    ...m,
    subgroups: subs.filter((sub) => sub.parent_id === m.id),
  }));
}

/** จำนวนผู้มีส่วนได้ส่วนเสียแยกตาม Zone (สีเดียวกับแผนผังลำดับความสำคัญ) */
export function zoneDistribution(fiscalYearId: number, orgUnitId?: number) {
  const rows = all<{ zone: number | null; n: number }>(
    `SELECT zone, COUNT(*) AS n FROM stakeholder
      WHERE fiscal_year_id = ?${orgUnitId ? " AND org_unit_id = ?" : ""}
      GROUP BY zone`,
    fiscalYearId, ...(orgUnitId ? [orgUnitId] : []),
  );
  const byZone = new Map(rows.map((r) => [r.zone, Number(r.n)]));
  return [1, 2, 3, 4].map((z) => {
    const band = zoneBand(z) as Band;
    return {
      label: `Zone ${z} · ${BAND_STYLE[band].label}`,
      value: byZone.get(z) ?? 0,
      color: BAND_STYLE[band].chart,
    };
  });
}

/** จำนวนประเด็นแยกตามระดับความสำคัญตามแผนผัง 4x4 */
export function issueDistribution(fiscalYearId: number, orgUnitId?: number) {
  const rows = all<{ impact_org: number | null; impact_stakeholder: number | null }>(
    `SELECT i.impact_org, i.impact_stakeholder
       FROM stakeholder_issue i
       JOIN stakeholder s ON s.id = i.stakeholder_id
      WHERE s.fiscal_year_id = ?${orgUnitId ? " AND s.org_unit_id = ?" : ""}`,
    fiscalYearId, ...(orgUnitId ? [orgUnitId] : []),
  );
  const counts: Record<Band, number> = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
  let unscored = 0;
  for (const r of rows) {
    const band = issueBand(r.impact_org, r.impact_stakeholder);
    if (band) counts[band]++;
    else unscored++;
  }
  return {
    segments: BANDS.map((b) => ({
      label: BAND_STYLE[b].label,
      value: counts[b],
      color: BAND_STYLE[b].chart,
    })),
    total: rows.length,
    unscored,
  };
}

/** ความคืบหน้าแผนงานและการบันทึกผลรายไตรมาส */
export function planProgress(fiscalYearId: number, orgUnitId?: number) {
  const n = (sql: string, ...p: unknown[]) => Number(get<{ n: number }>(sql, ...p)?.n ?? 0);
  const unit = orgUnitId ? " AND %s.org_unit_id = ?" : "";
  const unitParam = orgUnitId ? [orgUnitId] : [];

  const plans = n(
    `SELECT COUNT(*) AS n FROM plan WHERE fiscal_year_id = ?${unit.replace("%s.", "")}`,
    fiscalYearId, ...unitParam,
  );
  const approvedPlans = n(
    `SELECT COUNT(*) AS n FROM plan WHERE fiscal_year_id = ? AND status = 'APPROVED'${unit.replace("%s.", "")}`,
    fiscalYearId, ...unitParam,
  );
  const results = n(
    `SELECT COUNT(*) AS n FROM plan_quarter_result r JOIN plan p ON p.id = r.plan_id
      WHERE p.fiscal_year_id = ?${unit.replace("%s", "p")}`,
    fiscalYearId, ...unitParam,
  );
  const onTarget = n(
    `SELECT COUNT(*) AS n FROM plan_quarter_result r JOIN plan p ON p.id = r.plan_id
      WHERE p.fiscal_year_id = ? AND r.is_on_target = 1${unit.replace("%s", "p")}`,
    fiscalYearId, ...unitParam,
  );
  return {
    plans,
    approvedPlans,
    results,
    expectedResults: plans * 4,
    onTarget,
    onTargetRate: results ? Math.round((onTarget / results) * 100) : null,
  };
}

/** งานที่ส่วนงานยังต้องทำในปีงบประมาณนี้ */
export function todoForUnit(fiscalYearId: number, orgUnitId: number) {
  const todo: { label: string; href: string; count: number }[] = [];
  const n = (sql: string, ...p: unknown[]) => Number(get<{ n: number }>(sql, ...p)?.n ?? 0);

  const noZone = n(
    "SELECT COUNT(*) AS n FROM stakeholder WHERE fiscal_year_id = ? AND org_unit_id = ? AND zone IS NULL",
    fiscalYearId, orgUnitId,
  );
  if (noZone) todo.push({ label: "ผู้มีส่วนได้ส่วนเสียที่ยังไม่ได้จัด Zone", href: "/profile", count: noZone });

  const noIssue = n(
    `SELECT COUNT(*) AS n FROM stakeholder s
      WHERE s.fiscal_year_id = ? AND s.org_unit_id = ?
        AND NOT EXISTS (SELECT 1 FROM stakeholder_issue i WHERE i.stakeholder_id = s.id AND i.title IS NOT NULL)`,
    fiscalYearId, orgUnitId,
  );
  if (noIssue) todo.push({ label: "ผู้มีส่วนได้ส่วนเสียที่ยังไม่ระบุประเด็นความต้องการ", href: "/profile", count: noIssue });

  const draftPlans = n(
    "SELECT COUNT(*) AS n FROM plan WHERE fiscal_year_id = ? AND org_unit_id = ? AND status = 'DRAFT'",
    fiscalYearId, orgUnitId,
  );
  if (draftPlans) todo.push({ label: "แผนงาน/โครงการที่ยังเป็นฉบับร่าง", href: "/cluster/plans", count: draftPlans });

  const missingResults = n(
    `SELECT COUNT(*) AS n FROM plan p
      WHERE p.fiscal_year_id = ? AND p.org_unit_id = ?
        AND (SELECT COUNT(*) FROM plan_quarter_result r WHERE r.plan_id = p.id) < 4`,
    fiscalYearId, orgUnitId,
  );
  if (missingResults) todo.push({ label: "แผนงานที่ยังบันทึกผลไม่ครบ 4 ไตรมาส", href: "/cluster/results/1", count: missingResults });

  const noExpectation = n(
    `SELECT COUNT(*) AS n FROM stakeholder s
      WHERE s.fiscal_year_id = ? AND s.org_unit_id = ?
        AND NOT EXISTS (SELECT 1 FROM expectation e WHERE e.stakeholder_id = s.id)`,
    fiscalYearId, orgUnitId,
  );
  if (noExpectation) todo.push({ label: "ผู้มีส่วนได้ส่วนเสียที่ยังไม่บันทึกความคาดหวัง", href: "/expectations", count: noExpectation });

  return todo;
}
