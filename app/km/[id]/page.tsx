import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { isAdmin } from "@/lib/masters";
import FormCard from "@/components/FormCard";
import Markdown from "@/components/Markdown";
import { getKmArticle, listKmCategories } from "@/lib/queries";
import KmArticleClient from "./KmArticleClient";

export default async function KmArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;

  const article = Number.isInteger(Number(id)) ? await getKmArticle(Number(id)) : undefined;
  if (!article) notFound();

  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" });

  return (
    <FormCard
      title={article.title}
      actions={
        <Link href="/km" className="text-[13px] text-raot-600 underline underline-offset-2">
          ← กลับไปรายการองค์ความรู้
        </Link>
      }
    >
      <div className="mb-5 flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-[var(--line)] pb-4 text-[12px] text-[var(--ink-muted)]">
        {article.category && (
          <span className="rounded-full bg-raot-100 px-2.5 py-0.5 text-[11.5px] text-raot-700">
            {article.category}
          </span>
        )}
        <span>บันทึกเมื่อ {fmt(article.created_at)} โดย {article.created_by ?? "-"}</span>
        {article.updated_at !== article.created_at && (
          <span>· แก้ไขล่าสุด {fmt(article.updated_at)} โดย {article.updated_by ?? "-"}</span>
        )}
      </div>

      {article.summary && (
        <p className="mb-5 border-l-2 border-raot-300 pl-3 text-[13px] leading-relaxed text-[var(--ink-muted)]">
          {article.summary}
        </p>
      )}

      <Markdown source={article.body} />

      {isAdmin(user.role) && (
        <div className="mt-8 border-t border-[var(--line)] pt-4">
          <KmArticleClient article={article} categories={await listKmCategories()} />
        </div>
      )}
    </FormCard>
  );
}
