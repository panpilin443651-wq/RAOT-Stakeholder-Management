import "server-only";
import { cookies } from "next/headers";
import { get, all } from "@/lib/db";
import type { Role } from "@/lib/masters";

export const SESSION_COOKIE = "raot_sm_user";

export type SessionUser = {
  id: number;
  username: string;
  full_name: string;
  position: string | null;
  role: Role;
  org_unit_id: number;
  org_unit_name: string;
};

export function findUser(username: string): SessionUser | undefined {
  return get<SessionUser>(
    `SELECT u.id, u.username, u.full_name, u.position, u.role, u.org_unit_id,
            o.name AS org_unit_name
       FROM app_user u JOIN org_unit o ON o.id = u.org_unit_id
      WHERE u.username = ?`,
    username,
  );
}

export function listUsers(): SessionUser[] {
  return all<SessionUser>(
    `SELECT u.id, u.username, u.full_name, u.position, u.role, u.org_unit_id,
            o.name AS org_unit_name
       FROM app_user u JOIN org_unit o ON o.id = u.org_unit_id
      ORDER BY u.id`,
  );
}

/** ผู้ใช้ที่ล็อกอินอยู่ หรือ null เมื่อยังไม่ได้ล็อกอิน */
export async function currentUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const username = store.get(SESSION_COOKIE)?.value;
  if (!username) return null;
  return findUser(username) ?? null;
}

/** ใช้ในหน้าที่ต้องล็อกอิน — ถ้ายังไม่ล็อกอินจะพาไปหน้า login */
export async function requireUser(): Promise<SessionUser> {
  const user = await currentUser();
  if (!user) {
    const { redirect } = await import("next/navigation");
    redirect("/login"); // throws
  }
  return user as SessionUser;
}
