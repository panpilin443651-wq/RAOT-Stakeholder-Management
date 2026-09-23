"use client";

export type ScaleOption = { value: number; label: string };

export default function RadioScale({
  name,
  value,
  onChange,
  options,
  disabled,
}: {
  name: string;
  value: number | null;
  onChange?: (value: number) => void;
  options: ScaleOption[];
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-8 gap-y-2 pt-1.5">
      {options.map((opt) => (
        <label key={opt.value} className="flex cursor-pointer items-center gap-1.5">
          <input
            type="radio"
            name={name}
            value={opt.value}
            checked={value === opt.value}
            disabled={disabled}
            onChange={() => onChange?.(opt.value)}
            className="h-4 w-4 accent-raot-600"
          />
          <span>{opt.label}</span>
        </label>
      ))}
    </div>
  );
}

export const SCALE_3: ScaleOption[] = [
  { value: 1, label: "น้อย (1)" },
  { value: 2, label: "กลาง (2)" },
  { value: 3, label: "มาก (3)" },
];

export const SCALE_4: ScaleOption[] = [1, 2, 3, 4].map((v) => ({ value: v, label: String(v) }));
export const SCALE_5: ScaleOption[] = [1, 2, 3, 4, 5].map((v) => ({ value: v, label: String(v) }));
