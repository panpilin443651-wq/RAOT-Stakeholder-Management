import Link from "next/link";
import { MENU, APP_NAME, ROLE_LABEL, isAdmin } from "@/lib/masters";
import type { SessionUser } from "@/lib/auth";
import NavDropdown from "./NavDropdown";
import UserMenu from "./UserMenu";
import RaotLogo from "./RaotLogo";

export default function AppShell({
  user,
  children,
}: {
  user: SessionUser | null;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="navbar-raot sticky top-0 z-40 text-white shadow-md no-print">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-x-1 gap-y-2 px-4 py-2.5">
          <Link href="/" className="mr-auto flex items-center gap-3">
            {/* วางบนพื้นขาวเพื่อให้วงเขียวของตราสัญลักษณ์ไม่จมไปกับแถบเมนูสีเขียว */}
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white p-1 shadow-sm">
              <RaotLogo className="h-full w-full" />
            </span>
            <span className="text-[17px] font-medium tracking-tight">{APP_NAME}</span>
          </Link>

          <nav className="flex flex-wrap items-center gap-0.5 text-[13px]">
            {MENU.filter((group) => !group.adminOnly || isAdmin(user?.role)).map((group) =>
              group.items ? (
                <NavDropdown key={group.label} label={group.label} items={group.items} />
              ) : (
                <Link
                  key={group.label}
                  href={group.href ?? "/"}
                  className="rounded px-3 py-2 hover:bg-white/15"
                >
                  {group.label}
                </Link>
              ),
            )}
            <UserMenu user={user} />
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6">{children}</main>

      <footer className="no-print border-t border-[var(--line)] bg-white">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-x-6 gap-y-2 px-4 py-4 text-[12px] text-[var(--ink-muted)]">
          <span>
            สอบถามข้อมูลเพิ่มเติม ติดต่อ ฝ่ายยุทธศาสตร์องค์กร โทร.{" "}
            <b className="text-raot-700">2101, 2102</b> / สอบถามปัญหาการใช้งานหน้าจอ ติดต่อ
            ฝ่ายเทคโนโลยีสารสนเทศ โทร. <b className="text-raot-700">2350</b>
          </span>
          <span className="ml-auto">
            {user ? `${user.full_name} · ${ROLE_LABEL[user.role]} · ${user.org_unit_name}` : "ยังไม่ได้เข้าสู่ระบบ"}
          </span>
        </div>
      </footer>
    </div>
  );
}
