import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { isAdmin } from "@/lib/masters";
import { validateKm, saveKm, type KmPayload } from "@/lib/services/km";

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  if (!isAdmin(user.role)) {
    return NextResponse.json({ error: "เฉพาะผู้ดูแลระบบเท่านั้นที่เพิ่มองค์ความรู้ได้" }, { status: 403 });
  }

  const payload = (await request.json()) as KmPayload;
  const error = validateKm(payload);
  if (error) return NextResponse.json({ error }, { status: 400 });

  const id = await saveKm({ ...payload, id: undefined }, user.username);
  return NextResponse.json({ ok: true, id });
}
