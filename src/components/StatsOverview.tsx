import React from 'react';
import {
  FileCheck,
  FileClock,
  Files,
  Building2,
  ArrowUpRight,
  FolderArchive,
  FileUp,
  FileSearch,
  FileEdit,
  FileCheck2,
} from 'lucide-react';
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
  // แถวที่ 1: สถิติจำนวนสัญญาซื้อขายไฟฟ้า (หน่วย: สัญญา)
  const totalContracts = consumers.length;
  const uploadedContracts = consumers.filter((c) => c.contractStatus === 'uploaded').length;
  const pendingReviewContracts = consumers.filter((c) => c.contractStatus === 'pending_review').length;
  const needsRevisionContracts = consumers.filter((c) => c.contractStatus === 'needs_revision').length;
  const completedContracts = consumers.filter((c) => c.contractStatus === 'completed').length;

  const contractCards = [
    {
      id: 'ทั้งหมด',
      title: 'จำนวนสัญญาซื้อขายไฟฟ้าทั้งหมด',
      count: totalContracts,
      unit: 'สัญญา',
      subtitle: 'สัญญาซื้อขายไฟฟ้าทั้งหมดในระบบ',
      icon: Building2,
      accent: 'text-sky-700 dark:text-sky-400',
      bgGradient: 'from-sky-50 to-white dark:from-sky-950/40 dark:to-slate-900',
      borderColor: 'border-sky-200 dark:border-sky-800',
      badgeColor: 'text-sky-700 dark:text-sky-300 bg-sky-100/60 dark:bg-sky-900/60',
    },
    {
      id: 'แนบไฟล์แล้ว',
      title: 'แนบไฟล์สัญญาแล้ว',
      count: uploadedContracts,
      unit: 'สัญญา',
      subtitle: 'มีไฟล์สัญญาพร้อมรอส่งตรวจสอบ',
      icon: Files,
      accent: 'text-cyan-700 dark:text-cyan-400',
      bgGradient: 'from-cyan-50/70 to-white dark:from-cyan-950/40 dark:to-slate-900',
      borderColor: 'border-cyan-200 dark:border-cyan-800',
      badgeColor: 'text-cyan-700 dark:text-cyan-300 bg-cyan-100/60 dark:bg-cyan-900/60',
    },
    {
      id: 'รอตรวจสอบไฟล์สัญญา',
      title: 'รอตรวจสอบไฟล์สัญญา',
      count: pendingReviewContracts,
      unit: 'สัญญา',
      subtitle: 'รอตรวจสอบการนำเข้าข้อมูลสัญญา',
      icon: FileClock,
      accent: 'text-amber-700 dark:text-amber-400',
      bgGradient: 'from-amber-50/60 to-white dark:from-amber-950/40 dark:to-slate-900',
      borderColor: 'border-amber-200 dark:border-amber-800',
      badgeColor: 'text-amber-700 dark:text-amber-300 bg-amber-100/60 dark:bg-amber-900/60',
      highlight: pendingReviewContracts > 0,
    },
    {
      id: 'รอแก้ไขข้อมูล',
      title: 'รอแก้ไขข้อมูล',
      count: needsRevisionContracts,
      unit: 'สัญญา',
      subtitle: 'นำเข้าข้อมูลไม่ถูกต้อง รอการแก้ไข',
      icon: FileClock,
      accent: 'text-rose-700 dark:text-rose-400',
      bgGradient: 'from-rose-50/60 to-white dark:from-rose-950/40 dark:to-slate-900',
      borderColor: 'border-rose-200 dark:border-rose-800',
      badgeColor: 'text-rose-700 dark:text-rose-300 bg-rose-100/60 dark:bg-rose-900/60',
      highlight: needsRevisionContracts > 0,
      highlightText: 'ต้องแก้ไข',
    },
    {
      id: 'เสร็จสิ้น',
      title: 'สัญญาเสร็จสิ้นสมบูรณ์',
      count: completedContracts,
      unit: 'สัญญา',
      subtitle: 'ผ่านการตรวจสอบการนำเข้าข้อมูล',
      icon: FileCheck,
      accent: 'text-emerald-700 dark:text-emerald-400',
      bgGradient: 'from-emerald-50/60 to-white dark:from-emerald-950/40 dark:to-slate-900',
      borderColor: 'border-emerald-200 dark:border-emerald-800',
      badgeColor: 'text-emerald-700 dark:text-emerald-300 bg-emerald-100/60 dark:bg-emerald-900/60',
    },
  ];

  // แถวที่ 2: สถิติจำนวนไฟล์สัญญาซื้อขายไฟฟ้า (หน่วย: ไฟล์)
  // คำนวณไฟล์จริงจาก attachedFilesCount / verifiedFilesCount และ files list
  let totalFilesRequired = 0;
  let totalFilesUploaded = 0;
  let totalFilesPendingReview = 0;
  let totalFilesNeedsRevision = 0;
  let totalFilesVerified = 0;

  consumers.forEach((c) => {
    const files = c.contractDetails?.files;
    const attachedCount = c.attachedFilesCount || (files ? files.length : 0);
    const verifiedCount = c.verifiedFilesCount || (files ? files.filter((f) => f.isVerified).length : 0);

    // จำนวนไฟล์สัญญาซื้อขายไฟฟ้าที่ต้องแนบทั้งหมด (สัญญาที่ยังไม่แนบถือว่าต้องแนบอย่างน้อย 1 ไฟล์)
    const requiredForThis = attachedCount > 0 ? attachedCount : 1;
    totalFilesRequired += requiredForThis;
    totalFilesUploaded += attachedCount;

    if (files && files.length > 0) {
      files.forEach((f) => {
        if (f.needsRevision) {
          totalFilesNeedsRevision += 1;
        } else if (f.isVerified) {
          totalFilesVerified += 1;
        } else {
          totalFilesPendingReview += 1;
        }
      });
    } else {
      // กรณีไม่มีรายการไฟล์แจกแจง
      if (c.contractStatus === 'completed') {
        totalFilesVerified += attachedCount;
      } else if (c.contractStatus === 'needs_revision') {
        totalFilesNeedsRevision += Math.max(1, attachedCount - verifiedCount);
        totalFilesVerified += verifiedCount;
      } else if (c.contractStatus === 'pending_review') {
        totalFilesPendingReview += Math.max(1, attachedCount - verifiedCount);
        totalFilesVerified += verifiedCount;
      } else {
        // uploaded
        totalFilesPendingReview += attachedCount;
      }
    }
  });

  const fileCards = [
    {
      id: 'file-all',
      tabId: 'ทั้งหมด',
      title: '4.1 จำนวนไฟล์สัญญาซื้อขายไฟฟ้าที่ต้องแนบทั้งหมด',
      shortTitle: 'ไฟล์สัญญาที่ต้องแนบทั้งหมด',
      count: totalFilesRequired,
      unit: 'ไฟล์',
      subtitle: 'คำนวณจากทุกสัญญาในระบบ',
      icon: FolderArchive,
      accent: 'text-indigo-700 dark:text-indigo-400',
      bgGradient: 'from-indigo-50/70 to-white dark:from-indigo-950/40 dark:to-slate-900',
      borderColor: 'border-indigo-200 dark:border-indigo-800',
    },
    {
      id: 'file-uploaded',
      tabId: 'แนบไฟล์แล้ว',
      title: '4.2 แนบไฟล์สัญญาแล้ว',
      shortTitle: 'แนบไฟล์สัญญาแล้ว',
      count: totalFilesUploaded,
      unit: 'ไฟล์',
      subtitle: 'ไฟล์ที่อัปโหลดเข้าระบบแล้ว',
      icon: FileUp,
      accent: 'text-cyan-700 dark:text-cyan-400',
      bgGradient: 'from-cyan-50/70 to-white dark:from-cyan-950/40 dark:to-slate-900',
      borderColor: 'border-cyan-200 dark:border-cyan-800',
    },
    {
      id: 'file-pending',
      tabId: 'รอตรวจสอบไฟล์สัญญา',
      title: '4.3 รอตรวจสอบไฟล์สัญญา',
      shortTitle: 'รอตรวจสอบไฟล์สัญญา',
      count: totalFilesPendingReview,
      unit: 'ไฟล์',
      subtitle: 'ไฟล์ที่อยู่ระหว่างรอการตรวจ',
      icon: FileSearch,
      accent: 'text-amber-700 dark:text-amber-400',
      bgGradient: 'from-amber-50/60 to-white dark:from-amber-950/40 dark:to-slate-900',
      borderColor: 'border-amber-200 dark:border-amber-800',
      highlight: totalFilesPendingReview > 0,
      highlightText: 'รอตรวจ',
    },
    {
      id: 'file-revision',
      tabId: 'รอแก้ไขข้อมูล',
      title: '4.4 รอแก้ไขไฟล์สัญญา',
      shortTitle: 'รอแก้ไขไฟล์สัญญา',
      count: totalFilesNeedsRevision,
      unit: 'ไฟล์',
      subtitle: 'ไฟล์ที่มีข้อทักท้วงรอการแก้ไข',
      icon: FileEdit,
      accent: 'text-rose-700 dark:text-rose-400',
      bgGradient: 'from-rose-50/60 to-white dark:from-rose-950/40 dark:to-slate-900',
      borderColor: 'border-rose-200 dark:border-rose-800',
      highlight: totalFilesNeedsRevision > 0,
      highlightText: 'ต้องแก้ไข',
    },
    {
      id: 'file-verified',
      tabId: 'เสร็จสิ้น',
      title: '4.5 ตรวจสอบไฟล์สัญญาแล้ว',
      shortTitle: 'ตรวจสอบไฟล์สัญญาแล้ว',
      count: totalFilesVerified,
      unit: 'ไฟล์',
      subtitle: 'ผ่านการตรวจรับรองความถูกต้อง',
      icon: FileCheck2,
      accent: 'text-emerald-700 dark:text-emerald-400',
      bgGradient: 'from-emerald-50/60 to-white dark:from-emerald-950/40 dark:to-slate-900',
      borderColor: 'border-emerald-200 dark:border-emerald-800',
    },
  ];

  return (
    <div id="overview-section" className="mb-8 space-y-6">
      {/* แถวที่ 1: จำนวนสัญญาซื้อขายไฟฟ้า */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              จำนวนสัญญาซื้อขายไฟฟ้า (สถานะสัญญา)
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">
              · หน่วย: สัญญา
            </span>
          </div>
          <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
            รวม {totalContracts} สัญญา
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {contractCards.map((card) => {
            const Icon = card.icon;
            const isActive = activeTab === card.id;

            return (
              <div
                key={card.id}
                onClick={() => onSelectTab(card.id)}
                className={`p-4 rounded-2xl bg-gradient-to-b ${card.bgGradient} border transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md ${
                  isActive
                    ? `${card.borderColor} ring-2 ring-sky-400 dark:ring-sky-500 bg-white dark:bg-slate-900`
                    : `${card.borderColor} hover:border-sky-300 dark:hover:border-sky-700`
                }`}
              >
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 truncate" title={card.title}>
                    {card.title}
                  </span>
                  <div className={`p-1.5 rounded-xl bg-white dark:bg-slate-800 shadow-2xs border border-slate-100 dark:border-slate-700 ${card.accent}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white font-mono tabular-nums">
                    {card.count}
                  </span>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{card.unit}</span>
                  {card.highlight && (
                    <span className={`ml-auto inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      card.id === 'รอแก้ไขข้อมูล'
                        ? 'text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800'
                        : 'text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800 animate-pulse'
                    }`}>
                      {card.highlightText || 'รอจัดการ'}
                    </span>
                  )}
                </div>

                <div className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="truncate">{card.subtitle}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* แถวที่ 2: จำนวนไฟล์สัญญาซื้อขายไฟฟ้า */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              จำนวนไฟล์สัญญาซื้อขายไฟฟ้า (สถานะไฟล์เอกสารแนบ)
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">
              · หน่วย: ไฟล์
            </span>
          </div>
          <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
            แนบแล้ว {totalFilesUploaded} จาก {totalFilesRequired} ไฟล์
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {fileCards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.id}
                onClick={() => onSelectTab(card.tabId)}
                className={`p-4 rounded-2xl bg-gradient-to-b ${card.bgGradient} border ${card.borderColor} transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700`}
              >
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 truncate" title={card.title}>
                    {card.shortTitle}
                  </span>
                  <div className={`p-1.5 rounded-xl bg-white dark:bg-slate-800 shadow-2xs border border-slate-100 dark:border-slate-700 ${card.accent}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white font-mono tabular-nums">
                    {card.count}
                  </span>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{card.unit}</span>
                  {card.highlight && (
                    <span className={`ml-auto inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      card.id === 'file-revision'
                        ? 'text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800'
                        : 'text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800 animate-pulse'
                    }`}>
                      {card.highlightText || 'ต้องจัดการ'}
                    </span>
                  )}
                </div>

                <div className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="truncate">{card.subtitle}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
