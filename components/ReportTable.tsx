"use client";

import type { ReportData } from "@/lib/reports";
import StatusPill from "./StatusPill";

export default function ReportTable({ report, csvHref }: { report: ReportData; csvHref: string }) {
  return (
    <>
      <div className="no-print mt-5 flex flex-wrap items-center gap-2">
        <a href={csvHref} className="btn btn-secondary">
          ส่งออก CSV
        </a>
        <button type="button" className="btn btn-ghost" onClick={() => window.print()}>
          พิมพ์รายงาน
        </button>
        <span className="ml-auto text-[12px] text-[var(--ink-muted)]">รวม {report.rows.length} รายการ</span>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[1000px] border-collapse text-[13px]">
          <thead>
            <tr className="bg-raot-700 text-white">
              <th className="w-12 border border-raot-800 px-3 py-2 font-medium">ลำดับ</th>
              {report.columns.map((col) => (
                <th
                  key={col.key}
                  style={{ width: col.width }}
                  className="border border-raot-800 px-3 py-2 text-left font-medium"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {report.rows.length === 0 && (
              <tr>
                <td
                  colSpan={report.columns.length + 1}
                  className="border border-[var(--line)] px-3 py-8 text-center text-[var(--ink-muted)]"
                >
                  ไม่พบข้อมูลตามเงื่อนไขที่เลือก
                </td>
              </tr>
            )}
            {report.rows.map((row, index) => (
              <tr key={index} className="odd:bg-white even:bg-raot-50/40">
                <td className="border border-[var(--line)] px-3 py-2 text-center align-top">{index + 1}</td>
                {report.columns.map((col) => (
                  <td
                    key={col.key}
                    className={`border border-[var(--line)] px-3 py-2 align-top ${
                      col.align === "center" ? "text-center" : col.align === "right" ? "text-right" : ""
                    }`}
                  >
                    {col.key === "status" ? (
                      <StatusPill status={row[col.key] as string} />
                    ) : (
                      (row[col.key] ?? "-")
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
