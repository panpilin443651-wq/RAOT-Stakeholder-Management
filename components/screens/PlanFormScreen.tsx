import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { canApprove, canEditOrgUnit, scopedOrgUnitId, selectableUnits } from "@/lib/masters";
import PlanForm from "@/components/PlanForm";
import {
  getPlan,
  listFiscalYears,
  listOrgUnits,
  listStakeholders,
  listRiskRm,
  listRiskBa,
  currentFiscalYearRow,
} from "@/lib/queries";

export default async function PlanFormScreen({
  scope,
  params,
  searchParams,
}: {
  scope: "ORG" | "UNIT";
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | undefined>>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const query = searchParams ? await searchParams : {};
  const isNew = id === "new";

  const record = isNew ? undefined : getPlan(Number(id));
  if (!isNew && !record) notFound();
  if (record && !canEditOrgUnit(user, record.org_unit_id)) notFound();

  const years = listFiscalYears();
  // แผนใหม่ตั้งต้นที่ปีที่ผู้ใช้กำลังดูอยู่ ถ้าไม่ได้ระบุก็ใช้ปีปัจจุบันที่ผู้ดูแลระบบกำหนด
  const fiscalYearId = years.find((y) => y.id === Number(query.fy))?.id ?? currentFiscalYearRow().id;

  return (
    <PlanForm
      scope={scope}
      record={record ?? null}
      years={years}
      units={selectableUnits(user, listOrgUnits())}
      /* ส่งทุกปีไป เพราะผู้ใช้เปลี่ยนปีในฟอร์มได้โดยไม่โหลดหน้าใหม่
         ผู้บันทึกข้อมูลเห็นเฉพาะทะเบียนของส่วนงานตัวเอง */
      stakeholders={listStakeholders({ orgUnitId: scopedOrgUnitId(user) })}
      riskRm={listRiskRm()}
      riskBa={listRiskBa()}
      defaults={{ fiscalYearId, orgUnitId: user.org_unit_id }}
      canApprove={canApprove(user.role)}
    />
  );
}
