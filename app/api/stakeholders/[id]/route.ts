import { NextResponse } from "next/server";
import { run } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { checkRecordUnit } from "@/lib/access";

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });

  const { id } = await context.params;
  const denied = await checkRecordUnit(user, "stakeholder", Number(id));
  if (denied) return NextResponse.json({ error: denied.error }, { status: denied.status });

  await run("DELETE FROM stakeholder WHERE id = ?", Number(id));
  return NextResponse.json({ ok: true });
}
