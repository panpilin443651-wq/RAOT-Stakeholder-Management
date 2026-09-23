"use client";

/** คู่ช่อง Output / Outcome ที่ปรากฏซ้ำหลายจุดในฟอร์มแผนงานและฟอร์มผลการดำเนินงาน */
export default function OutputOutcome({
  output,
  outcome,
  onOutput,
  onOutcome,
  readOnly,
}: {
  output: string;
  outcome: string;
  onOutput?: (value: string) => void;
  onOutcome?: (value: string) => void;
  readOnly?: boolean;
}) {
  return (
    <div className="space-y-2">
      <div className="flex">
        <span className="input-prefix">Output</span>
        <input
          className="form-input"
          value={output}
          readOnly={readOnly}
          onChange={(e) => onOutput?.(e.target.value)}
        />
      </div>
      <div className="flex">
        <span className="input-prefix">Outcome</span>
        <input
          className="form-input"
          value={outcome}
          readOnly={readOnly}
          onChange={(e) => onOutcome?.(e.target.value)}
        />
      </div>
    </div>
  );
}
