"use client";

import { useEffect, useState } from "react";
import type { Criteria } from "@/lib/criteria";

/**
 * ป้ายชื่อฟิลด์ที่คลิกได้ เปิดหน้าต่าง MESSAGE แสดงเกณฑ์การให้คะแนน
 * (โครงเดียวกับหน้าจอต้นแบบ หน้า 29 ของเอกสาร)
 */
export default function HelpLabel({ text, criteria }: { text: string; criteria: Criteria }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button type="button" className="field-help text-raot-800" onClick={() => setOpen(true)}>
        {text}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/45 p-4 py-10"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-3xl rounded bg-white text-left shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center border-b border-[var(--line)] px-6 py-4">
              <h2 className="text-lg text-raot-800">MESSAGE</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="ปิด"
                className="ml-auto text-2xl leading-none text-[var(--ink-muted)] hover:text-[var(--ink)]"
              >
                ×
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto px-6 py-5 text-[13px] leading-relaxed">
              <p className="mb-4">{criteria.title}</p>
              {criteria.bands.map((band) => (
                <div key={band.score} className="mb-5">
                  <p className="font-medium">ระดับคะแนน {band.score}</p>
                  <p>{band.headline}</p>
                  <ul className="mt-1 space-y-0.5">
                    {band.bullets.map((b, i) => (
                      <li key={i} className="pl-4 -indent-4">
                        - {b}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="flex justify-end border-t border-[var(--line)] px-6 py-4">
              <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
