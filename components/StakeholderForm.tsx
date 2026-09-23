"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import FormCard, { FormSection } from "./FormCard";
import FormRow from "./FormRow";
import HelpLabel from "./HelpModal";
import RadioScale, { SCALE_3, SCALE_4 } from "./RadioScale";
import StatusBar from "./StatusBar";
import ContactFields from "./ContactFields";
import BandBadge from "./BandBadge";
import PriorityMatrix from "./PriorityMatrix";
import {
  calcZone,
  calcIssuePriority,
  issueBand,
  zoneBand,
  ZONE_LABELS,
  BAND_STYLE,
  type Score4,
} from "@/lib/scoring";
import {
  CRITERIA_INTEREST_X,
  CRITERIA_INFLUENCE_Y,
  CRITERIA_IMPACT_ORG,
  CRITERIA_IMPACT_STAKEHOLDER,
} from "@/lib/criteria";
import type { Group, FiscalYear, OrgUnit, RefItem, Stakeholder, Issue } from "@/lib/queries";

type IssueState = {
  title: string;
  impact_org: number | null;
  impact_stakeholder: number | null;
  level_code: string;
  level_extra_code: string;
  methods: string;
  frequency: string;
};

const emptyIssue = (): IssueState => ({
  title: "",
  impact_org: null,
  impact_stakeholder: null,
  level_code: "",
  level_extra_code: "",
  methods: "",
  frequency: "",
});

