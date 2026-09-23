"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Item = {
  username: string;
  full_name: string;
  position: string | null;
  role_label: string;
  org_unit_name: string;
};

export default function LoginList({ users }: { users: Item[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function login(username: string) {
    setBusy(username);
    await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username }),
    });
    router.push("/");
    router.refresh();
  }

  return (
    <ul className="space-y-2">
      {users.map((u) => (
        <li key={u.username}>
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => login(u.username)}
            className="flex w-full flex-wrap items-center gap-x-4 gap-y-1 rounded border border-[var(--line)] px-4 py-3 text-left transition hover:border-raot-400 hover:bg-raot-50 disabled:opacity-60"
          >
            <span className="font-medium text-raot-800">{u.full_name}</span>
            <span className="text-[var(--ink-muted)]">{u.position}</span>
            <span className="rounded bg-raot-100 px-2 py-0.5 text-[12px] text-raot-700">{u.role_label}</span>
            <span className="ml-auto text-[12px] text-[var(--ink-muted)]">{u.org_unit_name}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
