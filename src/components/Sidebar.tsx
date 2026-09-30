import React from 'react';
import {
  LayoutDashboard,
  FileSpreadsheet,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Users,
  FileCheck2,
  Clock,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { UserRole, RoleDefinition } from '../types/permissions';

export type MainNavTab = 'dashboard' | 'registry' | 'permissions';

interface SidebarProps {
  currentTab: MainNavTab;
  onSelectTab: (tab: MainNavTab) => void;
  pendingReviewCount: number;
  totalContractsCount: number;
  currentRole: RoleDefinition;
  canViewPermissions: boolean;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  pendingReviewCount,
  totalContractsCount,
  currentRole,
  canViewPermissions,
  isOpenMobile,
  onCloseMobile,
}) => {
  const navItems = [
    {
      id: 'dashboard' as MainNavTab,
      number: '1',
      title: 'Dashboard สถานะสัญญาซื้อขายไฟฟ้า',
      shortTitle: 'Dashboard สถานะสัญญา',
      description: 'ภาพรวมสถิติ ตัวชี้วัด และสถานะความคืบหน้า',
      icon: LayoutDashboard,
      badge: pendingReviewCount > 0 ? `${pendingReviewCount} รอตรวจ` : undefined,
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    },
    {
      id: 'registry' as MainNavTab,
      number: '2',
      title: 'ทะเบียนสัญญาซื้อขายไฟฟ้า',
      shortTitle: 'ทะเบียนสัญญาไฟฟ้า',
      description: 'ตารางข้อมูลผู้ใช้ไฟ กรอง ค้นหา อัพโหลด ตรวจสอบ',
      icon: FileSpreadsheet,
      badge: `${totalContractsCount} รายการ`,
      badgeColor: 'bg-sky-100 text-sky-800 border-sky-200',
    },
    {
      id: 'permissions' as MainNavTab,
      number: '3',
      title: 'การกำหนดสิทธิ์',
      shortTitle: 'การกำหนดสิทธิ์ผู้ใช้',
      description: 'กำหนดสิทธิ์อัพโหลด แก้ไข ลบ ตรวจสอบ และดูรายละเอียด',
      icon: ShieldCheck,
      badge: 'RBAC',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed lg:sticky top-16 left-0 z-40 h-[calc(100vh-4rem)] w-72 bg-white border-r border-sky-100/80 shadow-xs flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 space-y-6 overflow-y-auto flex-1">
          {/* Section Label */}
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2 flex items-center justify-between">
              <span>เมนูหลักระบบสัญญา</span>
              <span className="text-[10px] bg-sky-50 text-sky-600 px-1.5 py-0.5 rounded border border-sky-100">
                3 เมนู
              </span>
            </div>

            <nav className="space-y-1.5" aria-label="แถบเมนูด้านซ้าย">
              {navItems.map((item) => {
                const isActive = currentTab === item.id;
                const Icon = item.icon;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectTab(item.id);
                      onCloseMobile?.();
                    }}
                    className={`w-full text-left p-3 rounded-xl transition-all duration-150 flex items-start gap-3 cursor-pointer group relative ${
                      isActive
                        ? 'bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-sm shadow-sky-200 font-semibold'
                        : 'text-slate-700 hover:bg-sky-50/70 hover:text-sky-800'
                    }`}
                  >
                    {/* Item Number Tag */}
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 text-slate-500 group-hover:bg-sky-100 group-hover:text-sky-700'
                      }`}
                    >
                      {item.number}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="text-sm truncate leading-snug">
                          {item.shortTitle}
                        </span>
                        {item.badge && (
                          <span
                            className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 border ${
                              isActive
                                ? 'bg-white/20 text-white border-white/30'
                                : `${item.badgeColor}`
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-[11px] line-clamp-1 mt-0.5 ${
                          isActive ? 'text-sky-100 font-normal' : 'text-slate-400'
                        }`}
                      >
                        {item.description}
                      </p>
                    </div>

                    {isActive && (
                      <ChevronRight className="w-4 h-4 text-white shrink-0 self-center" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Sidebar Footer info */}
        <div className="p-3.5 border-t border-sky-100 bg-slate-50/50 text-[11px] text-slate-500">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700">การไฟฟ้าส่วนภูมิภาค</span>
            <span className="text-[10px] text-sky-600 font-mono">PLMS PPA v2.4</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">ระบบจัดเก็บและติดตามสัญญาซื้อขายไฟฟ้า</p>
        </div>
      </aside>
    </>
  );
};
