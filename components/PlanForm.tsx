"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import FormCard, { FormSection } from "./FormCard";
import FormRow from "./FormRow";
import RadioScale, { SCALE_5 } from "./RadioScale";
import StatusBar from "./StatusBar";
import OutputOutcome from "./OutputOutcome";
import { calcRiskLevel, requiresRiskControl, RISK_LEVEL_COLOR, type RiskLevel } from "@/lib/scoring";
import { PLAN_LINK_TYPES, RISK_APPETITES, ENGAGEMENT_LEVELS } from "@/lib/masters";
import type { FiscalYear, OrgUnit, PlanRow, RefItem, StakeholderRow } from "@/lib/queries";

export default function PlanForm({
  scope,
  record,
  years,
  units,
  stakeholders,
  riskRm,
  riskBa,
  defaults,
  canApprove,
}: {
  scope: "ORG" | "UNIT";
  record: PlanRow | null;
  years: FiscalYear[];
  units: OrgUnit[];
  stakeholders: StakeholderRow[];
  riskRm: RefItem[];
  riskBa: RefItem[];
  defaults: { fiscalYearId: number; orgUnitId: number };
  canApprove: boolean;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const code = scope === "ORG" ? "040" : "050";
  const basePath = scope === "ORG" ? "/organization/plans" : "/cluster/plans";

  const [form, setForm] = useState({
    fiscal_year_id: record?.fiscal_year_id ?? defaults.fiscalYearId,
    org_unit_id: record?.org_unit_id ?? (scope === "ORG" ? 1 : defaults.orgUnitId),
    stakeholder_id: record?.stakeholder_id ?? null,
    name: record?.name ?? "",
    objective: record?.objective ?? "",
    relation_level: record?.relation_level ?? "",
    relation_method: record?.relation_method ?? "",
    linked_plan_type: record?.linked_plan_type ?? "",
    linked_plan_name: record?.linked_plan_name ?? "",
    relation_objective: record?.relation_objective ?? "",
    goal_output: record?.goal_output ?? "",
    goal_outcome: record?.goal_outcome ?? "",
    goal_q1: record?.goal_q1 ?? "",
    goal_q2: record?.goal_q2 ?? "",
    goal_q3: record?.goal_q3 ?? "",
    goal_q4: record?.goal_q4 ?? "",
    rm_code: record?.rm_code ?? "RM000",
    ba_code: record?.ba_code ?? "BA000",
    risk_approach: record?.risk_approach ?? "",
    risk_factor: record?.risk_factor ?? "",
    impact: record?.impact ?? null,
    likelihood: record?.likelihood ?? null,
    risk_control: record?.risk_control ?? "",
    risk_appetite: record?.risk_appetite ?? RISK_APPETITES[0],
    risk_goal_output: record?.risk_goal_output ?? "",
    risk_goal_outcome: record?.risk_goal_outcome ?? "",
    res_headcount: record?.res_headcount ?? "",
    res_capability: record?.res_capability ?? "",
    res_technology: record?.res_technology ?? "",
    res_budget: record?.res_budget ?? "",
  });

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const riskLevel = calcRiskLevel(form.impact, form.likelihood);

  /* ทะเบียนผู้มีส่วนได้ส่วนเสียแยกตามปีงบประมาณ จึงต้องกรองตามปีที่เลือกอยู่ในฟอร์ม */
  const yearStakeholders = useMemo(
    () => stakeholders.filter((s) => s.fiscal_year_id === form.fiscal_year_id),
    [stakeholders, form.fiscal_year_id],
  );

  async function submit(action: "draft" | "approve") {
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch("/api/plans", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...form, id: record?.id, scope, action }),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.error ?? "บันทึกไม่สำเร็จ");
        return;
      }
      router.push(`${basePath}/${data.id}`);
      router.refresh();
      setMessage("บันทึกข้อมูลเรียบร้อยแล้ว");
    } finally {
      setSaving(false);
    }
  }

  return (
    <FormCard title="บันทึกแผนงาน/โครงการ" code={code}>
      {message && (
        <div className="mb-5 rounded border border-raot-300 bg-raot-50 px-4 py-2.5 text-raot-800">{message}</div>
      )}

      <div className="space-y-8">
        <FormSection>
          <FormRow label="ปีงบประมาณ :">
            <select
              className="form-select w-48"
              value={form.fiscal_year_id}
              onChange={(e) => set("fiscal_year_id", Number(e.target.value))}
            >
              {years.map((y) => (
                <option key={y.id} value={y.id}>
                  {y.year}
                </option>
              ))}
            </select>
          </FormRow>

          <FormRow
            label="ส่วนงานผู้รับผิดชอบ :"
            required
            hint={scope === "ORG" ? "ส่วนงานที่จัดทำแผนระดับองค์กร" : undefined}
          >
            <select
              className="form-select w-full max-w-md"
              value={form.org_unit_id}
              onChange={(e) => set("org_unit_id", Number(e.target.value))}
            >
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </FormRow>

          <FormRow label="ชื่อแผนงาน/โครงการ :" required>
            <input className="form-input" value={form.name} onChange={(e) => set("name", e.target.value)} />
          </FormRow>

          <FormRow label="ผู้มีส่วนได้ส่วนเสียเป้าหมาย :">
            <select
              className="form-select w-full max-w-md"
              value={form.stakeholder_id ?? ""}
              disabled={yearStakeholders.length === 0}
              onChange={(e) => set("stakeholder_id", e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">-- ระบุ --</option>
              {yearStakeholders.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.group_name ? `[${s.group_name}] ` : ""}
                  {s.name} · {s.org_unit_name}
                </option>
              ))}
            </select>
            {yearStakeholders.length === 0 && (
              <p className="mt-1.5 text-[12px] text-[#9e1b32]">
                ยังไม่มีผู้มีส่วนได้ส่วนเสียในทะเบียนของปีงบประมาณนี้ —{" "}
                <Link href="/profile" className="underline underline-offset-2">
                  ไปบันทึกที่ฟอร์ม [100]
                </Link>{" "}
                หรือเลือกปีงบประมาณอื่นก่อน
              </p>
            )}
          </FormRow>
        </FormSection>

        {scope === "UNIT" && (
          <FormSection title="ความเชื่อมโยงของแผนงาน/โครงการ">
            <FormRow label="ความเชื่อมโยงกับแผนสร้างความสัมพันธ์ :">
              <select
                className="form-select max-w-md"
                value={form.linked_plan_type}
                onChange={(e) => set("linked_plan_type", e.target.value)}
              >
                <option value="">-- ระบุ --</option>
                {PLAN_LINK_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </FormRow>
            <FormRow label="ระบุชื่อแผนงาน/โครงการ :">
              <input
                className="form-input"
                value={form.linked_plan_name}
                onChange={(e) => set("linked_plan_name", e.target.value)}
              />
            </FormRow>
            <FormRow label="วัตถุประสงค์ของแผนงานสร้างความสัมพันธ์ :">
              <input
                className="form-input"
                value={form.relation_objective}
                onChange={(e) => set("relation_objective", e.target.value)}
              />
            </FormRow>
          </FormSection>
        )}

        <FormSection>
          <FormRow label="วัตถุประสงค์ :">
            <textarea
              className="form-textarea"
              value={form.objective}
              onChange={(e) => set("objective", e.target.value)}
            />
          </FormRow>
          <FormRow label="ระดับการสร้างความสัมพันธ์ :">
            <select
              className="form-select max-w-xl"
              value={form.relation_level}
              onChange={(e) => set("relation_level", e.target.value)}
            >
              <option value="">-- ระบุ --</option>
              {ENGAGEMENT_LEVELS.map((l) => (
                <option key={l.code} value={l.name}>
                  {l.name}
                </option>
              ))}
            </select>
          </FormRow>
          <FormRow label="รูปแบบการสร้างความสัมพันธ์ :">
            <input
              className="form-input"
              value={form.relation_method}
              onChange={(e) => set("relation_method", e.target.value)}
            />
          </FormRow>

          <FormRow label="เป้าหมาย (ณ สิ้นปีงบประมาณ) :">
            <OutputOutcome
              output={form.goal_output}
              outcome={form.goal_outcome}
              onOutput={(v) => set("goal_output", v)}
              onOutcome={(v) => set("goal_outcome", v)}
            />
          </FormRow>

          <FormRow label="เป้าหมาย (รายไตรมาส) :">
            <div className="space-y-2">
              {([1, 2, 3, 4] as const).map((q) => (
                <div key={q} className="flex">
                  <span className="input-prefix">ไตรมาสที่ {q}</span>
                  <input
                    className="form-input"
                    value={form[`goal_q${q}` as const]}
                    onChange={(e) => set(`goal_q${q}` as const, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </FormRow>
        </FormSection>

        <FormSection title="การจัดการความเสี่ยงในการสร้างความสัมพันธ์">
          <FormRow label="RM ประเด็นความเสี่ยงผู้มีส่วนได้ส่วนเสีย :" required>
            <select
              className="form-select max-w-xl"
              value={form.rm_code}
              onChange={(e) => set("rm_code", e.target.value)}
            >
              {riskRm.map((r) => (
                <option key={r.code} value={r.code}>
                  {r.code} {r.name}
                </option>
              ))}
            </select>
          </FormRow>

          <FormRow label="BA ประเด็นพิจารณาความเสี่ยงด้านองค์กร :" required>
            <select
              className="form-select max-w-xl"
              value={form.ba_code}
              onChange={(e) => set("ba_code", e.target.value)}
            >
              {riskBa.map((r) => (
                <option key={r.code} value={r.code}>
                  {r.code} {r.name}
                </option>
              ))}
            </select>
          </FormRow>

          <FormRow label="แนวทางการจัดการความเสี่ยงการสร้างความสัมพันธ์ :">
            <input
              className="form-input"
              value={form.risk_approach}
              onChange={(e) => set("risk_approach", e.target.value)}
            />
          </FormRow>

          <FormRow label="ปัจจัยเสี่ยง (Risk Factor) :">
            <input
              className="form-input"
              value={form.risk_factor}
              onChange={(e) => set("risk_factor", e.target.value)}
            />
          </FormRow>

          <FormRow label="IMPACT :">
            <RadioScale name="impact" value={form.impact} options={SCALE_5} onChange={(v) => set("impact", v)} />
          </FormRow>

          <FormRow label="LIKELIHOOD :">
            <RadioScale
              name="likelihood"
              value={form.likelihood}
              options={SCALE_5}
              onChange={(v) => set("likelihood", v)}
            />
          </FormRow>

          <FormRow label="ระดับความเสี่ยง :" hint="คำนวณอัตโนมัติ">
            {riskLevel ? (
              <span className={`inline-block rounded px-3 py-1.5 ${RISK_LEVEL_COLOR[riskLevel as RiskLevel]}`}>
                {riskLevel}
              </span>
            ) : (
              <input className="form-input w-56" value="" readOnly />
            )}
          </FormRow>

          <FormRow
            label="มาตรการควบคุมความเสี่ยง :"
            required={requiresRiskControl(riskLevel)}
            hint="กรณีมีปัจจัยเสี่ยงเกินกว่าระดับที่ยอมรับได้ (ตั้งแต่ปานกลางขึ้นไป)"
          >
            <textarea
              className="form-textarea"
              value={form.risk_control}
              onChange={(e) => set("risk_control", e.target.value)}
            />
          </FormRow>

          <FormRow label="ระดับความเสี่ยงที่ยอมรับได้ :">
            <select
              className="form-select max-w-md"
              value={form.risk_appetite}
              onChange={(e) => set("risk_appetite", e.target.value)}
            >
              {RISK_APPETITES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </FormRow>

          <FormRow label="เป้าหมายของมาตรการรองรับความเสี่ยง :">
            <OutputOutcome
              output={form.risk_goal_output}
              outcome={form.risk_goal_outcome}
              onOutput={(v) => set("risk_goal_output", v)}
              onOutcome={(v) => set("risk_goal_outcome", v)}
            />
          </FormRow>
        </FormSection>

        <FormSection title="ทรัพยากรที่จำเป็นต่อการดำเนินงาน">
          <FormRow label="อัตรากำลัง :">
            <input
              className="form-input"
              placeholder="ระบุ จำนวน"
              value={form.res_headcount}
              onChange={(e) => set("res_headcount", e.target.value)}
            />
          </FormRow>
          <FormRow label="ขีดความสามารถ :">
            <input
              className="form-input"
              placeholder="ระบุ ทักษะความรู้ที่ต้องใช้ในกิจกรรม"
              value={form.res_capability}
              onChange={(e) => set("res_capability", e.target.value)}
            />
          </FormRow>
          <FormRow label="เทคโนโลยี/สารสนเทศ :">
            <input
              className="form-input"
              placeholder="ระบุ เทคโนโลยีที่จำเป็นในการจัดกิจกรรม"
              value={form.res_technology}
              onChange={(e) => set("res_technology", e.target.value)}
            />
          </FormRow>
          <FormRow label="งบประมาณ :">
            <input
              className="form-input"
              placeholder="ระบุ งบประมาณที่ได้รับการอนุมัติ"
              value={form.res_budget}
              onChange={(e) => set("res_budget", e.target.value)}
            />
          </FormRow>
        </FormSection>
      </div>

      <StatusBar
        status={record?.status ?? "DRAFT"}
        canApprove={canApprove}
        saving={saving}
        onApprove={() => submit("approve")}
        onSaveDraft={() => submit("draft")}
        onCancel={() => router.push(basePath)}
      />
    </FormCard>
  );
}
