import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // เดิมมี serverExternalPackages: ["node:sqlite"] ตอนใช้ SQLite แบบไฟล์
  // ย้ายมา Neon Postgres แล้วจึงไม่ต้องกันโมดูลนี้ออกจาก bundle อีก
};

export default nextConfig;
