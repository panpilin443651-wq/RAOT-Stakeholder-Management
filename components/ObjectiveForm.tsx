"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FormCard, { FormSection } from "./FormCard";
import FormRow from "./FormRow";
import StatusBar from "./StatusBar";
import type { EngagementObjective, FiscalYear, Group, OrgUnit } from "@/lib/queries";

export default function ObjectiveForm({
  scope,
  record,
  years,
  units,
  groups,
  selected,
  canApprove,
}: {
  scope: "ORG" | "UNIT";
  record: EngagementObjective | null;
  years: FiscalYear[];
  units: OrgUnit[];
  groups: Group[];
  selected: { fiscalYearId: number; orgUnitId: number };
  canApprove: boolean;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const code = scope === "ORG" ? "004" : "005";
  const title =
    scope === "ORG"
      ? "วัตถุประสงค์และขอบเขตการสร้างความสัมพันธ์ ระดับองค์กร"
      : "วัตถุประสงค์และขอบเขตการสร้างความสัมพันธ์ ระดับส่วนงาน";

  const initialGroups: number[] = (() => {
    try {
      return record?.target_groups ? (JSON.parse(record.target_groups) as number[]) : [];
    } catch {
      return [];
    }
  })();

  const [form, setForm] = useState({
    objective: record?.objective ?? "",
    scope_text: record?.scope_text ?? "",
    expected_result: record?.expected_result ?? "",
    target_groups: initialGroups,
  });

  function toggleGroup(id: number) {
    setForm((prev) => ({
      ...prev,
      target_groups: prev.target_groups.includes(id)
        ? prev.target_groups.filter((g) => g !== id)
        : [...prev.target_groups, id],
    }));
  }

  function navigate(next: { fy?: number; unit?: number }) {
    const params = new URLSearchParams();
    params.set("fy", String(next.fy ?? selected.fiscalYearId));
    params.set("unit", String(next.unit ?? selected.orgUnitId));
    router.push(`?${params.toString()}`);
  }

  async function submit(action: "draft" | "approve") {
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch("/api/objectives", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...form,
          scope,
          fiscal_year_id: selected.fiscalYearId,
          org_unit_id: selected.orgUnitId,
          action,
        }),
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
    <FormCard title={title} code={code}>
      {message && (
        <div className="mb-5 rounded border border-raot-300 bg-raot-50 px-4 py-2.5 text-raot-800">{message}</div>
      )}

      <div className="space-y-8">
        <FormSection>
          <FormRow label="ปีงบประมาณ :">
            <select
              className="form-select w-48"
              value={selected.fiscalYearId}
              onChange={(e) => navigate({ fy: Number(e.target.value) })}
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
            hint={scope === "ORG" ? "ส่วนงานที่จัดทำวัตถุประสงค์ระดับองค์กร" : undefined}
          >
            <select
              className="form-select w-full max-w-md"
              value={selected.orgUnitId}
              onChange={(e) => navigate({ unit: Number(e.target.value) })}
            >
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </FormRow>

          <FormRow label="วัตถุประสงค์ของการสร้างความสัมพันธ์ :" required>
            <textarea
              className="form-textarea min-h-28"
              value={form.objective}
              onChange={(e) => setForm((p) => ({ ...p, objective: e.target.value }))}
            />
          </FormRow>

          <FormRow label="ขอบเขตของการสร้างความสัมพันธ์ :" required>
            <textarea
              className="form-textarea"
              value={form.scope_text}
              onChange={(e) => setForm((p) => ({ ...p, scope_text: e.target.value }))}
            />
          </FormRow>

          <FormRow label="กลุ่มผู้มีส่วนได้ส่วนเสียเป้าหมาย :" required>
            <div className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
              {groups.map((g) => (
                <label key={g.id} className="flex cursor-pointer items-start gap-2">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 accent-raot-600"
                    checked={form.target_groups.includes(g.id)}
                    onChange={() => toggleGroup(g.id)}
                  />
                  <span>
                    {g.code} {g.name}
                  </span>
                </label>
              ))}
            </div>
          </FormRow>

          <FormRow label="ผลลัพธ์ที่คาดหวัง :">
            <textarea
              className="form-textarea"
              value={form.expected_result}
              onChange={(e) => setForm((p) => ({ ...p, expected_result: e.target.value }))}
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
        onCancel={() => router.push("/")}
      />
    </FormCard>
  );
}
