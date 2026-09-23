import Link from "next/link";
import type { GroupStat } from "@/lib/dashboard";
import { SectionCard } from "./Charts";

/**
 * นิยามกลุ่มผู้มีส่วนได้ส่วนเสีย 8 กลุ่มของ กยท. พร้อมกลุ่มย่อยและนิยามของแต่ละกลุ่มย่อย
 * ข้อความนิยามทั้งหมดมาจากฐานข้อมูล (ตั้งค่าที่ lib/seed.ts) ไม่ได้ฝังไว้ในหน้าจอ
 */
export default function GroupDefinitions({
  groups,
  orgAbbr,
}: {
  groups: GroupStat[];
  orgAbbr: string;
}) {
  return (
    <SectionCard
      title={`นิยามกลุ่มผู้มีส่วนได้ส่วนเสียของ ${orgAbbr}`}
      subtitle={`${groups.length} กลุ่มหลัก ครอบคลุมตลอดห่วงโซ่คุณค่า`}
      action={
        <Link href="/km" className="text-raot-600 underline underline-offset-2">
          องค์ความรู้
        </Link>
      }
    >
      <div className="grid gap-4 md:grid-cols-2">
        {groups.map((g) => (
          <article
            key={g.id}
            className="flex flex-col rounded border border-[var(--line)] bg-[#fbfcfb] p-4 transition hover:border-raot-300"
          >
            <header className="mb-2 flex items-start gap-2.5">
              <span aria-hidden className="text-[22px] leading-none">
                {g.icon ?? "•"}
              </span>
              <h3 className="font-medium leading-snug text-raot-800">
                <span className="text-[var(--ink-muted)]">กลุ่มที่ {g.code}</span>
                <br />
                {g.name}
              </h3>
              <span className="ml-auto shrink-0 rounded-full bg-raot-50 px-2.5 py-1 text-[11.5px] tabular-nums text-raot-700">
                {g.stakeholders} ราย
              </span>
            </header>

            <p className="text-[12.5px] leading-relaxed text-[var(--ink)]">{g.definition}</p>

            {g.subgroups.length > 0 && (
              <dl className="mt-3 space-y-2.5 border-t border-[var(--line)] pt-3">
                {g.subgroups.map((sub) => (
                  <div key={sub.id}>
                    <dt className="flex items-baseline gap-2 text-[12px] font-medium text-raot-700">
                      <span className="tabular-nums text-[var(--ink-muted)]">{sub.code}</span>
                      <span>{sub.name}</span>
                      <span className="ml-auto shrink-0 tabular-nums text-[11.5px] font-normal text-[var(--ink-muted)]">
                        {sub.stakeholders} ราย
                      </span>
                    </dt>
                    {sub.definition && (
                      <dd className="mt-0.5 border-l-2 border-raot-200 pl-2.5 text-[11.5px] leading-relaxed text-[var(--ink-muted)]">
                        {sub.definition}
                      </dd>
                    )}
                  </div>
                ))}
              </dl>
            )}

            <div className="mt-3 flex items-baseline gap-4 border-t border-[var(--line)] pt-3 text-[12px]">
              <span className="text-[var(--ink-muted)]">
                ประเด็นความต้องการ <b className="tabular-nums text-[var(--ink)]">{g.issues}</b> ประเด็น
              </span>
              <Link
                href={`/profile?group=${g.id}`}
                className="ml-auto text-raot-600 underline underline-offset-2 hover:text-raot-500"
              >
                ดูรายชื่อในกลุ่มนี้ →
              </Link>
            </div>
          </article>
        ))}
      </div>
    </SectionCard>
  );
}
