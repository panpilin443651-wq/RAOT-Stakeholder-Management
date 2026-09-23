import { requireUser } from "@/lib/auth";
import { isAdmin } from "@/lib/masters";
import FormCard from "@/components/FormCard";
import { listKmArticles, listKmCategories } from "@/lib/queries";
import KmListClient from "./KmListClient";

export default async function KmListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const q = params.q ?? "";
  const category = params.category ?? "";

  return (
    <FormCard title="องค์ความรู้การบริหารจัดการผู้มีส่วนได้ส่วนเสีย">
      <KmListClient
        rows={listKmArticles({ q, category })}
        categories={listKmCategories()}
        q={q}
        category={category}
        canManage={isAdmin(user.role)}
      />
    </FormCard>
  );
}
