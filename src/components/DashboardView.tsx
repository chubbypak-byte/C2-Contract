import React from 'react';
import {
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Building2,
  ArrowRight,
  TrendingUp,
  Zap,
  Shield,
  Layers,
  FileCheck2,
} from 'lucide-react';
import { HeroBanner } from './HeroBanner';
import { StatsOverview } from './StatsOverview';
import { ElectricityConsumer, CONTRACT_TYPES, PEA_BRANCHES } from '../types/contract';
import { getStatusLabel, getStatusStyle } from '../utils/formatters';

interface DashboardViewProps {
  consumers: ElectricityConsumer[];
  onGoToRegistry: (tabFilter?: string) => void;
  onVerifyConsumer?: (consumer: ElectricityConsumer) => void;
  canVerifyContract: boolean;
  canViewDetails: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  consumers,
  onGoToRegistry,
  onVerifyConsumer,
  canVerifyContract,
  canViewDetails,
}) => {
  const total = consumers.length;
  const pendingUpload = consumers.filter((c) => c.contractStatus === 'pending_upload').length;
  const uploaded = consumers.filter((c) => c.contractStatus === 'uploaded').length;
  const pendingReview = consumers.filter((c) => c.contractStatus === 'pending_review').length;
  const completed = consumers.filter((c) => c.contractStatus === 'completed').length;

  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  const totalAttachedFiles = consumers.reduce((acc, c) => acc + (c.attachedFilesCount || 0), 0);
  const totalVerifiedFiles = consumers.reduce((acc, c) => acc + (c.verifiedFilesCount || 0), 0);
  const filesVerificationRate = totalAttachedFiles > 0 ? Math.round((totalVerifiedFiles / totalAttachedFiles) * 100) : 0;

  // Contracts by branch
  const branchCounts = PEA_BRANCHES.map((b) => {
    const count = consumers.filter((c) => c.utility === b.name || c.utilityCode === b.code).length;
    const branchCompleted = consumers.filter(
      (c) => (c.utility === b.name || c.utilityCode === b.code) && c.contractStatus === 'completed'
    ).length;
    return { ...b, count, completed: branchCompleted };
  });

  // Items waiting for review
  const urgentReviews = consumers.filter((c) => c.contractStatus === 'pending_review');

  return (
    <div className="space-y-6">
      {/* 1. Hero Banner without security box */}
      <HeroBanner
        onQuickSearchFocus={() => onGoToRegistry()}
        pendingCount={pendingReview}
      />

      {/* 2. Key KPI Stats Overview Cards */}
      <StatsOverview
        consumers={consumers}
        onSelectTab={(tab) => onGoToRegistry(tab)}
        activeTab="ทั้งหมด"
      />

      {/* 3. Grid of Analytics & Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: สรุปภาพรวมความคืบหน้าการรับรองสัญญา */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-sky-100 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-sky-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <span>สถานะ</span>
              </h3>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                {completionRate}%
              </span>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1.5">
                  <span>สัญญาที่เสร็จสิ้นสมบูรณ์</span>
                  <span className="font-bold text-slate-900 dark:text-white font-mono">{completed} จาก {total} สัญญา</span>
                </div>
                <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-500"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1.5">
                  <span>จำนวนไฟล์สัญญาที่ตรวจแล้ว</span>
                  <span className="font-bold text-slate-900 dark:text-white font-mono">{totalVerifiedFiles} จาก {totalAttachedFiles} ไฟล์</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                  <div
                    className="bg-gradient-to-r from-sky-500 to-cyan-400 h-full transition-all duration-500"
                    style={{ width: `${filesVerificationRate}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 dark:text-slate-400">ความคืบหน้าการตรวจรับรองไฟล์สัญญา</span>
              <span className="font-bold text-sky-700 dark:text-sky-400 font-mono text-sm">{filesVerificationRate}%</span>
            </div>
          </div>

          <button
            onClick={() => onGoToRegistry('รอตรวจสอบไฟล์สัญญา')}
            className="mt-4 w-full py-2 px-3 text-xs text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/50 hover:bg-sky-100 dark:hover:bg-sky-900/60 font-semibold rounded-xl border border-sky-200 dark:border-sky-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>ดูรายการรอตรวจในทะเบียนสัญญา</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 2: สรุปแยกตามการไฟฟ้า (PEA Branches) - จำนวนสัญญาแยกตาม กฟฟ. */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-sky-100 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-sky-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <Building2 className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <span>จำนวนสัญญาแยกตาม กฟฟ.</span>
              </h3>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">6 กฟฟ.</span>
            </div>

            <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-800 max-h-64 overflow-y-auto pr-1">
              {branchCounts.map((branch) => (
                <div key={branch.code} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{branch.name}</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">({branch.code})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      เสร็จ {branch.completed} จาก {branch.count} สัญญา
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[11px] border border-slate-200/50 dark:border-slate-700">
                      {branch.count} สัญญา
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onGoToRegistry()}
            className="mt-4 w-full py-2 px-3 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold rounded-xl border border-slate-200 dark:border-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>กรองตามสาขาในทะเบียนสัญญา</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 3: สรุปแยกตามประเภทสัญญา (รวมตัวเลือก รอตรวจสอบและระบุประเภทสัญญา (ข้อมูลจากระบบ SAP)) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-sky-100 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-sky-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <span>ประเภทสัญญาซื้อขายไฟฟ้า</span>
              </h3>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">{CONTRACT_TYPES.length} ประเภท</span>
            </div>

            <div className="mt-3 space-y-2 text-xs max-h-64 overflow-y-auto pr-1">
              {CONTRACT_TYPES.map((type, idx) => {
                const count = consumers.filter((c) => c.contractDetails?.contractType === type).length;
                const isSAP = type === 'รอตรวจสอบและระบุประเภทสัญญา (ข้อมูลจากระบบ SAP)';

                return (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-2 rounded-lg ${
                      isSAP
                        ? 'bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800'
                        : 'bg-slate-50 dark:bg-slate-800/80 border border-transparent'
                    }`}
                  >
                    <span
                      className={`truncate max-w-[210px] ${
                        isSAP
                          ? 'font-medium text-purple-900 dark:text-purple-300'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                      title={type}
                    >
                      {type}
                    </span>
                    <span
                      className={`font-bold font-mono px-2 py-0.5 rounded-full text-[11px] border shrink-0 ${
                        isSAP
                          ? 'text-purple-800 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/60 border-purple-300 dark:border-purple-700'
                          : 'text-sky-700 dark:text-sky-400 bg-sky-100 dark:bg-sky-950 border-sky-200 dark:border-sky-800'
                      }`}
                    >
                      {count} สัญญา
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => onGoToRegistry()}
            className="mt-4 w-full py-2 px-3 text-xs text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/50 hover:bg-sky-100 dark:hover:bg-sky-900/60 font-semibold rounded-xl border border-sky-200 dark:border-sky-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>เปิดหน้าทะเบียนสัญญาซื้อขายไฟฟ้า</span>
          </button>
        </div>
      </div>
    </div>
  );
};
