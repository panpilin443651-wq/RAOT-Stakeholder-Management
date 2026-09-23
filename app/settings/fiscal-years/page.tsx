import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { isAdmin } from "@/lib/masters";
import FormCard from "@/components/FormCard";
import { listFiscalYearsWithUsage } from "@/lib/services/fiscalYear";
import { currentFiscalYear, FISCAL_YEAR_START_MONTH } from "@/lib/fiscal";
import FiscalYearClient from "./FiscalYearClient";

export default async function FiscalYearSettingsPage() {
  const user = await requireUser();
  if (!isAdmin(user.role)) redirect("/");

  const rows = listFiscalYearsWithUsage();
  const latest = rows.reduce((max, r) => Math.max(max, r.year), 0);

  return (
    <FormCard title="ปีงบประมาณ">
      <FiscalYearClient
        rows={rows}
        startMonth={FISCAL_YEAR_START_MONTH}
        suggestedYear={Math.max(latest + 1, currentFiscalYear())}
      />
    </FormCard>
  );
}
