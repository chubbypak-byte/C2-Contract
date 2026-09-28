import React from 'react';
import { Zap, ShieldCheck, FileCheck, Search, Activity, Sparkles, Building2 } from 'lucide-react';
import heroImage from '../assets/images/hero_power_grid_soft_1790573415835.jpg';

interface HeroBannerProps {
  onQuickSearchFocus: () => void;
  pendingCount: number;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onQuickSearchFocus,
  pendingCount,
}) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-900 via-sky-800 to-slate-900 text-white mb-8 shadow-sm">
      {/* Background Graphic Asset with measured scrim */}
      <div className="absolute inset-0 z-0 opacity-25 mix-blend-overlay">
        <img
          src={heroImage}
          alt="Power Grid Clean Infrastructure"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Decorative soft gradients */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-sky-500/20 rounded-full blur-3xl pointer-events-none"></div>

      {/* Content Container */}
      <div className="relative z-10 p-6 sm:p-8 lg:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-cyan-200 text-xs font-medium mb-3 border border-white/10">
            <Zap className="w-3.5 h-3.5 text-cyan-300" />
            <span>ระบบบริหารจัดการสัญญาซื้อขายไฟฟ้าอัจฉริยะ (Smart PPA Registry)</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight text-balance">
            ศูนย์กลางจัดเก็บสัญญาและติดตามสถานะผู้ใช้ไฟฟ้ารายใหญ่
          </h1>

          <p className="mt-2.5 text-sm sm:text-base text-sky-100/90 leading-relaxed font-light max-w-xl">
            ค้นหาข้อมูลการจำหน่ายไฟฟ้า พิกัดขนาดหม้อแปลง ระดับแรงดัน และตรวจรับไฟล์สัญญาซื้อขายไฟฟ้าแบบเรียลไทม์ การไฟฟ้าส่วนภูมิภาค (กฟภ.)
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={onQuickSearchFocus}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>ค้นหาหมายเลขผู้ใช้ไฟฟ้า (CA)</span>
            </button>

            {pendingCount > 0 && (
              <div className="inline-flex items-center gap-2 px-3.5 py-2 bg-amber-500/20 border border-amber-300/30 text-amber-200 text-xs rounded-xl backdrop-blur-xs">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                <span>มีสัญญารอตรวจสอบ {pendingCount} รายการ</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Info Box */}
        <div className="lg:w-80 shrink-0 bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/15 text-xs space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-white/15">
            <span className="text-sky-200 font-medium">มาตรฐานความปลอดภัย</span>
            <span className="text-emerald-300 font-mono flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              เข้ารหัส 256-bit
            </span>
          </div>

          <div className="space-y-2 text-sky-100">
            <div className="flex items-center justify-between">
              <span className="text-sky-200/80">ระบบคลาวด์เป้าหมาย</span>
              <span className="font-semibold text-white">Vercel Serverless Ready</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sky-200/80">ฐานข้อมูลที่รองรับ</span>
              <span className="font-semibold text-white">PostgreSQL (Relational)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sky-200/80">การแจ้งเตือนสด</span>
              <span className="font-semibold text-cyan-300">Live SSE / Real-time</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
