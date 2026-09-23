"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ROLE_LABEL } from "@/lib/masters";
import type { SessionUser } from "@/lib/auth";

export default function UserMenu({ user }: { user: SessionUser | null }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`rounded px-3 py-2 hover:bg-white/15 ${open ? "bg-white/20" : ""}`}
      >
        👤 [{user ? user.username : ""}] <span className="ml-0.5 text-[9px]">▼</span>
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-1 w-64 rounded border border-[var(--line)] bg-white py-2 text-[13px] shadow-xl">
          {user ? (
            <>
              <div className="px-4 py-2 leading-relaxed">
                <div className="font-medium text-raot-800">{user.full_name}</div>
                <div className="text-[var(--ink-muted)]">{user.position}</div>
                <div className="text-[var(--ink-muted)]">{user.org_unit_name}</div>
                <div className="mt-1 inline-block rounded bg-raot-100 px-2 py-0.5 text-raot-700">
                  {ROLE_LABEL[user.role]}
                </div>
              </div>
              <div className="my-1 border-t border-[var(--line)]" />
              <button
                type="button"
                onClick={logout}
                className="block w-full px-4 py-1.5 text-left text-raot-800 hover:bg-raot-50"
              >
                ออกจากระบบ
              </button>
            </>
          ) : (
            <a href="/login" className="block px-4 py-1.5 text-raot-800 hover:bg-raot-50">
              เข้าสู่ระบบ
            </a>
          )}
        </div>
      )}
    </div>
  );
}
