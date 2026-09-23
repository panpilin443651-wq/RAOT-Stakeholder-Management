"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FormCard, { FormSection } from "./FormCard";
import FormRow from "./FormRow";
import StatusBar from "./StatusBar";
import OutputOutcome from "./OutputOutcome";
import { fiscalMonths, type Quarter } from "@/lib/fiscal";
import type { PlanRow, QuarterResult } from "@/lib/queries";

const RESOURCE_FIELDS = [
  { key: "headcount", label: "อัตรากำลัง" },
  { key: "capability", label: "ขีดความสามารถ" },
  { key: "technology", label: "เทคโนโลยี/สารสนเทศ" },
  { key: "budget", label: "งบประมาณ" },
] as const;

export default function QuarterResultForm({
  scope,
  quarter,
  plan,
  record,
  previousSummary,
  canApprove,
}: {
  scope: "ORG" | "UNIT";
  quarter: Quarter;
  plan: PlanRow;
  record: QuarterResult | null;
  previousSummary: string;
  canApprove: boolean;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const code = `0${scope === "ORG" ? "4" : "5"}1${quarter}`;
  const listPath = scope === "ORG" ? `/organization/results/${quarter}` : `/cluster/results/${quarter}`;
  const months = fiscalMonths(quarter);
  const isQ4 = quarter === 4;

  const [form, setForm] = useState({
    month1: record?.month1 ?? "",
    month2: record?.month2 ?? "",
    month3: record?.month3 ?? "",
    forecast: record?.forecast ?? "",
    problem: record?.problem ?? "",
    solution: record?.solution ?? "",
    cumulative_percent: record?.cumulative_percent ?? null,
    is_on_target: record?.is_on_target ?? null,
    remediation: record?.remediation ?? "",
    year_output: record?.year_output ?? "",
    year_outcome: record?.year_outcome ?? "",
    risk_result: record?.risk_result ?? "",
    risk_output: record?.risk_output ?? "",
    risk_outcome: record?.risk_outcome ?? "",
    emergency_output: record?.emergency_output ?? "",
    emergency_outcome: record?.emergency_outcome ?? "",
    res_headcount_ok: record?.res_headcount_ok ?? null,
    res_headcount_note: record?.res_headcount_note ?? "",
    res_capability_ok: record?.res_capability_ok ?? null,
    res_capability_note: record?.res_capability_note ?? "",
    res_technology_ok: record?.res_technology_ok ?? null,
    res_technology_note: record?.res_technology_note ?? "",
    res_budget_ok: record?.res_budget_ok ?? null,
    res_budget_note: record?.res_budget_note ?? "",
  });

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  async function submit(action: "draft" | "approve") {
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch("/api/quarter-results", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...form, plan_id: plan.id, quarter, action }),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.error ?? "บันทึกไม่สำเร็จ");
        return;
      }
      setMessage("บันทึกข้อมูลเรียบร้อยแล้ว");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <FormCard title={`บันทึกผลการดำเนินงานแผนงาน/โครงการ - ไตรมาส ${quarter}`} code={code}>
      {message && (
        <div className="mb-5 rounded border border-raot-300 bg-raot-50 px-4 py-2.5 text-raot-800">{message}</div>
      )}

      <div className="space-y-8">
        <FormSection>
          <FormRow label="ชื่อแผนงาน/โครงการ :">
            <input className="form-input" value={plan.name} readOnly />
          </FormRow>

          <FormRow label={`ผลการดำเนินงาน ไตรมาสที่ ${quarter} :`} hint="สรุปผลไตรมาสก่อนหน้า (อ่านอย่างเดียว)">
            <textarea className="form-textarea" value={previousSummary} readOnly />
          </FormRow>

          <FormRow label={`เป้าหมายไตรมาสที่ ${quarter} :`}>
            <input className="form-input" value={plan[`goal_q${quarter}` as const] ?? ""} readOnly />
          </FormRow>

          {months.map((month, index) => (
            <FormRow key={month} label={`${month} :`}>
              <textarea
                className="form-textarea"
                value={form[`month${index + 1}` as "month1" | "month2" | "month3"]}
                onChange={(e) => set(`month${index + 1}` as "month1" | "month2" | "month3", e.target.value)}
              />
            </FormRow>
          ))}

          <FormRow label="คาดการณ์ ณ สิ้นไตรมาส :">
            <input className="form-input" value={form.forecast} onChange={(e) => set("forecast", e.target.value)} />
          </FormRow>

          <FormRow label="ปัญหา/อุปสรรค :" required>
            <textarea
              className="form-textarea"
              value={form.problem}
              onChange={(e) => set("problem", e.target.value)}
            />
          </FormRow>

          <FormRow label="แนวทางการแก้ไขปัญหา :" required>
            <textarea
              className="form-textarea"
              value={form.solution}
              onChange={(e) => set("solution", e.target.value)}
            />
          </FormRow>

          <FormRow label="ผลการดำเนินงานสะสม (ร้อยละ) :">
            <input
              type="number"
              min={0}
              max={100}
              className="form-input w-40"
              value={form.cumulative_percent ?? ""}
              onChange={(e) => set("cumulative_percent", e.target.value === "" ? null : Number(e.target.value))}
            />
          </FormRow>
        </FormSection>

        {isQ4 && (
          <FormSection title="สรุปผล ณ สิ้นปีงบประมาณ">
            <FormRow label="ผลการดำเนินงาน ณ สิ้นปี :">
              <OutputOutcome
                output={form.year_output}
                outcome={form.year_outcome}
                onOutput={(v) => set("year_output", v)}
                onOutcome={(v) => set("year_outcome", v)}
              />
            </FormRow>

            <FormRow label="ผลการดำเนินงานตามมาตรการรองรับความเสี่ยง :" hint="ระบุผลการดำเนินงาน และวันที่แล้วเสร็จ">
              <div className="space-y-2">
                <textarea
                  className="form-textarea"
                  value={form.risk_result}
                  onChange={(e) => set("risk_result", e.target.value)}
                />
                <OutputOutcome
                  output={form.risk_output}
                  outcome={form.risk_outcome}
                  onOutput={(v) => set("risk_output", v)}
                  onOutcome={(v) => set("risk_outcome", v)}
                />
              </div>
            </FormRow>

            {scope === "UNIT" && (
              <FormRow label="ผลการดำเนินงานตามแผนรองรับสถานการณ์ฉุกเฉิน :">
                <OutputOutcome
                  output={form.emergency_output}
                  outcome={form.emergency_outcome}
                  onOutput={(v) => set("emergency_output", v)}
                  onOutcome={(v) => set("emergency_outcome", v)}
                />
              </FormRow>
            )}
          </FormSection>
        )}

        <FormSection>
          <FormRow label="ความสำเร็จของแผนงาน/โครงการ :" required>
            <div className="flex flex-wrap items-center gap-x-8 gap-y-2 pt-1.5">
              {[
                { value: 1, label: "เป็นไปตามเป้าหมาย" },
                { value: 0, label: "ไม่เป็นไปตามเป้าหมาย" },
              ].map((opt) => (
                <label key={opt.value} className="flex cursor-pointer items-center gap-1.5">
                  <input
                    type="radio"
                    name="is_on_target"
                    checked={form.is_on_target === opt.value}
                    onChange={() => set("is_on_target", opt.value)}
                    className="h-4 w-4 accent-raot-600"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </FormRow>

          <FormRow
            label={isQ4 ? "ระบุสาเหตุ :" : "แนวทางการแก้ไข :"}
            required={form.is_on_target === 0}
            hint="กรณีไม่เป็นไปตามเป้าหมาย"
          >
            <input
              className="form-input"
              value={form.remediation}
              onChange={(e) => set("remediation", e.target.value)}
            />
          </FormRow>
        </FormSection>

        {isQ4 && (
          <FormSection title="สรุปการใช้ทรัพยากรที่ได้รับจัดสรร">
            {RESOURCE_FIELDS.map((field) => {
              const okKey = `res_${field.key}_ok` as const;
              const noteKey = `res_${field.key}_note` as const;
              return (
                <FormRow key={field.key} label={`${field.label} :`}>
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
                      {[
                        { value: 1, label: "เพียงพอ" },
                        { value: 0, label: "ไม่เพียงพอ" },
                      ].map((opt) => (
                        <label key={opt.value} className="flex cursor-pointer items-center gap-1.5">
                          <input
                            type="radio"
                            name={okKey}
                            checked={form[okKey] === opt.value}
                            onChange={() => set(okKey, opt.value)}
                            className="h-4 w-4 accent-raot-600"
                          />
                          <span>{opt.label}</span>
                        </label>
                      ))}
                    </div>
                    <input
                      className="form-input"
                      placeholder="ระบุสาเหตุกรณีไม่เพียงพอ"
                      value={form[noteKey]}
                      onChange={(e) => set(noteKey, e.target.value)}
                    />
                  </div>
                </FormRow>
              );
            })}
          </FormSection>
        )}
      </div>

      <StatusBar
        status={record?.status ?? "DRAFT"}
        canApprove={canApprove}
        saving={saving}
        onApprove={() => submit("approve")}
        onSaveDraft={() => submit("draft")}
        onCancel={() => router.push(listPath)}
      />
    </FormCard>
  );
}
