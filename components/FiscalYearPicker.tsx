"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { FiscalYear } from "@/lib/queries";

/**
 * ช่องเลือกปีงบประมาณแบบกะทัดรัด ใช้ในหน้าที่ไม่มีแถบตัวกรองเต็ม
 *
 * ค่าตั้งต้นคือ "ปีปัจจุบัน" ที่ผู้ดูแลระบบกำหนดไว้ที่หน้าตั้งค่า ซึ่งใช้ร่วมกันทุกคน
 * ผู้ใช้ทุกสิทธิ์เปลี่ยนปีเพื่อดูข้อมูลย้อนหลังได้ (ข้อมูลที่เห็นยังจำกัดตามสิทธิ์เดิม)
 */
export default function FiscalYearPicker({
  years,
  value,
  tone = "light",
}: {
  years: FiscalYear[];
  value: number;
  tone?: "light" | "dark";
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function pick(id: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("fy", id);
    router.push(`?${params.toString()}`);
  }

  const dark = tone === "dark";

  return (
    <label
      className={`no-print flex items-center gap-2 text-[12.5px] ${
        dark ? "text-raot-100" : "text-raot-800"
      }`}
    >
      ปีงบประมาณ
      <select
        className={
          dark
            ? "rounded border border-white/40 bg-white/15 px-2 py-1 text-[13px] text-white [&>option]:text-[var(--ink)]"
            : "form-select w-32"
        }
        value={value}
        onChange={(e) => pick(e.target.value)}
      >
        {years.map((y) => (
          <option key={y.id} value={y.id}>
            {y.year}
            {y.is_current ? " (ปีปัจจุบัน)" : ""}
          </option>
        ))}
      </select>
    </label>
  );
}