export default function StakeholderForm({
  record,
  issues: initialIssues,
  groups,
  years,
  units,
  levels,
  defaults,
  canApprove,
}: {
  record: Stakeholder | null;
  issues: Issue[];
  groups: Group[];
  years: FiscalYear[];
  units: OrgUnit[];
  levels: RefItem[];
  defaults: { fiscalYearId: number; orgUnitId: number };
  canApprove: boolean;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [form, setForm] = useState({
    fiscal_year_id: record?.fiscal_year_id ?? defaults.fiscalYearId,
    org_unit_id: record?.org_unit_id ?? defaults.orgUnitId,
    group_l1_id: record?.group_l1_id ?? null,
    group_l2_id: record?.group_l2_id ?? null,
    group_l3_id: record?.group_l3_id ?? null,
    name: record?.name ?? "",
    business_model: record?.business_model ?? "",
    coord_name: record?.coord_name ?? "",
    coord_phone: record?.coord_phone ?? "",
    coord_email: record?.coord_email ?? "",
    coord_line: record?.coord_line ?? "",
    coord_note: record?.coord_note ?? "",
    dm_name: record?.dm_name ?? "",
    dm_phone: record?.dm_phone ?? "",
    dm_email: record?.dm_email ?? "",
    dm_line: record?.dm_line ?? "",
    dm_note: record?.dm_note ?? "",
    interest_x: record?.interest_x ?? null,
    influence_y: record?.influence_y ?? null,
  });

  const [issues, setIssues] = useState<IssueState[]>(
    initialIssues.length
      ? initialIssues.map((i) => ({
          title: i.title ?? "",
          impact_org: i.impact_org,
          impact_stakeholder: i.impact_stakeholder,
          level_code: i.level_code ?? "",
          level_extra_code: i.level_extra_code ?? "",
          methods: i.methods ?? "",
          frequency: i.frequency ?? "",
        }))
      : [emptyIssue()],
  );

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const setIssue = <K extends keyof IssueState>(index: number, key: K, value: IssueState[K]) =>
    setIssues((prev) => prev.map((issue, i) => (i === index ? { ...issue, [key]: value } : issue)));

  const l1 = useMemo(() => groups.filter((g) => g.level === 1), [groups]);
  const l2 = useMemo(
    () => groups.filter((g) => g.level === 2 && g.parent_id === form.group_l1_id),
    [groups, form.group_l1_id],
  );
  const l3 = useMemo(
    () => groups.filter((g) => g.level === 3 && g.parent_id === form.group_l2_id),
    [groups, form.group_l2_id],
  );

  const zone = calcZone(form.interest_x, form.influence_y);

  async function submit(action: "draft" | "approve") {
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch("/api/stakeholders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...form, id: record?.id, issues, action }),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.error ?? "บันทึกไม่สำเร็จ");
        return;
      }
      router.push(`/profile/${data.id}`);
      router.refresh();
      setMessage("บันทึกข้อมูลเรียบร้อยแล้ว");
    } finally {
      setSaving(false);
    }
  }

  return (
    <FormCard title="บันทึกข้อมูล Stakeholder's Profile" code="100">
      {message && (
        <div className="mb-5 rounded border border-raot-300 bg-raot-50 px-4 py-2.5 text-raot-800">{message}</div>
      )}

      <div className="space-y-8">
        <FormSection>
          <FormRow label="ปีงบประมาณ">
            <select
              className="form-select w-48"
              value={form.fiscal_year_id}
              onChange={(e) => set("fiscal_year_id", Number(e.target.value))}
            >
              {years.map((y) => (
                <option key={y.id} value={y.id}>
                  {y.year}
                </option>
              ))}
            </select>
          </FormRow>

          <FormRow label="ส่วนงานที่รับผิดชอบ">
            <select
              className="form-select"
              value={form.org_unit_id}
              onChange={(e) => set("org_unit_id", Number(e.target.value))}
            >
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </FormRow>

          <FormRow label="กลุ่ม Stakeholder :">
            <div className="grid gap-3 sm:grid-cols-3">
              <select
                className="form-select"
                value={form.group_l1_id ?? ""}
                onChange={(e) => {
                  const value = e.target.value ? Number(e.target.value) : null;
                  setForm((prev) => ({ ...prev, group_l1_id: value, group_l2_id: null, group_l3_id: null }));
                }}
              >
                <option value="">-- ระบุ --</option>
                {l1.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.code} {g.name}
                  </option>
                ))}
              </select>

              <select
                className="form-select"
                value={form.group_l2_id ?? ""}
                disabled={!form.group_l1_id || l2.length === 0}
                onChange={(e) => {
                  const value = e.target.value ? Number(e.target.value) : null;
                  setForm((prev) => ({ ...prev, group_l2_id: value, group_l3_id: null }));
                }}
              >
                <option value="">-- ระบุ --</option>
                {l2.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>

              <select
                className="form-select"
                value={form.group_l3_id ?? ""}
                disabled={!form.group_l2_id || l3.length === 0}
                onChange={(e) => set("group_l3_id", e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">-- ระบุ --</option>
                {l3.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
          </FormRow>

          <FormRow label="ชื่อ Stakeholder :" required>
            <input
              className="form-input"
              value={form.name}
              placeholder="ระบุชื่อผู้มีส่วนได้ส่วนเสีย"
              onChange={(e) => set("name", e.target.value)}
            />
          </FormRow>

          <FormRow label="รูปแบบธุรกิจในการสร้างความสัมพันธ์ระหว่างกัน :">
            <input
              className="form-input"
              value={form.business_model}
              placeholder="รูปแบบธุรกิจที่ดำเนินการกับส่วนงาน"
              onChange={(e) => set("business_model", e.target.value)}
            />
          </FormRow>
        </FormSection>

        <FormSection>
          <FormRow label="ผู้ประสานงานของ Stakeholder :" required>
            <input
              className="form-input"
              value={form.coord_name}
              placeholder="-- ระบุ --"
              onChange={(e) => set("coord_name", e.target.value)}
            />
          </FormRow>
          <ContactFields
            phone={form.coord_phone}
            email={form.coord_email}
            line={form.coord_line}
            note={form.coord_note}
            onChange={(field, value) => set(`coord_${field}` as never, value as never)}
          />
        </FormSection>

        <FormSection>
          <FormRow label="ผู้มีอำนาจตัดสินใจของ Stakeholder :" required>
            <input
              className="form-input"
              value={form.dm_name}
              placeholder="-- ระบุ --"
              onChange={(e) => set("dm_name", e.target.value)}
            />
          </FormRow>
          <ContactFields
            phone={form.dm_phone}
            email={form.dm_email}
            line={form.dm_line}
            note={form.dm_note}
            onChange={(field, value) => set(`dm_${field}` as never, value as never)}
          />
        </FormSection>

        <FormSection title="การวิเคราะห์การสร้างความสัมพันธ์">
          <p className="pl-0 text-[var(--ink-muted)] sm:pl-[280px]">การจัดลำดับความสัมพันธ์กับผู้มีส่วนได้ส่วนเสีย</p>

          <FormRow label={<HelpLabel text="ระดับความสนใจ (แกน X)" criteria={CRITERIA_INTEREST_X} />}>
            <RadioScale
              name="interest_x"
              value={form.interest_x}
              options={SCALE_3}
              onChange={(v) => set("interest_x", v)}
            />
          </FormRow>

          <FormRow label={<HelpLabel text="ระดับอิทธิพล (แกน Y)" criteria={CRITERIA_INFLUENCE_Y} />}>
            <RadioScale
              name="influence_y"
              value={form.influence_y}
              options={SCALE_3}
              onChange={(v) => set("influence_y", v)}
            />
          </FormRow>

          <FormRow label="ลำดับความสำคัญ Zone :" hint="คำนวณอัตโนมัติ">
            <RadioScale name="zone" value={zone} options={SCALE_4} disabled />
            {zone && (
              <p className="mt-2">
                <BandBadge band={zoneBand(zone)}>{ZONE_LABELS[zone as Score4]}</BandBadge>
              </p>
            )}
          </FormRow>
        </FormSection>

        <FormSection title="การจัดลำดับความสำคัญของประเด็น">
          <div className="space-y-8">
            {issues.map((issue, index) => {
              const priority = calcIssuePriority(issue.impact_org, issue.impact_stakeholder);
              const band = issueBand(issue.impact_org, issue.impact_stakeholder);
              return (
                <div key={index} className="space-y-3 border-l-2 border-raot-200 pl-4">
                  <FormRow label={`ประเด็นที่ ${index + 1} :`} required>
                    <div className="flex gap-2">
                      <input
                        className="form-input"
                        value={issue.title}
                        onChange={(e) => setIssue(index, "title", e.target.value)}
                      />
                      {issues.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-ghost shrink-0"
                          onClick={() => setIssues((prev) => prev.filter((_, i) => i !== index))}
                        >
                          ลบ
                        </button>
                      )}
                    </div>
                  </FormRow>

                  <FormRow label={<HelpLabel text="ส่งผลกระทบต่อองค์กร" criteria={CRITERIA_IMPACT_ORG} />}>
                    <RadioScale
                      name={`impact_org_${index}`}
                      value={issue.impact_org}
                      options={SCALE_4}
                      onChange={(v) => setIssue(index, "impact_org", v)}
                    />
                  </FormRow>

                  <FormRow
                    label={<HelpLabel text="ส่งผลกระทบต่อผู้มีส่วนได้ส่วนเสีย" criteria={CRITERIA_IMPACT_STAKEHOLDER} />}
                  >
                    <RadioScale
                      name={`impact_sh_${index}`}
                      value={issue.impact_stakeholder}
                      options={SCALE_4}
                      onChange={(v) => setIssue(index, "impact_stakeholder", v)}
                    />
                  </FormRow>

                  <FormRow label="ลำดับความสำคัญของประเด็น :" hint="คำนวณอัตโนมัติ">
                    <RadioScale name={`priority_${index}`} value={priority} options={SCALE_4} disabled />
                    {band && (
                      <p className="mt-2">
                        <BandBadge band={band}>
                          ความสำคัญระดับ{BAND_STYLE[band].label} ({issue.impact_org} x {issue.impact_stakeholder})
                        </BandBadge>
                      </p>
                    )}
                  </FormRow>

                  <FormRow label="ตำแหน่งในแผนผัง :">
                    <PriorityMatrix org={issue.impact_org} stakeholder={issue.impact_stakeholder} />
                  </FormRow>

                  <div className="mt-4 border-t border-dashed border-[var(--line)] pt-4">
                    <p className="mb-3 font-medium text-raot-700">
                      การสร้างความสัมพันธ์กับ Stakeholder — ประเด็นที่ {index + 1}
                    </p>

                    <div className="space-y-3">
                      <FormRow label={`ระดับ (Levels) จากประเด็นที่ ${index + 1} :`} required>
                        <select
                          className="form-select max-w-xl"
                          value={issue.level_code}
                          onChange={(e) => setIssue(index, "level_code", e.target.value)}
                        >
                          <option value="">-- ระบุ --</option>
                          {levels.map((l) => (
                            <option key={l.code} value={l.code}>
                              {l.name}
                            </option>
                          ))}
                        </select>
                      </FormRow>

                      <FormRow label={`ระดับ (Levels) จากประเด็นที่ ${index + 1} (เพิ่มเติม) :`}>
                        <select
                          className="form-select max-w-xl"
                          value={issue.level_extra_code}
                          onChange={(e) => setIssue(index, "level_extra_code", e.target.value)}
                        >
                          <option value="">-- ระบุ --</option>
                          {levels.map((l) => (
                            <option key={l.code} value={l.code}>
                              {l.name}
                            </option>
                          ))}
                        </select>
                      </FormRow>

                      <FormRow label="รูปแบบ (Methods) ของการสร้างความสัมพันธ์ :" required>
                        <input
                          className="form-input"
                          value={issue.methods}
                          onChange={(e) => setIssue(index, "methods", e.target.value)}
                        />
                      </FormRow>

                      <FormRow label="ความถี่ของการสร้างความสัมพันธ์ :" required>
                        <input
                          className="form-input"
                          value={issue.frequency}
                          placeholder="เช่น รายเดือน / รายไตรมาส / ปีละ 2 ครั้ง"
                          onChange={(e) => setIssue(index, "frequency", e.target.value)}
                        />
                      </FormRow>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            className="btn btn-secondary mt-4"
            onClick={() => setIssues((prev) => [...prev, emptyIssue()])}
          >
            + เพิ่มประเด็น
          </button>
        </FormSection>
      </div>

      <StatusBar
        status={record?.status ?? "DRAFT"}
        canApprove={canApprove}
        saving={saving}
        onApprove={() => submit("approve")}
        onSaveDraft={() => submit("draft")}
        onCancel={() => router.push("/profile")}
      />
    </FormCard>
  );
}
