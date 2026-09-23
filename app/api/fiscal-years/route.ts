import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { isAdmin } from "@/lib/masters";
import {
  validateFiscalYear,
  createFiscalYear,
  type FiscalYearPayload,
} from "@/lib/services/fiscalYear";

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  if (!isAdmin(user.role)) {
    return NextResponse.json({ error: "เฉพาะผู้ดูแลระบบเท่านั้นที่เพิ่มปีงบประมาณได้" }, { status: 403 });
  }

  const payload = (await request.json()) as FiscalYearPayload;
  const error = await validateFiscalYear(payload);
  if (error) return NextResponse.json({ error }, { status: 400 });

  const id = await createFiscalYear(payload);
  return NextResponse.json({ ok: true, id });
}
