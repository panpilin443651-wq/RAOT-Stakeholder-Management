import { requireUser } from "@/lib/auth";
import { canApprove, isUnitScoped, scopedOrgUnitId } from "@/lib/masters";
import FormCard from "@/components/FormCard";
import UnitScopeNote from "@/components/UnitScopeNote";
import FiscalYearPicker from "@/components/FiscalYearPicker";
import ExpectationManager from "@/components/ExpectationManager";
import { listExpectations, listStakeholders, listFiscalYears, currentFiscalYearRow } from "@/lib/queries";

export default async function ExpectationPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const years = await listFiscalYears();
  const fy = years.find((y) => y.id === Number(params.fy)) ?? await currentFiscalYearRow();
  const lockedUnitId = scopedOrgUnitId(user);

  return (
    <FormCard
      title="บันทึกความต้องการความคาดหวังของผู้มีส่วนได้ส่วนเสีย"
      code="604"
      actions={<FiscalYearPicker years={years} value={fy.id} />}
    >
      {isUnitScoped(user.role) && <UnitScopeNote unitName={user.org_unit_name} />}

      <ExpectationManager
        rows={await listExpectations({ fiscalYearId: fy.id, orgUnitId: lockedUnitId })}
        stakeholders={await listStakeholders({ fiscalYearId: fy.id, orgUnitId: lockedUnitId })}
        fiscalYearId={fy.id}
        orgUnitId={user.org_unit_id}
        canApprove={canApprove(user.role)}
      />
    </FormCard>
  );
}
