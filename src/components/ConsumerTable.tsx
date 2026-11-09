import React, { useState } from 'react';
import {
  FilePlus,
  FileCheck2,
  FileText,
  Copy,
  Check,
  Building,
  Zap,
  MoreVertical,
  ExternalLink,
  PlusCircle,
  Eye,
  FileClock,
  MapPin,
  UserCheck,
  Paperclip,
  CheckCircle2,
  Clock,
  Lock,
  Trash2,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';
import { ElectricityConsumer } from '../types/contract';
import { getStatusLabel, getStatusStyle, getAuthorityBadgeStyle } from '../utils/formatters';

interface ConsumerTableProps {
  consumers: ElectricityConsumer[];
  onOpenUploadModal: (consumer: ElectricityConsumer) => void;
  onOpenAddModal: () => void;
  onViewContract: (consumer: ElectricityConsumer) => void;
  onViewAttachments?: (consumer: ElectricityConsumer) => void;
  onVerifyContract?: (consumer: ElectricityConsumer) => void;
  onConfirmRevision?: (consumer: ElectricityConsumer) => void;
  onDeleteConsumer?: (consumer: ElectricityConsumer) => void;
  canViewDetails?: boolean;
  canUploadFiles?: boolean;
  canVerifyContract?: boolean;
  canEditData?: boolean;
  canDeleteData?: boolean;
  onPermissionDenied?: (actionName: string) => void;
}

export const ConsumerTable: React.FC<ConsumerTableProps> = ({
  consumers,
  onOpenUploadModal,
  onOpenAddModal,
  onViewContract,
  onViewAttachments,
  onVerifyContract,
  onConfirmRevision,
  onDeleteConsumer,
  canViewDetails = true,
  canUploadFiles = true,
  canVerifyContract = true,
  canEditData = true,
  canDeleteData = false,
  onPermissionDenied,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleDetailsClick = (item: ElectricityConsumer) => {
    if (!canViewDetails) {
      if (onPermissionDenied) {
        onPermissionDenied('กดดูรายละเอียดสัญญา');
      }
      return;
    }
    onViewContract(item);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-sky-100 dark:border-slate-800 shadow-xs overflow-hidden">
      {/* Top Header of Table: Title & The Required "เพิ่มข้อมูล" button on top right */}
      <div className="px-5 py-4 border-b border-sky-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-sky-50/40 via-white to-sky-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>ตารางข้อมูลผู้ใช้ไฟฟ้าและสถานะสัญญา</span>
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400 font-mono tabular-nums">
              ({consumers.length} สัญญา)
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            จัดการข้อมูลผู้ใช้ไฟฟ้า รายละเอียดหม้อแปลง แรงดัน และแนบไฟล์สัญญาซื้อขายไฟฟ้า
          </p>
        </div>

        {/* REQUIRED: ปุ่มเพิ่มข้อมูลไว้ด้านขวาบนของตาราง */}
        <div className="flex items-center gap-2">
          {canEditData ? (
            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-700 hover:to-cyan-700 rounded-xl shadow-xs shadow-sky-300 dark:shadow-none transition-all duration-150 transform hover:-translate-y-0.5 cursor-pointer whitespace-nowrap"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ เพิ่มข้อมูลผู้ใช้ไฟฟ้า</span>
            </button>
          ) : (
            <button
              onClick={() => onPermissionDenied?.('เพิ่มข้อมูลผู้ใช้ไฟฟ้า')}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl cursor-not-allowed whitespace-nowrap"
              title="ไม่มีสิทธิ์เพิ่มข้อมูล (เฉพาะเจ้าหน้าที่)"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>+ เพิ่มข้อมูล (สิทธิ์ถูกจำกัด)</span>
            </button>
          )}
        </div>
      </div>

      {/* Viewer Role Notice Banner if canViewDetails is false */}
      {!canViewDetails && (
        <div className="px-5 py-2.5 bg-amber-50/90 dark:bg-amber-950/50 border-b border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
          <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>
            <strong>โหมดผู้เข้าชม (Viewer):</strong> คุณสามารถดูข้อมูลตารางทะเบียนสัญญาและสถิติภาพรวมได้ แต่ถูกจำกัดสิทธิ์
            <strong>"ไม่สามารถกดเข้าไปดูรายละเอียดสัญญา"</strong> และไม่สามารถแก้ไข/อัพโหลด/ตรวจสอบสัญญาได้
          </span>
        </div>
      )}

      {/* Table responsive container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm border-collapse">
          <thead>
            <tr className="bg-slate-50/90 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium tracking-tight">
              <th scope="col" className="py-3 px-3 sm:px-4 text-xs font-semibold whitespace-nowrap">
                การไฟฟ้า
              </th>
              <th scope="col" className="py-3 px-3 text-xs font-semibold whitespace-nowrap">
                รหัสการไฟฟ้า
              </th>
              <th scope="col" className="py-3 px-3 text-xs font-semibold whitespace-nowrap">
                หมายเลขผู้ใช้ไฟฟ้า
              </th>
              <th scope="col" className="py-3 px-3 text-xs font-semibold whitespace-nowrap">
                เลขที่สัญญา
              </th>
              <th scope="col" className="py-3 px-3 text-xs font-semibold whitespace-nowrap text-center">
                วันที่ลงนาม
              </th>
              <th scope="col" className="py-3 px-4 text-xs font-semibold min-w-[220px]">
                สถานที่ใช้ไฟฟ้า
              </th>
              <th scope="col" className="py-3 px-3 text-xs font-semibold whitespace-nowrap text-right">
                ขนาดหม้อแปลง
              </th>
              <th scope="col" className="py-3 px-3 text-xs font-semibold whitespace-nowrap text-center">
                แรงดัน
              </th>
              <th scope="col" className="py-3 px-3 text-xs font-semibold whitespace-nowrap text-center">
                อำนาจลงนาม
              </th>
              <th scope="col" className="py-3 px-3 text-xs font-semibold whitespace-nowrap text-center">
                ความคืบหน้าเอกสาร
              </th>
              <th scope="col" className="py-3 px-3 text-xs font-semibold whitespace-nowrap text-center">
                สถานะสัญญา
              </th>
              <th scope="col" className="py-3 px-3 text-xs font-semibold text-left whitespace-nowrap bg-sky-50/70 dark:bg-slate-800 border-l border-slate-200/80 dark:border-slate-700 min-w-[360px]">
                <div className="flex items-center gap-1.5 text-sky-950 dark:text-sky-300 font-bold">
                  <span>การจัดการสัญญา</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {consumers.length === 0 ? (
              <tr>
                <td colSpan={12} className="py-12 text-center text-slate-400 dark:text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <FileText className="w-8 h-8 text-slate-300 dark:text-slate-600 stroke-1" />
                    <p className="text-sm font-medium">ไม่พบข้อมูลสัญญาตามเงื่อนไขที่เลือก</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">ลองปรับเปลี่ยนตัวกรอง หรือค้นหาด้วยคำอื่น</p>
                  </div>
                </td>
              </tr>
            ) : (
              consumers.map((item) => {
                const statusStyle = getStatusStyle(item.contractStatus);
                const hasContractFile =
                  Boolean(item.contractDetails?.fileName) || (item.attachedFilesCount || 0) > 0;

                const isVerified =
                  item.contractStatus === 'completed' ||
                  (item.attachedFilesCount > 0 &&
                    item.verifiedFilesCount === item.attachedFilesCount);

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-sky-50/30 dark:hover:bg-slate-800/60 transition-colors duration-100 group"
                  >
                    {/* การไฟฟ้า */}
                    <td className="py-3.5 px-3 sm:px-4 font-medium text-slate-900 dark:text-white whitespace-nowrap align-middle">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                        <span className="font-semibold text-sky-950 dark:text-sky-200">{item.utility}</span>
                      </div>
                    </td>

                    {/* รหัสการไฟฟ้า */}
                    <td className="py-3.5 px-3 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap align-middle">
                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded text-xs border border-slate-200/60 dark:border-slate-700">
                        {item.utilityCode}
                      </span>
                    </td>

                    {/* หมายเลขผู้ใช้ไฟฟ้า (CA) */}
                    <td className="py-3.5 px-3 whitespace-nowrap align-middle">
                      <div className="flex items-center gap-1.5 font-mono font-bold text-sky-800 dark:text-sky-400">
                        <span>{item.accountNumber}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(item.accountNumber, item.id)}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-sky-600 dark:hover:text-sky-300 transition-opacity p-0.5 rounded cursor-pointer"
                          title="คัดลอกหมายเลขผู้ใช้ไฟฟ้า"
                        >
                          {copiedId === item.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* เลขที่สัญญา */}
                    <td className="py-3.5 px-3 font-mono text-slate-700 dark:text-slate-300 whitespace-nowrap align-middle">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {item.contractDetails?.contractNumber || item.installationNumber}
                      </span>
                    </td>

                    {/* วันที่ลงนาม */}
                    <td className="py-3.5 px-3 font-mono text-slate-700 dark:text-slate-300 whitespace-nowrap align-middle text-center">
                      {item.contractDetails?.contractDate || item.contractDetails?.expireDate ? (
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700">
                          {item.contractDetails?.contractDate || item.contractDetails?.expireDate}
                        </span>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500 text-xs">-</span>
                      )}
                    </td>

                    {/* สถานที่ใช้ไฟฟ้า & ชื่อผู้ใช้ไฟฟ้า */}
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 align-middle">
                      <div className="flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                          <button
                            type="button"
                            onClick={() => {
                              if (onViewAttachments) {
                                onViewAttachments(item);
                              } else {
                                handleDetailsClick(item);
                              }
                            }}
                            className="font-bold text-sky-800 dark:text-sky-300 hover:text-purple-700 dark:hover:text-purple-300 hover:underline text-left text-xs cursor-pointer inline-flex items-center gap-1 group/btn"
                            title="คลิกเพื่อดูไฟล์สัญญาที่อัพโหลดทั้งหมด (เอกสารแนบ)"
                          >
                            <Paperclip className="w-3 h-3 text-purple-600 dark:text-purple-400 opacity-75 group-hover/btn:opacity-100 shrink-0" />
                            <span>{item.consumerName || item.location.split(' ')[0]}</span>
                          </button>
                          <span
                            className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 block"
                            title={item.location}
                          >
                            {item.location}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* ขนาดหม้อแปลง */}
                    <td className="py-3.5 px-3 font-mono font-medium text-slate-800 dark:text-slate-200 text-right whitespace-nowrap align-middle">
                      <span className="bg-sky-50 dark:bg-slate-800 text-sky-900 dark:text-sky-300 px-2 py-0.5 rounded border border-sky-100 dark:border-slate-700">
                        {item.transformerSize}
                      </span>
                    </td>

                    {/* แรงดัน */}
                    <td className="py-3.5 px-3 text-center whitespace-nowrap align-middle">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-medium font-mono ${
                          item.voltageLevel === '115 kV'
                            ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                            : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        }`}
                      >
                        {item.voltageLevel}
                      </span>
                    </td>

                    {/* อำนาจลงนาม */}
                    <td className="py-3.5 px-3 text-center whitespace-nowrap align-middle">
                      {(() => {
                        const auth = item.signingAuthority || item.authorizedSignatory || 'ผจก.';
                        const authStyle = getAuthorityBadgeStyle(auth);
                        return (
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${authStyle.badgeBg} ${authStyle.textColor} ${authStyle.borderColor}`}
                            title={`${authStyle.fullTitle} | หม้อแปลง: ${item.transformerSize} (${item.voltageLevel})`}
                          >
                            <UserCheck className="w-3 h-3 opacity-80" />
                            <span>{auth}</span>
                          </span>
                        );
                      })()}
                    </td>

                    {/* ความคืบหน้าเอกสาร */}
                    <td className="py-3.5 px-3 text-center whitespace-nowrap align-middle">
                      {item.attachedFilesCount > 0 ? (
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-mono font-semibold ${
                            item.verifiedFilesCount === item.attachedFilesCount
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                          }`}
                        >
                          {item.verifiedFilesCount === item.attachedFilesCount ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                          )}
                          <span>
                            {item.verifiedFilesCount}/{item.attachedFilesCount} ไฟล์
                          </span>
                        </span>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500 font-mono text-xs">-</span>
                      )}
                    </td>

                    {/* สถานะสัญญา */}
                    <td className="py-3.5 px-3 whitespace-nowrap align-middle text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusStyle.badgeBg} ${statusStyle.borderColor}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dotColor}`}></span>
                        <span>{getStatusLabel(item.contractStatus)}</span>
                      </span>
                      {item.contractDetails?.contractNumber && (
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5 truncate max-w-[130px] mx-auto">
                          {item.contractDetails.contractNumber}
                        </div>
                      )}
                      {item.contractStatus === 'needs_revision' && (
                        <div
                          className="text-[10px] text-rose-600 dark:text-rose-400 font-medium mt-1 truncate max-w-[140px] mx-auto flex items-center justify-center gap-1 cursor-help"
                          title={`หมายเหตุแก้ไข: ${item.contractDetails?.reviewNotes || 'มีไฟล์ที่ต้องแก้ไข'}`}
                        >
                          <AlertTriangle className="w-3 h-3 text-rose-500 dark:text-rose-400 shrink-0" />
                          <span className="truncate">
                            {item.contractDetails?.reviewNotes ? item.contractDetails.reviewNotes : 'มีไฟล์ต้องแก้ไข'}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* การจัดการสัญญา */}
                    <td className="py-2.5 px-3 whitespace-nowrap align-middle bg-sky-50/15 dark:bg-slate-800/40 border-l border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-start gap-1.5 min-w-max">
                        {/* 1. ปุ่ม เพิ่มไฟล์สัญญา */}
                        {canUploadFiles ? (
                          <button
                            onClick={() => onOpenUploadModal(item)}
                            className="inline-flex items-center justify-center gap-1.5 w-[114px] h-8 text-xs font-semibold text-sky-700 dark:text-sky-300 bg-sky-50/90 dark:bg-slate-800 hover:bg-sky-600 hover:text-white dark:hover:bg-sky-600 dark:hover:text-white border border-sky-300 dark:border-slate-700 hover:border-sky-600 rounded-lg shadow-2xs transition-all duration-150 cursor-pointer whitespace-nowrap shrink-0"
                            title="เพิ่ม/แก้ไขไฟล์สัญญา"
                          >
                            <FilePlus className="w-3.5 h-3.5 shrink-0" />
                            <span>เพิ่มไฟล์สัญญา</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => onPermissionDenied?.('อัพโหลดไฟล์สัญญา')}
                            className="inline-flex items-center justify-center gap-1.5 w-[114px] h-8 text-xs font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg cursor-not-allowed whitespace-nowrap shrink-0"
                            title="ไม่มีสิทธิ์อัพโหลดไฟล์สัญญา"
                          >
                            <Lock className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>เพิ่มไฟล์สัญญา</span>
                          </button>
                        )}

                        {/* 2. ตรวจสอบการนำเข้าข้อมูล */}
                        {onVerifyContract && (
                          canVerifyContract ? (
                            <button
                              onClick={() => onVerifyContract(item)}
                              className={`inline-flex items-center justify-center gap-1.5 w-[152px] h-8 text-xs font-semibold rounded-lg border shadow-xs transition-all duration-150 cursor-pointer whitespace-nowrap shrink-0 ${
                                isVerified
                                  ? 'text-white bg-emerald-600 hover:bg-emerald-700 border-emerald-600 font-bold'
                                  : 'text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 border-slate-300 dark:border-slate-700'
                              }`}
                              title={
                                isVerified
                                  ? 'ตรวจสอบการนำเข้าข้อมูล (ตรวจแล้ว - สีเขียว)'
                                  : 'ตรวจสอบการนำเข้าข้อมูล (ยังไม่ตรวจ - สีเทา)'
                              }
                            >
                              <FileCheck2
                                className={`w-3.5 h-3.5 shrink-0 ${
                                  isVerified ? 'text-white stroke-[2.5]' : 'text-slate-400 dark:text-slate-500'
                                }`}
                              />
                              <span>ตรวจสอบการนำเข้าข้อมูล</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => onPermissionDenied?.('ตรวจสอบการนำเข้าข้อมูล')}
                              className="inline-flex items-center justify-center gap-1.5 w-[152px] h-8 text-xs font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg cursor-not-allowed whitespace-nowrap shrink-0"
                              title="ไม่มีสิทธิ์ตรวจสอบการนำเข้าข้อมูล"
                            >
                              <Lock className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>ตรวจสอบการนำเข้าข้อมูล</span>
                            </button>
                          )
                        )}

                        {/* 3. ดูรายละเอียดสัญญาฉบับเต็ม */}
                        {hasContractFile ? (
                          canViewDetails ? (
                            <button
                              onClick={() => handleDetailsClick(item)}
                              className="w-8 h-8 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-sky-700 dark:hover:text-sky-300 hover:bg-sky-100 dark:hover:bg-slate-700 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors cursor-pointer shrink-0 shadow-2xs"
                              title="กดดูรายละเอียดสัญญาฉบับเต็ม"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleDetailsClick(item)}
                              className="w-8 h-8 flex items-center justify-center text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 border border-rose-200 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/30 rounded-lg transition-colors cursor-pointer shrink-0"
                              title="ล็อค: ไม่มีสิทธิ์กดเข้าไปดูรายละเอียดสัญญา"
                            >
                              <Lock className="w-3.5 h-3.5" />
                            </button>
                          )
                        ) : (
                          <button
                            disabled
                            className="w-8 h-8 flex items-center justify-center text-slate-300 dark:text-slate-600 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-lg cursor-not-allowed shrink-0"
                            title="ยังไม่มีไฟล์สัญญาแนบในระบบ"
                          >
                            <Eye className="w-3.5 h-3.5 opacity-30" />
                          </button>
                        )}

                        {/* 4. ปุ่ม ยืนยันการแก้ไข */}
                        {item.contractStatus === 'needs_revision' && onConfirmRevision && (
                          <button
                            type="button"
                            onClick={() => onConfirmRevision(item)}
                            className="inline-flex items-center justify-center gap-1.5 px-3 h-8 text-xs font-bold text-white bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 active:scale-95 rounded-lg shadow-xs transition-all duration-150 cursor-pointer whitespace-nowrap shrink-0"
                            title="กดยืนยันการแก้ไขข้อมูล เพื่อเด้งกลับไปสถานะรอตรวจสอบใหม่"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>ยืนยันการแก้ไข</span>
                          </button>
                        )}

                        {/* 5. สิทธิ์ลบข้อมูล */}
                        {canDeleteData && onDeleteConsumer && (
                          <button
                            onClick={() => {
                              if (window.confirm(`ยืนยันการลบข้อมูลสัญญาของผู้ใช้ไฟฟ้า CA: ${item.accountNumber}?`)) {
                                onDeleteConsumer(item);
                              }
                            }}
                            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 border border-slate-200 dark:border-slate-700 hover:border-rose-200 dark:hover:border-rose-800 rounded-lg transition-colors cursor-pointer shrink-0"
                            title="ลบข้อมูลสัญญา"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer info */}
      <div className="px-5 py-3 bg-slate-50/60 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
        <div className="flex items-center gap-2">
          <span>สิทธิ์เข้าถึง:</span>
          {canViewDetails ? (
            <span className="text-emerald-700 dark:text-emerald-300 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
              อนุญาตให้ดูรายละเอียดสัญญา
            </span>
          ) : (
            <span className="text-amber-800 dark:text-amber-300 font-semibold bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800 flex items-center gap-1">
              <Lock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
              จำกัดสิทธิ์: ดูได้เฉพาะภาพรวมและตาราง ไม่สามารถกดดูรายละเอียดสัญญา
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span>ระบบตรวจสอบความถูกต้องเอกสารอัตโนมัติ กฟภ.</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
        </div>
      </div>
    </div>
  );
};
