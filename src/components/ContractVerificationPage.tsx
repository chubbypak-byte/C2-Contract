import React, { useState } from 'react';
import {
  X,
  FileCheck2,
  CheckCircle2,
  Clock,
  Download,
  Printer,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Building2,
  Zap,
  Calendar,
  ShieldCheck,
  FileText,
  UserCheck,
  Check,
  RotateCcw,
  Sparkles,
  Paperclip,
  ExternalLink,
  Info,
  FileX2,
  AlertCircle,
  AlertTriangle,
  FilePlus
} from 'lucide-react';
import { ElectricityConsumer, AttachedFile, ContractStatus, CONTRACT_TYPES, ContractType } from '../types/contract';
import { formatCurrency, getStatusLabel, getStatusStyle, calculateSigningAuthority, getAuthorityRuleText, getAuthorityBadgeStyle } from '../utils/formatters';

interface ContractVerificationPageProps {
  consumer: ElectricityConsumer | null;
  isOpen: boolean;
  onClose: () => void;
  reviewerPosition?: string;
  onConfirmVerification: (
    consumerId: string,
    verifiedFiles: AttachedFile[],
    reviewNotes: string,
    reviewerName: string
  ) => void;
  onRejectVerification?: (
    consumerId: string,
    reviewNotes: string,
    reviewerName: string,
    rejectedFiles?: AttachedFile[]
  ) => void;
  onOpenUploadModal?: (consumer: ElectricityConsumer) => void;
}

