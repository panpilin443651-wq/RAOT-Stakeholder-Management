import { listUsers } from "@/lib/auth";
import { ROLE_LABEL } from "@/lib/masters";
import FormCard from "@/components/FormCard";
import LoginList from "@/components/LoginList";
import RaotLogo from "@/components/RaotLogo";

export default function LoginPage() {
  const users = listUsers();
  return (
    <div className="mx-auto max-w-3xl">
      <FormCard title="เข้าสู่ระบบ" code="000">
        <div className="mb-6 flex justify-center">
          <RaotLogo variant="full" className="h-32 w-32" />
        </div>
        <p className="mb-5 text-[var(--ink-muted)]">
          เลือกผู้ใช้เพื่อเข้าใช้งานระบบ (รอบนี้เป็นการจำลองสิทธิ์ ยังไม่ได้เชื่อมต่อระบบยืนยันตัวตนขององค์กร)
        </p>
        <LoginList
          users={users.map((u) => ({
            username: u.username,
            full_name: u.full_name,
            position: u.position,
            role_label: ROLE_LABEL[u.role],
            org_unit_name: u.org_unit_name,
          }))}
        />
      </FormCard>
    </div>
  );
}
