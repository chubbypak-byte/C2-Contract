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
        <div className="bg-white rounded-2xl border border-sky-100 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-sky-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-sky-600" />
                <span>อัตราการอนุมัติสัญญา (Completion Rate)</span>
              </h3>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {completionRate}%
              </span>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <div className="flex justify-between text-xs text-slate-600 mb-1.5">
                  <span>สัญญาที่เสร็จสิ้นสมบูรณ์</span>
                  <span className="font-bold text-slate-900">{completed} จาก {total} รายการ</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-500"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-600 mb-1.5">
                  <span>ไฟล์สัญญาที่ตรวจรับรองแล้ว</span>
                  <span className="font-bold text-slate-900">{totalVerifiedFiles} จาก {totalAttachedFiles} ไฟล์</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
                  <div
                    className="bg-gradient-to-r from-sky-500 to-cyan-400 h-full transition-all duration-500"
                    style={{ width: `${filesVerificationRate}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2 text-center text-xs">
              <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-100">
                <div className="text-lg font-extrabold text-amber-700">{pendingReview}</div>
                <div className="text-slate-500 text-[11px]">รอตรวจรับรอง</div>
              </div>
              <div className="p-2.5 bg-sky-50 rounded-xl border border-sky-100">
                <div className="text-lg font-extrabold text-sky-700">{uploaded}</div>
                <div className="text-slate-500 text-[11px]">แนบไฟล์แล้ว</div>
              </div>
            </div>
          </div>

          <button
            onClick={() => onGoToRegistry('รอตรวจสอบไฟล์สัญญา')}
            className="mt-4 w-full py-2 px-3 text-xs text-sky-700 bg-sky-50 hover:bg-sky-100 font-semibold rounded-xl border border-sky-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>ดูรายการรอตรวจในทะเบียนสัญญา</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 2: สรุปแยกตามการไฟฟ้า (PEA Branches) */}
        <div className="bg-white rounded-2xl border border-sky-100 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-sky-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Building2 className="w-4 h-4 text-sky-600" />
                <span>จำแนกตามสังกัดการไฟฟ้า (PEA)</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">6 สาขา</span>
            </div>

            <div className="mt-3 divide-y divide-slate-100 max-h-56 overflow-y-auto pr-1">
              {branchCounts.map((branch) => (
                <div key={branch.code} className="py-2 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                    <span className="font-medium text-slate-800">{branch.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">({branch.code})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500">
                      เสร็จ {branch.completed}/{branch.count}
                    </span>
                    <span className="font-bold text-slate-800 font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                      {branch.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onGoToRegistry()}
            className="mt-4 w-full py-2 px-3 text-xs text-slate-700 bg-slate-50 hover:bg-slate-100 font-semibold rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>กรองตามสาขาในทะเบียนสัญญา</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 3: สรุปแยกตามประเภทสัญญา (7 ประเภท) */}
        <div className="bg-white rounded-2xl border border-sky-100 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-sky-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-600" />
                <span>ประเภทสัญญาซื้อขายไฟฟ้า</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">7 ประเภท</span>
            </div>

            <div className="mt-3 space-y-2 text-xs">
              {CONTRACT_TYPES.slice(0, 5).map((type, idx) => {
                const count = consumers.filter((c) => c.contractDetails?.contractType === type).length;
                return (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                    <span className="truncate max-w-[200px] text-slate-700" title={type}>
                      {type}
                    </span>
                    <span className="font-bold text-sky-700 font-mono bg-sky-100 px-2 py-0.5 rounded-full text-[11px]">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => onGoToRegistry()}
            className="mt-4 w-full py-2 px-3 text-xs text-sky-700 bg-sky-50 hover:bg-sky-100 font-semibold rounded-xl border border-sky-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>เปิดหน้าทะเบียนสัญญาซื้อขายไฟฟ้า</span>
          </button>
        </div>
      </div>

      {/* 4. สัญญารอตรวจสอบเร่งด่วน (Urgent Action List) */}
      {urgentReviews.length > 0 && (
        <div className="bg-white rounded-2xl border border-amber-200 shadow-xs overflow-hidden">
          <div className="px-5 py-4 bg-gradient-to-r from-amber-50 to-white border-b border-amber-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600 animate-pulse" />
              <div>
                <h3 className="text-sm font-bold text-amber-950">
                  สัญญารอตรวจสอบและรับรอง ({urgentReviews.length} รายการ)
                </h3>
                <p className="text-xs text-amber-800/80">
                  ไฟล์สัญญาได้รับการอัพโหลดเข้าระบบแล้ว รอการตรวจสอบความถูกต้องเปรียบเทียบกับข้อมูลหลัก
                </p>
              </div>
            </div>

            <button
              onClick={() => onGoToRegistry('รอตรวจสอบไฟล์สัญญา')}
              className="text-xs font-semibold text-amber-800 hover:text-amber-950 underline cursor-pointer"
            >
              ดูทั้งหมดในทะเบียน
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {urgentReviews.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-amber-50/20 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs sm:text-sm text-slate-900">
                      {item.consumerName || item.location.split(' ')[0]}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                      CA: {item.accountNumber}
                    </span>
                    <span className="text-[11px] text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
                      {item.utility}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                    <span>หม้อแปลง: {item.transformerSize}</span>
                    <span>แรงดัน: {item.voltageLevel}</span>
                    <span>อำนาจ: {item.authorizedSignatory}</span>
                    <span>ตรวจแล้ว {item.verifiedFilesCount}/{item.attachedFilesCount} ไฟล์</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {onVerifyConsumer && canVerifyContract && (
                    <button
                      onClick={() => onVerifyConsumer(item)}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <FileCheck2 className="w-3.5 h-3.5" />
                      <span>ตรวจสอบสัญญา</span>
                    </button>
                  )}
                  {canViewDetails ? (
                    <button
                      onClick={() => onGoToRegistry()}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                    >
                      เปิดทะเบียน
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-200">
                      ไม่มีสิทธิ์ดูรายละเอียด
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
