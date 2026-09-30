import React from 'react';
import {
  X,
  FileText,
  Building2,
  Zap,
  Calendar,
  ShieldCheck,
  Download,
  Printer,
  CheckCircle2,
  Clock,
  UserCheck,
  FileCheck2,
  AlertTriangle,
  RotateCcw,
  Paperclip
} from 'lucide-react';
import { ElectricityConsumer, CONTRACT_TYPES } from '../types/contract';
import { formatCurrency, getStatusLabel, getStatusStyle, calculateSigningAuthority, getAuthorityRuleText, getAuthorityBadgeStyle } from '../utils/formatters';

interface ContractDetailDrawerProps {
  consumer: ElectricityConsumer | null;
  isOpen: boolean;
  onClose: () => void;
  onEditContract: (consumer: ElectricityConsumer) => void;
  onVerifyContract?: (consumer: ElectricityConsumer) => void;
  onConfirmRevision?: (consumer: ElectricityConsumer) => void;
}

export const ContractDetailDrawer: React.FC<ContractDetailDrawerProps> = ({
  consumer,
  isOpen,
  onClose,
  onEditContract,
  onVerifyContract,
  onConfirmRevision,
}) => {
  if (!isOpen || !consumer) return null;

  const contract = consumer.contractDetails;
  const statusStyle = getStatusStyle(consumer.contractStatus);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadMock = () => {
    const textContent = `
สัญญาซื้อขายไฟฟ้าฉบับจำลอง
---------------------------------------------
เลขที่สัญญา: ${contract?.contractNumber || consumer.installationNumber || 'PPA-0000'}
หน่วยงานการไฟฟ้า: ${consumer.utility}
รหัสการไฟฟ้า: ${consumer.utilityCode}
หมายเลขผู้ใช้ไฟฟ้า (CA): ${consumer.accountNumber}
สถานที่ใช้ไฟฟ้า: ${consumer.location}
ขนาดหม้อแปลง: ${consumer.transformerSize}
ระดับแรงดัน: ${consumer.voltageLevel}
ผู้มีอำนาจลงนาม: ${consumer.authorizedSignatory}
ประเภทสัญญา: ${contract?.contractType || 'สัญญาหลัก'}
วันที่ลงนามสัญญา: ${contract?.contractDate || '-'}
เงินค้ำประกันการใช้ไฟฟ้า: ${formatCurrency(contract?.securityDeposit)}
สถานะการอนุมัติ: ${getStatusLabel(consumer.contractStatus)}
---------------------------------------------
    `;
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${contract?.fileName || 'สัญญาซื้อขายไฟฟ้า.txt'}`;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col border-l border-sky-100 animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-5 border-b border-sky-100 bg-gradient-to-r from-sky-50 via-white to-sky-50/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-500 text-white rounded-xl shadow-xs">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">เอกสารสัญญาซื้อขายไฟฟ้า</h3>
              <p className="text-xs text-slate-500 font-mono">
                {contract?.contractNumber || 'ยังไม่มีเลขที่สัญญา'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Status Banner */}
          <div className={`p-4 rounded-xl border flex items-center justify-between ${statusStyle.badgeBg} ${statusStyle.borderColor}`}>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${statusStyle.dotColor}`}></span>
              <div>
                <p className="text-xs font-semibold text-slate-900">
                  สถานะเอกสาร: {getStatusLabel(consumer.contractStatus)}
                </p>
                <p className="text-[11px] text-slate-500">
                  อัปเดตล่าสุด: {consumer.updatedAt}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                onClose();
                onEditContract(consumer);
              }}
              className="px-3 py-1 text-xs font-medium text-sky-800 bg-white border border-sky-200 rounded-lg hover:bg-sky-50 cursor-pointer shadow-2xs"
            >
              เพิ่ม/แก้ไขไฟล์สัญญา
            </button>
          </div>

          {/* Alert Banner for needs_revision */}
          {consumer.contractStatus === 'needs_revision' && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs flex items-center gap-1.5 text-rose-800">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>รอแก้ไขข้อมูล (ผู้ตรวจระบุว่านำเข้าข้อมูลไม่ถูกต้อง)</span>
                </span>
                {onConfirmRevision && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onConfirmRevision(consumer);
                    }}
                    className="px-3 py-1 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>ยืนยันการแก้ไข</span>
                  </button>
                )}
              </div>
              {contract?.reviewNotes && (
                <div className="bg-white/80 p-2.5 rounded-lg border border-rose-200 text-xs">
                  <strong>บันทึกความเห็น:</strong> {contract.reviewNotes}
                </div>
              )}
            </div>
          )}

          {/* Section: ข้อมูลผู้ใช้ไฟฟ้า */}
          <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/80 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-sky-600" />
              <span>ข้อมูลผู้ใช้ไฟฟ้า</span>
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">การไฟฟ้า</span>
                <span className="font-semibold text-slate-800">{consumer.utility}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">รหัสการไฟฟ้า</span>
                <span className="font-semibold text-slate-800 font-mono">{consumer.utilityCode}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">หมายเลขผู้ใช้ไฟฟ้า (CA)</span>
                <span className="font-semibold text-slate-900 font-mono text-sm bg-white px-1.5 py-0.5 rounded border border-slate-200 inline-block">
                  {consumer.accountNumber}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">เลขที่สัญญา</span>
                <span className="font-semibold text-slate-800 font-mono">
                  {contract?.contractNumber || consumer.installationNumber}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block text-[11px]">ชื่อผู้ใช้ไฟฟ้า</span>
                <span className="font-bold text-slate-900">{consumer.consumerName || consumer.location.split(' ')[0]}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block text-[11px]">สถานที่ใช้ไฟฟ้า</span>
                <span className="font-medium text-slate-800">{consumer.location}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">ขนาดหม้อแปลง</span>
                <span className="font-semibold text-sky-800 font-mono">{consumer.transformerSize}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">ระดับแรงดันไฟฟ้า</span>
                <span className="font-semibold text-slate-800 font-mono">{consumer.voltageLevel}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block text-[11px]">ผู้มีอำนาจลงนาม</span>
                {(() => {
                  const auth = consumer.signingAuthority || consumer.contractDetails?.signingAuthority || 'ผจก.';
                  const authStyle = getAuthorityBadgeStyle(auth);
                  const ruleAuth = calculateSigningAuthority(consumer.voltageLevel, consumer.transformerSize);
                  const isMatch = auth === ruleAuth;

                  return (
                    <div className="space-y-1 mt-1">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold border ${authStyle.badgeBg} ${authStyle.textColor} ${authStyle.borderColor}`}>
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>อำนาจ: {auth}</span>
                        </span>
                        <span className="text-xs text-slate-600 font-medium">
                          {auth === 'ผชก.'
                            ? 'ผู้ช่วยผู้ว่าการการไฟฟ้าส่วนภูมิภาค'
                            : auth === 'อฝ.สบ.'
                            ? 'ผู้อำนวยการฝ่ายสัญญาและบริการระบบจำหน่าย'
                            : 'ผู้จัดการการไฟฟ้าส่วนภูมิภาค'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-200/80 flex items-center justify-between">
                        <span>เกณฑ์ กฟภ.: 22 kV ≤ 2,500 kVA (ผจก.) | 22 kV &gt; 2,500 kVA (อฝ.สบ.) | 115 kV (ผชก.)</span>
                        <span className={`font-semibold ${isMatch ? 'text-emerald-700' : 'text-amber-700'}`}>
                          {isMatch ? `✓ ตรงตามเกณฑ์ (${ruleAuth})` : `เกณฑ์แนะนำ: ${ruleAuth}`}
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* ต่อท้ายข้อมูลผู้ใช้ไฟฟ้า: ประเภทสัญญา, วันที่ลงนามสัญญา, เงินค้ำประกันการใช้ไฟฟ้า */}
              <div className="col-span-2 pt-2.5 mt-1 border-t border-slate-200">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-slate-400 block text-[11px]">ประเภทสัญญา</span>
                    <span className="font-semibold text-slate-800">
                      {contract?.contractType && (CONTRACT_TYPES as readonly string[]).includes(contract.contractType)
                        ? contract.contractType
                        : 'สัญญาหลัก'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">วันที่ลงนามสัญญา</span>
                    <span className="font-mono text-slate-800">
                      {contract?.contractDate || contract?.expireDate || '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">เงินค้ำประกันการใช้ไฟฟ้า</span>
                    <span className="font-mono font-semibold text-slate-900 tabular-nums">
                      {formatCurrency(contract?.securityDeposit)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section: เอกสารและไฟล์แนบสัญญา */}
          <div className="bg-white rounded-xl p-4 border border-sky-100 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5 text-sky-600" />
                <span>เอกสารและไฟล์แนบสัญญา ({consumer.attachedFilesCount} ไฟล์)</span>
              </h4>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                consumer.verifiedFilesCount === consumer.attachedFilesCount && consumer.attachedFilesCount > 0
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                ตรวจแล้ว {consumer.verifiedFilesCount}/{consumer.attachedFilesCount} ไฟล์
              </span>
            </div>

            {contract ? (
              <div className="space-y-3 text-xs">
                {contract.files && contract.files.length > 0 ? (
                    <div className="space-y-2">
                      {contract.files.map((file, idx) => (
                        <div
                          key={file.id || idx}
                          className="p-3 bg-slate-50 hover:bg-sky-50/50 rounded-xl border border-slate-200 text-xs transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2 min-w-0 flex-1">
                              <FileText className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                              <div className="min-w-0 flex-1">
                                <p className="font-semibold text-slate-800 truncate" title={file.fileName}>
                                  {file.fileName}
                                </p>
                                <p className="text-[10px] text-slate-400 mt-0.5">
                                  {file.fileCategory} · {file.fileSize} {file.pageCount ? `· ${file.pageCount} หน้า` : ''}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {file.isVerified ? (
                                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>ตรวจแล้ว</span>
                                </span>
                              ) : file.needsRevision || file.revisionNote ? (
                                <span className="inline-flex items-center gap-1 text-[11px] text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 animate-pulse">
                                  <AlertTriangle className="w-3 h-3 text-rose-600" />
                                  <span>ต้องแก้ไข</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                                  <Clock className="w-3 h-3 text-amber-600" />
                                  <span>รอตรวจ</span>
                                </span>
                              )}
                              <button
                                onClick={handleDownloadMock}
                                className="p-1 text-slate-400 hover:text-sky-700 rounded cursor-pointer"
                                title="ดาวน์โหลด"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* แสดงหมายเหตุจุดที่ต้องแก้ไขของไฟล์นี้ */}
                          {(file.needsRevision || file.revisionNote) && (
                            <div className="mt-2 p-2 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-0.5">
                              <div className="font-bold text-rose-800 flex items-center gap-1 text-[11px]">
                                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                <span>หมายเหตุจุดที่ต้องแก้ไข:</span>
                              </div>
                              <p className="text-[11px] text-rose-700 pl-4 font-normal leading-relaxed">
                                {file.revisionNote || 'กรุณาแก้ไขเอกสารให้ถูกต้องและแนบใหม่'}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 bg-sky-50/50 rounded-xl border border-sky-200 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-5 h-5 text-sky-600" />
                        <div>
                          <p className="text-xs font-semibold text-slate-800">{contract.fileName}</p>
                          <p className="text-[11px] text-slate-500 font-mono">
                            {contract.fileSize || '4.0 MB'} · อัปโหลดเมื่อ {contract.uploadedAt || '-'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleDownloadMock}
                        className="p-1.5 text-sky-700 hover:bg-sky-100 rounded-lg cursor-pointer transition-colors"
                        title="ดาวน์โหลดไฟล์สัญญา"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
            ) : (
              <div className="text-center py-6 text-slate-400">
                <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                <p className="text-xs">ยังไม่มีการแนบไฟล์สัญญาสำหรับผู้ใช้ไฟฟ้ารายนี้</p>
                <button
                  onClick={() => {
                    onClose();
                    onEditContract(consumer);
                  }}
                  className="mt-2 text-xs font-semibold text-sky-600 hover:underline"
                >
                  คลิกที่นี่เพื่อเพิ่มไฟล์สัญญา
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>พิมพ์รายงานสรุป</span>
          </button>

          <div className="flex items-center gap-2">
            {onVerifyContract && (() => {
              const isVerified =
                consumer.contractStatus === 'completed' ||
                (consumer.attachedFilesCount > 0 &&
                  consumer.verifiedFilesCount === consumer.attachedFilesCount);

              return (
                <button
                  onClick={() => {
                    onClose();
                    onVerifyContract(consumer);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border shadow-xs transition-colors cursor-pointer ${
                    isVerified
                      ? 'text-white bg-emerald-600 hover:bg-emerald-700 border-emerald-600'
                      : 'text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-800 border-slate-300'
                  }`}
                  title={
                    isVerified
                      ? 'ตรวจสอบการนำเข้าข้อมูล (ตรวจแล้ว - สีเขียว)'
                      : 'ตรวจสอบการนำเข้าข้อมูล (ยังไม่ตรวจ - สีเทา)'
                  }
                >
                  <FileCheck2 className={`w-4 h-4 ${isVerified ? 'text-white' : 'text-slate-400'}`} />
                  <span>ตรวจสอบการนำเข้าข้อมูล</span>
                </button>
              );
            })()}

            <button
              onClick={handleDownloadMock}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>ดาวน์โหลด</span>
            </button>
            {consumer.contractStatus === 'needs_revision' && onConfirmRevision && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onConfirmRevision(consumer);
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                title="ยืนยันการแก้ไขข้อมูล แล้วเด้งกลับไปที่สถานะรอตรวจสอบใหม่"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>ยืนยันการแก้ไข</span>
              </button>
            )}

            <button
              onClick={() => {
                onClose();
                onEditContract(consumer);
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs shadow-sky-200 transition-colors cursor-pointer"
            >
              แก้ไขสัญญา
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
