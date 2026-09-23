import "server-only";
import { all } from "@/lib/db";
import { findMenuItem } from "@/lib/masters";
import { fiscalMonths } from "@/lib/fiscal";

export type ReportColumn = { key: string; label: string; width?: string; align?: "center" | "right" };
export type ReportRow = Record<string, string | number | null>;
export type ReportData = { code: string; title: string; columns: ReportColumn[]; rows: ReportRow[] };

export const REPORT_CODES = ["804", "805", "806", "807", "808", "809", "810"] as const;
export type ReportCode = (typeof REPORT_CODES)[number];

export function isReportCode(code: string): code is ReportCode {
  return (REPORT_CODES as readonly string[]).includes(code);
}

type Filters = { fiscalYearId?: number; orgUnitId?: number; status?: string };

function scopeConditions(alias: string, filters: Filters, params: unknown[]): string {
  const where: string[] = [];
  if (filters.fiscalYearId) {
    where.push(`${alias}.fiscal_year_id = ?`);
    params.push(filters.fiscalYearId);
  }
  if (filters.orgUnitId) {
    where.push(`${alias}.org_unit_id = ?`);
    params.push(filters.orgUnitId);
  }
  if (filters.status) {
    where.push(`${alias}.status = ?`);
    params.push(filters.status);
  }
  return where.length ? `AND ${where.join(" AND ")}` : "";
}

