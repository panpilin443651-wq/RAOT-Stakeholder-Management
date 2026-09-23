"use client";

import FormRow from "./FormRow";

/** ช่องทางการติดต่อ (โทร. / อีเมล์ / Line) + หมายเหตุ — ใช้ซ้ำทั้งผู้ประสานงานและผู้มีอำนาจตัดสินใจ */
export default function ContactFields({
  phone,
  email,
  line,
  note,
  onChange,
}: {
  phone: string;
  email: string;
  line: string;
  note: string;
  onChange: (field: "phone" | "email" | "line" | "note", value: string) => void;
}) {
  return (
    <>
      <FormRow label="ช่องทางการติดต่อ :">
        <div className="grid gap-3 sm:grid-cols-3">
          <Prefixed label="โทร." value={phone} onChange={(v) => onChange("phone", v)} />
          <Prefixed label="อีเมล์" value={email} onChange={(v) => onChange("email", v)} />
          <Prefixed label="Line" value={line} onChange={(v) => onChange("line", v)} />
        </div>
      </FormRow>

      <FormRow label="หมายเหตุ :">
        <textarea className="form-textarea" value={note} onChange={(e) => onChange("note", e.target.value)} />
      </FormRow>
    </>
  );
}

function Prefixed({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex">
      <span className="input-prefix">{label}</span>
      <input className="form-input" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