export const ContractVerificationPage: React.FC<ContractVerificationPageProps> = ({
  consumer,
  isOpen,
  onClose,
  reviewerPosition = 'หผ.',
  onConfirmVerification,
  onRejectVerification,
  onOpenUploadModal,
}) => {
  if (!isOpen || !consumer) return null;

  const contract = consumer.contractDetails;
  const hasFilesAttached =
    Boolean(consumer.attachedFilesCount && consumer.attachedFilesCount > 0) &&
    Boolean((contract?.files && contract.files.length > 0) || contract?.fileName);

  const initialFiles: AttachedFile[] = hasFilesAttached
    ? contract?.files && contract.files.length > 0
      ? contract.files
      : [
          {
            id: 'f-1',
            fileName: contract?.fileName || 'สัญญาหลัก.pdf',
            fileCategory: 'สัญญาหลัก',
            fileSize: contract?.fileSize || '4.5 MB',
            pageCount: 16,
            uploadedAt: contract?.uploadedAt || new Date().toLocaleString('th-TH'),
            isVerified: consumer.contractStatus === 'completed',
          },
        ]
    : [];

  const [activeFileIndex, setActiveFileIndex] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [fileList, setFileList] = useState<AttachedFile[]>(initialFiles);
  // ผู้ตรวจสอบเป็น user ชื่อ นามสกุล รหัสพนักงาน และตำแหน่ง (หผ. หรือ พบช.4)
  const [reviewerName, setReviewerName] = useState<string>(
    contract?.reviewedBy || `นายสมเกียรติ สว่างไสว (รหัสพนักงาน: 504128, ${reviewerPosition})`
  );
  const [reviewNotes, setReviewNotes] = useState<string>(
    contract?.reviewNotes || ''
  );
  const [reviewNotesError, setReviewNotesError] = useState<string>('');
  const [isConfirmedSuccess, setIsConfirmedSuccess] = useState<boolean>(false);
  const [isRejectSuccess, setIsRejectSuccess] = useState<boolean>(false);

  const currentFile = fileList[activeFileIndex] || null;
  const totalPages = currentFile?.pageCount || 12;

  // Toggle individual file verification
  const handleToggleFileVerify = (fileId: string) => {
    setFileList((prev) =>
      prev.map((f) =>
        f.id === fileId
          ? {
              ...f,
              isVerified: !f.isVerified,
              needsRevision: false,
              verifiedBy: !f.isVerified ? reviewerName : undefined,
              verifiedAt: !f.isVerified ? new Date().toLocaleString('th-TH') : undefined,
            }
          : f
      )
    );
  };

  // Mark file as needing revision
  const handleMarkFileNeedsRevision = (fileId: string, defaultNote = '') => {
    setFileList((prev) =>
      prev.map((f) =>
        f.id === fileId
          ? {
              ...f,
              isVerified: false,
              needsRevision: true,
              revisionNote: f.revisionNote || defaultNote,
            }
          : f
      )
    );
  };

  // Update revision note for specific file
  const handleUpdateFileRevisionNote = (fileId: string, note: string) => {
    setFileList((prev) =>
      prev.map((f) =>
        f.id === fileId
          ? {
              ...f,
              isVerified: false,
              needsRevision: true,
              revisionNote: note,
            }
          : f
      )
    );
  };

  // Mark all files as verified
  const handleVerifyAllFiles = () => {
    setFileList((prev) =>
      prev.map((f) => ({
        ...f,
        isVerified: true,
        needsRevision: false,
        verifiedBy: reviewerName,
        verifiedAt: new Date().toLocaleString('th-TH'),
      }))
    );
  };

  // ข้อ 6: นำเข้าข้อมูลถูกต้อง
  const handleApproveValid = () => {
    setReviewNotesError('');
    const finalNotes =
      reviewNotes.trim() || 'เอกสารสัญญาซื้อขายไฟฟ้าและเอกสารแนบถูกต้องครบถ้วนตามระเบียบ กฟภ.';

    const verifiedList = fileList.map((f) => ({
      ...f,
      isVerified: true,
      needsRevision: false,
      verifiedBy: reviewerName,
      verifiedAt: f.verifiedAt || new Date().toLocaleString('th-TH'),
    }));

    onConfirmVerification(consumer.id, verifiedList, finalNotes, reviewerName);
    setIsConfirmedSuccess(true);
    setTimeout(() => {
      setIsConfirmedSuccess(false);
      onClose();
    }, 1200);
  };

  // ข้อ 7: นำเข้าข้อมูลไม่ถูกต้อง และบังคับระบุ บันทึกความเห็นการตรวจสัญญา
  const handleRejectInvalid = () => {
    const filesWithIssues = fileList.filter((f) => f.needsRevision || f.revisionNote);
    let finalNotes = reviewNotes.trim();

    if (!finalNotes) {
      if (filesWithIssues.length > 0) {
        finalNotes = filesWithIssues
          .map((f) => `ไฟล์ ${f.fileName} (${f.fileCategory}): ${f.revisionNote || 'พบข้อผิดพลาด กรุณาแก้ไข'}`)
          .join('\n');
      } else {
        setReviewNotesError('กรุณาระบุบันทึกความเห็นการตรวจสัญญา (บังคับระบุเหตุผลกรณีนำเข้าข้อมูลไม่ถูกต้อง)');
        return;
      }
    }
    setReviewNotesError('');

    if (onRejectVerification) {
      onRejectVerification(consumer.id, finalNotes, reviewerName, fileList);
    }
    setIsRejectSuccess(true);
    setTimeout(() => {
      setIsRejectSuccess(false);
      onClose();
    }, 1200);
  };

  // Download simulation
  const handleDownloadFile = () => {
    const dummyText = `การไฟฟ้าส่วนภูมิภาค (PEA) - สัญญาซื้อขายไฟฟ้า
เลขที่สัญญา: ${contract?.contractNumber || 'PPA-PEA'}
ผู้ใช้ไฟฟ้า: ${consumer.consumerName || consumer.location}
CA: ${consumer.accountNumber}
แรงดัน: ${consumer.voltageLevel}
ขนาดหม้อแปลง: ${consumer.transformerSize}
อำนาจลงนาม: ${consumer.signingAuthority || 'ผจก.'}
สถานะ: ตรวจสอบและรับรองแล้ว`;

    const blob = new Blob([dummyText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = currentFile?.fileName || 'สัญญาซื้อขายไฟฟ้า_กฟภ.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  const statusStyle = getStatusStyle(consumer.contractStatus);
  const allFilesVerified = fileList.length > 0 && fileList.every((f) => f.isVerified);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-xs flex flex-col animate-in fade-in duration-200">
      {/* Top Navigation Bar (PEA Purple Header) */}
      <header className="bg-[#702d8a] text-white px-4 sm:px-6 py-3 flex items-center justify-between shadow-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-purple-200">
            <FileCheck2 className="w-5 h-5 text-purple-100" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold tracking-tight">
                หน้าตรวจสอบ/รับรองข้อมูลสัญญาซื้อขายไฟฟ้า (กฟภ.)
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/15 text-purple-100">
                PLMS Verification
              </span>
            </div>
            <p className="text-xs text-purple-200 truncate max-w-xl">
              {consumer.utility} ({consumer.utilityCode}) · CA: <span className="font-mono font-bold text-white">{consumer.accountNumber}</span> · {consumer.consumerName || consumer.location.split(' ')[0]}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick status pill */}
          <div className="hidden md:flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 text-xs">
            <span className="text-purple-200">สถานะปัจจุบัน:</span>
            <span className="font-semibold text-white">{getStatusLabel(consumer.contractStatus)}</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-purple-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            title="ปิดหน้าต่างตรวจสอบ"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Main 2-Column Split View: Left (Details) & Right (Contract Document Viewer) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-slate-100">
        {/* =========================================================================
            LEFT COLUMN: ข้อมูลรายละเอียดสัญญาและผู้ใช้ไฟฟ้า
           ========================================================================= */}
        <section className="w-full lg:w-[420px] xl:w-[460px] bg-white border-r border-slate-200 flex flex-col shrink-0 h-full overflow-hidden shadow-sm">
          {/* Section Header */}
          <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#702d8a]" />
              <h3 className="text-sm font-bold text-slate-900">
                ข้อมูลรายละเอียดสัญญา
              </h3>
            </div>
            <span className="text-xs font-mono font-semibold text-purple-900 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
              {contract?.contractNumber || `PPA-PEA-${consumer.utilityCode}`}
            </span>
          </div>

          {/* Scrollable Information Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
            {/* Box 1: ข้อมูลผู้ใช้ไฟฟ้า (พร้อมข้อมูลสัญญาต่อท้าย) */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
              <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs border-b border-slate-200 pb-2">
                <Building2 className="w-3.5 h-3.5 text-purple-700" />
                <span>ข้อมูลผู้ใช้ไฟฟ้า</span>
              </h4>

              <div className="grid grid-cols-2 gap-3 text-slate-700">
                <div>
                  <span className="text-slate-400 block text-[11px]">การไฟฟ้า (กฟฟ.)</span>
                  <span className="font-semibold text-slate-900">{consumer.utility}</span>
                  <span className="text-[10px] text-purple-700 font-mono ml-1">({consumer.utilityCode})</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">หมายเลขผู้ใช้ไฟฟ้า (CA)</span>
                  <span className="font-bold font-mono text-purple-950 text-sm">{consumer.accountNumber}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block text-[11px]">ชื่อผู้ใช้ไฟฟ้า</span>
                  <span className="font-bold text-slate-900 text-xs">
                    {consumer.consumerName || consumer.location.split(' ')[0]}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block text-[11px]">สถานที่ใช้ไฟฟ้า</span>
                  <span className="text-slate-700 font-medium">{consumer.location}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">เลขที่สัญญา</span>
                  <span className="font-mono font-semibold text-slate-900">
                    {contract?.contractNumber || consumer.installationNumber}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">ระดับแรงดัน</span>
                  <span className="inline-flex items-center gap-1 font-mono font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    <Zap className="w-3 h-3 text-amber-500" />
                    {consumer.voltageLevel}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">ขนาดหม้อแปลง</span>
                  <span className="font-mono font-bold text-slate-900">{consumer.transformerSize}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">อำนาจลงนาม กฟภ.</span>
                  {(() => {
                    const currentAuth = consumer.signingAuthority || contract?.signingAuthority || 'ผจก.';
                    const ruleAuth = calculateSigningAuthority(consumer.voltageLevel, consumer.transformerSize);
                    const isRuleMatched = currentAuth === ruleAuth;
                    const authStyle = getAuthorityBadgeStyle(currentAuth);

                    return (
                      <div className="space-y-0.5">
                        <span className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded border text-xs ${authStyle.badgeBg} ${authStyle.textColor} ${authStyle.borderColor}`}>
                          <UserCheck className="w-3 h-3" />
                          <span>{currentAuth}</span>
                        </span>
                        <div className="text-[10px]">
                          {isRuleMatched ? (
                            <span className="text-emerald-700 font-medium flex items-center gap-0.5">
                              <Check className="w-2.5 h-2.5" /> ตรงตามเกณฑ์ ({ruleAuth})
                            </span>
                          ) : (
                            <span className="text-amber-700 font-medium">
                              เกณฑ์แนะนำ: {ruleAuth}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* ข้อความเกณฑ์อำนาจ กฟภ. */}
              <div className="mt-2.5 pt-2 border-t border-slate-200/80 text-[11px] text-slate-500 flex items-center justify-between">
                <span>เกณฑ์อำนาจ: 22 kV ≤ 2,500 kVA (ผจก.) | 22 kV &gt; 2,500 kVA (อฝ.สบ.) | 115 kV (ผชก.)</span>
                <span className="font-semibold text-purple-900 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-100">
                  {getAuthorityRuleText(consumer.voltageLevel, consumer.transformerSize)}
                </span>
              </div>

              {/* ต่อท้ายข้อมูลผู้ใช้ไฟฟ้า: ประเภทสัญญา, วันที่ลงนามสัญญา, เงินค้ำประกันการใช้ไฟฟ้า */}
              <div className="pt-2.5 mt-2 border-t border-slate-200">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-white p-3 rounded-lg border border-purple-100/80 shadow-2xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">ประเภทสัญญา</span>
                    <span className="font-semibold text-slate-900 text-xs">
                      {contract?.contractType && (CONTRACT_TYPES as readonly string[]).includes(contract.contractType)
                        ? contract.contractType
                        : 'สัญญาหลัก'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">วันที่ลงนามสัญญา</span>
                    <span className="font-semibold text-slate-900 font-mono text-xs">
                      {contract?.contractDate || contract?.expireDate || '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">เงินค้ำประกันการใช้ไฟฟ้า</span>
                    <span className="font-semibold font-mono text-emerald-700 text-xs">
                      {contract?.securityDeposit ? formatCurrency(contract.securityDeposit) : '-'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Box 3: รายการเอกสารที่แนบในสัญญา (ตรวจสอบ/รับรองข้อมูลทีละไฟล์แนบเทียบกับข้อมูล) */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div>
                  <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                    <Paperclip className="w-3.5 h-3.5 text-purple-700" />
                    <span>ตรวจสอบ/รับรองข้อมูลทีละไฟล์แนบ ({fileList.filter((f) => f.isVerified).length}/{fileList.length})</span>
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    เทียบข้อมูลเอกสารแต่ละไฟล์กับข้อมูลสัญญาในระบบ
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleVerifyAllFiles}
                  className="text-[11px] font-semibold text-purple-700 hover:text-purple-900 hover:underline cursor-pointer whitespace-nowrap"
                >
                  รับรองครบทุกไฟล์
                </button>
              </div>

              {/* Progress bar of verified files */}
              {fileList.length > 0 && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-600">
                    <span>ความคืบหน้าการรับรองไฟล์</span>
                    <span className="font-bold text-purple-900 font-mono">
                      {fileList.filter((f) => f.isVerified).length} / {fileList.length} ไฟล์
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden flex">
                    <div
                      className="bg-emerald-500 h-full transition-all duration-300"
                      style={{
                        width: `${fileList.length > 0 ? (fileList.filter((f) => f.isVerified).length / fileList.length) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {fileList.length === 0 ? (
                <p className="text-slate-400 italic py-2 text-center text-xs">ไม่มีเอกสารแนบในสัญญานี้</p>
              ) : (
                <div className="space-y-1.5 pt-1">
                  {fileList.map((file, idx) => {
                    const isSelected = idx === activeFileIndex;
                    return (
                      <div
                        key={file.id}
                        onClick={() => {
                          setActiveFileIndex(idx);
                          setCurrentPage(1);
                        }}
                        className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                          isSelected
                            ? 'bg-purple-50/90 border-[#702d8a] ring-2 ring-[#702d8a]/40 shadow-xs'
                            : 'bg-white border-slate-200 hover:bg-slate-100/70'
                        }`}
                      >
                        <div className="flex items-start gap-2 min-w-0 flex-1">
                          <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold ${
                            isSelected ? 'bg-[#702d8a] text-white' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {idx + 1}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-slate-900 truncate text-xs flex items-center gap-1.5 flex-wrap">
                              <span>{file.fileCategory}</span>
                              {isSelected && (
                                <span className="text-[10px] bg-purple-200 text-purple-900 px-1.5 py-0.2 rounded font-medium">
                                  กำลังเปิดเทียบ
                                </span>
                              )}
                              {file.needsRevision && (
                                <span className="text-[10px] bg-rose-100 text-rose-700 border border-rose-200 px-1.5 py-0.2 rounded font-bold flex items-center gap-0.5">
                                  <AlertTriangle className="w-2.5 h-2.5 text-rose-600" />
                                  ต้องแก้ไข
                                </span>
                              )}
                            </p>
                            <p className="font-mono text-[10px] text-slate-500 truncate" title={file.fileName}>
                              {file.fileName} · {file.fileSize} {file.pageCount ? `· ${file.pageCount} หน้า` : ''}
                            </p>
                            {/* หมายเหตุสิ่งที่ต้องแก้ไขใต้ชื่อไฟล์ */}
                            {(file.needsRevision || file.revisionNote) && (
                              <div className="mt-1 p-1.5 rounded bg-rose-50 border border-rose-200 text-[11px] text-rose-800 flex items-start gap-1">
                                <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0 mt-0.5" />
                                <div className="leading-tight">
                                  <span className="font-bold text-rose-900">ต้องแก้: </span>
                                  <span>{file.revisionNote || 'ระบุให้แก้ไขไฟล์นี้'}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Verify Checkbox button */}
                        <div className="flex flex-col gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleFileVerify(file.id);
                            }}
                            className={`px-2 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold border ${
                              file.isVerified
                                ? 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700 shadow-2xs'
                                : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                            }`}
                            title={file.isVerified ? 'ตรวจรับรองแล้ว คลิกเพื่อยกเลิก' : 'คลิกเพื่อรับรองข้อมูลไฟล์นี้'}
                          >
                            <CheckCircle2 className={`w-3 h-3 ${file.isVerified ? 'text-white' : 'text-slate-400'}`} />
                            <span>{file.isVerified ? 'ถูกต้อง' : 'รับรอง'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Box 4: ผู้ตรวจสอบและความเห็น */}
            <div className="bg-purple-50/60 rounded-xl p-4 border border-purple-200/80 space-y-3">
              <h4 className="font-bold text-purple-950 flex items-center gap-1.5 text-xs">
                <UserCheck className="w-3.5 h-3.5 text-[#702d8a]" />
                <span>ผลการตรวจสอบและความเห็นเจ้าหน้าที่ กฟภ.</span>
              </h4>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  ผู้ตรวจสอบสัญญา
                </label>
                <input
                  type="text"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-purple-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-400 font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>บันทึกความเห็นการตรวจสัญญา</span>
                  <span className="text-[10px] text-slate-400">
                    * บังคับระบุเมื่อนำเข้าข้อมูลไม่ถูกต้อง
                  </span>
                </label>
                <textarea
                  rows={3}
                  value={reviewNotes}
                  onChange={(e) => {
                    setReviewNotes(e.target.value);
                    if (reviewNotesError) setReviewNotesError('');
                  }}
                  className={`w-full px-2.5 py-1.5 text-xs bg-white rounded-lg outline-none resize-none transition-colors ${
                    reviewNotesError
                      ? 'border-2 border-rose-500 focus:ring-2 focus:ring-rose-400 bg-rose-50/20'
                      : 'border border-purple-200 focus:ring-2 focus:ring-purple-400'
                  }`}
                  placeholder="ระบุข้อสังเกตหรือเหตุผลในการตรวจสอบเอกสาร (เช่น ข้อมูลไม่ตรงกับสัญญาหลัก, รอปรับปรุงขนาดหม้อแปลง)..."
                />
                {reviewNotesError && (
                  <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{reviewNotesError}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Left Footer Action: นำเข้าข้อมูลถูกต้อง และ นำเข้าข้อมูลไม่ถูกต้อง */}
          <div className="p-4 border-t border-slate-200 bg-white space-y-2.5">
            {fileList.length === 0 ? (
              <button
                type="button"
                disabled
                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                title="ยังไม่ได้แนบไฟล์สัญญา กรุณาแนบไฟล์สัญญาก่อนยืนยันการตรวจสอบ"
              >
                <AlertCircle className="w-4 h-4 text-slate-400" />
                <span>ยังไม่ได้แนบไฟล์สัญญา (ไม่สามารถยืนยันได้)</span>
              </button>
            ) : (
              <div className="space-y-2">
                {/* 1. ปุ่ม นำเข้าข้อมูลถูกต้อง (ข้อ 6) */}
                <button
                  type="button"
                  onClick={handleApproveValid}
                  disabled={isConfirmedSuccess || isRejectSuccess}
                  className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer ${
                    isConfirmedSuccess
                      ? 'bg-emerald-700 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow-md'
                  }`}
                >
                  {isConfirmedSuccess ? (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>นำเข้าข้อมูลถูกต้องเรียบร้อย!</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>นำเข้าข้อมูลถูกต้อง</span>
                    </>
                  )}
                </button>

                {/* 2. ปุ่ม นำเข้าข้อมูลไม่ถูกต้อง (ข้อ 7) */}
                <button
                  type="button"
                  onClick={handleRejectInvalid}
                  disabled={isConfirmedSuccess || isRejectSuccess}
                  className={`w-full py-2 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border shadow-xs transition-all cursor-pointer ${
                    isRejectSuccess
                      ? 'bg-rose-700 text-white border-rose-700'
                      : 'bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border-rose-300'
                  }`}
                  title="ส่งกลับเพื่อแก้ไขข้อมูล และย้ายผู้ใช้ไฟฟ้ารายนี้ไปที่ tab รอแก้ไขข้อมูล"
                >
                  {isRejectSuccess ? (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>บันทึกสถานะรอแก้ไขข้อมูลแล้ว!</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4" />
                      <span>นำเข้าข้อมูลไม่ถูกต้อง รอการแก้ไข</span>
                    </>
                  )}
                </button>
              </div>
            )}

            <p className="text-[10px] text-center text-slate-400 leading-relaxed">
              {fileList.length === 0
                ? 'กรุณาแนบไฟล์สัญญาก่อน เพื่อเปิดให้ตรวจสอบและรับรองข้อมูล'
                : 'หากเลือก "นำเข้าข้อมูลไม่ถูกต้อง" ผู้ใช้ไฟฟ้ารายนี้จะย้ายไปที่ tab "รอแก้ไขข้อมูล" ทันที'}
            </p>
          </div>
        </section>

        {/* =========================================================================
            RIGHT COLUMN: หน้าสัญญาซื้อขายไฟฟ้า (Document Viewer)
            ถ้ายังไม่ได้แนบไฟล์ หน้าตรวจสอบจะไม่โชว์ไฟล์ PDF ให้ตรวจ
           ========================================================================= */}
        <main className="flex-1 flex flex-col overflow-hidden bg-slate-200/90">
          {fileList.length === 0 ? (
            /* ถ้ายังไม่ได้แนบไฟล์ จะไม่โชว์ไฟล์ PDF ให้ตรวจ */
            <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 text-center bg-slate-100/90 overflow-y-auto">
              <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-slate-200 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200 shadow-xs">
                  <FileX2 className="w-8 h-8 text-amber-600" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    ยังไม่ได้แนบไฟล์สัญญา
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    ระบบจะไม่แสดงหน้าสัญญา PDF สำหรับการตรวจสอบ เนื่องจากยังไม่มีการแนบไฟล์สัญญาซื้อขายไฟฟ้าหรือเอกสารประกอบของผู้ใช้ไฟฟ้ารายนี้
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-left text-xs space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">หมายเลขผู้ใช้ไฟฟ้า (CA):</span>
                    <span className="font-mono font-bold text-slate-900">{consumer.accountNumber}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">การไฟฟ้า (กฟฟ.):</span>
                    <span className="font-medium text-slate-900">{consumer.utility} ({consumer.utilityCode})</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">สถานที่ใช้ไฟฟ้า:</span>
                    <span className="font-medium text-slate-700 truncate max-w-[200px]" title={consumer.location}>
                      {consumer.location}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                    <span className="text-slate-500">สถานะเอกสาร:</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px]">
                      <AlertCircle className="w-3 h-3 text-amber-600" />
                      <span>ยังไม่แนบไฟล์สัญญา</span>
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                  {onOpenUploadModal && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenUploadModal(consumer);
                      }}
                      className="flex-1 py-2.5 px-4 bg-[#702d8a] hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <FilePlus className="w-4 h-4" />
                      <span>ไปหน้าเพิ่มไฟล์สัญญา</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onClose}
                    className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    ปิดหน้าต่าง
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* แถบตรวจสอบรับรองข้อมูลทีละไฟล์แนบเทียบกับข้อมูลสัญญา */}
              <div className="bg-gradient-to-r from-purple-950 via-[#702d8a] to-slate-900 text-white px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-md border-b border-purple-800 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-white/20 text-white font-bold text-xs flex items-center justify-center font-mono">
                    {activeFileIndex + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-white">
                        กำลังตรวจสอบไฟล์: {currentFile?.fileCategory}
                      </span>
                      {currentFile?.isVerified ? (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          รับรองข้อมูลไฟล์นี้แล้ว
                        </span>
                      ) : currentFile?.needsRevision ? (
                        <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-400/40 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 animate-pulse">
                          <AlertTriangle className="w-3 h-3 text-rose-400" />
                          ระบุให้แก้ไขไฟล์นี้
                        </span>
                      ) : (
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-400/40 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-400" />
                          รอตรวจสอบรับรองข้อมูล
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-purple-200/90 truncate max-w-sm sm:max-w-lg mt-0.5">
                      เทียบกับข้อมูลสัญญา: CA {consumer.accountNumber} · หม้อแปลง {consumer.transformerSize} ({consumer.voltageLevel}) · อำนาจ: {consumer.signingAuthority || 'ผจก.'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {currentFile && (
                    <div className="flex items-center gap-1 bg-black/25 p-1 rounded-xl border border-white/10">
                      {/* ปุ่ม รับรองว่าถูกต้อง */}
                      <button
                        type="button"
                        onClick={() => handleToggleFileVerify(currentFile.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 ${
                          currentFile.isVerified
                            ? 'bg-emerald-500 text-white border border-emerald-400 shadow-sm'
                            : 'bg-white/10 hover:bg-emerald-600 hover:text-white text-slate-200 border border-transparent'
                        }`}
                        title="รับรองว่าไฟล์นี้ถูกต้องครบถ้วน"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{currentFile.isVerified ? '✓ ถูกต้องแล้ว' : '✓ รับรองถูกต้อง'}</span>
                      </button>

                      {/* ปุ่ม ระบุให้แก้ไขไฟล์นี้ */}
                      <button
                        type="button"
                        onClick={() => {
                          if (currentFile.needsRevision) {
                            setFileList((prev) =>
                              prev.map((f) => (f.id === currentFile.id ? { ...f, needsRevision: false } : f))
                            );
                          } else {
                            handleMarkFileNeedsRevision(currentFile.id);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 ${
                          currentFile.needsRevision
                            ? 'bg-rose-500 text-white border border-rose-400 shadow-sm ring-1 ring-rose-300'
                            : 'bg-white/10 hover:bg-rose-600 hover:text-white text-slate-200 border border-transparent'
                        }`}
                        title="ระบุว่าไฟล์นี้มีข้อผิดพลาดและต้องแก้ไข"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>{currentFile.needsRevision ? '⚠️ ระบุให้แก้ไข' : '⚠️ ให้แก้ไขไฟล์นี้'}</span>
                      </button>
                    </div>
                  )}

                  {activeFileIndex < fileList.length - 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveFileIndex((prev) => Math.min(fileList.length - 1, prev + 1));
                        setCurrentPage(1);
                      }}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-200 bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-1 cursor-pointer"
                      title="สลับไปตรวจไฟล์ถัดไป"
                    >
                      <span>ถัดไป ({activeFileIndex + 2}/{fileList.length})</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* แถบระบุหมายเหตุจุดที่ต้องแก้ไขของไฟล์นี้ (เมื่อผู้ตรวจระบุว่าให้แก้ไข) */}
              {currentFile?.needsRevision && (
                <div className="bg-gradient-to-r from-rose-950 via-rose-900 to-slate-900 border-b border-rose-700/80 px-4 py-3 text-white shadow-inner animate-in slide-in-from-top-2 duration-150 shrink-0">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-300 flex items-center justify-center shrink-0 border border-rose-500/40">
                        <AlertTriangle className="w-4 h-4 text-rose-400" />
                      </div>
                      <div>
                        <span className="font-bold text-xs text-rose-100 flex items-center gap-1">
                          <span>หมายเหตุจุดที่ต้องแก้ไขในไฟล์นี้</span>
                          <span className="text-[10px] text-rose-300 font-normal">(ระบุเพื่อให้คนแก้ไขรู้ว่าต้องแก้ตรงไหน)</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex-1 max-w-2xl flex items-center gap-2">
                      <input
                        type="text"
                        value={currentFile.revisionNote || ''}
                        onChange={(e) => handleUpdateFileRevisionNote(currentFile.id, e.target.value)}
                        placeholder="พิมพ์ระบุจุดที่ต้องแก้ไขในสัญญา เช่น ข้อมูลหม้อแปลงไม่ตรงกับระบบ, ลายมือชื่อไม่ครบ..."
                        className="w-full px-3 py-1.5 text-xs bg-black/40 border border-rose-400/60 rounded-lg text-white placeholder-rose-300/50 focus:ring-2 focus:ring-rose-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* ชิปข้อความสำเร็จรูปสำหรับจุดที่ต้องแก้ไขข้อมูลและไฟล์สัญญา */}
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap text-[11px] pt-1 border-t border-rose-800/60">
                    <span className="text-rose-300 text-[10px] font-semibold">ข้อความแนะนำ:</span>
                    {[
                      'ข้อมูลพิกัดหม้อแปลงในสัญญาไม่ตรงกับข้อมูลในระบบ',
                      'ระดับแรงดันหรือสถานที่ใช้ไฟฟ้าในสัญญาไม่ถูกต้อง',
                      'ขาดหน้าสัญญาแนบท้าย / แนบเอกสารสัญญาแนบท้ายไม่ครบถ้วน',
                      'ลายมือชื่อหรืออำนาจลงนามในสัญญาไม่ถูกต้องครบถ้วน',
                      'เลขที่สัญญาหรือวันที่ทำสัญญาไม่ตรงกับฉบับจริง',
                      'ชื่อผู้ใช้ไฟฟ้าในสัญญาไม่ตรงกับข้อมูลระบบ',
                    ].map((suggestion, sIdx) => (
                      <button
                        key={sIdx}
                        type="button"
                        onClick={() => handleUpdateFileRevisionNote(currentFile.id, suggestion)}
                        className="px-2 py-0.5 rounded bg-rose-900/60 hover:bg-rose-800 text-rose-200 border border-rose-700/50 text-[10px] transition-colors cursor-pointer"
                      >
                        + {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Document Viewer Toolbar */}
              <div className="bg-slate-800 text-slate-100 px-4 py-2.5 flex items-center justify-between text-xs shadow-inner shrink-0">
                {/* Left toolbar info */}
                <div className="flex items-center gap-2 truncate">
                  <FileText className="w-4 h-4 text-purple-300 shrink-0" />
                  <span className="font-semibold truncate text-slate-200">
                    {currentFile?.fileName || 'เอกสารสัญญาซื้อขายไฟฟ้า_กฟภ.pdf'}
                  </span>
                  <span className="text-[10px] bg-slate-700 text-purple-300 px-2 py-0.5 rounded font-mono hidden sm:inline">
                    {currentFile?.fileCategory || 'สัญญาหลัก'}
                  </span>
                </div>

                {/* Middle pagination controls */}
                <div className="flex items-center gap-2 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-700">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                    className="p-1 text-slate-300 hover:text-white disabled:text-slate-600 cursor-pointer disabled:cursor-not-allowed"
                    title="หน้าก่อนหน้า"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <span className="font-mono text-xs text-slate-200 font-semibold px-1">
                    หน้า {currentPage} / {totalPages}
                  </span>

                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages}
                    className="p-1 text-slate-300 hover:text-white disabled:text-slate-600 cursor-pointer disabled:cursor-not-allowed"
                    title="หน้าถัดไป"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Right Zoom and Action tools */}
                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex items-center gap-1 bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-700">
                    <button
                      type="button"
                      onClick={() => setZoomLevel((z) => Math.max(70, z - 10))}
                      className="p-1 text-slate-300 hover:text-white cursor-pointer"
                      title="ย่อขนาด"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-mono text-[11px] text-slate-300 px-1">{zoomLevel}%</span>
                    <button
                      type="button"
                      onClick={() => setZoomLevel((z) => Math.min(150, z + 10))}
                      className="p-1 text-slate-300 hover:text-white cursor-pointer"
                      title="ขยายขนาด"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleDownloadFile}
                    className="p-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                    title="ดาวน์โหลดไฟล์เอกสาร"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden md:inline text-[11px]">ดาวน์โหลด</span>
                  </button>
                </div>
              </div>

              {/* Document Canvas Container */}
              <div className="flex-1 overflow-auto p-4 sm:p-8 flex justify-center items-start">
                {/* The Document Paper (Simulated High-Fidelity Official PEA Power Purchase Agreement) */}
                <div
                  style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
                  className="bg-white rounded-sm shadow-2xl border border-slate-300 w-full max-w-[800px] min-h-[1100px] p-8 sm:p-12 text-slate-900 font-serif relative transition-transform duration-100 flex flex-col justify-between"
                >
                  {/* Document Header (Emblem & Official Header) */}
                  <div>
                    {/* แถบแจ้งเตือนจุดที่ต้องแก้ไขบนหน้าเอกสารจำลอง */}
                    {currentFile?.needsRevision && (
                      <div className="mb-6 p-4 rounded-xl bg-rose-50 border-2 border-rose-300 text-rose-900 font-sans shadow-sm flex items-start gap-3 animate-in fade-in">
                        <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                        <div className="space-y-1 flex-1">
                          <div className="font-bold text-sm text-rose-800 flex items-center gap-2 flex-wrap">
                            <span>⚠️ ไฟล์นี้มีหมายเหตุจุดที่ต้องแก้ไข:</span>
                            <span className="text-xs bg-rose-200 text-rose-900 px-2 py-0.5 rounded font-mono font-semibold">
                              {currentFile.fileName}
                            </span>
                          </div>
                          <p className="text-xs text-rose-700 leading-relaxed font-semibold">
                            {currentFile.revisionNote || 'เจ้าหน้าที่ผู้ตรวจระบุว่าข้อมูลหรือเอกสารในไฟล์นี้ไม่ถูกต้อง กรุณาตรวจสอบและแนบฉบับแก้ไข'}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Official PEA Header */}
                    <div className="flex flex-col items-center text-center border-b-2 border-slate-800 pb-5 mb-6">
                      {/* PEA Emblem placeholder */}
                      <div className="w-14 h-14 rounded-full bg-[#702d8a] text-white flex items-center justify-center font-bold text-xs shadow-md mb-2">
                        <span className="tracking-tighter">PEA</span>
                      </div>
                      <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950">
                        สัญญาซื้อขายไฟฟ้า
                      </h1>
                      <h2 className="text-sm font-semibold text-slate-800 mt-1">
                        การไฟฟ้าส่วนภูมิภาค (PROVINCIAL ELECTRICITY AUTHORITY)
                      </h2>
                      <p className="text-xs text-slate-600 font-sans mt-0.5">
                        สัญญาเลขที่: <span className="font-mono font-bold text-[#702d8a]">{contract?.contractNumber || `PPA-PEA-${consumer.utilityCode}/0114`}</span>
                      </p>
                    </div>

                    {/* Contract Body Text (Dynamic based on selected consumer) */}
                    <div className="text-xs sm:text-sm leading-relaxed space-y-4 font-sans text-slate-800">
                      <p className="text-right text-xs text-slate-600">
                        ทำที่: <span className="font-semibold text-slate-900">{consumer.utility}</span>
                      </p>
                      <p className="text-right text-xs text-slate-600">
                        วันที่: <span className="font-mono font-semibold text-slate-900">{contract?.contractDate || '2026-01-15'}</span>
                      </p>

                      <p className="text-justify indent-8">
                        สัญญานี้ทำขึ้นระหว่าง <strong>การไฟฟ้าส่วนภูมิภาค</strong> โดย{' '}
                        <span className="underline decoration-slate-400 font-semibold text-purple-900">
                          {consumer.signingAuthority === 'ผชก.'
                            ? 'ผู้ช่วยผู้ว่าการการไฟฟ้าส่วนภูมิภาค (ผชก.)'
                            : consumer.signingAuthority === 'อฝ.สบ.'
                            ? 'ผู้อำนวยการฝ่ายสัญญาและบริการระบบจำหน่าย (อฝ.สบ.)'
                            : 'ผู้จัดการการไฟฟ้าส่วนภูมิภาค (ผจก.)'}
                        </span>{' '}
                        ผู้มีอำนาจลงนามผูกพันการไฟฟ้าส่วนภูมิภาค ซึ่งต่อไปในสัญญานี้เรียกว่า <strong>"ผู้จำหน่าย"</strong> ฝ่ายหนึ่ง
                      </p>

                      <p className="text-justify indent-8">
                        กับ <strong>{consumer.consumerName || consumer.location.split(' ')[0]}</strong> ตั้งอยู่ ณ เลขที่ {consumer.location} ซึ่งต่อไปในสัญญานี้เรียกว่า <strong>"ผู้ใช้ไฟฟ้า"</strong> อีกฝ่ายหนึ่ง
                      </p>

                      {/* Highlighted Specifications Box */}
                      <div className="my-5 p-4 rounded-lg bg-purple-50/60 border border-purple-200 text-xs space-y-2">
                        <h5 className="font-bold text-purple-900 text-xs flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-purple-700" />
                          <span>ข้อกำหนดทางเทคนิคและการจำหน่ายไฟฟ้า (Technical Specifications)</span>
                        </h5>
                        <div className="grid grid-cols-2 gap-2 text-slate-700 font-mono text-[11px]">
                          <div>
                            หมายเลขผู้ใช้ไฟฟ้า (CA): <strong>{consumer.accountNumber}</strong>
                          </div>
                          <div>
                            เลขที่สัญญา: <strong>{contract?.contractNumber || consumer.installationNumber}</strong>
                          </div>
                          <div>
                            พิกัดแรงดันไฟฟ้า: <strong className="text-amber-800">{consumer.voltageLevel}</strong>
                          </div>
                          <div>
                            ขนาดกำลังหม้อแปลง: <strong className="text-purple-900">{consumer.transformerSize}</strong>
                          </div>
                          <div>
                            เงินค้ำประกันการใช้ไฟฟ้า: <strong>{formatCurrency(contract?.securityDeposit || 1000000)}</strong>
                          </div>
                        </div>
                      </div>

                      <p className="text-justify indent-8">
                        คู่สัญญาทั้งสองฝ่ายได้ตกลงทำสัญญาซื้อขายไฟฟ้า โดยผู้จำหน่ายตกลงจำหน่ายไฟฟ้าให้แก่ผู้ใช้ไฟฟ้า และผู้ใช้ไฟฟ้าตกลงรับซื้อไฟฟ้าจากผู้จำหน่าย ณ จุดส่งมอบไฟฟ้าตามระดับแรงดัน <strong>{consumer.voltageLevel}</strong> และขนาดหม้อแปลง <strong>{consumer.transformerSize}</strong> ภายใต้ระเบียบและข้อกำหนดการใช้ไฟฟ้าของการไฟฟ้าส่วนภูมิภาคทุกประการ
                      </p>

                      <p className="text-justify indent-8">
                        วันที่ลงนามสัญญา: <strong>{contract?.contractDate || contract?.expireDate || '2026-01-15'}</strong> และมีเอกสารแนบท้ายสัญญาจำนวน <strong>{fileList.length} รายการ</strong> ซึ่งถือเป็นส่วนหนึ่งของสัญญานี้
                      </p>
                    </div>
                  </div>

                  {/* Document Signatures Area */}
                  <div className="pt-10 mt-8 border-t border-slate-300">
                    <div className="grid grid-cols-2 gap-8 text-center text-xs font-sans">
                      {/* PEA Signatory */}
                      <div className="space-y-2">
                        <p className="text-slate-500 text-[11px]">ลงชื่อ ........................................................... ผู้จำหน่าย</p>
                        <p className="font-bold text-slate-900">
                          ( การไฟฟ้าส่วนภูมิภาค {consumer.utility} )
                        </p>
                        <p className="text-purple-800 font-bold text-[11px]">
                          ผู้มีอำนาจลงนาม: {consumer.signingAuthority || 'ผจก.'}
                        </p>
                        <div className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>ตรวจรับรองเอกสารสัญญาแล้ว</span>
                        </div>
                      </div>

                      {/* Consumer Signatory */}
                      <div className="space-y-2">
                        <p className="text-slate-500 text-[11px]">ลงชื่อ ........................................................... ผู้ใช้ไฟฟ้า</p>
                        <p className="font-bold text-slate-900">
                          ( ผู้มีอำนาจลงนามฝ่ายผู้ใช้ไฟฟ้า )
                        </p>
                        <p className="text-[11px] text-slate-600">
                          {consumer.consumerName || consumer.location.split(' ')[0]}
                        </p>
                      </div>
                    </div>

                    {/* Footer Watermark & Page Number */}
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-6 mt-6 border-t border-slate-200 font-sans">
                      <span>ระบบบริหารจัดการสัญญาซื้อขายไฟฟ้า กฟภ. (PLMS)</span>
                      <span className="font-mono">
                        หน้า {currentPage} จาก {totalPages} หน้า
                      </span>
                      <span>รหัสตรวจสอบ: PEA-VFY-{consumer.utilityCode}-{consumer.accountNumber.slice(-4)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};
