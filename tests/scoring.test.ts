import { describe, it, expect } from "vitest";
import {
  calcZone,
  calcIssuePriority,
  calcRiskLevel,
  requiresRiskControl,
  issueBand,
  zoneBand,
  BANDS,
} from "../lib/scoring";
import { fiscalMonths, FISCAL_YEAR_START_MONTH, fiscalYearRange } from "../lib/fiscal";

describe("calcZone", () => {
  it("ตรงกับค่าที่ยืนยันได้จากเอกสารต้นแบบ: X=1, Y=2 -> Zone 3", () => {
    expect(calcZone(1, 2)).toBe(3);
  });

  it("ความสนใจมากและอิทธิพลมาก -> Zone 1", () => {
    expect(calcZone(3, 3)).toBe(1);
  });

  it("ความสนใจน้อยและอิทธิพลน้อย -> Zone 4", () => {
    expect(calcZone(1, 1)).toBe(4);
  });

  it("คืน null เมื่อยังให้คะแนนไม่ครบ", () => {
    expect(calcZone(null, 2)).toBeNull();
    expect(calcZone(2, null)).toBeNull();
  });

  it("คืน null เมื่อคะแนนอยู่นอกช่วง 1-3", () => {
    expect(calcZone(4, 2)).toBeNull();
    expect(calcZone(0, 2)).toBeNull();
  });
});

describe("calcIssuePriority", () => {
  it("ตรงกับค่าที่ยืนยันได้จากเอกสารต้นแบบ: องค์กร=1, ผู้มีส่วนได้ส่วนเสีย=4 -> ลำดับ 3", () => {
    expect(calcIssuePriority(1, 4)).toBe(3);
  });

  it("กระทบสูงสุดทั้งสองด้าน -> ลำดับ 4", () => {
    expect(calcIssuePriority(4, 4)).toBe(4);
  });

  it("กระทบต่ำสุดทั้งสองด้าน -> ลำดับ 1", () => {
    expect(calcIssuePriority(1, 1)).toBe(1);
  });

  it("คืน null เมื่อยังให้คะแนนไม่ครบ", () => {
    expect(calcIssuePriority(null, 3)).toBeNull();
  });
});

describe("calcRiskLevel", () => {
  it("IMPACT และ LIKELIHOOD ต่ำ -> ความเสี่ยงต่ำ", () => {
    expect(calcRiskLevel(1, 1)).toBe("ความเสี่ยงต่ำ");
  });

  it("IMPACT=4 LIKELIHOOD=3 -> ความเสี่ยงสูง (ตรงกับข้อมูลตัวอย่างในระบบ)", () => {
    expect(calcRiskLevel(4, 3)).toBe("ความเสี่ยงสูง");
  });

  it("IMPACT=3 LIKELIHOOD=3 -> ความเสี่ยงปานกลาง", () => {
    expect(calcRiskLevel(3, 3)).toBe("ความเสี่ยงปานกลาง");
  });

  it("สูงสุดทั้งคู่ -> ความเสี่ยงสูงมาก", () => {
    expect(calcRiskLevel(5, 5)).toBe("ความเสี่ยงสูงมาก");
  });

  it("คืน null เมื่อยังให้คะแนนไม่ครบ", () => {
    expect(calcRiskLevel(null, 3)).toBeNull();
  });
});

describe("requiresRiskControl", () => {
  it("บังคับกรอกมาตรการควบคุมตั้งแต่ระดับปานกลางขึ้นไป", () => {
    expect(requiresRiskControl("ความเสี่ยงต่ำ")).toBe(false);
    expect(requiresRiskControl("ความเสี่ยงปานกลาง")).toBe(true);
    expect(requiresRiskControl("ความเสี่ยงสูง")).toBe(true);
    expect(requiresRiskControl("ความเสี่ยงสูงมาก")).toBe(true);
    expect(requiresRiskControl(null)).toBe(false);
  });
});

