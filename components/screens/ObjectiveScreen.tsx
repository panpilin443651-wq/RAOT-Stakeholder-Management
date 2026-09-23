import { requireUser } from "@/lib/auth";
import { canApprove, scopedOrgUnitId, selectableUnits } from "@/lib/masters";
import ObjectiveForm from "@/components/ObjectiveForm";
import {
  getObjective,
  listFiscalYears,
  listOrgUnits,
  listGroups,
  currentFiscalYearRow,
} from "@/lib/queries";

export default async function ObjectiveScreen({
  scope,
  searchParams,
}: {
  scope: "ORG" | "UNIT";
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const user = await requireUser();
  const params = await searchParams;

  const fiscalYearId = Number(params.fy) || currentFiscalYearRow().id;
  // ผู้บันทึกข้อมูลถูกล็อกไว้ที่ส่วนงานตัวเอง เปลี่ยนผ่าน URL ไม่ได้
  const orgUnitId = scopedOrgUnitId(user) ?? (Number(params.unit) || user.org_unit_id);

  return (
    <ObjectiveForm
      scope={scope}
      record={getObjective(scope, fiscalYearId, orgUnitId) ?? null}
      years={listFiscalYears()}
      units={selectableUnits(user, listOrgUnits())}
      groups={listGroups(1)}
      selected={{ fiscalYearId, orgUnitId }}
      canApprove={canApprove(user.role)}
    />
  );
}
