import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { isAdmin } from "@/lib/masters";
import { validateKm, saveKm, deleteKm, type KmPayload } from "@/lib/services/km";

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  if (!isAdmin(user.role)) {
    return NextResponse.json({ error: "เฉพาะผู้ดูแลระบบเท่านั้นที่แก้ไของค์ความรู้ได้" }, { status: 403 });
  }

  const { id } = await context.params;
  const payload = (await request.json()) as KmPayload;
  const error = validateKm(payload);
  if (error) return NextResponse.json({ error }, { status: 400 });

  try {
    saveKm({ ...payload, id: Number(id) }, user.username);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 404 });
  }
  return NextResponse.json({ ok: true, id: Number(id) });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  if (!isAdmin(user.role)) {
    return NextResponse.json({ error: "เฉพาะผู้ดูแลระบบเท่านั้นที่ลบองค์ความรู้ได้" }, { status: 403 });
  }

  const { id } = await context.params;
  const error = deleteKm(Number(id));
  if (error) return NextResponse.json({ error }, { status: 404 });
  return NextResponse.json({ ok: true });
}
