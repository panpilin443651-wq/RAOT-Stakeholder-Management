import Link from "next/link";

/* ================================================================
   ชิ้นส่วนกราฟสำหรับหน้าสรุปผล
   - แท่งบาง ปลายมน ยึดกับเส้นฐาน
   - มีช่องว่าง 2px ระหว่างแท่งที่ติดกัน
   - ทุกแท่งมีป้ายค่ากำกับ จึงไม่ต้องอาศัยสีเพียงอย่างเดียว
   - แสดง tooltip เมื่อชี้ (ทำด้วย CSS ล้วน ไม่ต้องใช้ JavaScript)
   ================================================================ */

const INK = "text-[var(--ink)]";
const MUTED = "text-[var(--ink-muted)]";

export function SectionCard({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded border border-[var(--line)] bg-white px-5 py-4">
      <header className="mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 className="font-medium text-raot-800">{title}</h2>
        {subtitle && <p className={`text-[12px] ${MUTED}`}>{subtitle}</p>}
        {action && <div className="ml-auto text-[12px]">{action}</div>}
      </header>
      {children}
    </section>
  );
}

/** ตัวเลขพาดหัว ใช้เมื่อข้อมูลมีค่าเดียวที่ต้องการเน้น */
export function StatTile({
  label,
  value,
  unit,
  caption,
  href,
  tone = "default",
}: {
  label: string;
  value: string | number;
  unit?: string;
  caption?: string;
  href?: string;
  tone?: "default" | "good" | "warn" | "bad";
}) {
  const toneRing =
    tone === "good"
      ? "border-l-4 border-l-[#3a9d5d]"
      : tone === "warn"
        ? "border-l-4 border-l-[#e5b52c]"
        : tone === "bad"
          ? "border-l-4 border-l-[#9e1b32]"
          : "border-l-4 border-l-raot-500";

  const body = (
    <>
      <div className={`text-[12px] leading-snug ${MUTED}`}>{label}</div>
      <div className="mt-1 text-raot-800">
        <span className="text-[28px] font-semibold leading-none">{value}</span>
        {unit && <span className={`ml-1.5 text-[13px] ${MUTED}`}>{unit}</span>}
      </div>
      {caption && <div className={`mt-1.5 text-[11px] leading-snug ${MUTED}`}>{caption}</div>}
    </>
  );

  const className = `block rounded border border-[var(--line)] bg-white px-4 py-3.5 ${toneRing} ${
    href ? "transition hover:border-raot-400 hover:shadow-sm" : ""
  }`;

  return href ? (
    <Link href={href} className={className}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}

/** แถบแท่งแนวนอนชุดเดียว (ใช้กับข้อมูลเชิงปริมาณที่มีชุดเดียว) */
export function BarList({
  items,
  unit = "",
  color = "#15803d",
}: {
  items: { label: string; value: number; caption?: string; href?: string }[];
  unit?: string;
  color?: string;
}) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <ul className="space-y-2.5">
      {items.map((item) => {
        const width = (item.value / max) * 100;
        const row = (
          <div className="group grid grid-cols-[minmax(0,11rem)_1fr_3.2rem] items-center gap-3">
            <span className={`truncate text-[12.5px] ${INK}`} title={item.label}>
              {item.label}
            </span>
            <span className="relative block h-3 rounded-sm bg-[#eef1ef]">
              <span
                className="absolute inset-y-0 left-0 rounded-sm"
                style={{ width: `${width}%`, background: color, minWidth: item.value > 0 ? "3px" : 0 }}
              />
              {item.caption && (
                <span className="pointer-events-none absolute -top-8 left-2 z-10 hidden whitespace-nowrap rounded bg-[#1f2937] px-2 py-1 text-[11px] text-white shadow group-hover:block">
                  {item.caption}
                </span>
              )}
            </span>
            <span className={`text-right text-[12.5px] tabular-nums ${INK}`}>
              {item.value.toLocaleString("th-TH")}
              {unit && <span className={`ml-0.5 text-[11px] ${MUTED}`}>{unit}</span>}
            </span>
          </div>
        );
        return (
          <li key={item.label}>
            {item.href ? (
              <Link href={item.href} className="block rounded hover:bg-raot-50">
                {row}
              </Link>
            ) : (
              row
            )}
          </li>
        );
      })}
    </ul>
  );
}

export type Segment = { label: string; value: number; color: string };

/** แท่งสัดส่วนแบบซ้อน 1 แถว พร้อมคำอธิบายและจำนวนกำกับทุกส่วน */
export function StackedBar({ segments, unit = "" }: { segments: Segment[]; unit?: string }) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  if (total === 0) {
    return <p className={`text-[12.5px] ${MUTED}`}>ยังไม่มีข้อมูล</p>;
  }
  return (
    <div>
      <div className="flex h-5 w-full gap-[2px] overflow-hidden rounded-sm">
        {segments
          .filter((s) => s.value > 0)
          .map((s) => (
            <span
              key={s.label}
              className="group relative block first:rounded-l-sm last:rounded-r-sm"
              style={{ width: `${(s.value / total) * 100}%`, background: s.color }}
              title={`${s.label} ${s.value} ${unit} (${Math.round((s.value / total) * 100)}%)`}
            >
              <span className="pointer-events-none absolute -top-8 left-0 z-10 hidden whitespace-nowrap rounded bg-[#1f2937] px-2 py-1 text-[11px] text-white shadow group-hover:block">
                {s.label} · {s.value} {unit} ({Math.round((s.value / total) * 100)}%)
              </span>
            </span>
          ))}
      </div>

      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-[12px]">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-[2px]" style={{ background: s.color }} />
            <span className={INK}>{s.label}</span>
            <span className={`tabular-nums ${MUTED}`}>
              {s.value} {unit}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
