/** ค่าคงที่ / รายการตัวเลือก ที่ใช้ร่วมกันทั้งระบบ */

export const APP_NAME = "RAOT Stakeholder Management";
export const ORG_NAME = "การยางแห่งประเทศไทย";
export const ORG_ABBR = "กยท.";

/* ---------- ระดับการสร้างความสัมพันธ์ (Levels) ---------- */
export const ENGAGEMENT_LEVELS = [
  { code: "L1", name: "การให้ข้อมูล (Inform)" },
  { code: "L2", name: "การร่วมงานแบบเป็นทางการ/มีพันธะสัญญา (Transact)" },
  { code: "L3", name: "การแสดงความคิดเห็น หรือให้คำปรึกษา แนะนำ (Consult)" },
  { code: "L4", name: "เจรจาต่อรอง (Negotiate)" },
  { code: "L5", name: "การมีส่วนร่วม (Involve)" },
  { code: "L6", name: "การร่วมมือ (Collaborate)" },
  { code: "L7", name: "ให้อำนาจ (Empower)" },
] as const;

/* ---------- ความเชื่อมโยงของแผนงาน (ใช้ในฟอร์ม [050]) ---------- */
export const PLAN_LINK_TYPES = [
  "แผนวิสาหกิจ",
  "แผนแม่บทด้านผู้มีส่วนได้ส่วนเสีย",
  "แผนปฏิบัติการประจำปี",
  "แผนบริหารความเสี่ยง",
  "แผนงานอื่น ๆ",
] as const;

/* ---------- ระดับความเสี่ยงที่ยอมรับได้ ---------- */
export const RISK_APPETITES = [
  "ความเสี่ยงต่ำ",
  "ความเสี่ยงปานกลาง",
  "ความเสี่ยงสูง",
] as const;

/* ---------- สถานะเอกสาร ---------- */
export const STATUS = {
  DRAFT: "DRAFT",
  APPROVED: "APPROVED",
} as const;
export type DocStatus = (typeof STATUS)[keyof typeof STATUS];

export const STATUS_LABEL: Record<DocStatus, string> = {
  DRAFT: "ฉบับร่าง",
  APPROVED: "อนุมัติแล้ว",
};

/* ---------- สิทธิ์ผู้ใช้ ---------- */
export const ROLES = {
  STAFF: "STAFF",
  APPROVER: "APPROVER",
  ADMIN: "ADMIN",
} as const;
export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_LABEL: Record<Role, string> = {
  STAFF: "ผู้บันทึกข้อมูล",
  APPROVER: "ผู้อนุมัติ",
  ADMIN: "ผู้ดูแลระบบ",
};

export function canApprove(role: Role | undefined): boolean {
  return role === "APPROVER" || role === "ADMIN";
}

/** สิทธิ์แก้ข้อมูลหลักที่กระทบทั้งระบบ เช่น ปีงบประมาณ และองค์ความรู้ */
export function isAdmin(role: Role | undefined): boolean {
  return role === "ADMIN";
}

/* ---------- ขอบเขตการเข้าถึงข้อมูลตามส่วนงาน ----------
 *
 * ผู้บันทึกข้อมูล (STAFF) เห็นและแก้ไขได้เฉพาะข้อมูลของส่วนงานตัวเอง
 * ผู้อนุมัติ (APPROVER) และผู้ดูแลระบบ (ADMIN) เห็นได้ทุกส่วนงาน
 *
 * ถ้าต้องการจำกัดผู้อนุมัติให้เห็นเฉพาะส่วนงานตัวเองด้วย
 * แก้เงื่อนไขใน isUnitScoped() จุดเดียว หน้าจอและ API ทั้งหมดจะเปลี่ยนตาม
 */

/** ข้อมูลผู้ใช้เท่าที่การตรวจสิทธิ์ต้องใช้ (รับได้ทั้ง SessionUser และอ็อบเจกต์ย่อ) */
export type Actor = { role: Role; org_unit_id: number };

export function isUnitScoped(role: Role | undefined): boolean {
  return role === "STAFF";
}

/** ส่วนงานที่ผู้ใช้ถูกจำกัดให้เห็น — undefined = เห็นได้ทุกส่วนงาน (ใช้เป็นตัวกรองของคิวรี) */
export function scopedOrgUnitId(user: Actor): number | undefined {
  return isUnitScoped(user.role) ? user.org_unit_id : undefined;
}

/** ผู้ใช้แก้ไขข้อมูลที่เป็นของส่วนงานนี้ได้หรือไม่ */
export function canEditOrgUnit(user: Actor, orgUnitId: number | null | undefined): boolean {
  if (!isUnitScoped(user.role)) return true;
  return orgUnitId === user.org_unit_id;
}

/** รายชื่อส่วนงานที่ผู้ใช้เลือกได้ในฟอร์มและตัวกรอง */
export function selectableUnits<T extends { id: number }>(user: Actor, units: T[]): T[] {
  return isUnitScoped(user.role) ? units.filter((u) => u.id === user.org_unit_id) : units;
}

