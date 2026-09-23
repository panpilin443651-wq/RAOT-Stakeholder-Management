import { STATUS_LABEL, type DocStatus } from "@/lib/masters";

export default function StatusPill({ status }: { status: string | null }) {
  if (!status) return <span className="text-[var(--ink-muted)]">-</span>;
  const approved = status === "APPROVED";
  const label = status in STATUS_LABEL ? STATUS_LABEL[status as DocStatus] : status;
  return (
    <span
      className={`inline-block rounded px-2 py-0.5 text-[12px] ${
        approved ? "bg-raot-100 text-raot-800" : "bg-amber-100 text-amber-800"
      }`}
    >
      {label}
    </span>
  );
}
