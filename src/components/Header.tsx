import React, { useState } from 'react';
import { Zap, Bell, CheckCircle2, ShieldCheck, RefreshCw, FileText, ChevronDown } from 'lucide-react';
import { NotificationItem } from '../types/contract';

interface HeaderProps {
  notifications: NotificationItem[];
  onOpenNotifications: () => void;
  onSimulateEvent: () => void;
  isSimulating: boolean;
  onGoHome?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  notifications,
  onOpenNotifications,
  onSimulateEvent,
  isSimulating,
  onGoHome,
}) => {
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-sky-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single Brand element with clickable lightning icon to return to home */}
          <div
            onClick={onGoHome}
            className={`flex items-center gap-3 select-none ${
              onGoHome ? 'cursor-pointer group' : ''
            }`}
            title="กดรูปสายฟ้าหรือโลโก้เพื่อกลับหน้าหลัก"
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onGoHome?.();
              }}
              className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-cyan-400 hover:from-sky-600 hover:to-cyan-500 active:scale-95 flex items-center justify-center text-white shadow-sm shadow-sky-200 transition-all duration-150 cursor-pointer group-hover:ring-2 group-hover:ring-sky-400 group-hover:ring-offset-2"
              title="กดรูปสายฟ้าเพื่อกลับหน้าหลักทันที"
            >
              <Zap className="w-5 h-5 text-white transition-transform duration-200 group-hover:scale-110" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-sky-600 transition-colors">
                  ระบบจัดเก็บและติดตามสัญญาซื้อขายไฟฟ้า
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium text-sky-700 bg-sky-50 border border-sky-200 rounded-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  ระบบออนไลน์ (Real-time)
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden md:block">
                ศูนย์กลางบริหารจัดการสัญญาผู้ใช้ไฟฟ้ารายใหญ่ การไฟฟ้าส่วนภูมิภาค (กฟภ.)
              </p>
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
            <a href="#table-section" className="text-sky-600 font-semibold flex items-center gap-1.5 transition-colors">
              <FileText className="w-4 h-4" />
              ทะเบียนสัญญาไฟฟ้า
            </a>
            <a href="#overview-section" className="text-slate-600 hover:text-slate-900 transition-colors">
              สถิติภาพรวม
            </a>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-sky-600" />
              <span>ฐานข้อมูลปลอดภัย Vercel & Postgres Ready</span>
            </div>
          </nav>

          {/* Zone 3: Actions & Real-time Alerts */}
          <div className="flex items-center gap-3">
            {/* Simulate Real-time Event Button */}
            <button
              onClick={onSimulateEvent}
              disabled={isSimulating}
              title="กดเพื่อจำลองการส่งการแจ้งเตือนแบบเรียลไทม์"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin text-sky-600' : ''}`} />
              <span>จำลองแจ้งเตือนสด</span>
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={onOpenNotifications}
                className="relative p-2 text-slate-600 hover:text-sky-600 hover:bg-sky-50/80 rounded-xl transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-400"
                aria-label="การแจ้งเตือนเอกสาร"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex items-center justify-center min-w-4 h-4 px-1 text-[10px] font-bold text-white bg-rose-500 rounded-full animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>

            {/* User Profile */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-sky-100 border border-sky-300 flex items-center justify-center text-sky-700 font-semibold text-xs">
                PEA
              </div>
              <div className="hidden xl:block text-left text-xs">
                <div className="font-semibold text-slate-800">เจ้าหน้าที่นิติกรสัญญา</div>
                <div className="text-[11px] text-slate-400">ฝ่ายสัญญาซื้อขายไฟฟ้า</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
