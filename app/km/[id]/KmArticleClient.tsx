"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import KmEditor from "@/components/KmEditor";
import type { KmArticle } from "@/lib/queries";

export default function KmArticleClient({
  article,
  categories,
}: {
  article: KmArticle;
  categories: string[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function remove() {
    if (!confirm(`ลบองค์ความรู้ "${article.title}" ออกจากระบบ?`)) return;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/km/${article.id}`, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.error ?? "ลบไม่สำเร็จ");
        return;
      }
      router.push("/km");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  if (editing) {
    return <KmEditor record={article} categories={categories} onClose={() => setEditing(false)} />;
  }

  return (
    <div className="no-print flex flex-wrap gap-2">
      <button type="button" className="btn btn-secondary" disabled={busy} onClick={() => setEditing(true)}>
        แก้ไข
      </button>
      <button type="button" className="btn btn-ghost" disabled={busy} onClick={remove}>
        ลบ
      </button>
      {error && (
        <p className="w-full rounded border border-[#e8a1a1] bg-[#fdf3f3] px-4 py-2.5 text-[13px] text-[#9e1b32]">
          {error}
        </p>
      )}
    </div>
  );
}