describe("fiscalMonths", () => {
  it("ใช้ปีงบประมาณ ต.ค.-ก.ย. ตามที่ตั้งค่าไว้สำหรับ กยท.", () => {
    expect(FISCAL_YEAR_START_MONTH).toBe(10);
    expect(fiscalMonths(1)).toEqual(["ตุลาคม", "พฤศจิกายน", "ธันวาคม"]);
    expect(fiscalMonths(4)).toEqual(["กรกฎาคม", "สิงหาคม", "กันยายน"]);
  });

  it("แต่ละไตรมาสมี 3 เดือน และรวมกันครบ 12 เดือนไม่ซ้ำ", () => {
    const months = [1, 2, 3, 4].flatMap((q) => fiscalMonths(q as 1 | 2 | 3 | 4));
    expect(months).toHaveLength(12);
    expect(new Set(months).size).toBe(12);
  });
});

describe("แถบสีตามแผนผังการจัดลำดับของประเด็น", () => {
  it("ความสำคัญต่อองค์กรและต่อผู้มีส่วนได้ส่วนเสียต่ำทั้งคู่ -> เขียว (ต่ำ)", () => {
    expect(issueBand(1, 1)).toBe("LOW");
    expect(issueBand(2, 2)).toBe("LOW");
  });

  it("องค์กรต่ำ แต่ผู้มีส่วนได้ส่วนเสียสูง -> เหลือง (ปานกลาง)", () => {
    expect(issueBand(1, 3)).toBe("MEDIUM");
    expect(issueBand(2, 4)).toBe("MEDIUM");
  });

  it("องค์กรสูง แต่ผู้มีส่วนได้ส่วนเสียต่ำ -> ส้ม (สูง)", () => {
    expect(issueBand(3, 1)).toBe("HIGH");
    expect(issueBand(4, 2)).toBe("HIGH");
  });

  it("สูงทั้งคู่ -> แดง (สูงมาก)", () => {
    expect(issueBand(3, 3)).toBe("CRITICAL");
    expect(issueBand(4, 4)).toBe("CRITICAL");
  });

  it("คืน null เมื่อยังให้คะแนนไม่ครบ", () => {
    expect(issueBand(null, 3)).toBeNull();
    expect(issueBand(3, null)).toBeNull();
  });

  it("ทั้ง 16 ช่องของแผนผังมีแถบสีครบ", () => {
    for (const org of [1, 2, 3, 4]) {
      for (const sh of [1, 2, 3, 4]) {
        expect(BANDS).toContain(issueBand(org, sh));
      }
    }
  });
});

describe("zoneBand", () => {
  it("Zone 1 สำคัญที่สุด (แดง) ไล่ลงถึง Zone 4 (เขียว)", () => {
    expect(zoneBand(1)).toBe("CRITICAL");
    expect(zoneBand(2)).toBe("HIGH");
    expect(zoneBand(3)).toBe("MEDIUM");
    expect(zoneBand(4)).toBe("LOW");
    expect(zoneBand(null)).toBeNull();
  });
});

describe("fiscalYearRange", () => {
  it("ปีงบประมาณที่เริ่มเดือนตุลาคม คร่อมสองปีปฏิทิน", () => {
    expect(fiscalYearRange(2568, 10)).toBe("ตุลาคม 2567 – กันยายน 2568");
  });

  it("เริ่มเดือนเมษายนแบบ ธ.ก.ส.", () => {
    expect(fiscalYearRange(2568, 4)).toBe("เมษายน 2567 – มีนาคม 2568");
  });

  it("เริ่มเดือนมกราคม = ตรงกับปีปฏิทินพอดี", () => {
    expect(fiscalYearRange(2568, 1)).toBe("มกราคม 2568 – ธันวาคม 2568");
  });

  it("ใช้ค่าเริ่มต้นของระบบเมื่อไม่ระบุเดือน", () => {
    expect(fiscalYearRange(2569)).toBe(fiscalYearRange(2569, FISCAL_YEAR_START_MONTH));
  });
});
