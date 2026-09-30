import React from 'react';
import {
  X,
  FileText,
  Download,
  CheckCircle2,
  Clock,
  Plus,
  Paperclip,
  Building2,
  Zap,
  MapPin,
  FileSpreadsheet
} from 'lucide-react';
import { ElectricityConsumer, AttachedFile } from '../types/contract';
import { getStatusLabel, getStatusStyle } from '../utils/formatters';

interface ConsumerAttachmentsModalProps {
  consumer: ElectricityConsumer | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenUploadModal?: (consumer: ElectricityConsumer) => void;
}

export const ConsumerAttachmentsModal: React.FC<ConsumerAttachmentsModalProps> = ({
  consumer,
  isOpen,
  onClose,
  onOpenUploadModal,
}) => {
  if (!isOpen || !consumer) return null;

  const contract = consumer.contractDetails;
  const statusStyle = getStatusStyle(consumer.contractStatus);

  // รวบรวมรายการไฟล์แนบ
  const files: AttachedFile[] =
    contract?.files && contract.files.length > 0
      ? contract.files
      : contract?.fileName
      ? [
          {
            id: 'f-main-1',
            fileName: contract.fileName,
            fileCategory: 'สัญญาหลัก',
            fileDetails: contract.contractType || 'สัญญาซื้อขายไฟฟ้า',
            fileSize: contract.fileSize || '4.0 MB',
            pageCount: 16,
            uploadedAt: contract.uploadedAt || consumer.updatedAt,
            isVerified: consumer.contractStatus === 'completed',
          },
        ]
      : [];

  const handleDownloadFile = (fileName: string) => {
    const dummyContent = `PEA CONTRACT DOCUMENT: ${fileName}\nUtility: ${consumer.utility} (${consumer.utilityCode})\nCA: ${consumer.accountNumber}\nConsumer: ${consumer.consumerName || consumer.location}`;
    const blob = new Blob([dummyContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header matching PLMS pea purple theme */}
        <div className="bg-[#702d8a] text-white px-5 py-3.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-white/10 rounded-lg">
              <Paperclip className="w-5 h-5 text-purple-200" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">
                เอกสารประกอบสัญญาและไฟล์แนบทั้งหมด
              </h3>
              <p className="text-xs text-purple-200">
                {consumer.consumerName || consumer.location.split(' ')[0]} · CA: <span className="font-mono font-bold text-white">{consumer.accountNumber}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-purple-200 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors cursor-pointer"
            title="ปิดหน้าต่าง"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Consumer summary banner */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="space-y-0.5">
              <div className="text-slate-500 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-purple-700" />
                <span className="font-semibold text-slate-800">{consumer.utility} ({consumer.utilityCode})</span>
                <span>·</span>
                <span>พิกัด: {consumer.voltageLevel}</span>
                <span>·</span>
                <span>หม้อแปลง: {consumer.transformerSize}</span>
              </div>
              <div className="text-slate-600 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate max-w-md">{consumer.location}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${statusStyle.badgeBg} ${statusStyle.borderColor}`}>
              {getStatusLabel(consumer.contractStatus)}
            </span>
            {onOpenUploadModal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenUploadModal(consumer);
                }}
                className="bg-[#22c55e] hover:bg-green-600 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>+ เพิ่ม/แก้ไขเอกสาร</span>
              </button>
            )}
          </div>
        </div>

        {/* Modal Body: Documents Table */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            {/* Table purple header */}
            <div className="bg-[#702d8a] px-4 py-2.5 flex items-center justify-between text-white">
              <span className="text-xs sm:text-sm font-bold tracking-tight">
                เอกสารประกอบสัญญา (แนบแล้ว {files.length} รายการ)
              </span>
              <span className="text-[11px] text-purple-200 font-mono">
                ตรวจแล้ว {files.filter((f) => f.isVerified).length}/{files.length} รายการ
              </span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/90 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">หัวข้อเอกสาร</th>
                    <th className="py-2.5 px-4 font-semibold">ชื่อไฟล์</th>
                    <th className="py-2.5 px-3 font-semibold text-center whitespace-nowrap">ขนาด</th>
                    <th className="py-2.5 px-3 font-semibold text-center whitespace-nowrap">จำนวนหน้า</th>
                    <th className="py-2.5 px-3 font-semibold text-center whitespace-nowrap">สถานะการตรวจ</th>
                    <th className="py-2.5 px-3 font-semibold text-center whitespace-nowrap">Download</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {files.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <FileText className="w-8 h-8 text-slate-300 stroke-1" />
                          <p className="text-sm font-medium">ยังไม่มีการแนบไฟล์สัญญาสำหรับผู้ใช้ไฟฟ้ารายนี้</p>
                          {onOpenUploadModal && (
                            <button
                              type="button"
                              onClick={() => {
                                onClose();
                                onOpenUploadModal(consumer);
                              }}
                              className="mt-1 text-xs font-semibold text-[#702d8a] hover:underline"
                            >
                              คลิกที่นี่เพื่อไปหน้าเพิ่มไฟล์สัญญา
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    files.map((file, idx) => (
                      <tr key={file.id || idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-medium text-slate-800">
                          <div className="flex items-start gap-2">
                            <FileText className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-slate-900">{file.fileCategory}</span>
                                {file.fileCategory === 'สัญญาแนบท้าย' && (
                                  <span className="text-[10px] bg-purple-100 text-[#702d8a] px-1.5 py-0.2 rounded font-bold">
                                    แนบท้าย
                                  </span>
                                )}
                              </div>
                              {file.fileDetails && (
                                <span className="text-[11px] text-purple-900 font-medium block mt-0.5">
                                  {file.fileDetails}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-mono text-[11px] truncate max-w-[200px]" title={file.fileName}>
                          {file.fileName}
                        </td>
                        <td className="py-3 px-3 text-center text-slate-600 font-mono">
                          {file.fileSize}
                        </td>
                        <td className="py-3 px-3 text-center text-slate-600 font-mono">
                          {file.pageCount || '-'}
                        </td>
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          {file.isVerified ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>ตรวจแล้ว</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200">
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>รอตรวจ</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleDownloadFile(file.fileName)}
                            className="inline-flex items-center justify-center p-1.5 text-sky-600 hover:text-sky-800 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
                            title="ดาวน์โหลดไฟล์"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer info */}
            <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>แสดงทั้งหมด {files.length} รายการ</span>
              <span>ระบบบริหารจัดการสัญญาซื้อขายไฟฟ้า กฟภ. (PLMS)</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-white border-t border-slate-200 px-5 py-3 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-4 py-2 rounded-lg transition-colors cursor-pointer"
          >
            ปิด
          </button>
          {onOpenUploadModal && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenUploadModal(consumer);
              }}
              className="bg-[#702d8a] hover:bg-purple-800 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>จัดการและเพิ่มไฟล์สัญญา</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
