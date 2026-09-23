"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export type FilterField = {
  name: string;
  label: string;
  options: { value: string; label: string }[];
  value: string;
};

export default function FilterBar({
  fields,
  searchValue,
  searchPlaceholder,
}: {
  fields: FilterField[];
  searchValue?: string;
  searchPlaceholder?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchValue ?? "");

  function apply(next: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    router.push(`?${params.toString()}`);
  }

  return (
    <form
      className="flex flex-wrap items-end gap-x-4 gap-y-3 rounded border border-[var(--line)] bg-raot-50/60 px-4 py-3"
      onSubmit={(e) => {
        e.preventDefault();
        apply({ q });
      }}
    >
      {fields.map((field) => (
        <label key={field.name} className="flex flex-col gap-1 text-[12px] text-raot-800">
          {field.label}
          <select
            className="form-select w-56"
            value={field.value}
            onChange={(e) => apply({ [field.name]: e.target.value })}
          >
            <option value="">-- ทั้งหมด --</option>
            {field.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      ))}

      {searchPlaceholder && (
        <label className="flex flex-col gap-1 text-[12px] text-raot-800">
          ค้นหา
          <input
            className="form-input w-64"
            value={q}
            placeholder={searchPlaceholder}
            onChange={(e) => setQ(e.target.value)}
          />
        </label>
      )}

      <button type="submit" className="btn btn-primary">
        ค้นหา
      </button>
    </form>
  );
}
