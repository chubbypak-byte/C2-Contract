import React from 'react';
import { FileCheck, FileClock, Files, Building2, Zap, ArrowUpRight } from 'lucide-react';
import { ElectricityConsumer } from '../types/contract';

interface StatsOverviewProps {
  consumers: ElectricityConsumer[];
  onSelectTab: (tab: string) => void;
  activeTab: string;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  consumers,
  onSelectTab,
  activeTab,
}) => {
  const total = consumers.length;
  const uploaded = consumers.filter((c) => c.contractStatus === 'uploaded').length;
  const pendingReview = consumers.filter((c) => c.contractStatus === 'pending_review').length;
  const needsRevision = consumers.filter((c) => c.contractStatus === 'needs_revision').length;
  const completed = consumers.filter((c) => c.contractStatus === 'completed').length;

  const totalTransformers = consumers.reduce((acc, curr) => {
    const val = parseInt(curr.transformerSize.replace(/[^0-9]/g, ''), 10) || 0;
    return acc + val;
  }, 0);

  const cards = [
    {
      id: 'ทั้งหมด',
      title: 'ผู้ใช้ไฟฟ้าทั้งหมด',
      count: total,
      unit: 'ราย',
      subtitle: `กำลังหม้อแปลงรวม ${totalTransformers.toLocaleString()} kVA`,
      icon: Building2,
      accent: 'text-sky-700',
      bgGradient: 'from-sky-50 to-white',
      borderColor: 'border-sky-200',
      badgeColor: 'text-sky-700 bg-sky-100/60',
    },
    {
      id: 'แนบไฟล์แล้ว',
      title: 'แนบไฟล์สัญญาแล้ว',
      count: uploaded,
      unit: 'ฉบับ',
      subtitle: 'พร้อมเข้าสู่กระบวนการตรวจรับ',
      icon: Files,
      accent: 'text-cyan-700',
      bgGradient: 'from-cyan-50/70 to-white',
      borderColor: 'border-cyan-200',
      badgeColor: 'text-cyan-700 bg-cyan-100/60',
    },
    {
      id: 'รอตรวจสอบไฟล์สัญญา',
      title: 'รอตรวจสอบไฟล์สัญญา',
      count: pendingReview,
      unit: 'ฉบับ',
      subtitle: 'ต้องตรวจสอบพิกัดและเงื่อนไข',
      icon: FileClock,
      accent: 'text-amber-700',
      bgGradient: 'from-amber-50/60 to-white',
      borderColor: 'border-amber-200',
      badgeColor: 'text-amber-700 bg-amber-100/60',
      highlight: pendingReview > 0,
    },
    {
      id: 'รอแก้ไขข้อมูล',
      title: 'รอแก้ไขข้อมูล',
      count: needsRevision,
      unit: 'ฉบับ',
      subtitle: 'นำเข้าไม่ถูกต้อง ต้องแก้ไขข้อมูลใหม่',
      icon: FileClock,
      accent: 'text-rose-700',
      bgGradient: 'from-rose-50/60 to-white',
      borderColor: 'border-rose-200',
      badgeColor: 'text-rose-700 bg-rose-100/60',
      highlight: needsRevision > 0,
      highlightText: 'ต้องแก้ไข',
    },
    {
      id: 'เสร็จสิ้น',
      title: 'สัญญาเสร็จสิ้นสมบูรณ์',
      count: completed,
      unit: 'ฉบับ',
      subtitle: 'ผ่านการอนุมัติและมีผลบังคับใช้',
      icon: FileCheck,
      accent: 'text-emerald-700',
      bgGradient: 'from-emerald-50/60 to-white',
      borderColor: 'border-emerald-200',
      badgeColor: 'text-emerald-700 bg-emerald-100/60',
    },
  ];

  return (
    <div id="overview-section" className="mb-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {cards.map((card) => {
          const Icon = card.icon;
          const isActive = activeTab === card.id;

          return (
            <div
              key={card.id}
              onClick={() => onSelectTab(card.id)}
              className={`p-4 rounded-2xl bg-gradient-to-b ${card.bgGradient} border transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md ${
                isActive
                  ? `${card.borderColor} ring-2 ring-sky-400 bg-white`
                  : `${card.borderColor} hover:border-sky-300`
              }`}
            >
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-medium text-slate-500">{card.title}</span>
                <div className={`p-1.5 rounded-xl bg-white shadow-2xs border border-slate-100 ${card.accent}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
                  {card.count}
                </span>
                <span className="text-xs font-medium text-slate-500">{card.unit}</span>
                {card.highlight && (
                  <span className={`ml-auto inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    card.id === 'รอแก้ไขข้อมูล'
                      ? 'text-rose-700 bg-rose-100'
                      : 'text-amber-700 bg-amber-100 animate-pulse'
                  }`}>
                    {card.highlightText || 'รอจัดการ'}
                  </span>
                )}
              </div>

              <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="truncate">{card.subtitle}</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
