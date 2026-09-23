import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { isUnitScoped, scopedOrgUnitId, selectableUnits } from "@/lib/masters";
import FormCard from "@/components/FormCard";
import UnitScopeNote from "@/components/UnitScopeNote";
import FilterBar from "@/components/FilterBar";
import ReportTable from "@/components/ReportTable";
import { buildReport, isReportCode } from "@/lib/reports";
import { listFiscalYears, listOrgUnits, currentFiscalYearRow } from "@/lib/queries";

export default async function ReportPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const user = await requireUser();
  const { code } = await params;
  if (!isReportCode(code)) notFound();

  const query = await searchParams;
  const fiscalYearId = Number(query.fy) || (await currentFiscalYearRow()).id;
  const orgUnitId = scopedOrgUnitId(user) ?? (Number(query.unit) || undefined);
  const status = query.status || undefined;

  const report = await buildReport(code, { fiscalYearId, orgUnitId, status });
  const csvHref = `/api/reports/${code}?${new URLSearchParams({
    fy: String(fiscalYearId),
    ...(orgUnitId ? { unit: String(orgUnitId) } : {}),
    ...(status ? { status } : {}),
  }).toString()}`;

  return (
    <FormCard title={report.title} code={code}>
      {isUnitScoped(user.role) && <UnitScopeNote unitName={user.org_unit_name} />}

      <FilterBar
        fields={[
          {
            name: "fy",
            label: "ปีงบประมาณ",
            options: (await listFiscalYears()).map((y) => ({ value: String(y.id), label: String(y.year) })),
            value: String(fiscalYearId),
          },
          ...(isUnitScoped(user.role)
            ? []
            : [
                {
                  name: "unit",
                  label: "ส่วนงาน",
                  options: selectableUnits(user, await listOrgUnits()).map((u) => ({ value: String(u.id), label: u.name })),
                  value: query.unit ?? "",
                },
              ]),
          {
            name: "status",
            label: "สถานะ",
            options: [
              { value: "DRAFT", label: "ฉบับร่าง" },
              { value: "APPROVED", label: "อนุมัติแล้ว" },
            ],
            value: query.status ?? "",
          },
        ]}
      />

      <ReportTable report={report} csvHref={csvHref} />
    </FormCard>
  );
}
