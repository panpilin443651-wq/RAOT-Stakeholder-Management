"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import type { MenuItem } from "@/lib/masters";

export default function NavDropdown({ label, items }: { label: string; items: MenuItem[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const active = items.some((item) => pathname.startsWith(item.href.split("?")[0]));

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={`rounded px-3 py-2 hover:bg-white/15 ${open || active ? "bg-white/20" : ""}`}
      >
        {label} <span className="ml-0.5 text-[9px]">▼</span>
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-1 w-[min(640px,calc(100vw-2rem))] rounded border border-[var(--line)] bg-white py-2 text-[13px] shadow-xl">
          {items.map((item, index) => (
            <div key={item.href}>
              {index > 0 &&
                (item.code?.length ?? 0) !== (items[index - 1].code?.length ?? 0) && (
                  <div className="my-1.5 border-t border-[var(--line)]" />
                )}
              <Link
                href={item.href}
                className="block px-4 py-1.5 text-raot-800 hover:bg-raot-50 hover:text-raot-600"
              >
                {item.code && <span className="text-[var(--ink-muted)]">[{item.code}]</span>}{" "}
                {item.label}
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
