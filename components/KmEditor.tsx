"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FormRow from "./FormRow";
import type { KmArticle } from "@/lib/queries";

export type KmDraft = Pick<KmArticle, "id" | "title" | "summary" | "category" | "body">;

/**
 * ฟอร์มเพิ่ม/แก้ไของค์ความรู้ ใช้ร่วมกันทั้งหน้ารายการ (เพิ่มใหม่) และหน้าอ่าน (แก้ไข)
 * เนื้อหารับเป็น Markdown แบบเดียวกับที่ [components/Markdown.tsx] แสดงผล
 */
export default function KmEditor({
  record,
  categories,
  onClose,
  onSaved,
}: {
  record?: KmDraft;
  categories: string[];
  onClose: () => void;
  onSaved?: (id: number) => void;
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: record?.title ?? "",
    summary: record?.summary ?? "",
    category: record?.category ?? "",
    body: record?.body ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(record ? `/api/km/${record.id}` : "/api/km", {
        method: record ? "PUT" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.error ?? "บันทึกไม่สำเร็จ");
        return;
      }
      router.refresh();
      onSaved?.(Number(data.id));
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3 rounded border border-raot-300 bg-raot-50/50 p-4">
      <h2 className="font-medium text-raot-800">
        {record ? "แก้ไของค์ความรู้" : "เพิ่มหัวข้อองค์ความรู้"}
      </h2>

      <FormRow label="ชื่อหัวข้อ :" required labelWidth="150px">
        <input
          className="form-input"
          autoFocus
          value={form.title}
          placeholder="เช่น แนวทางการรับฟังความคิดเห็นเกษตรกรชาวสวนยาง"
          onChange={(e) => set("title", e.target.value)}
        />
      </FormRow>

      <FormRow label="คำโปรย :" hint="แสดงใต้ชื่อหัวข้อในหน้ารายการ" labelWidth="150px">
        <input
          className="form-input"
          value={form.summary ?? ""}
          onChange={(e) => set("summary", e.target.value)}
        />
      </FormRow>

      <FormRow label="หมวดหมู่ :" hint="ใช้กรองในหน้ารายการ" labelWidth="150px">
        <input
          className="form-input w-72"
          list="km-categories"
          value={form.category ?? ""}
          placeholder="พิมพ์ใหม่ หรือเลือกจากที่มีอยู่"
          onChange={(e) => set("category", e.target.value)}
        />
        <datalist id="km-categories">
          {categories.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </FormRow>

      <FormRow label="เนื้อหา :" required hint="รองรับ Markdown: ## หัวข้อ, - รายการ, | ตาราง |" labelWidth="150px">
        <textarea
          className="form-textarea min-h-64 font-mono text-[12.5px]"
          value={form.body}
          onChange={(e) => set("body", e.target.value)}
        />
      </FormRow>

      {error && (
        <p className="rounded border border-[#e8a1a1] bg-[#fdf3f3] px-4 py-2.5 text-[13px] text-[#9e1b32]">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn btn-primary" disabled={saving} onClick={save}>
          บันทึก
        </button>
        <button type="button" className="btn btn-ghost" disabled={saving} onClick={onClose}>
          ยกเลิก
        </button>
      </div>
    </div>
  );
}
