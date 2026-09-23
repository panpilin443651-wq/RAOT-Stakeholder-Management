import Image from "next/image";

/**
 * ตราสัญลักษณ์การยางแห่งประเทศไทย
 * - variant "emblem" : เฉพาะวงตราสัญลักษณ์ ใช้ในแถบเมนูซึ่งมีชื่อระบบกำกับอยู่แล้ว
 * - variant "full"   : ตราสัญลักษณ์พร้อมชื่อองค์กร ใช้ในหน้าที่มีพื้นที่พอ
 */
export default function RaotLogo({
  variant = "emblem",
  className = "h-11 w-11",
}: {
  variant?: "emblem" | "full";
  className?: string;
}) {
  const full = variant === "full";
  return (
    <Image
      src={full ? "/raot-logo.png" : "/raot-emblem.png"}
      alt="ตราสัญลักษณ์การยางแห่งประเทศไทย"
      width={full ? 240 : 180}
      height={full ? 240 : 178}
      priority
      className={`object-contain ${className}`}
    />
  );
}
