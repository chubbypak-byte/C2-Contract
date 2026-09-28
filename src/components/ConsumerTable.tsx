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
  Clock
} from 'lucide-react';
import { ElectricityConsumer } from '../types/contract';
import { getStatusLabel, getStatusStyle } from '../utils/formatters';

interface ConsumerTableProps {
  consumers: ElectricityConsumer[];
  onOpenUploadModal: (consumer: ElectricityConsumer) => void;
  onOpenAddModal: () => void;
  onViewContract: (consumer: ElectricityConsumer) => void;
  onVerifyContract?: (consumer: ElectricityConsumer) => void;
}

export const ConsumerTable: React.FC<ConsumerTableProps> = ({
  consumers,
  onOpenUploadModal,
  onOpenAddModal,
  onViewContract,
  onVerifyContract,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <div className="bg-white rounded-2xl border border-sky-100 shadow-xs overflow-hidden">
      {/* Top Header of Table: Title & The Required "เพิ่มข้อมูล" button on top right */}
      <div className="px-5 py-4 border-b border-sky-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-sky-50/40 via-white to-sky-50/20">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>ตารางข้อมูลผู้ใช้ไฟฟ้าและสถานะสัญญา</span>
            <span className="text-xs font-normal text-slate-500 font-mono tabular-nums">
              ({consumers.length} รายการ)
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            จัดการข้อมูลผู้ใช้ไฟฟ้า รายละเอียดหม้อแปลง แรงดัน และแนบไฟล์สัญญาซื้อขายไฟฟ้า
          </p>
        </div>

        {/* REQUIRED: ปุ่มเพิ่มข้อมูลไว้ด้านขวาบนของตาราง */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-700 hover:to-cyan-700 rounded-xl shadow-xs shadow-sky-300 transition-all duration-150 transform hover:-translate-y-0.5 cursor-pointer whitespace-nowrap"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ เพิ่มข้อมูลผู้ใช้ไฟฟ้า</span>
          </button>
        </div>
      </div>

      {/* Table responsive container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm border-collapse">
          <thead>
            <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-medium tracking-tight">
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
                การติดตั้ง
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
              <th scope="col" className="py-3 px-3 text-xs font-semibold min-w-[170px]">
                อำนาจลงนาม
              </th>
              {/* NEW: คอลัมน์ ไฟล์แนบกี่ไฟล์ & ตรวจแล้วกี่ไฟล์ */}
              <th scope="col" className="py-3 px-3 text-xs font-semibold whitespace-nowrap text-center">
                ไฟล์แนบ
              </th>
              <th scope="col" className="py-3 px-3 text-xs font-semibold whitespace-nowrap text-center">
                ตรวจแล้ว
              </th>
              <th scope="col" className="py-3 px-3 text-xs font-semibold whitespace-nowrap text-center">
                สถานะสัญญา
              </th>
              {/* REQUIRED: ปุ่ม เพิ่มไฟล์สัญญาอยู่ข้างๆในแต่ละบรรทัด */}
              <th scope="col" className="py-3 px-4 text-xs font-semibold text-center whitespace-nowrap bg-sky-50/30">
                เพิ่มไฟล์สัญญา
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {consumers.length === 0 ? (
              <tr>
                <td colSpan={12} className="py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <FileText className="w-10 h-10 text-slate-300" />
                    <p className="text-sm font-medium text-slate-700">ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหา</p>
                    <p className="text-xs text-slate-400">ลองปรับคำค้นหา หรือรีเซ็ตตัวกรองเพื่อดูข้อมูลทั้งหมด</p>
                    <button
                      onClick={onOpenAddModal}
                      className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg border border-sky-200"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>เพิ่มข้อมูลผู้ใช้ไฟฟ้ารายใหม่</span>
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              consumers.map((item) => {
                const statusStyle = getStatusStyle(item.contractStatus);
                const hasContractFile = Boolean(item.contractDetails?.fileName);

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-sky-50/30 transition-colors duration-100 group"
                  >
                    {/* 1. การไฟฟ้า */}
                    <td className="py-3.5 px-3 sm:px-4 whitespace-nowrap align-middle">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold tracking-wide bg-purple-50 text-purple-700 border border-purple-200">
                          {item.utility}
                        </span>
                      </div>
                    </td>

                    {/* 2. รหัสการไฟฟ้า */}
                    <td className="py-3.5 px-3 whitespace-nowrap align-middle">
                      <span className="font-mono text-xs font-bold text-sky-900 bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
                        {item.utilityCode}
                      </span>
                    </td>

                    {/* 3. หมายเลขผู้ใช้ไฟฟ้า */}
                    <td className="py-3.5 px-3 whitespace-nowrap align-middle">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono tabular-nums text-xs font-semibold text-slate-900 bg-slate-100/70 px-2 py-0.5 rounded">
                          {item.accountNumber}
                        </span>
                        <button
                          onClick={() => handleCopy(item.accountNumber, item.id)}
                          title="คัดลอกหมายเลขผู้ใช้ไฟฟ้า"
                          className="text-slate-400 hover:text-sky-600 p-1 rounded transition-colors cursor-pointer"
                        >
                          {copiedId === item.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* 4. การติดตั้ง */}
                    <td className="py-3.5 px-3 whitespace-nowrap align-middle font-mono text-xs text-slate-600">
                      {item.installationNumber}
                    </td>

                    {/* 5. สถานที่ใช้ไฟฟ้า */}
                    <td className="py-3.5 px-4 align-middle">
                      <div className="max-w-[280px]">
                        <p className="text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-purple-700 transition-colors">
                          {item.consumerName || item.location.split(' ')[0]}
                        </p>
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          {item.location}
                        </p>
                      </div>
                    </td>

                    {/* 6. ขนาดหม้อแปลง */}
                    <td className="py-3.5 px-3 whitespace-nowrap align-middle text-right">
                      <span className="font-mono tabular-nums text-xs font-semibold text-sky-950 bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
                        {item.transformerSize}
                      </span>
                    </td>

                    {/* 7. แรงดัน */}
                    <td className="py-3.5 px-3 whitespace-nowrap align-middle text-center">
                      <span className="inline-flex items-center gap-1 font-mono text-xs font-medium text-slate-700">
                        <Zap className="w-3 h-3 text-amber-500" />
                        {item.voltageLevel}
                      </span>
                    </td>

                    {/* 8. อำนาจลงนาม */}
                    <td className="py-3.5 px-3 align-middle">
                      <div className="max-w-[190px]">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          {item.signingAuthority && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-[#702d8a] border border-purple-200">
                              {item.signingAuthority}
                            </span>
                          )}
                          <p className="text-xs font-medium text-slate-800 truncate">
                            {item.authorizedSignatory}
                          </p>
                        </div>
                        {item.contactPhone && (
                          <p className="text-[11px] text-slate-400 font-mono">
                            โทร: {item.contactPhone}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* NEW: ไฟล์แนบกี่ไฟล์ */}
                    <td className="py-3.5 px-3 whitespace-nowrap align-middle text-center">
                      {item.attachedFilesCount > 0 ? (
                        <span className="inline-flex items-center gap-1.5 font-mono tabular-nums text-xs font-semibold text-slate-800 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200 shadow-2xs">
                          <Paperclip className="w-3.5 h-3.5 text-sky-600" />
                          <span>{item.attachedFilesCount} ไฟล์</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 font-mono text-xs">0 ไฟล์</span>
                      )}
                    </td>

                    {/* NEW: ตรวจแล้วกี่ไฟล์ */}
                    <td className="py-3.5 px-3 whitespace-nowrap align-middle text-center">
                      {item.attachedFilesCount > 0 ? (
                        <span
                          className={`inline-flex items-center gap-1.5 font-mono tabular-nums text-xs font-semibold px-2.5 py-1 rounded-lg border shadow-2xs ${
                            item.verifiedFilesCount === item.attachedFilesCount
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : item.verifiedFilesCount > 0
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-slate-50 text-slate-600 border-slate-200'
                          }`}
                        >
                          {item.verifiedFilesCount === item.attachedFilesCount ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                          )}
                          <span>
                            {item.verifiedFilesCount}/{item.attachedFilesCount} ไฟล์
                          </span>
                        </span>
                      ) : (
                        <span className="text-slate-400 font-mono text-xs">-</span>
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
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate max-w-[130px] mx-auto">
                          {item.contractDetails.contractNumber}
                        </div>
                      )}
                    </td>

                    {/* REQUIRED: ปุ่ม เพิ่มไฟล์สัญญา และ ตรวจสอบสัญญา ในแต่ละบรรทัด */}
                    <td className="py-3.5 px-4 whitespace-nowrap align-middle text-center bg-sky-50/20">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onOpenUploadModal(item)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-600 hover:text-white border border-sky-300 rounded-lg shadow-2xs transition-all duration-150 cursor-pointer whitespace-nowrap"
                          title="เพิ่มไฟล์สัญญา"
                        >
                          <FilePlus className="w-3.5 h-3.5" />
                          <span>เพิ่มไฟล์สัญญา</span>
                        </button>

                        {/* NEW: ตรวจสอบสัญญา */}
                        {onVerifyContract && (
                          <button
                            onClick={() => onVerifyContract(item)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-lg border shadow-2xs transition-all duration-150 cursor-pointer whitespace-nowrap ${
                              item.contractStatus === 'completed'
                                ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-600 hover:text-white border-emerald-300'
                                : item.contractStatus === 'pending_review'
                                ? 'text-purple-700 bg-purple-50 hover:bg-[#702d8a] hover:text-white border-purple-300 ring-1 ring-purple-300'
                                : 'text-slate-700 bg-white hover:bg-slate-100 border-slate-300'
                            }`}
                            title="เปิดหน้าตรวจสอบสัญญาซื้อขายไฟฟ้า (แบบแยกหน้าจอ ซ้าย-ขวา)"
                          >
                            <FileCheck2 className="w-3.5 h-3.5" />
                            <span>ตรวจสอบสัญญา</span>
                          </button>
                        )}

                        {/* ดูสัญญา */}
                        {hasContractFile && (
                          <button
                            onClick={() => onViewContract(item)}
                            className="p-1.5 text-slate-400 hover:text-sky-700 hover:bg-sky-100 rounded-lg transition-colors cursor-pointer"
                            title="ดูรายละเอียดสัญญาฉบับเต็ม"
                          >
                            <Eye className="w-3.5 h-3.5" />
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
      <div className="px-5 py-3 bg-slate-50/60 border-t border-slate-200 flex items-center justify-end text-xs text-slate-500 gap-2">
        <span>ระบบตรวจสอบความถูกต้องเอกสารอัตโนมัติ</span>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
      </div>
    </div>
  );
};
