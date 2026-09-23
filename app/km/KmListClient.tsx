"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import KmEditor from "@/components/KmEditor";
import type { KmSummary } from "@/lib/queries";

/** วันที่แบบไทย เช่น 15 ก.ย. 2568 */
function thaiDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" });
}

export default function KmListClient({
  rows,
  categories,
  q,
  category,
  canManage,
}: {
  rows: KmSummary[];
  categories: string[];
  q: string;
  category: string;
  canManage: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [keyword, setKeyword] = useState(q);
  const [adding, setAdding] = useState(false);

  function apply(next: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    const query = params.toString();
    router.push(query ? `/km?${query}` : "/km");
  }

  return (
    <div className="space-y-5">
      {/* ---------- ช่องค้นหา ---------- */}
      <form
        className="flex flex-wrap items-end gap-x-4 gap-y-3 rounded border border-[var(--line)] bg-raot-50/60 px-4 py-3"
        onSubmit={(e) => {
          e.preventDefault();
          apply({ q: keyword });
        }}
      >
        <label className="flex flex-1 flex-col gap-1 text-[12px] text-raot-800">
          ค้นหาองค์ความรู้
          <input
            className="form-input min-w-64"
            value={keyword}
            placeholder="ค้นจากชื่อหัวข้อ คำโปรย หมวดหมู่ หรือเนื้อหา"
            onChange={(e) => setKeyword(e.target.value)}
          />
        </label>

        <label className="flex flex-col gap-1 text-[12px] text-raot-800">
          หมวดหมู่
          <select
            className="form-select w-56"
            value={category}
            onChange={(e) => apply({ category: e.target.value })}
          >
            <option value="">-- ทั้งหมด --</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <button type="submit" className="btn btn-primary">
          ค้นหา
        </button>
        {(q || category) && (
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              setKeyword("");
              router.push("/km");
            }}
          >
            ล้างเงื่อนไข
          </button>
        )}
      </form>

      {/* ---------- ปุ่มเพิ่มหัวข้อ (ผู้ดูแลระบบ) ---------- */}
      {canManage &&
        (adding ? (
          <KmEditor
            categories={categories}
            onClose={() => setAdding(false)}
            onSaved={(id) => router.push(`/km/${id}`)}
          />
        ) : (
          <button type="button" className="btn btn-primary" onClick={() => setAdding(true)}>
            + เพิ่มหัวข้อองค์ความรู้
          </button>
        ))}

      {/* ---------- รายการ เรียงตามวันที่บันทึกข้อมูล ---------- */}
      {rows.length === 0 ? (
        <p className="rounded border border-[var(--line)] px-4 py-10 text-center text-[var(--ink-muted)]">
          {q || category
            ? "ไม่พบองค์ความรู้ตามเงื่อนไขที่ค้นหา"
            : "ยังไม่มีองค์ความรู้ในระบบ"}
        </p>
      ) : (
        <ul className="space-y-3">
          {rows.map((row) => (
            <li key={row.id}>
              <Link
                href={`/km/${row.id}`}
                className="block rounded border border-[var(--line)] px-4 py-3.5 transition hover:border-raot-400 hover:bg-raot-50/50"
              >
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h3 className="font-medium text-raot-800">{row.title}</h3>
                  {row.category && (
                    <span className="rounded-full bg-raot-100 px-2.5 py-0.5 text-[11.5px] text-raot-700">
                      {row.category}
                    </span>
                  )}
                  <span className="ml-auto whitespace-nowrap text-[12px] text-[var(--ink-muted)]">
                    บันทึกเมื่อ {thaiDate(row.created_at)}
                  </span>
                </div>

                {row.summary && (
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-[var(--ink-muted)]">
                    {row.summary}
                  </p>
                )}

                <p className="mt-2 text-[11.5px] text-[var(--ink-muted)]">
                  โดย {row.created_by ?? "-"}
                  {row.updated_at !== row.created_at && ` · แก้ไขล่าสุด ${thaiDate(row.updated_at)}`}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <p className="text-[12px] text-[var(--ink-muted)]">
        {q || category ? `พบ ${rows.length} หัวข้อ` : `ทั้งหมด ${rows.length} หัวข้อ`}
      </p>
    </div>
  );
}
