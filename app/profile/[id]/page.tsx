import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { canApprove, canEditOrgUnit, selectableUnits } from "@/lib/masters";
import StakeholderForm from "@/components/StakeholderForm";
import {
  getStakeholder,
  listIssues,
  listAllGroups,
  listFiscalYears,
  listOrgUnits,
  listLevels,
  currentFiscalYearRow,
} from "@/lib/queries";

export default async function StakeholderFormPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const query = await searchParams;
  const isNew = id === "new";

  const record = isNew ? undefined : getStakeholder(Number(id));
  if (!isNew && !record) notFound();
  // ผู้บันทึกข้อมูลเปิดของส่วนงานอื่นไม่ได้ แม้จะรู้เลขที่ของแถวนั้น
  if (record && !canEditOrgUnit(user, record.org_unit_id)) notFound();

  const years = listFiscalYears();
  // รายการใหม่ตั้งต้นที่ปีที่ผู้ใช้กำลังดูอยู่ ถ้าไม่ได้ระบุก็ใช้ปีปัจจุบันที่ผู้ดูแลระบบกำหนด
  const fiscalYearId = years.find((y) => y.id === Number(query.fy))?.id ?? currentFiscalYearRow().id;

  return (
    <StakeholderForm
      record={record ?? null}
      issues={record ? listIssues(record.id) : []}
      groups={listAllGroups()}
      years={years}
      units={selectableUnits(user, listOrgUnits())}
      levels={listLevels()}
      defaults={{ fiscalYearId, orgUnitId: user.org_unit_id }}
      canApprove={canApprove(user.role)}
    />
  );
}
