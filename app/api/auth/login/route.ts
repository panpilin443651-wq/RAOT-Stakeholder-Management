import { NextResponse } from "next/server";
import { findUser, SESSION_COOKIE } from "@/lib/auth";

export async function POST(request: Request) {
  const { username } = (await request.json()) as { username?: string };
  if (!username || !findUser(username)) {
    return NextResponse.json({ error: "ไม่พบผู้ใช้งาน" }, { status: 400 });
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, username, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return response;
}
