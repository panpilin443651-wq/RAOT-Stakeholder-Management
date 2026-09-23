/**
 * แถบบอกผู้บันทึกข้อมูลว่ากำลังเห็นเฉพาะข้อมูลของส่วนงานตัวเอง
 * แสดงเมื่อสิทธิ์ถูกจำกัดเท่านั้น (ผู้อนุมัติและผู้ดูแลระบบจะไม่เห็นแถบนี้)
 */
export default function UnitScopeNote({ unitName }: { unitName: string }) {
  return (
    <p className="no-print mb-4 rounded border border-raot-300 bg-raot-50 px-4 py-2.5 text-[12.5px] text-raot-800">
      แสดงเฉพาะข้อมูลของส่วนงาน <b>{unitName}</b> — สิทธิ์ผู้บันทึกข้อมูลเข้าถึงและแก้ไขได้เฉพาะส่วนงานตัวเอง
    </p>
  );
}
