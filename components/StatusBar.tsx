"use client";

import { STATUS_LABEL, type DocStatus } from "@/lib/masters";

export default function StatusBar({
  status,
  canApprove,
  saving,
  onApprove,
  onSaveDraft,
  onCancel,
}: {
  status: string | null;
  canApprove: boolean;
  saving?: boolean;
  onApprove: () => void;
  onSaveDraft: () => void;
  onCancel: () => void;
}) {
  const label = status && status in STATUS_LABEL ? STATUS_LABEL[status as DocStatus] : "-";
  return (
    <div className="no-print mt-8 border-t border-[var(--line)] pt-4">
      <div className="mb-3 text-right text-[var(--ink-muted)]">
        Status : <span className="text-raot-700">{label}</span>
      </div>
      <div className="flex flex-wrap justify-end gap-2">
        <button
          type="button"
          className="btn btn-primary"
          disabled={!canApprove || saving}
          onClick={onApprove}
          title={canApprove ? undefined : "เฉพาะผู้อนุมัติเท่านั้น"}
        >
          APPROVE
        </button>
        <button type="button" className="btn btn-secondary" disabled={saving} onClick={onSaveDraft}>
          SAVE AS DRAFT
        </button>
        <button type="button" className="btn btn-ghost" disabled={saving} onClick={onCancel}>
          CANCEL
        </button>
      </div>
    </div>
  );
}
