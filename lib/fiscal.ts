/**
 * ปฏิทินปีงบประมาณ
 *
 * ระบบ BAAC ต้นแบบใช้ปีบัญชีของธนาคารซึ่งเริ่มเดือนเมษายน (ไตรมาส 1 = เม.ย./พ.ค./มิ.ย.)
 * กยท. เป็นรัฐวิสาหกิจ ใช้ปีงบประมาณเริ่มเดือนตุลาคม จึงตั้งค่าเริ่มต้นเป็น 10
 * เปลี่ยนค่าเดียวตรงนี้เพื่อสลับกลับเป็นแบบ ธ.ก.ส. (= 4)
 */
export const FISCAL_YEAR_START_MONTH = 10;

export const THAI_MONTHS = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
] as const;

export type Quarter = 1 | 2 | 3 | 4;

export const QUARTERS: Quarter[] = [1, 2, 3, 4];

export function isQuarter(value: unknown): value is Quarter {
  return value === 1 || value === 2 || value === 3 || value === 4;
}

/** ชื่อเดือนทั้ง 3 เดือนของไตรมาสที่กำหนด เรียงตามปีงบประมาณ */
export function fiscalMonths(quarter: Quarter): string[] {
  const firstMonthIndex = (FISCAL_YEAR_START_MONTH - 1 + (quarter - 1) * 3) % 12;
  return [0, 1, 2].map((offset) => THAI_MONTHS[(firstMonthIndex + offset) % 12]);
}

/** ปีงบประมาณปัจจุบันเป็น พ.ศ. */
export function currentFiscalYear(today = new Date()): number {
  const buddhistYear = today.getFullYear() + 543;
  return today.getMonth() + 1 >= FISCAL_YEAR_START_MONTH ? buddhistYear + 1 : buddhistYear;
}

/**
 * ช่วงเวลาของปีงบประมาณหนึ่ง ๆ เป็นข้อความ เช่น "ตุลาคม 2567 – กันยายน 2568"
 *
 * ปีงบประมาณที่เริ่มเดือนอื่นที่ไม่ใช่มกราคม จะคร่อมสองปีปฏิทิน
 * (ปี 2568 ที่เริ่มเดือนตุลาคม = ต.ค. 2567 ถึง ก.ย. 2568)
 * ถ้าตั้งค่าให้เริ่มเดือนมกราคม ปีงบประมาณจะตรงกับปีปฏิทินพอดี
 */
export function fiscalYearRange(year: number, startMonth = FISCAL_YEAR_START_MONTH): string {
  const start = THAI_MONTHS[(startMonth - 1) % 12];
  const end = THAI_MONTHS[(startMonth + 10) % 12];
  const startYear = startMonth === 1 ? year : year - 1;
  return `${start} ${startYear} – ${end} ${year}`;
}
