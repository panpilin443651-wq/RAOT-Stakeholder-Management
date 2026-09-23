import Link from "next/link";
import { currentUser } from "@/lib/auth";
import { ORG_NAME, ORG_ABBR, isUnitScoped, scopedOrgUnitId } from "@/lib/masters";
import { currentFiscalYearRow, listFiscalYears } from "@/lib/queries";
import {
  groupStats,
  zoneDistribution,
  issueDistribution,
  planProgress,
  todoForUnit,
} from "@/lib/dashboard";
import { SectionCard, StatTile, BarList, StackedBar } from "@/components/Charts";
import GroupDefinitions from "@/components/GroupDefinitions";
import UnitScopeNote from "@/components/UnitScopeNote";
import FiscalYearPicker from "@/components/FiscalYearPicker";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const user = await currentUser();
  const params = await searchParams;

  // ค่าตั้งต้นคือปีปัจจุบันที่ผู้ดูแลระบบกำหนด — ใช้ร่วมกันทุกคน
  // ผู้ใช้เปลี่ยนปีเพื่อดูย้อนหลังได้ผ่าน ?fy=
  const years = listFiscalYears();
  const fy = years.find((y) => y.id === Number(params.fy)) ?? currentFiscalYearRow();

  // ผู้บันทึกข้อมูลเห็นตัวเลขของส่วนงานตัวเองเท่านั้น
  const unitId = user ? scopedOrgUnitId(user) : undefined;

  const groups = groupStats(fy.id, unitId);
  const zones = zoneDistribution(fy.id, unitId);
  const issues = issueDistribution(fy.id, unitId);
  const plans = planProgress(fy.id, unitId);
  const todo = user ? todoForUnit(fy.id, user.org_unit_id) : [];

  const totalStakeholders = groups.reduce((s, g) => s + g.stakeholders, 0);
  const groupsCovered = groups.filter((g) => g.stakeholders > 0).length;
  const totalIssues = groups.reduce((s, g) => s + g.issues, 0);
  const zoned = zones.reduce((s, z) => s + z.value, 0);

  return (
    <div className="space-y-6">
      {/* ---------- หัวเรื่อง ---------- */}
      <section className="rounded border border-[var(--line)] bg-gradient-to-r from-raot-800 via-raot-700 to-raot-600 px-6 py-5 text-white">
        <div className="flex flex-wrap items-end gap-x-6 gap-y-2">
          <div>
            <h1 className="text-[20px] font-medium">สรุปข้อมูลผู้มีส่วนได้ส่วนเสีย</h1>
            <p className="mt-1 text-[13px] text-raot-100">
              {ORG_NAME} · ปีงบประมาณ {fy.year}
              {user && isUnitScoped(user.role) && ` · ${user.org_unit_name}`}
            </p>
          </div>
          <div className="ml-auto flex flex-col items-end gap-2">
            <FiscalYearPicker years={years} value={fy.id} tone="dark" />
            <p className="max-w-xl text-[12px] leading-relaxed text-raot-100">
              หน้านี้รวมข้อมูลจากทุกเมนูของระบบเพื่อให้เห็นสถานะการดำเนินงานในภาพเดียว
              ตัวเลขทั้งหมดคำนวณจากข้อมูลที่ส่วนงานบันทึกจริง ไม่ได้กรอกซ้ำ
            </p>
          </div>
        </div>
      </section>

      {!user && (
        <p className="rounded border border-amber-300 bg-amber-50 px-4 py-3 text-center text-amber-900">
          กรุณา{" "}
          <Link href="/login" className="font-medium underline underline-offset-2">
            เข้าสู่ระบบ
          </Link>{" "}
          เพื่อเริ่มบันทึกข้อมูล — ตัวเลขด้านล่างเป็นข้อมูลภาพรวมทั้งองค์กร
        </p>
      )}

      {user && isUnitScoped(user.role) && <UnitScopeNote unitName={user.org_unit_name} />}

      {/* ---------- ตัวเลขสำคัญ ---------- */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="ผู้มีส่วนได้ส่วนเสียในทะเบียน"
          value={totalStakeholders}
          unit="ราย"
          caption={`ครอบคลุม ${groupsCovered} จาก ${groups.length} กลุ่ม`}
          href="/profile"
        />
        <StatTile
          label="จัดลำดับความสำคัญแล้ว"
          value={zoned}
          unit={`จาก ${totalStakeholders} ราย`}
          caption={
            totalStakeholders === 0
              ? "ยังไม่มีข้อมูลในทะเบียน"
              : `ยังไม่ได้จัด Zone ${totalStakeholders - zoned} ราย`
          }
          href="/profile"
          tone={totalStakeholders > 0 && zoned === totalStakeholders ? "good" : "warn"}
        />
        <StatTile
          label="แผนงาน/โครงการ"
          value={plans.plans}
          unit="แผน"
          caption={`อนุมัติแล้ว ${plans.approvedPlans} แผน · บันทึกผล ${plans.results}/${plans.expectedResults} ไตรมาส`}
          href="/organization/plans"
        />
        <StatTile
          label="ผลไตรมาสที่เป็นไปตามเป้าหมาย"
          value={plans.onTargetRate ?? "-"}
          unit={plans.onTargetRate === null ? "" : "%"}
          caption={`${plans.onTarget} จาก ${plans.results} รายการที่บันทึกผล`}
          href="/report/807"
          tone={plans.onTargetRate === null ? "default" : plans.onTargetRate >= 80 ? "good" : "warn"}
        />
      </div>

      {/* ---------- สิ่งที่ต้องดำเนินการ ---------- */}
      {user && todo.length > 0 && (
        <SectionCard
          title="สิ่งที่ส่วนงานของท่านยังต้องดำเนินการ"
          subtitle={user.org_unit_name}
          action={<span className="text-[var(--ink-muted)]">คลิกที่รายการเพื่อไปกรอกต่อ</span>}
        >
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {todo.map((t) => (
              <li key={t.label}>
                <Link
                  href={t.href}
                  className="flex items-center gap-3 rounded border border-[var(--line)] px-3 py-2.5 transition hover:border-raot-400 hover:bg-raot-50"
                >
                  <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-[#fde7a7] px-2 text-[12px] font-semibold text-[#7a5a05]">
                    {t.count}
                  </span>
                  <span className="text-[12.5px] leading-snug">{t.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </SectionCard>
      )}

      {user && todo.length === 0 && (
        <p className="rounded border border-[#a9cf97] bg-[#f2fbf6] px-4 py-3 text-[13px] text-[#2f5c22]">
          ✔ ส่วนงาน {user.org_unit_name} บันทึกข้อมูลครบถ้วนสำหรับปีงบประมาณ {fy.year} แล้ว
        </p>
      )}

      {/* ---------- กราฟภาพรวม ---------- */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard
          title="จำนวนผู้มีส่วนได้ส่วนเสียแต่ละกลุ่ม"
          subtitle={`ปีงบประมาณ ${fy.year} · รวม ${totalStakeholders} ราย`}
          action={
            <Link href="/profile" className="text-raot-600 underline underline-offset-2">
              ดูทะเบียน
            </Link>
          }
        >
          <BarList
            unit="ราย"
            items={groups.map((g) => ({
              label: `${g.code}. ${g.name}`,
              value: g.stakeholders,
              caption: `${g.name}: ${g.stakeholders} ราย · ${g.issues} ประเด็น`,
              href: `/profile?group=${g.id}`,
            }))}
          />
        </SectionCard>

        <SectionCard
          title="ประเด็นความต้องการแยกตามระดับความสำคัญ"
          subtitle={
            issues.unscored > 0
              ? `รวม ${totalIssues} ประเด็น (ยังไม่ให้คะแนน ${issues.unscored} ประเด็น)`
              : `รวม ${totalIssues} ประเด็น`
          }
          action={
            <Link href="/report/810" className="text-raot-600 underline underline-offset-2">
              ดูรายงาน [810]
            </Link>
          }
        >
          <StackedBar segments={issues.segments} unit="ประเด็น" />
        </SectionCard>
      </div>

      <SectionCard
        title="การจัดลำดับความสำคัญของผู้มีส่วนได้ส่วนเสีย (Zone)"
        subtitle="Zone 1 ต้องบริหารความสัมพันธ์ใกล้ชิดที่สุด ไล่ลงไปถึง Zone 4 เฝ้าติดตาม"
      >
        <StackedBar segments={zones} unit="ราย" />
      </SectionCard>

      {/* ---------- นิยามกลุ่ม ---------- */}
      <GroupDefinitions groups={groups} orgAbbr={ORG_ABBR} />
    </div>
  );
}
