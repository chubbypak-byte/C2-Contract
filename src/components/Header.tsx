import React, { useState } from 'react';
import {
  Zap,
  Bell,
  RefreshCw,
  Menu,
  ChevronDown,
  User,
  Shield,
  Check,
  Lock,
} from 'lucide-react';
import { NotificationItem } from '../types/contract';
import { UserRole, RoleDefinition } from '../types/permissions';

interface HeaderProps {
  notifications: NotificationItem[];
  onOpenNotifications: () => void;
  onSimulateEvent: () => void;
  isSimulating: boolean;
  onGoHome?: () => void;
  currentRole: RoleDefinition;
  rolesConfig: Record<UserRole, RoleDefinition>;
  onChangeRole: (role: UserRole) => void;
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  notifications,
  onOpenNotifications,
  onSimulateEvent,
  isSimulating,
  onGoHome,
  currentRole,
  rolesConfig,
  onChangeRole,
  onToggleSidebar,
}) => {
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-sky-100 shadow-xs">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Zone: Hamburger (mobile) + Single Brand Logo + Title */}
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={onToggleSidebar}
              className="lg:hidden p-2 text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition-colors cursor-pointer"
              title="เปิดแถบเมนู"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Clickable Brand Logo & System Name */}
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
                className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-cyan-400 hover:from-sky-600 hover:to-cyan-500 active:scale-95 flex items-center justify-center text-white shadow-sm shadow-sky-200 transition-all duration-150 cursor-pointer group-hover:ring-2 group-hover:ring-sky-400 group-hover:ring-offset-2 shrink-0"
                title="กดรูปสายฟ้าเพื่อกลับหน้าหลักทันที"
              >
                <Zap className="w-5 h-5 text-white transition-transform duration-200 group-hover:scale-110" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 group-hover:text-sky-600 transition-colors">
                    ระบบจัดเก็บและติดตามสัญญาซื้อขายไฟฟ้า
                  </span>
                  <span className="hidden xl:inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium text-sky-700 bg-sky-50 border border-sky-200 rounded-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    PEA Real-time
                  </span>
                </div>
                <p className="text-xs text-slate-500 hidden sm:block">
                  ศูนย์กลางบริหารจัดการสัญญาผู้ใช้ไฟฟ้ารายใหญ่ การไฟฟ้าส่วนภูมิภาค (กฟภ.)
                </p>
              </div>
            </div>
          </div>

          {/* Right Zone: Live Sim + Notification Bell + User Profile / Role Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Simulate Real-time Event Button */}
            <button
              onClick={onSimulateEvent}
              disabled={isSimulating}
              title="กดเพื่อจำลองการส่งการแจ้งเตือนแบบเรียลไทม์"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition-colors cursor-pointer"
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

            {/* User Profile & Role Switcher Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className="flex items-center gap-2.5 pl-2 sm:pl-3 py-1 border-l border-slate-200 hover:bg-slate-50/80 rounded-xl transition-colors cursor-pointer text-left focus:outline-none"
                title="คลิกเพื่อสลับบทบาทผู้ใช้"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-500 to-cyan-400 border border-sky-300 flex items-center justify-center text-white font-bold text-xs shadow-2xs">
                  {currentRole.id === 'viewer' ? 'VW' : 'PEA'}
                </div>
                <div className="hidden sm:block text-left text-xs">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <span>{currentRole.id === 'viewer' ? 'ผู้เข้าชมทั่วไป' : 'เจ้าหน้าที่ กฟภ.'}</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </div>
                  <div className="text-[11px] text-sky-600 font-medium truncate max-w-[130px]">
                    {currentRole.title.split(' ')[0]}
                  </div>
                </div>
              </button>

              {/* Role Dropdown Menu */}
              {isRoleDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsRoleDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-sky-100 z-50 py-2 divide-y divide-slate-100">
                    <div className="px-4 py-2.5">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        สลับบทบาทเพื่อทดสอบสิทธิ์
                      </div>
                      <div className="text-xs font-semibold text-slate-800 mt-1">
                        กำลังใช้งานในบทบาท:
                      </div>
                      <div className="text-xs text-sky-700 font-bold">
                        {currentRole.title}
                      </div>
                    </div>

                    <div className="py-1">
                      {(Object.keys(rolesConfig) as UserRole[]).map((rKey) => {
                        const r = rolesConfig[rKey];
                        const isSelected = currentRole.id === rKey;

                        return (
                          <button
                            key={rKey}
                            onClick={() => {
                              onChangeRole(rKey);
                              setIsRoleDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2.5 text-xs flex items-start justify-between gap-2 hover:bg-sky-50/80 transition-colors cursor-pointer ${
                              isSelected ? 'bg-sky-50 text-sky-900 font-semibold' : 'text-slate-700'
                            }`}
                          >
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span>{r.title}</span>
                                {rKey === 'viewer' && (
                                  <Lock className="w-3 h-3 text-amber-500" />
                                )}
                              </div>
                              <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                                {rKey === 'viewer'
                                  ? 'ดู Dashboard และทะเบียนได้ แต่กดดูรายละเอียดไม่ได้'
                                  : r.department}
                              </div>
                            </div>
                            {isSelected && (
                              <Check className="w-4 h-4 text-sky-600 shrink-0 self-center" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    <div className="px-4 py-2 bg-slate-50/70 text-[10px] text-slate-500">
                      <span>กำหนดสิทธิ์เพิ่มเติมได้ที่แท็บ "การกำหนดสิทธิ์" ทางเมนูด้านซ้าย</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
