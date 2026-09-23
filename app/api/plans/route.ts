import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { canApprove, canEditOrgUnit, NO_UNIT_PERMISSION } from "@/lib/masters";
import { checkRecordUnit } from "@/lib/access";
import { validatePlan, savePlan, type PlanPayload } from "@/lib/services/plan";

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });

  const payload = (await request.json()) as PlanPayload;
  // ผู้บันทึกข้อมูลแตะได้เฉพาะของส่วนงานตัวเอง ตรวจก่อนอย่างอื่นเสมอ
  if (!canEditOrgUnit(user, payload.org_unit_id)) {
    return NextResponse.json({ error: NO_UNIT_PERMISSION }, { status: 403 });
  }
  if (payload.id) {
    const denied = checkRecordUnit(user, "plan", payload.id);
    if (denied) return NextResponse.json({ error: denied.error }, { status: denied.status });
  }

  const error = validatePlan(payload);
  if (error) return NextResponse.json({ error }, { status: 400 });
  if (payload.action === "approve" && !canApprove(user.role)) {
    return NextResponse.json({ error: "ไม่มีสิทธิ์อนุมัติ" }, { status: 403 });
  }

  const status = payload.action === "approve" ? "APPROVED" : "DRAFT";
  const id = savePlan(payload, status, user.username);
  return NextResponse.json({ ok: true, id });
}
