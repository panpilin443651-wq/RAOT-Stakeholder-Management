/**
 * ภาพประกอบหน้าแรก — เครือข่ายผู้มีส่วนได้ส่วนเสียรอบองค์กร
 * วาดเป็น inline SVG จึงไม่ต้องพึ่งไฟล์ภาพภายนอก
 */
export default function HeroArt() {
  // 8 กลุ่มตามที่ กยท. กำหนด (ดู lib/seed.ts)
  const groups = [
    { angle: -90, label: "ภาครัฐผู้กำกับ" },
    { angle: -45, label: "คณะกรรมการ" },
    { angle: 0, label: "พันธมิตร" },
    { angle: 45, label: "ลูกค้า" },
    { angle: 90, label: "ชุมชน" },
    { angle: 135, label: "พนักงาน" },
    { angle: 180, label: "สื่อมวลชน" },
    { angle: 225, label: "คู่เทียบ" },
  ];
  const cx = 300;
  const cy = 215;
  const r = 138;

  return (
    <div className="overflow-hidden rounded border border-[var(--line)] bg-gradient-to-br from-raot-50 via-white to-raot-100">
      <svg viewBox="0 0 600 430" className="h-auto w-full" role="img" aria-label="แผนภาพเครือข่ายผู้มีส่วนได้ส่วนเสีย 8 กลุ่มรอบ กยท.">
        <defs>
          <radialGradient id="core" cx="50%" cy="40%">
            <stop offset="0%" stopColor="#22a04c" />
            <stop offset="100%" stopColor="#0b3d20" />
          </radialGradient>
        </defs>

        {/* วงโคจรพื้นหลัง */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#c3ecd3" strokeWidth="1.5" strokeDasharray="5 7" />
        <circle cx={cx} cy={cy} r={r - 46} fill="none" stroke="#e2f6ea" strokeWidth="1.5" />

        {/* เส้นเชื่อมและโหนดของแต่ละกลุ่ม */}
        {groups.map((g) => {
          const rad = (g.angle * Math.PI) / 180;
          const x = cx + r * Math.cos(rad);
          const y = cy + r * Math.sin(rad);
          const anchor = Math.abs(g.angle + 90) < 1 ? "middle" : Math.cos(rad) >= 0 ? "start" : "end";
          const labelX = x + (anchor === "middle" ? 0 : anchor === "start" ? 26 : -26);
          const labelY = anchor === "middle" ? y - 30 : y + 4;
          return (
            <g key={g.label}>
              <line x1={cx} y1={cy} x2={x} y2={y} stroke="#86d9a6" strokeWidth="1.6" />
              <circle cx={x} cy={y} r="19" fill="#ffffff" stroke="#15803d" strokeWidth="2" />
              {/* สัญลักษณ์คนอย่างง่าย */}
              <circle cx={x} cy={y - 5} r="5" fill="#166534" />
              <path d={`M${x - 8} ${y + 9} a8 8 0 0 1 16 0z`} fill="#166534" />
              <text x={labelX} y={labelY} textAnchor={anchor} fontSize="12.5" fill="#11532c">
                {g.label}
              </text>
            </g>
          );
        })}

        {/* แกนกลาง = องค์กร */}
        <circle cx={cx} cy={cy} r="46" fill="url(#core)" />
        <circle cx={cx} cy={cy} r="46" fill="none" stroke="#c8a344" strokeWidth="2.5" />
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize="17" fontWeight="600" fill="#ffffff">
          กยท.
        </text>
        <text x={cx} y={cy + 15} textAnchor="middle" fontSize="10.5" fill="#c3ecd3">
          RAOT
        </text>

        <text x={cx} y={402} textAnchor="middle" fontSize="13" fill="#11532c">
          การสร้างความสัมพันธ์กับผู้มีส่วนได้ส่วนเสีย 8 กลุ่มหลัก
        </text>
      </svg>
    </div>
  );
}
