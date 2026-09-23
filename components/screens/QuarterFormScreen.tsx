import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { canApprove, canEditOrgUnit } from "@/lib/masters";
import QuarterResultForm from "@/components/QuarterResultForm";
import { isQuarter } from "@/lib/fiscal";
import { getPlan, getQuarterResult, previousQuartersSummary } from "@/lib/queries";

export default async function QuarterFormScreen({
  scope,
  params,
}: {
  scope: "ORG" | "UNIT";
  params: Promise<{ q: string; planId: string }>;
}) {
  const user = await requireUser();
  const { q, planId } = await params;
  const quarter = Number(q);
  if (!isQuarter(quarter)) notFound();

  const plan = getPlan(Number(planId));
  if (!plan || plan.scope !== scope) notFound();
  // ผลไตรมาสเป็นของส่วนงานเดียวกับแผนงานแม่
  if (!canEditOrgUnit(user, plan.org_unit_id)) notFound();

  return (
    <QuarterResultForm
      scope={scope}
      quarter={quarter}
      plan={plan}
      record={getQuarterResult(plan.id, quarter) ?? null}
      previousSummary={previousQuartersSummary(plan.id, quarter)}
      canApprove={canApprove(user.role)}
    />
  );
}
