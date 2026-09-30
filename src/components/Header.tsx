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
  CheckCircle2,
  ShieldCheck,
  UserCheck,
  BadgeCheck,
} from 'lucide-react';
import { NotificationItem } from '../types/contract';
import { UserRole, RoleDefinition, INITIAL_SYSTEM_USERS } from '../types/permissions';

interface HeaderProps {
  notifications: NotificationItem[];
  onOpenNotifications: () => void;
  onSimulateEvent: () => void;
  isSimulating: boolean;
  onGoHome?: () => void;
  currentRole: RoleDefinition;
  rolesConfig: Record<UserRole, RoleDefinition>;
  userPosition?: 'หผ.' | 'พบช.4';
  onChangeUserPosition?: (position: 'หผ.' | 'พบช.4') => void;
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
  userPosition = 'หผ.',
  onChangeUserPosition,
  onChangeRole,
  onToggleSidebar,
}) => {
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [internalPosition, setInternalPosition] = useState<'หผ.' | 'พบช.4'>(userPosition);
  const activePosition = onChangeUserPosition ? userPosition : internalPosition;
  const setPosition = onChangeUserPosition || setInternalPosition;
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // ข้อมูล user ตามบทบาทปัจจุบัน (ข้อ 10)
  const matchedUser = INITIAL_SYSTEM_USERS.find((u) => u.role === currentRole.id) || {
    name: currentRole.title,
    employeeId: '504128',
    position: 'หผ.',
    department: currentRole.department,
  };

  const displayName =
    currentRole.id === 'legal_officer'
      ? 'นายสมเกียรติ สว่างไสว'
      : matchedUser.name;
  const displayEmployeeId =
    currentRole.id === 'legal_officer'
      ? '504128'
      : matchedUser.employeeId || '501234';
  const displayPosition =
    currentRole.id === 'legal_officer'
      ? activePosition
      : matchedUser.position || 'เจ้าหน้าที่';

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

            {/* User Profile & Role Switcher Dropdown with Permissions Card (ข้อ 8, 9, 10) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className="flex items-center gap-2.5 pl-2 sm:pl-3 py-1 border-l border-slate-200 hover:bg-slate-50/80 rounded-xl transition-colors cursor-pointer text-left focus:outline-none"
                title="คลิกเพื่อดูข้อมูลผู้ใช้และสิทธิ์การใช้งานปัจจุบัน"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 border border-purple-300 flex items-center justify-center text-white font-bold text-xs shadow-2xs">
                  {currentRole.id === 'viewer' ? 'VW' : 'สก'}
                </div>
                <div className="hidden sm:block text-left text-xs">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <span>{displayName}</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </div>
                  <div className="text-[11px] text-purple-700 font-semibold truncate max-w-[180px]">
                    รหัส: {displayEmployeeId} ({displayPosition})
                  </div>
                </div>
              </button>

              {/* User Profile & Permissions Dropdown Menu */}
              {isRoleDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsRoleDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-84 sm:w-96 bg-white rounded-2xl shadow-2xl border border-sky-100 z-50 py-3 divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-150">
                    {/* User Profile Info Card (ข้อ 10) */}
                    <div className="px-5 py-3 bg-gradient-to-br from-purple-50/80 via-white to-sky-50/50">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
                            {currentRole.id === 'viewer' ? 'VW' : 'สก'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm">
                              {displayName}
                            </div>
                            <div className="text-xs text-purple-800 font-semibold mt-0.5">
                              รหัสพนักงาน: <span className="font-mono">{displayEmployeeId}</span>
                            </div>
                            {/* เลือกว่าเป็น พบช.4 หรือ หผ. โดยเริ่มต้นระบุเป็น หผ. */}
                            <div className="flex items-center gap-1.5 mt-1.5">
                              <span className="text-[11px] text-slate-600 font-semibold">ตำแหน่ง:</span>
                              <div className="inline-flex rounded-lg border border-purple-200 p-0.5 bg-white shadow-2xs">
                                <button
                                  type="button"
                                  onClick={() => setPosition('หผ.')}
                                  className={`px-2.5 py-0.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                                    activePosition === 'หผ.'
                                      ? 'bg-[#702d8a] text-white shadow-2xs'
                                      : 'text-purple-800 hover:bg-purple-50'
                                  }`}
                                  title="เลือกตำแหน่ง: หผ."
                                >
                                  หผ.
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setPosition('พบช.4')}
                                  className={`px-2.5 py-0.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                                    activePosition === 'พบช.4'
                                      ? 'bg-[#702d8a] text-white shadow-2xs'
                                      : 'text-purple-800 hover:bg-purple-50'
                                  }`}
                                  title="เลือกตำแหน่ง: พบช.4"
                                >
                                  พบช.4
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${currentRole.badgeColor}`}>
                          {currentRole.id === 'viewer' ? 'ผู้เข้าชม' : 'เจ้าหน้าที่'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-purple-100 flex items-center gap-1.5">
                        <BadgeCheck className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                        <span>{matchedUser.department}</span>
                      </div>
                    </div>

                    {/* ข้อ 8: การ์ด "สิทธิ์การใช้งานปัจจุบัน" มาโชว์ที่ข้อมูล user แทน */}
                    <div className="p-4 space-y-2 bg-slate-50/60">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-purple-700" />
                          <span>สิทธิ์การใช้งานปัจจุบัน</span>
                        </span>
                        <span className="text-[10px] font-mono text-purple-800 bg-purple-100 px-2 py-0.5 rounded-full font-semibold">
                          RBAC
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600">ดู Dashboard & ทะเบียน:</span>
                          <span className="text-emerald-700 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> ได้
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600">กดดูรายละเอียดสัญญา:</span>
                          {currentRole.permissions.canViewDetails ? (
                            <span className="text-emerald-700 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> ได้
                            </span>
                          ) : (
                            <span className="text-rose-600 font-semibold flex items-center gap-1">
                              <Lock className="w-3.5 h-3.5 text-rose-500" /> ไม่ได้
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600">อัพโหลดไฟล์สัญญา:</span>
                          <span className={currentRole.permissions.canUploadFiles ? 'text-emerald-700 font-semibold flex items-center gap-1' : 'text-slate-400'}>
                            {currentRole.permissions.canUploadFiles ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> ได้
                              </>
                            ) : (
                              'ไม่ได้'
                            )}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600">แก้ไขข้อมูลสัญญา:</span>
                          <span className={currentRole.permissions.canEditData ? 'text-emerald-700 font-semibold flex items-center gap-1' : 'text-slate-400'}>
                            {currentRole.permissions.canEditData ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> ได้
                              </>
                            ) : (
                              'ไม่ได้'
                            )}
                          </span>
                        </div>
                        {/* ข้อ 9: ตรวจสอบการนำเข้าข้อมูล */}
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600">ตรวจสอบการนำเข้าข้อมูล:</span>
                          <span className={currentRole.permissions.canVerifyContract ? 'text-emerald-700 font-semibold flex items-center gap-1' : 'text-slate-400'}>
                            {currentRole.permissions.canVerifyContract ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> ได้
                              </>
                            ) : (
                              'ไม่ได้'
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Role Switcher for Testing */}
                    <div className="py-2 px-2">
                      <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        สลับบทบาทผู้ใช้งานเพื่อทดสอบ
                      </div>
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
                            className={`w-full text-left px-3 py-2 text-xs rounded-xl flex items-start justify-between gap-2 hover:bg-purple-50/70 transition-colors cursor-pointer ${
                              isSelected ? 'bg-purple-50 text-purple-950 font-semibold' : 'text-slate-700'
                            }`}
                          >
                            <div>
                              <div className="flex items-center gap-1.5 font-medium">
                                <span>{r.title}</span>
                                {rKey === 'viewer' && (
                                  <Lock className="w-3 h-3 text-amber-500" />
                                )}
                              </div>
                              <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                                {r.department}
                              </div>
                            </div>
                            {isSelected && (
                              <Check className="w-4 h-4 text-purple-700 shrink-0 self-center" />
                            )}
                          </button>
                        );
                      })}
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