export function buildReport(code: ReportCode, filters: Filters): ReportData {
  const title = findMenuItem(code)?.label ?? `รายงาน [${code}]`;
  const params: unknown[] = [];

  switch (code) {
    /* -------- [804] ข้อมูลผู้มีส่วนได้ส่วนเสีย ทั้งหมด -------- */
    case "804": {
      const clause = scopeConditions("s", filters, params);
      const rows = all<ReportRow>(
        `SELECT s.name AS stakeholder, g1.name AS group_name, g2.name AS subgroup,
                o.name AS org_unit, s.interest_x, s.influence_y, s.zone,
                s.coord_name, s.dm_name,
                (SELECT COUNT(*) FROM stakeholder_issue i WHERE i.stakeholder_id = s.id) AS issues,
                s.status
           FROM stakeholder s
           JOIN org_unit o ON o.id = s.org_unit_id
           LEFT JOIN stakeholder_group g1 ON g1.id = s.group_l1_id
           LEFT JOIN stakeholder_group g2 ON g2.id = s.group_l2_id
          WHERE 1 = 1 ${clause}
          ORDER BY s.zone IS NULL, s.zone, s.name`,
        ...params,
      );
      return {
        code, title, rows,
        columns: [
          { key: "stakeholder", label: "ชื่อ Stakeholder" },
          { key: "group_name", label: "กลุ่มหลัก", width: "170px" },
          { key: "subgroup", label: "กลุ่มย่อย", width: "170px" },
          { key: "org_unit", label: "ส่วนงาน", width: "180px" },
          { key: "interest_x", label: "แกน X", width: "64px", align: "center" },
          { key: "influence_y", label: "แกน Y", width: "64px", align: "center" },
          { key: "zone", label: "Zone", width: "64px", align: "center" },
          { key: "coord_name", label: "ผู้ประสานงาน", width: "150px" },
          { key: "dm_name", label: "ผู้มีอำนาจตัดสินใจ", width: "150px" },
          { key: "issues", label: "ประเด็น", width: "70px", align: "center" },
          { key: "status", label: "สถานะ", width: "90px", align: "center" },
        ],
      };
    }

    /* -------- [805] วัตถุประสงค์ ขอบเขต ระดับส่วนงาน -------- */
    case "805": {
      const clause = scopeConditions("e", filters, params);
      const rows = all<ReportRow>(
        `SELECT o.name AS org_unit, f.year AS fiscal_year, e.objective, e.scope_text,
                e.expected_result, e.status
           FROM engagement_objective e
           JOIN org_unit o ON o.id = e.org_unit_id
           JOIN fiscal_year f ON f.id = e.fiscal_year_id
          WHERE e.scope = 'UNIT' ${clause}
          ORDER BY o.id`,
        ...params,
      );
      return {
        code, title, rows,
        columns: [
          { key: "org_unit", label: "ส่วนงาน", width: "190px" },
          { key: "fiscal_year", label: "ปีงบประมาณ", width: "80px", align: "center" },
          { key: "objective", label: "วัตถุประสงค์" },
          { key: "scope_text", label: "ขอบเขต" },
          { key: "expected_result", label: "ผลลัพธ์ที่คาดหวัง" },
          { key: "status", label: "สถานะ", width: "90px", align: "center" },
        ],
      };
    }

    /* -------- [806]/[808] แผนสร้างความสัมพันธ์ -------- */
    case "806":
    case "808": {
      const scope = code === "806" ? "ORG" : "UNIT";
      const clause = scopeConditions("p", filters, params);
      const rows = all<ReportRow>(
        `SELECT p.name AS plan_name, o.name AS org_unit, s.name AS stakeholder,
                p.relation_level, p.relation_method,
                p.goal_output, p.goal_outcome,
                p.goal_q1, p.goal_q2, p.goal_q3, p.goal_q4,
                p.risk_level, p.res_budget, p.status
           FROM plan p
           JOIN org_unit o ON o.id = p.org_unit_id
           LEFT JOIN stakeholder s ON s.id = p.stakeholder_id
          WHERE p.scope = '${scope}' ${clause}
          ORDER BY p.id`,
        ...params,
      );
      return {
        code, title, rows,
        columns: [
          { key: "plan_name", label: "แผนงาน/โครงการ" },
          { key: "org_unit", label: "ส่วนงาน", width: "170px" },
          { key: "stakeholder", label: "ผู้มีส่วนได้ส่วนเสีย", width: "170px" },
          { key: "relation_level", label: "ระดับความสัมพันธ์", width: "170px" },
          { key: "goal_output", label: "เป้าหมาย Output" },
          { key: "goal_outcome", label: "เป้าหมาย Outcome" },
          { key: "goal_q1", label: "ไตรมาส 1" },
          { key: "goal_q2", label: "ไตรมาส 2" },
          { key: "goal_q3", label: "ไตรมาส 3" },
          { key: "goal_q4", label: "ไตรมาส 4" },
          { key: "risk_level", label: "ระดับความเสี่ยง", width: "120px", align: "center" },
          { key: "res_budget", label: "งบประมาณ", width: "120px" },
          { key: "status", label: "สถานะ", width: "90px", align: "center" },
        ],
      };
    }

    /* -------- [807]/[809] ผลการดำเนินงานตามแผน -------- */
    case "807":
    case "809": {
      const scope = code === "807" ? "ORG" : "UNIT";
      const clause = scopeConditions("p", filters, params);
      const rows = all<ReportRow>(
        `SELECT p.name AS plan_name, o.name AS org_unit, r.quarter,
                r.month1, r.month2, r.month3, r.forecast,
                r.cumulative_percent, r.problem, r.solution,
                CASE r.is_on_target WHEN 1 THEN 'เป็นไปตามเป้าหมาย'
                                    WHEN 0 THEN 'ไม่เป็นไปตามเป้าหมาย' ELSE '-' END AS on_target,
                r.status
           FROM plan_quarter_result r
           JOIN plan p ON p.id = r.plan_id
           JOIN org_unit o ON o.id = p.org_unit_id
          WHERE p.scope = '${scope}' ${clause}
          ORDER BY p.id, r.quarter`,
        ...params,
      );
      const withMonths = rows.map((row) => {
        const months = fiscalMonths(Number(row.quarter) as 1 | 2 | 3 | 4);
        return { ...row, months: months.join(" / ") };
      });
      return {
        code, title, rows: withMonths,
        columns: [
          { key: "plan_name", label: "แผนงาน/โครงการ" },
          { key: "org_unit", label: "ส่วนงาน", width: "170px" },
          { key: "quarter", label: "ไตรมาส", width: "70px", align: "center" },
          { key: "months", label: "เดือน", width: "170px" },
          { key: "month1", label: "ผลเดือนที่ 1" },
          { key: "month2", label: "ผลเดือนที่ 2" },
          { key: "month3", label: "ผลเดือนที่ 3" },
          { key: "cumulative_percent", label: "สะสม (%)", width: "90px", align: "center" },
          { key: "problem", label: "ปัญหา/อุปสรรค" },
          { key: "solution", label: "แนวทางแก้ไข" },
          { key: "on_target", label: "ความสำเร็จ", width: "150px" },
          { key: "status", label: "สถานะ", width: "90px", align: "center" },
        ],
      };
    }

    /* -------- [810] ความต้องการความคาดหวัง -------- */
    case "810": {
      const clause = scopeConditions("e", filters, params);
      const rows = all<ReportRow>(
        `SELECT s.name AS stakeholder, g.name AS group_name, o.name AS org_unit,
                e.need, e.expectation, e.channel, e.response, e.status
           FROM expectation e
           JOIN stakeholder s ON s.id = e.stakeholder_id
           JOIN org_unit o ON o.id = e.org_unit_id
           LEFT JOIN stakeholder_group g ON g.id = s.group_l1_id
          WHERE 1 = 1 ${clause}
          ORDER BY e.id`,
        ...params,
      );
      return {
        code, title, rows,
        columns: [
          { key: "stakeholder", label: "ชื่อ Stakeholder", width: "200px" },
          { key: "group_name", label: "กลุ่ม", width: "170px" },
          { key: "org_unit", label: "ส่วนงาน", width: "180px" },
          { key: "need", label: "ความต้องการ" },
          { key: "expectation", label: "ความคาดหวัง" },
          { key: "channel", label: "ช่องทางที่ได้รับข้อมูล", width: "180px" },
          { key: "response", label: "การตอบสนองของ กยท." },
          { key: "status", label: "สถานะ", width: "90px", align: "center" },
        ],
      };
    }
  }
}

/** CSV พร้อม BOM เพื่อให้ Excel อ่านภาษาไทยได้ถูกต้อง */
export function toCsv(report: ReportData): string {
  const escape = (value: string | number | null) => {
    const text = value === null || value === undefined ? "" : String(value);
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  const lines = [
    report.columns.map((c) => escape(c.label)).join(","),
    ...report.rows.map((row) => report.columns.map((c) => escape(row[c.key] ?? "")).join(",")),
  ];
  return "﻿" + lines.join("\r\n");
}
