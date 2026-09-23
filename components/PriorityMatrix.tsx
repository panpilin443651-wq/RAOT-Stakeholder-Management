"use client";

import { BAND_STYLE, PRIORITY_MATRIX, SCORE4_LABELS, type Score4 } from "@/lib/scoring";

const SCORES: Score4[] = [4, 3, 2, 1];
const COLS: Score4[] = [1, 2, 3, 4];

/**
 * แผนผังการจัดลำดับของประเด็นความต้องการ ความคาดหวัง และความกังวลของผู้มีส่วนได้ส่วนเสีย
 * แกนตั้ง = ความสำคัญต่อองค์กร, แกนนอน = ความสำคัญต่อผู้มีส่วนได้ส่วนเสีย
 * ช่องที่ตรงกับคะแนนที่เลือกจะถูกเน้นกรอบ
 */
export default function PriorityMatrix({
  org,
  stakeholder,
}: {
  org: number | null;
  stakeholder: number | null;
}) {
  return (
    <figure className="inline-block max-w-full overflow-x-auto rounded border border-[var(--line)] bg-white p-3">
      <figcaption className="mb-2.5 text-center text-[12px] leading-snug text-raot-800">
        แผนผังการจัดลำดับของประเด็นความต้องการ ความคาดหวัง
        <br />
        และความกังวลของผู้มีส่วนได้ส่วนเสีย
      </figcaption>

      <table className="border-collapse text-[11px]">
        <tbody>
          {SCORES.map((row) => (
            <tr key={row}>
              {row === 4 && (
                <th
                  rowSpan={4}
                  className="border border-[var(--line)] px-1 font-normal text-raot-800"
                  style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
                >
                  ความสำคัญต่อองค์กร
                </th>
              )}
              <th className="w-16 border border-[var(--line)] px-2 py-1.5 font-normal">
                {SCORE4_LABELS[row]}
              </th>
              <th className="w-8 border border-[var(--line)] px-2 py-1.5 font-normal">{row}</th>
              {COLS.map((col) => {
                const band = PRIORITY_MATRIX[row][col];
                const selected = org === row && stakeholder === col;
                return (
                  <td
                    key={col}
                    className="w-16 px-2 py-2 text-center"
                    style={{
                      background: BAND_STYLE[band].bg,
                      color: BAND_STYLE[band].fg,
                      border: selected ? "2px solid #111827" : `1px solid ${BAND_STYLE[band].border}`,
                      fontWeight: selected ? 700 : 400,
                    }}
                  >
                    {row} x {col}
                  </td>
                );
              })}
            </tr>
          ))}
          <tr>
            <td className="border border-[var(--line)]" colSpan={3} />
            {COLS.map((col) => (
              <th key={col} className="border border-[var(--line)] px-2 py-1 font-normal">
                {col}
              </th>
            ))}
          </tr>
          <tr>
            <td className="border border-[var(--line)]" colSpan={3} />
            {COLS.map((col) => (
              <th key={col} className="border border-[var(--line)] px-2 py-1 font-normal">
                {SCORE4_LABELS[col]}
              </th>
            ))}
          </tr>
          <tr>
            <td className="border border-[var(--line)]" colSpan={3} />
            <th colSpan={4} className="border border-[var(--line)] px-2 py-1.5 font-normal text-raot-800">
              ความสำคัญต่อผู้มีส่วนได้ส่วนเสีย
            </th>
          </tr>
        </tbody>
      </table>
    </figure>
  );
}