export const NO_UNIT_PERMISSION = "ไม่มีสิทธิ์เข้าถึงข้อมูลของส่วนงานอื่น";

/* ---------- โครงสร้างเมนูหลัก (ตามระบบ BAAC หน้า 26-37) ---------- */
export type MenuItem = { code?: string; label: string; href: string };
/** adminOnly = แสดงเฉพาะผู้ดูแลระบบ (ดูการกรองที่ components/AppShell.tsx) */
export type MenuGroup = { label: string; href?: string; items?: MenuItem[]; adminOnly?: boolean };

export const MENU: MenuGroup[] = [
  { label: "HOME", href: "/" },
  {
    label: "PROFILE",
    items: [
      { code: "100", label: "บันทึกข้อมูล Stakeholder's Profile", href: "/profile" },
    ],
  },
  {
    label: "ORGANIZATION",
    items: [
      { code: "004", label: "วัตถุประสงค์และขอบเขตการสร้างความสัมพันธ์ ระดับองค์กร", href: "/organization/objective" },
      { code: "040", label: "บันทึกแผนงาน/โครงการ", href: "/organization/plans" },
      { code: "0411", label: "บันทึกผลการดำเนินงานตามแผนงาน/โครงการ - ไตรมาส 1", href: "/organization/results/1" },
      { code: "0412", label: "บันทึกผลการดำเนินงานตามแผนงาน/โครงการ - ไตรมาส 2", href: "/organization/results/2" },
      { code: "0413", label: "บันทึกผลการดำเนินงานตามแผนงาน/โครงการ - ไตรมาส 3", href: "/organization/results/3" },
      { code: "0414", label: "บันทึกผลการดำเนินงานตามแผนงาน/โครงการ - ไตรมาส 4", href: "/organization/results/4" },
    ],
  },
  {
    label: "CLUSTER",
    items: [
      { code: "005", label: "วัตถุประสงค์และขอบเขตการสร้างความสัมพันธ์ ระดับส่วนงาน", href: "/cluster/objective" },
      { code: "050", label: "บันทึกแผนงาน/โครงการ", href: "/cluster/plans" },
      { code: "0511", label: "บันทึกผลการดำเนินงานตามแผนงาน/โครงการ - ไตรมาส 1", href: "/cluster/results/1" },
      { code: "0512", label: "บันทึกผลการดำเนินงานตามแผนงาน/โครงการ - ไตรมาส 2", href: "/cluster/results/2" },
      { code: "0513", label: "บันทึกผลการดำเนินงานตามแผนงาน/โครงการ - ไตรมาส 3", href: "/cluster/results/3" },
      { code: "0514", label: "บันทึกผลการดำเนินงานตามแผนงาน/โครงการ - ไตรมาส 4", href: "/cluster/results/4" },
    ],
  },
  {
    label: "REPORT",
    items: [
      { code: "804", label: "รายงานข้อมูลด้านผู้มีส่วนได้ส่วนเสีย ทั้งหมด", href: "/report/804" },
      { code: "805", label: "รายงานวัตถุประสงค์ ขอบเขต ของการสร้างความสัมพันธ์ ระดับส่วนงาน", href: "/report/805" },
      { code: "806", label: "รายงานแผนแม่บทด้านผู้มีส่วนได้ส่วนเสีย ระดับองค์กร", href: "/report/806" },
      { code: "807", label: "รายงานผลการดำเนินงาน ตามแผนแม่บทด้านผู้มีส่วนได้ส่วนเสีย (ระดับองค์กร)", href: "/report/807" },
      { code: "808", label: "รายงานแผนสร้างความสัมพันธ์กับผู้มีส่วนได้ส่วนเสียระดับส่วนงาน", href: "/report/808" },
      { code: "809", label: "รายงานผลการดำเนินงาน ตามแผนสร้างความสัมพันธ์กับผู้มีส่วนได้ส่วนเสีย (ระดับส่วนงาน)", href: "/report/809" },
      { code: "810", label: "รายงานความต้องการความคาดหวังของผู้มีส่วนได้ส่วนเสีย", href: "/report/810" },
    ],
  },
  {
    label: "Knowledge Management",
    items: [
      { label: "องค์ความรู้ — ค้นหาและอ่านทุกหัวข้อ", href: "/km" },
      { code: "604", label: "บันทึกความต้องการความคาดหวังของผู้มีส่วนได้ส่วนเสีย", href: "/expectations" },
    ],
  },
  {
    label: "ตั้งค่าระบบ",
    adminOnly: true,
    items: [
      { label: "ปีงบประมาณ", href: "/settings/fiscal-years" },
    ],
  },
];

export function findMenuItem(code: string): MenuItem | undefined {
  for (const group of MENU) {
    const hit = group.items?.find((item) => item.code === code);
    if (hit) return hit;
  }
  return undefined;
}
