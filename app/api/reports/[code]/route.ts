import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { scopedOrgUnitId } from "@/lib/masters";
import { buildReport, isReportCode, toCsv } from "@/lib/reports";

export async function GET(request: Request, context: { params: Promise<{ code: string }> }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });

  const { code } = await context.params;
  if (!isReportCode(code)) return NextResponse.json({ error: "ไม่พบรายงาน" }, { status: 404 });

  const url = new URL(request.url);
  const report = buildReport(code, {
    fiscalYearId: Number(url.searchParams.get("fy")) || undefined,
    // ผู้บันทึกข้อมูลส่งออกได้เฉพาะข้อมูลของส่วนงานตัวเอง แม้จะใส่ unit อื่นมาใน URL
    orgUnitId: scopedOrgUnitId(user) ?? (Number(url.searchParams.get("unit")) || undefined),
    status: url.searchParams.get("status") || undefined,
  });

  return new NextResponse(toCsv(report), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="report-${code}.csv"`,
    },
  });
}
