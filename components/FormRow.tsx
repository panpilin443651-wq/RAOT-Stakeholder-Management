/** แถวของฟอร์ม: ป้ายชื่อชิดขวา + ช่องกรอกชิดซ้าย (โครงเดียวกับระบบต้นแบบ) */
export default function FormRow({
  label,
  required,
  hint,
  children,
  labelWidth = "260px",
}: {
  label: React.ReactNode;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
  labelWidth?: string;
}) {
  return (
    <div
      className="grid grid-cols-1 gap-x-5 gap-y-1 sm:grid-cols-[var(--lw)_1fr]"
      style={{ ["--lw" as string]: labelWidth }}
    >
      <div className={`field-label ${required ? "field-required" : ""}`}>
        {label}
        {hint && <div className="text-[11px] font-normal text-[var(--ink-muted)]">{hint}</div>}
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
