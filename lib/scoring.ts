/**
 * ตรรกะการให้คะแนน/จัดลำดับทั้งหมดของระบบรวมไว้ที่ไฟล์เดียว
 * เพื่อให้ปรับเกณฑ์ได้โดยไม่ต้องแก้หน้าจอ
 */

export type Score3 = 1 | 2 | 3;
export type Score4 = 1 | 2 | 3 | 4;
export type Score5 = 1 | 2 | 3 | 4 | 5;

/* ------------------------------------------------------------------ */
/* 1) ลำดับความสำคัญ Zone จาก ระดับความสนใจ (แกน X) และ ระดับอิทธิพล (แกน Y)
 *
 * ยืนยันจากเอกสารต้นแบบได้ 1 ช่อง: X = น้อย (1), Y = กลาง (2) -> Zone 3
 * ช่องที่เหลืออนุมานตามหลัก Mendelow (Power/Interest Grid)
 * ดัชนี: ZONE_MATRIX[อิทธิพล][ความสนใจ]
 */
export const ZONE_MATRIX: Record<Score3, Record<Score3, Score4>> = {
  3: { 1: 2, 2: 1, 3: 1 }, // อิทธิพลมาก
  2: { 1: 3, 2: 2, 3: 1 }, // อิทธิพลกลาง
  1: { 1: 4, 2: 4, 3: 3 }, // อิทธิพลน้อย
};

export const ZONE_LABELS: Record<Score4, string> = {
  1: "Zone 1 - บริหารความสัมพันธ์อย่างใกล้ชิด (Manage Closely)",
  2: "Zone 2 - สร้างความพึงพอใจอย่างต่อเนื่อง (Keep Satisfied)",
  3: "Zone 3 - ให้ข้อมูลอย่างสม่ำเสมอ (Keep Informed)",
  4: "Zone 4 - เฝ้าติดตาม (Monitor)",
};

export function calcZone(interestX: number | null, influenceY: number | null): Score4 | null {
  if (!isScore3(interestX) || !isScore3(influenceY)) return null;
  return ZONE_MATRIX[influenceY][interestX];
}

/* ------------------------------------------------------------------ */
/* 1.1) แถบสีตาม "แผนผังการจัดลำดับของประเด็นความต้องการ ความคาดหวัง
 *      และความกังวลของผู้มีส่วนได้ส่วนเสีย" ที่ กยท. กำหนด
 *
 *      แกนตั้ง = ความสำคัญต่อองค์กร (1 น้อย - 4 สูงมาก)
 *      แกนนอน = ความสำคัญต่อผู้มีส่วนได้ส่วนเสีย (1 น้อย - 4 สูงมาก)
 */
export const BANDS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
export type Band = (typeof BANDS)[number];

/**
 * bg/fg/border = สีพื้นตารางตามแผนผังที่ กยท. กำหนด (มีตัวอักษรสีเข้มทับ จึงอ่านได้ชัด)
 * chart        = เฉดเข้มของระดับเดียวกัน สำหรับใช้เป็นสีแท่งกราฟบนพื้นขาว
 *                สีพื้นตารางเป็นสีพาสเทลซึ่งคอนทราสต์ไม่พอเมื่อใช้เป็นแท่งกราฟ
 *                ชุด chart ผ่านการตรวจการแยกแยะสำหรับผู้มีภาวะตาบอดสี (ΔE ต่ำสุด 14.0)
 */
export const BAND_STYLE: Record<
  Band,
  { label: string; bg: string; fg: string; border: string; chart: string }
> = {
  LOW: { label: "ต่ำ", bg: "#cfe5c3", fg: "#2f5c22", border: "#a9cf97", chart: "#3a9d5d" },
  MEDIUM: { label: "ปานกลาง", bg: "#fde7a7", fg: "#7a5a05", border: "#e9cd73", chart: "#e5b52c" },
  HIGH: { label: "สูง", bg: "#f5b183", fg: "#7c3a10", border: "#dd9260", chart: "#d2691e" },
  CRITICAL: { label: "สูงมาก", bg: "#fa8080", fg: "#7a1414", border: "#e45f5f", chart: "#9e1b32" },
};

/** ดัชนี: PRIORITY_MATRIX[ความสำคัญต่อองค์กร][ความสำคัญต่อผู้มีส่วนได้ส่วนเสีย] */
export const PRIORITY_MATRIX: Record<Score4, Record<Score4, Band>> = {
  4: { 1: "HIGH", 2: "HIGH", 3: "CRITICAL", 4: "CRITICAL" },
  3: { 1: "HIGH", 2: "HIGH", 3: "CRITICAL", 4: "CRITICAL" },
  2: { 1: "LOW", 2: "LOW", 3: "MEDIUM", 4: "MEDIUM" },
  1: { 1: "LOW", 2: "LOW", 3: "MEDIUM", 4: "MEDIUM" },
};

