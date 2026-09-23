import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { calcZone } from "@/lib/scoring";
import { canApprove, canEditOrgUnit, NO_UNIT_PERMISSION } from "@/lib/masters";
import { checkRecordUnit } from "@/lib/access";
import { validate, saveStakeholder, type StakeholderPayload } from "@/lib/services/stakeholder";

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });

  const payload = (await request.json()) as StakeholderPayload;
  // ผู้บันทึกข้อมูลแตะได้เฉพาะของส่วนงานตัวเอง ตรวจก่อนอย่างอื่นเสมอ
  if (!canEditOrgUnit(user, payload.org_unit_id)) {
    return NextResponse.json({ error: NO_UNIT_PERMISSION }, { status: 403 });
  }
  if (payload.id) {
    const denied = checkRecordUnit(user, "stakeholder", payload.id);
    if (denied) return NextResponse.json({ error: denied.error }, { status: denied.status });
  }

  const error = validate(payload);
  if (error) return NextResponse.json({ error }, { status: 400 });
  if (payload.action === "approve" && !canApprove(user.role)) {
    return NextResponse.json({ error: "ไม่มีสิทธิ์อนุมัติ" }, { status: 403 });
  }

  const status = payload.action === "approve" ? "APPROVED" : "DRAFT";
  const zone = calcZone(payload.interest_x ?? null, payload.influence_y ?? null);
  const id = saveStakeholder(payload, status, zone, user.username);

  return NextResponse.json({ ok: true, id });
}
