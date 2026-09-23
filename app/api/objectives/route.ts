import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { canApprove, canEditOrgUnit, NO_UNIT_PERMISSION } from "@/lib/masters";
import { validateObjective, saveObjective, type ObjectivePayload } from "@/lib/services/objective";

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });

  const payload = (await request.json()) as ObjectivePayload;
  // ผู้บันทึกข้อมูลแตะได้เฉพาะของส่วนงานตัวเอง ตรวจก่อนอย่างอื่นเสมอ
  if (!canEditOrgUnit(user, payload.org_unit_id)) {
    return NextResponse.json({ error: NO_UNIT_PERMISSION }, { status: 403 });
  }

  const error = validateObjective(payload);
  if (error) return NextResponse.json({ error }, { status: 400 });
  if (payload.action === "approve" && !canApprove(user.role)) {
    return NextResponse.json({ error: "ไม่มีสิทธิ์อนุมัติ" }, { status: 403 });
  }

  const status = payload.action === "approve" ? "APPROVED" : "DRAFT";
  const id = saveObjective(payload, status, user.username);
  return NextResponse.json({ ok: true, id });
}
