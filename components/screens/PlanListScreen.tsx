import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { isUnitScoped, scopedOrgUnitId, selectableUnits } from "@/lib/masters";
import FormCard from "@/components/FormCard";
import UnitScopeNote from "@/components/UnitScopeNote";
import FilterBar from "@/components/FilterBar";
import StatusPill from "@/components/StatusPill";
import { RISK_LEVEL_COLOR, type RiskLevel } from "@/lib/scoring";
import { listPlans, listFiscalYears, listOrgUnits, currentFiscalYearRow } from "@/lib/queries";

export default async function PlanListScreen({
  scope,
  searchParams,
}: {
  scope: "ORG" | "UNIT";
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const fiscalYearId = Number(params.fy) || currentFiscalYearRow().id;
  const basePath = scope === "ORG" ? "/organization/plans" : "/cluster/plans";
  const code = scope === "ORG" ? "040" : "050";

  const lockedUnitId = scopedOrgUnitId(user);
  const rows = listPlans(scope, {
    fiscalYearId,
    orgUnitId: lockedUnitId ?? (Number(params.unit) || undefined),
  });

  return (
    <FormCard
      title={`ทะเบียนแผนงาน/โครงการ ${scope === "ORG" ? "ระดับองค์กร" : "ระดับส่วนงาน"}`}
      code={code}
      actions={
        <Link href={`${basePath}/new?fy=${fiscalYearId}`} className="btn btn-primary">
          + บันทึกแผนงานใหม่
        </Link>
      }
    >
      {isUnitScoped(user.role) && <UnitScopeNote unitName={user.org_unit_name} />}

      <FilterBar
        fields={[
          {
            name: "fy",
            label: "ปีงบประมาณ",
            options: listFiscalYears().map((y) => ({ value: String(y.id), label: String(y.year) })),
            value: String(fiscalYearId),
          },
          ...(scope === "UNIT" && !lockedUnitId
            ? [
                {
                  name: "unit",
                  label: "ส่วนงาน",
                  options: selectableUnits(user, listOrgUnits()).map((u) => ({ value: String(u.id), label: u.name })),
                  value: params.unit ?? "",
                },
              ]
            : []),
        ]}
      />

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[960px] border-collapse text-[13px]">
          <thead>
            <tr className="bg-raot-700 text-white">
              <Th className="w-12">ลำดับ</Th>
              <Th>ชื่อแผนงาน/โครงการ</Th>
              <Th className="w-52">ส่วนงาน</Th>
              <Th className="w-52">ผู้มีส่วนได้ส่วนเสีย</Th>
              <Th className="w-40 text-center">ระดับความเสี่ยง</Th>
              <Th className="w-44 text-center">ผลไตรมาส</Th>
              <Th className="w-28 text-center">สถานะ</Th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="border border-[var(--line)] px-3 py-8 text-center text-[var(--ink-muted)]">
                  ยังไม่มีแผนงาน/โครงการในปีงบประมาณที่เลือก
                </td>
              </tr>
            )}
            {rows.map((row, index) => (
              <tr key={row.id} className="odd:bg-white even:bg-raot-50/40 hover:bg-raot-100/60">
                <Td className="text-center">{index + 1}</Td>
                <Td>
                  <Link href={`${basePath}/${row.id}`} className="text-raot-700 underline underline-offset-2 hover:text-raot-500">
                    {row.name}
                  </Link>
                </Td>
                <Td>{row.org_unit_name}</Td>
                <Td>{row.stakeholder_name ?? "-"}</Td>
                <Td className="text-center">
                  {row.risk_level ? (
                    <span className={`rounded px-2 py-0.5 ${RISK_LEVEL_COLOR[row.risk_level as RiskLevel] ?? ""}`}>
                      {row.risk_level}
                    </span>
                  ) : (
                    "-"
                  )}
                </Td>
                <Td className="text-center">
                  <div className="flex justify-center gap-1">
                    {[1, 2, 3, 4].map((q) => (
                      <Link
                        key={q}
                        href={`${scope === "ORG" ? "/organization" : "/cluster"}/results/${q}/${row.id}`}
                        className="rounded border border-raot-300 px-2 py-0.5 text-raot-700 hover:bg-raot-100"
                      >
                        Q{q}
                      </Link>
                    ))}
                  </div>
                </Td>
                <Td className="text-center">
                  <StatusPill status={row.status} />
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-[12px] text-[var(--ink-muted)]">รวม {rows.length} รายการ</p>
    </FormCard>
  );
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <th className={`border border-raot-800 px-3 py-2 text-left font-medium ${className}`}>{children}</th>;
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`border border-[var(--line)] px-3 py-2 align-top ${className}`}>{children}</td>;
}
