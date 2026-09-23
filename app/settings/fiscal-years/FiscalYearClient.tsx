"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FormRow from "@/components/FormRow";
import { FormSection } from "@/components/FormCard";
import { THAI_MONTHS, fiscalYearRange } from "@/lib/fiscal";
import type { FiscalYearRow } from "@/lib/services/fiscalYear";

export default function FiscalYearClient({
  rows,
  startMonth,
  suggestedYear,
}: {
  rows: FiscalYearRow[];
  startMonth: number;
  suggestedYear: number;
}) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [year, setYear] = useState(String(suggestedYear));
  const [makeCurrent, setMakeCurrent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  /** เรียก API แล้วรีเฟรชหน้าเมื่อสำเร็จ */
  async function call(url: string, init: RequestInit, okText: string) {
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch(url, init);
      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        setMessage({ tone: "ok", text: okText });
        router.refresh();
        return true;
      }
      setMessage({ tone: "error", text: data.error ?? "ดำเนินการไม่สำเร็จ" });
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function add() {
    const ok = await call(
      "/api/fiscal-years",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ year: Number(year), start_month: startMonth, make_current: makeCurrent }),
      },
      `เพิ่มปีงบประมาณ ${year} แล้ว`,
    );
    if (ok) {
      setAdding(false);
      setMakeCurrent(false);
      setYear(String(Number(year) + 1));
    }
  }

  const setCurrent = (row: FiscalYearRow) =>
    call(`/api/fiscal-years/${row.id}`, { method: "PATCH" }, `กำหนดให้ปี ${row.year} เป็นปีปัจจุบันแล้ว`);

  async function remove(row: FiscalYearRow) {
    if (!confirm(`ลบปีงบประมาณ ${row.year} ออกจากระบบ?`)) return;
    await call(`/api/fiscal-years/${row.id}`, { method: "DELETE" }, `ลบปีงบประมาณ ${row.year} แล้ว`);
  }

  return (
    <div className="space-y-5">
      <p className="text-[12.5px] leading-relaxed text-[var(--ink-muted)]">
        ปีงบประมาณของ กยท. เริ่มเดือน
        <b className="text-raot-700"> {THAI_MONTHS[startMonth - 1]}</b> ทุกฟอร์มในระบบผูกกับปีงบประมาณ
        การเพิ่มปีใหม่จะทำให้ปีนั้นปรากฏในช่องเลือกปีของทุกหน้าจอทันที
        ส่วน <b className="text-raot-700">ปีปัจจุบัน</b> คือปีที่ทุกหน้าจอของ
        <b className="text-raot-700">ผู้ใช้ทุกคน</b> เลือกให้อัตโนมัติเมื่อเปิดหน้า
        (ผู้ใช้ยังเปลี่ยนไปดูปีอื่นย้อนหลังได้เองจากช่องเลือกปีในแต่ละหน้า)
      </p>

      {/* ---------- ปุ่มเพิ่มปีงบประมาณ ---------- */}
      {!adding ? (
        <button type="button" className="btn btn-primary" onClick={() => setAdding(true)}>
          + เพิ่มปีงบประมาณ
        </button>
      ) : (
        <FormSection title="เพิ่มปีงบประมาณใหม่">
          <FormRow label="ปีงบประมาณ (พ.ศ.) :" required labelWidth="200px">
            <input
              className="form-input w-40"
              type="number"
              autoFocus
              value={year}
              onChange={(e) => setYear(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !busy && add()}
            />
          </FormRow>

          <FormRow label="เดือนเริ่มต้น :" labelWidth="200px">
            <span className="inline-block py-1.5 text-[13px]">
              {THAI_MONTHS[startMonth - 1]} — ตั้งค่าไว้ที่ <code>lib/fiscal.ts</code> เท่ากันทุกปี
            </span>
          </FormRow>

          <FormRow label="" labelWidth="200px">
            <label className="flex items-center gap-2 py-1.5 text-[13px]">
              <input
                type="checkbox"
                checked={makeCurrent}
                onChange={(e) => setMakeCurrent(e.target.checked)}
              />
              กำหนดให้เป็นปีปัจจุบันทันที
            </label>
          </FormRow>

          <div className="flex flex-wrap gap-2 pt-1">
            <button type="button" className="btn btn-primary" disabled={busy} onClick={add}>
              บันทึก
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              disabled={busy}
              onClick={() => {
                setAdding(false);
                setMessage(null);
              }}
            >
              ยกเลิก
            </button>
          </div>
        </FormSection>
      )}

      {message && (
        <p
          className={`rounded border px-4 py-2.5 text-[13px] ${
            message.tone === "ok"
              ? "border-[#a9cf97] bg-[#f2fbf6] text-[#2f5c22]"
              : "border-[#e8a1a1] bg-[#fdf3f3] text-[#9e1b32]"
          }`}
        >
          {message.text}
        </p>
      )}

      {/* ---------- ทะเบียนปีงบประมาณ ---------- */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-[13px]">
          <thead>
            <tr className="bg-raot-700 text-white">
              <Th className="w-32">ปีงบประมาณ</Th>
              <Th className="w-44">ช่วงเวลา</Th>
              <Th className="w-32 text-center">ปีปัจจุบัน</Th>
              <Th className="w-40 text-center">ข้อมูลที่ผูกอยู่</Th>
              <Th>จัดการ</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className={row.is_current ? "bg-raot-50" : undefined}>
                <Td className="font-medium tabular-nums text-raot-800">{row.year}</Td>
                <Td className="text-[var(--ink-muted)]">{fiscalYearRange(row.year, row.start_month)}</Td>
                <Td className="text-center">
                  {row.is_current ? (
                    <span className="rounded-full bg-raot-600 px-2.5 py-1 text-[11.5px] text-white">
                      ปีปัจจุบัน
                    </span>
                  ) : (
                    <span className="text-[var(--ink-muted)]">—</span>
                  )}
                </Td>
                <Td className="text-center tabular-nums">
                  {row.usage === 0 ? (
                    <span className="text-[var(--ink-muted)]">ยังไม่มีข้อมูล</span>
                  ) : (
                    `${row.usage} รายการ`
                  )}
                </Td>
                <Td>
                  <div className="flex flex-wrap gap-2">
                    {!row.is_current && (
                      <button
                        type="button"
                        className="btn btn-secondary"
                        disabled={busy}
                        onClick={() => setCurrent(row)}
                      >
                        ตั้งเป็นปีปัจจุบัน
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn btn-ghost"
                      disabled={busy || row.is_current === 1 || row.usage > 0}
                      title={
                        row.is_current
                          ? "ลบปีปัจจุบันไม่ได้"
                          : row.usage > 0
                            ? "ลบไม่ได้เพราะมีข้อมูลผูกอยู่แล้ว"
                            : undefined
                      }
                      onClick={() => remove(row)}
                    >
                      ลบ
                    </button>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-[12px] text-[var(--ink-muted)]">รวม {rows.length} ปีงบประมาณ</p>
    </div>
  );
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <th className={`border border-raot-800 px-3 py-2 text-left font-medium ${className}`}>{children}</th>;
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`border border-[var(--line)] px-3 py-2 align-middle ${className}`}>{children}</td>;
}
