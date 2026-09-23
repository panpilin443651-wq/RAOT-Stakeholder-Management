import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { canApprove, canEditOrgUnit, NO_UNIT_PERMISSION } from "@/lib/masters";
import { planOwnerUnit } from "@/lib/access";
import {
  validateQuarterResult,
  saveQuarterResult,
  type QuarterResultPayload,
} from "@/lib/services/quarterResult";

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });

  const payload = (await request.json()) as QuarterResultPayload;
  // ผลไตรมาสเป็นของส่วนงานเดียวกับแผนงานแม่
  const ownerUnit = planOwnerUnit(payload.plan_id);
  if (ownerUnit === undefined) {
    return NextResponse.json({ error: "ไม่พบแผนงาน/โครงการที่อ้างถึง" }, { status: 404 });
  }
  if (!canEditOrgUnit(user, ownerUnit)) {
    return NextResponse.json({ error: NO_UNIT_PERMISSION }, { status: 403 });
  }

  const error = validateQuarterResult(payload);
  if (error) return NextResponse.json({ error }, { status: 400 });
  if (payload.action === "approve" && !canApprove(user.role)) {
    return NextResponse.json({ error: "ไม่มีสิทธิ์อนุมัติ" }, { status: 403 });
  }

  const status = payload.action === "approve" ? "APPROVED" : "DRAFT";
  const id = saveQuarterResult(payload, status, user.username);
  return NextResponse.json({ ok: true, id });
}