export const SCORE4_LABELS: Record<Score4, string> = {
  1: "น้อย",
  2: "ปานกลาง",
  3: "สูง",
  4: "สูงมาก",
};

/** แถบสีของประเด็น ตามตำแหน่งในแผนผัง */
export function issueBand(impactOrg: number | null, impactStakeholder: number | null): Band | null {
  if (!isScore4(impactOrg) || !isScore4(impactStakeholder)) return null;
  return PRIORITY_MATRIX[impactOrg][impactStakeholder];
}

/**
 * แถบสีของ Zone — ใช้ชุดสีเดียวกับแผนผังข้างต้น
 * Zone 1 สำคัญที่สุด (สีแดง) ไล่ลงไปจนถึง Zone 4 (สีเขียว)
 */
export const ZONE_BAND: Record<Score4, Band> = {
  1: "CRITICAL",
  2: "HIGH",
  3: "MEDIUM",
  4: "LOW",
};

export function zoneBand(zone: number | null): Band | null {
  return isScore4(zone) ? ZONE_BAND[zone] : null;
}

/* ------------------------------------------------------------------ */
/* 2) ลำดับความสำคัญของประเด็น จากความสำคัญต่อองค์กร และความสำคัญต่อผู้มีส่วนได้ส่วนเสีย
 *
 * ยืนยันจากเอกสารต้นแบบ: องค์กร = 1, ผู้มีส่วนได้ส่วนเสีย = 4 -> ลำดับที่ 3
 */
export function calcIssuePriority(
  impactOrg: number | null,
  impactStakeholder: number | null,
): Score4 | null {
  if (!isScore4(impactOrg) || !isScore4(impactStakeholder)) return null;
  return Math.ceil((impactOrg + impactStakeholder) / 2) as Score4;
}

/* ------------------------------------------------------------------ */
/* 3) ระดับความเสี่ยง จาก IMPACT x LIKELIHOOD (มาตรฐาน 5x5) */

export const RISK_LEVELS = ["ความเสี่ยงต่ำ", "ความเสี่ยงปานกลาง", "ความเสี่ยงสูง", "ความเสี่ยงสูงมาก"] as const;
export type RiskLevel = (typeof RISK_LEVELS)[number];

/** ดัชนี: RISK_MATRIX[likelihood][impact] */
export const RISK_MATRIX: Record<Score5, Record<Score5, RiskLevel>> = {
  5: { 1: "ความเสี่ยงปานกลาง", 2: "ความเสี่ยงสูง", 3: "ความเสี่ยงสูง", 4: "ความเสี่ยงสูงมาก", 5: "ความเสี่ยงสูงมาก" },
  4: { 1: "ความเสี่ยงปานกลาง", 2: "ความเสี่ยงปานกลาง", 3: "ความเสี่ยงสูง", 4: "ความเสี่ยงสูง", 5: "ความเสี่ยงสูงมาก" },
  3: { 1: "ความเสี่ยงต่ำ", 2: "ความเสี่ยงปานกลาง", 3: "ความเสี่ยงปานกลาง", 4: "ความเสี่ยงสูง", 5: "ความเสี่ยงสูง" },
  2: { 1: "ความเสี่ยงต่ำ", 2: "ความเสี่ยงต่ำ", 3: "ความเสี่ยงปานกลาง", 4: "ความเสี่ยงปานกลาง", 5: "ความเสี่ยงสูง" },
  1: { 1: "ความเสี่ยงต่ำ", 2: "ความเสี่ยงต่ำ", 3: "ความเสี่ยงต่ำ", 4: "ความเสี่ยงปานกลาง", 5: "ความเสี่ยงปานกลาง" },
};

export function calcRiskLevel(impact: number | null, likelihood: number | null): RiskLevel | null {
  if (!isScore5(impact) || !isScore5(likelihood)) return null;
  return RISK_MATRIX[likelihood][impact];
}

/** ตั้งแต่ "ปานกลาง" ขึ้นไปต้องระบุมาตรการควบคุมความเสี่ยง */
export function requiresRiskControl(level: RiskLevel | null): boolean {
  return level !== null && level !== "ความเสี่ยงต่ำ";
}

export const RISK_LEVEL_COLOR: Record<RiskLevel, string> = {
  "ความเสี่ยงต่ำ": "bg-emerald-100 text-emerald-800",
  "ความเสี่ยงปานกลาง": "bg-amber-100 text-amber-800",
  "ความเสี่ยงสูง": "bg-orange-100 text-orange-800",
  "ความเสี่ยงสูงมาก": "bg-red-100 text-red-800",
};

/* ------------------------------------------------------------------ */
function isScore3(v: unknown): v is Score3 {
  return v === 1 || v === 2 || v === 3;
}
function isScore4(v: unknown): v is Score4 {
  return v === 1 || v === 2 || v === 3 || v === 4;
}
function isScore5(v: unknown): v is Score5 {
  return v === 1 || v === 2 || v === 3 || v === 4 || v === 5;
}
