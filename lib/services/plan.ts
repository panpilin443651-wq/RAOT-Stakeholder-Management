import { bind, bindInt, nowIso, run, get, insertId } from "@/lib/db";
import { calcRiskLevel, requiresRiskControl } from "@/lib/scoring";

export type PlanPayload = {
  id?: number;
  scope: "ORG" | "UNIT";
  fiscal_year_id: number;
  org_unit_id: number;
  stakeholder_id?: number | null;
  name: string;
  objective?: string | null;
  relation_level?: string | null;
  relation_method?: string | null;
  linked_plan_type?: string | null;
  linked_plan_name?: string | null;
  relation_objective?: string | null;
  goal_output?: string | null;
  goal_outcome?: string | null;
  goal_q1?: string | null;
  goal_q2?: string | null;
  goal_q3?: string | null;
  goal_q4?: string | null;
  rm_code?: string | null;
  ba_code?: string | null;
  risk_approach?: string | null;
  risk_factor?: string | null;
  impact?: number | null;
  likelihood?: number | null;
  risk_control?: string | null;
  risk_appetite?: string | null;
  risk_goal_output?: string | null;
  risk_goal_outcome?: string | null;
  res_headcount?: string | null;
  res_capability?: string | null;
  res_technology?: string | null;
  res_budget?: string | null;
  action: "draft" | "approve";
};

export function validatePlan(payload: PlanPayload): string | null {
  if (!payload.name?.trim()) return "กรุณาระบุ ชื่อแผนงาน/โครงการ";
  if (!payload.rm_code) return "กรุณาระบุ RM ประเด็นความเสี่ยงผู้มีส่วนได้ส่วนเสีย";
  if (!payload.ba_code) return "กรุณาระบุ BA ประเด็นพิจารณาความเสี่ยงด้านองค์กร";

  const level = calcRiskLevel(payload.impact ?? null, payload.likelihood ?? null);
  if (requiresRiskControl(level) && !payload.risk_control?.trim()) {
    return `ระดับความเสี่ยงอยู่ที่ "${level}" จึงต้องระบุ มาตรการควบคุมความเสี่ยง`;
  }
  return null;
}

const COLUMNS = [
  "scope", "fiscal_year_id", "org_unit_id", "stakeholder_id", "name", "objective",
  "relation_level", "relation_method", "linked_plan_type", "linked_plan_name", "relation_objective",
  "goal_output", "goal_outcome", "goal_q1", "goal_q2", "goal_q3", "goal_q4",
  "rm_code", "ba_code", "risk_approach", "risk_factor", "impact", "likelihood", "risk_level",
  "risk_control", "risk_appetite", "risk_goal_output", "risk_goal_outcome",
  "res_headcount", "res_capability", "res_technology", "res_budget",
  "status", "updated_at", "updated_by",
];

export async function savePlan(payload: PlanPayload, status: string, username: string): Promise<number> {
  const riskLevel = calcRiskLevel(payload.impact ?? null, payload.likelihood ?? null);
  const values = [
    bind(payload.scope), bindInt(payload.fiscal_year_id), bindInt(payload.org_unit_id),
    bindInt(payload.stakeholder_id), bind(payload.name), bind(payload.objective),
    bind(payload.relation_level), bind(payload.relation_method),
    bind(payload.linked_plan_type), bind(payload.linked_plan_name), bind(payload.relation_objective),
    bind(payload.goal_output), bind(payload.goal_outcome),
    bind(payload.goal_q1), bind(payload.goal_q2), bind(payload.goal_q3), bind(payload.goal_q4),
    bind(payload.rm_code), bind(payload.ba_code), bind(payload.risk_approach), bind(payload.risk_factor),
    bindInt(payload.impact), bindInt(payload.likelihood), bind(riskLevel),
    bind(payload.risk_control), bind(payload.risk_appetite),
    bind(payload.risk_goal_output), bind(payload.risk_goal_outcome),
    bind(payload.res_headcount), bind(payload.res_capability),
    bind(payload.res_technology), bind(payload.res_budget),
    bind(status), nowIso(), bind(username),
  ];

  if (payload.id) {
    await run(
      `UPDATE plan SET ${COLUMNS.map((c) => `${c} = ?`).join(", ")} WHERE id = ?`,
      ...values,
      payload.id,
    );
    return payload.id;
  }
  return insertId(
    `INSERT INTO plan (${COLUMNS.join(", ")}) VALUES (${COLUMNS.map(() => "?").join(", ")})`,
    ...values,
  );
}
