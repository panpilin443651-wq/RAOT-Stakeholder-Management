"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FormRow from "./FormRow";
import StatusPill from "./StatusPill";
import StatusBar from "./StatusBar";
import { FormSection } from "./FormCard";
import type { Expectation, StakeholderRow } from "@/lib/queries";

type Row = Expectation & { stakeholder_name: string; org_unit_name: string; group_name: string | null };

const blank = {
  id: undefined as number | undefined,
  stakeholder_id: null as number | null,
  need: "",
  expectation: "",
  channel: "",
  response: "",
  note: "",
  status: "DRAFT",
};

export default function ExpectationManager({
  rows,
  stakeholders,
  fiscalYearId,
  orgUnitId,
  canApprove,
}: {
  rows: Row[];
  stakeholders: StakeholderRow[];
  fiscalYearId: number;
  orgUnitId: number;
  canApprove: boolean;
}) {
  const router = useRouter();
  const [form, setForm] = useState({ ...blank });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  function edit(row: Row) {
    setForm({
      id: row.id,
      stakeholder_id: row.stakeholder_id,
      need: row.need ?? "",
      expectation: row.expectation ?? "",
      channel: row.channel ?? "",
      response: row.response ?? "",
      note: row.note ?? "",
      status: row.status,
    });
    setMessage(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit(action: "draft" | "approve") {
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch("/api/expectations", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...form, fiscal_year_id: fiscalYearId, org_unit_id: orgUnitId, action }),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.error ?? "บันทึกไม่สำเร็จ");
        return;
      }
      setForm({ ...blank });
      setMessage("บันทึกข้อมูลเรียบร้อยแล้ว");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: number) {
    if (!confirm("ยืนยันการลบรายการนี้")) return;
    await fetch(`/api/expectations/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div>
      {message && (
        <div className="mb-5 rounded border border-raot-300 bg-raot-50 px-4 py-2.5 text-raot-800">{message}</div>
      )}

      <FormSection title={form.id ? `แก้ไขรายการที่ ${form.id}` : "บันทึกรายการใหม่"}>
        <FormRow label="ชื่อ Stakeholder :" required>
          <select
            className="form-select"
            value={form.stakeholder_id ?? ""}
            onChange={(e) => set("stakeholder_id", e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">-- ระบุ --</option>
            {stakeholders.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </FormRow>

        <FormRow label="ความต้องการ :" required>
          <textarea className="form-textarea" value={form.need} onChange={(e) => set("need", e.target.value)} />
        </FormRow>

        <FormRow label="ความคาดหวัง :" required>
          <textarea
            className="form-textarea"
            value={form.expectation}
            onChange={(e) => set("expectation", e.target.value)}
          />
        </FormRow>

        <FormRow label="ช่องทางที่ได้รับข้อมูล :">
          <input className="form-input" value={form.channel} onChange={(e) => set("channel", e.target.value)} />
        </FormRow>

        <FormRow label="การตอบสนองของ กยท. :">
          <textarea
            className="form-textarea"
            value={form.response}
            onChange={(e) => set("response", e.target.value)}
          />
        </FormRow>

        <FormRow label="หมายเหตุ :">
          <input className="form-input" value={form.note} onChange={(e) => set("note", e.target.value)} />
        </FormRow>
      </FormSection>

      <StatusBar
        status={form.status}
        canApprove={canApprove}
        saving={saving}
        onApprove={() => submit("approve")}
        onSaveDraft={() => submit("draft")}
        onCancel={() => {
          setForm({ ...blank });
          setMessage(null);
        }}
      />

      <div className="mt-10">
        <h2 className="mb-3 font-medium text-raot-700">รายการที่บันทึกไว้</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-[13px]">
            <thead>
              <tr className="bg-raot-700 text-white">
                <th className="w-12 border border-raot-800 px-3 py-2 font-medium">ลำดับ</th>
                <th className="w-52 border border-raot-800 px-3 py-2 text-left font-medium">Stakeholder</th>
                <th className="border border-raot-800 px-3 py-2 text-left font-medium">ความต้องการ</th>
                <th className="border border-raot-800 px-3 py-2 text-left font-medium">ความคาดหวัง</th>
                <th className="w-24 border border-raot-800 px-3 py-2 font-medium">สถานะ</th>
                <th className="w-28 border border-raot-800 px-3 py-2 font-medium no-print">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="border border-[var(--line)] px-3 py-8 text-center text-[var(--ink-muted)]">
                    ยังไม่มีข้อมูล
                  </td>
                </tr>
              )}
              {rows.map((row, index) => (
                <tr key={row.id} className="odd:bg-white even:bg-raot-50/40">
                  <td className="border border-[var(--line)] px-3 py-2 text-center align-top">{index + 1}</td>
                  <td className="border border-[var(--line)] px-3 py-2 align-top">{row.stakeholder_name}</td>
                  <td className="border border-[var(--line)] px-3 py-2 align-top">{row.need}</td>
                  <td className="border border-[var(--line)] px-3 py-2 align-top">{row.expectation}</td>
                  <td className="border border-[var(--line)] px-3 py-2 text-center align-top">
                    <StatusPill status={row.status} />
                  </td>
                  <td className="border border-[var(--line)] px-3 py-2 text-center align-top no-print">
                    <button type="button" className="text-raot-700 underline" onClick={() => edit(row)}>
                      แก้ไข
                    </button>
                    <span className="px-1 text-[var(--line)]">|</span>
                    <button type="button" className="text-red-600 underline" onClick={() => remove(row.id)}>
                      ลบ
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
