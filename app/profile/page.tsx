import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { isUnitScoped, scopedOrgUnitId, selectableUnits } from "@/lib/masters";
import FormCard from "@/components/FormCard";
import UnitScopeNote from "@/components/UnitScopeNote";
import FilterBar from "@/components/FilterBar";
import StatusPill from "@/components/StatusPill";
import BandBadge, { BandLegend } from "@/components/BandBadge";
import { ZONE_LABELS, zoneBand, issueBand, type Score4 } from "@/lib/scoring";
import {
  listStakeholders,
  issuesByStakeholder,
  listFiscalYears,
  listOrgUnits,
  listGroups,
  currentFiscalYearRow,
} from "@/lib/queries";

export default async function ProfileListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const years = listFiscalYears();
  const units = selectableUnits(user, listOrgUnits());
  const groups = listGroups(1);
  const fiscalYearId = Number(params.fy) || currentFiscalYearRow().id;

  // ผู้บันทึกข้อมูลถูกล็อกไว้ที่ส่วนงานตัวเอง ตัวกรองส่วนงานจาก URL จึงใช้ไม่ได้
  const lockedUnitId = scopedOrgUnitId(user);

  const rows = listStakeholders({
    fiscalYearId,
    orgUnitId: lockedUnitId ?? (Number(params.unit) || undefined),
    groupL1Id: Number(params.group) || undefined,
    q: params.q || undefined,
  }).filter((row) => (params.zone ? row.zone === Number(params.zone) : true));

  const issues = issuesByStakeholder(rows.map((row) => row.id));

  return (
    <FormCard
      title="ทะเบียนข้อมูล Stakeholder's Profile"
      code="100"
      actions={
        <Link href={`/profile/new?fy=${fiscalYearId}`} className="btn btn-primary">
          + บันทึกข้อมูลใหม่
        </Link>
      }
    >
      {isUnitScoped(user.role) && <UnitScopeNote unitName={user.org_unit_name} />}

      <FilterBar
        fields={[
          { name: "fy", label: "ปีงบประมาณ", options: years.map((y) => ({ value: String(y.id), label: String(y.year) })), value: String(fiscalYearId) },
          ...(lockedUnitId
            ? []
            : [{ name: "unit", label: "ส่วนงาน", options: units.map((u) => ({ value: String(u.id), label: u.name })), value: params.unit ?? "" }]),
          { name: "group", label: "กลุ่ม Stakeholder", options: groups.map((g) => ({ value: String(g.id), label: `${g.code} ${g.name}` })), value: params.group ?? "" },
        ]}
        searchValue={params.q ?? ""}
        searchPlaceholder="ค้นหาชื่อ Stakeholder"
      />

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[1000px] border-collapse text-[13px]">
          <thead>
            <tr className="bg-raot-700 text-white">
              <Th className="w-12">ลำดับ</Th>
              <Th className="w-56">ชื่อ Stakeholder</Th>
              <Th className="w-48">กลุ่ม</Th>
              <Th className="w-48">ส่วนงานที่รับผิดชอบ</Th>
              <Th>ประเด็นความต้องการ</Th>
              <Th className="w-24 text-center">Zone</Th>
              <Th className="w-28 text-center">สถานะ</Th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="border border-[var(--line)] px-3 py-8 text-center text-[var(--ink-muted)]">
                  ไม่พบข้อมูลตามเงื่อนไขที่เลือก
                </td>
              </tr>
            )}
            {rows.map((row, index) => {
              const rowIssues = issues.get(row.id) ?? [];
              return (
                <tr key={row.id} className="odd:bg-white even:bg-raot-50/40 hover:bg-raot-100/60">
                  <Td className="text-center">{index + 1}</Td>
                  <Td>
                    <Link href={`/profile/${row.id}`} className="text-raot-700 underline underline-offset-2 hover:text-raot-500">
                      {row.name}
                    </Link>
                  </Td>
                  <Td>{row.group_name ?? "-"}</Td>
                  <Td>{row.org_unit_name}</Td>
                  <Td>
                    {rowIssues.length === 0 ? (
                      <span className="text-[var(--ink-muted)]">ยังไม่ระบุประเด็น</span>
                    ) : (
                      <ol className="space-y-1.5">
                        {rowIssues.map((issue) => (
                          <li key={issue.id} className="flex flex-wrap items-start gap-2">
                            <BandBadge
                              band={issueBand(issue.impact_org, issue.impact_stakeholder)}
                              title={`ความสำคัญต่อองค์กร ${issue.impact_org ?? "-"} / ต่อผู้มีส่วนได้ส่วนเสีย ${issue.impact_stakeholder ?? "-"}`}
                              className="shrink-0"
                            >
                              {issue.seq}
                            </BandBadge>
                            <span className="min-w-0 flex-1">{issue.title ?? "-"}</span>
                          </li>
                        ))}
                      </ol>
                    )}
                  </Td>
                  <Td className="text-center">
                    <BandBadge band={zoneBand(row.zone)} title={row.zone ? ZONE_LABELS[row.zone as Score4] : undefined}>
                      Zone {row.zone}
                    </BandBadge>
                  </Td>
                  <Td className="text-center">
                    <StatusPill status={row.status} />
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
        <p className="text-[12px] text-[var(--ink-muted)]">รวม {rows.length} รายการ</p>
        <BandLegend className="ml-auto" />
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
