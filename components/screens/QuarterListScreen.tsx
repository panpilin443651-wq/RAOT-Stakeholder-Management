import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { isUnitScoped, scopedOrgUnitId } from "@/lib/masters";
import FormCard from "@/components/FormCard";
import UnitScopeNote from "@/components/UnitScopeNote";
import FiscalYearPicker from "@/components/FiscalYearPicker";
import StatusPill from "@/components/StatusPill";
import { fiscalMonths, isQuarter } from "@/lib/fiscal";
import { listPlans, listQuarterResults, listFiscalYears, currentFiscalYearRow } from "@/lib/queries";

export default async function QuarterListScreen({
  scope,
  params,
  searchParams,
}: {
  scope: "ORG" | "UNIT";
  params: Promise<{ q: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const user = await requireUser();
  const { q } = await params;
  const query = await searchParams;
  const quarter = Number(q);
  if (!isQuarter(quarter)) notFound();

  const code = `0${scope === "ORG" ? "4" : "5"}1${quarter}`;
  const base = scope === "ORG" ? "/organization" : "/cluster";
  const years = listFiscalYears();
  const fiscalYearId = years.find((y) => y.id === Number(query.fy))?.id ?? currentFiscalYearRow().id;
  const plans = listPlans(scope, { fiscalYearId, orgUnitId: scopedOrgUnitId(user) });

  return (
    <FormCard
      title={`บันทึกผลการดำเนินงานตามแผนงาน/โครงการ - ไตรมาส ${quarter}`}
      code={code}
      actions={<FiscalYearPicker years={years} value={fiscalYearId} />}
    >
      {isUnitScoped(user.role) && <UnitScopeNote unitName={user.org_unit_name} />}

      <p className="mb-4 text-[var(--ink-muted)]">
        เดือนในไตรมาสที่ {quarter}: {fiscalMonths(quarter).join(" / ")} — เลือกแผนงาน/โครงการที่ต้องการบันทึกผล
      </p>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] border-collapse text-[13px]">
          <thead>
            <tr className="bg-raot-700 text-white">
              <Th className="w-12">ลำดับ</Th>
              <Th>ชื่อแผนงาน/โครงการ</Th>
              <Th className="w-52">ส่วนงาน</Th>
              <Th>เป้าหมายไตรมาสที่ {quarter}</Th>
              <Th className="w-28 text-center">สถานะผล</Th>
            </tr>
          </thead>
          <tbody>
            {plans.length === 0 && (
              <tr>
                <td colSpan={5} className="border border-[var(--line)] px-3 py-8 text-center text-[var(--ink-muted)]">
                  ยังไม่มีแผนงาน/โครงการในปีงบประมาณที่เลือก
                </td>
              </tr>
            )}
            {plans.map((plan, index) => {
              const result = listQuarterResults(plan.id).find((r) => r.quarter === quarter);
              return (
                <tr key={plan.id} className="odd:bg-white even:bg-raot-50/40 hover:bg-raot-100/60">
                  <Td className="text-center">{index + 1}</Td>
                  <Td>
                    <Link
                      href={`${base}/results/${quarter}/${plan.id}`}
                      className="text-raot-700 underline underline-offset-2 hover:text-raot-500"
                    >
                      {plan.name}
                    </Link>
                  </Td>
                  <Td>{plan.org_unit_name}</Td>
                  <Td>{plan[`goal_q${quarter}` as const] ?? "-"}</Td>
                  <Td className="text-center">
                    {result ? <StatusPill status={result.status} /> : <span className="text-[var(--ink-muted)]">ยังไม่บันทึก</span>}
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </FormCard>
  );
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <th className={`border border-raot-800 px-3 py-2 text-left font-medium ${className}`}>{children}</th>;
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`border border-[var(--line)] px-3 py-2 align-top ${className}`}>{children}</td>;
}
