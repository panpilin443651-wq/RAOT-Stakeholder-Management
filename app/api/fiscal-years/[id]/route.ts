import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { isAdmin } from "@/lib/masters";
import { setCurrentFiscalYear, deleteFiscalYear } from "@/lib/services/fiscalYear";

/** กำหนดให้ปีนี้เป็นปีปัจจุบัน */
export async function PATCH(_request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  if (!isAdmin(user.role)) {
    return NextResponse.json({ error: "เฉพาะผู้ดูแลระบบเท่านั้นที่เปลี่ยนปีปัจจุบันได้" }, { status: 403 });
  }

  const { id } = await context.params;
  const error = await setCurrentFiscalYear(Number(id));
  if (error) return NextResponse.json({ error }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  if (!isAdmin(user.role)) {
    return NextResponse.json({ error: "เฉพาะผู้ดูแลระบบเท่านั้นที่ลบปีงบประมาณได้" }, { status: 403 });
  }

  const { id } = await context.params;
  const error = await deleteFiscalYear(Number(id));
  if (error) return NextResponse.json({ error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
