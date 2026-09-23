import { BAND_STYLE, type Band } from "@/lib/scoring";

/**
 * ป้ายสีตามแผนผังการจัดลำดับของประเด็นความต้องการ ความคาดหวัง
 * และความกังวลของผู้มีส่วนได้ส่วนเสีย (เขียว / เหลือง / ส้ม / แดง)
 */
export default function BandBadge({
  band,
  children,
  title,
  className = "",
}: {
  band: Band | null;
  children: React.ReactNode;
  title?: string;
  className?: string;
}) {
  if (!band) return <span className="text-[var(--ink-muted)]">-</span>;
  const style = BAND_STYLE[band];
  return (
    <span
      title={title ?? `ระดับ${style.label}`}
      className={`inline-block rounded px-2.5 py-1 text-[12px] leading-tight ${className}`}
      style={{ background: style.bg, color: style.fg, border: `1px solid ${style.border}` }}
    >
      {children}
    </span>
  );
}

/** คำอธิบายแถบสีทั้ง 4 ระดับ */
export function BandLegend({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] ${className}`}>
      <span className="text-[var(--ink-muted)]">ระดับความสำคัญ :</span>
      {(["LOW", "MEDIUM", "HIGH", "CRITICAL"] as Band[]).map((band) => (
        <span key={band} className="inline-flex items-center gap-1.5">
          <span
            className="inline-block h-3 w-3 rounded-sm"
            style={{ background: BAND_STYLE[band].bg, border: `1px solid ${BAND_STYLE[band].border}` }}
          />
          {BAND_STYLE[band].label}
        </span>
      ))}
    </div>
  );
}
