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
} from 'lucide-react';
import { ElectricityConsumer } from '../types/contract';
import { getStatusLabel, getStatusStyle } from '../utils/formatters';

interface ConsumerTableProps {
  consumers: ElectricityConsumer[];
  onOpenUploadModal: (consumer: ElectricityConsumer) => void;
  onOpenAddModal: () => void;
  onViewContract: (consumer: ElectricityConsumer) => void;
  onVerifyContract?: (consumer: ElectricityConsumer) => void;
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
  onVerifyContract,
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
          {canEditData ? (
            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-700 hover:to-cyan-700 rounded-xl shadow-xs shadow-sky-300 transition-all duration-150 transform hover:-translate-y-0.5 cursor-pointer whitespace-nowrap"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ เพิ่มข้อมูลผู้ใช้ไฟฟ้า</span>
            </button>
          ) : (
            <button
              onClick={() => onPermissionDenied?.('เพิ่มข้อมูลผู้ใช้ไฟฟ้า')}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-400 bg-slate-100 border border-slate-200 rounded-xl cursor-not-allowed whitespace-nowrap"
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
        <div className="px-5 py-2.5 bg-amber-50/90 border-b border-amber-200 text-xs text-amber-900 flex items-center gap-2">
          <Lock className="w-4 h-4 text-amber-600 shrink-0" />
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
              <th scope="col" className="py-3 px-3 text-xs font-semibold whitespace-nowrap text-center">
                อำนาจลงนาม
              </th>
              <th scope="col" className="py-3 px-3 text-xs font-semibold whitespace-nowrap text-center">
                ความคืบหน้าเอกสาร
              </th>
              <th scope="col" className="py-3 px-3 text-xs font-semibold whitespace-nowrap text-center">
                สถานะสัญญา
              </th>
              <th scope="col" className="py-3 px-4 text-xs font-semibold text-center whitespace-nowrap bg-sky-50/50">
                การจัดการสัญญา
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {consumers.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <FileText className="w-8 h-8 text-slate-300 stroke-1" />
                    <p className="text-sm font-medium">ไม่พบข้อมูลสัญญาตามเงื่อนไขที่เลือก</p>
                    <p className="text-xs text-slate-400">ลองปรับเปลี่ยนตัวกรอง หรือค้นหาด้วยคำอื่น</p>
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
                    className="hover:bg-sky-50/30 transition-colors duration-100 group"
                  >
                    {/* การไฟฟ้า */}
                    <td className="py-3.5 px-3 sm:px-4 font-medium text-slate-900 whitespace-nowrap align-middle">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                        <span className="font-semibold text-sky-950">{item.utility}</span>
                      </div>
                    </td>

                    {/* รหัสการไฟฟ้า */}
                    <td className="py-3.5 px-3 font-mono text-slate-600 whitespace-nowrap align-middle">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs">
                        {item.utilityCode}
                      </span>
                    </td>

                    {/* หมายเลขผู้ใช้ไฟฟ้า (CA) */}
                    <td className="py-3.5 px-3 whitespace-nowrap align-middle">
                      <div className="flex items-center gap-1.5 font-mono font-bold text-sky-800">
                        <span>{item.accountNumber}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(item.accountNumber, item.id)}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-sky-600 transition-opacity p-0.5 rounded cursor-pointer"
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

                    {/* การติดตั้ง */}
                    <td className="py-3.5 px-3 font-mono text-slate-600 whitespace-nowrap align-middle">
                      {item.installationNumber}
                    </td>

                    {/* สถานที่ใช้ไฟฟ้า */}
                    <td className="py-3.5 px-4 text-slate-700 align-middle">
                      <div className="flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <div>
                          {item.consumerName && (
                            <div className="font-semibold text-slate-900 text-xs">
                              {item.consumerName}
                            </div>
                          )}
                          <span
                            className="text-xs text-slate-600 line-clamp-2"
                            title={item.location}
                          >
                            {item.location}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* ขนาดหม้อแปลง */}
                    <td className="py-3.5 px-3 font-mono font-medium text-slate-800 text-right whitespace-nowrap align-middle">
                      <span className="bg-sky-50 text-sky-900 px-2 py-0.5 rounded border border-sky-100">
                        {item.transformerSize}
                      </span>
                    </td>

                    {/* แรงดัน */}
                    <td className="py-3.5 px-3 text-center whitespace-nowrap align-middle">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-medium font-mono ${
                          item.voltageLevel === '115 kV'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {item.voltageLevel}
                      </span>
                    </td>

                    {/* อำนาจลงนาม */}
                    <td className="py-3.5 px-3 text-center whitespace-nowrap align-middle">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                        <UserCheck className="w-3 h-3 text-amber-600" />
                        <span>{item.authorizedSignatory}</span>
                      </span>
                    </td>

                    {/* ความคืบหน้าเอกสาร */}
                    <td className="py-3.5 px-3 text-center whitespace-nowrap align-middle">
                      {item.attachedFilesCount > 0 ? (
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-mono font-semibold ${
                            item.verifiedFilesCount === item.attachedFilesCount
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
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

                    {/* การจัดการสัญญา: เพิ่มไฟล์ / ตรวจสอบ / ดูรายละเอียด */}
                    <td className="py-3.5 px-4 whitespace-nowrap align-middle text-center bg-sky-50/20">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* 1. ปุ่ม เพิ่มไฟล์สัญญา (ตามสิทธิ์ canUploadFiles) */}
                        {canUploadFiles ? (
                          <button
                            onClick={() => onOpenUploadModal(item)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-600 hover:text-white border border-sky-300 rounded-lg shadow-2xs transition-all duration-150 cursor-pointer whitespace-nowrap"
                            title="เพิ่มไฟล์สัญญา"
                          >
                            <FilePlus className="w-3.5 h-3.5" />
                            <span>เพิ่มไฟล์สัญญา</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => onPermissionDenied?.('อัพโหลดไฟล์สัญญา')}
                            className="inline-flex items-center gap-1 px-2 py-1.5 text-xs text-slate-400 bg-slate-100 border border-slate-200 rounded-lg cursor-not-allowed whitespace-nowrap"
                            title="ไม่มีสิทธิ์อัพโหลดไฟล์สัญญา"
                          >
                            <Lock className="w-3 h-3 text-slate-400" />
                            <span>เพิ่มไฟล์</span>
                          </button>
                        )}

                        {/* 2. ตรวจสอบสัญญา (ถ้ายังไม่ตรวจเป็นสีเทา ถ้าตรวจแล้วเป็นสีเขียว) */}
                        {onVerifyContract && (
                          canVerifyContract ? (
                            <button
                              onClick={() => onVerifyContract(item)}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border shadow-xs transition-all duration-150 cursor-pointer whitespace-nowrap ${
                                isVerified
                                  ? 'text-white bg-emerald-600 hover:bg-emerald-700 border-emerald-600 font-bold'
                                  : 'text-slate-700 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 border-slate-300'
                              }`}
                              title={
                                isVerified
                                  ? 'ตรวจสอบสัญญา (ตรวจแล้ว - สีเขียว)'
                                  : 'ตรวจสอบสัญญา (ยังไม่ตรวจ - สีเทา)'
                              }
                            >
                              <FileCheck2
                                className={`w-3.5 h-3.5 ${
                                  isVerified ? 'text-white stroke-[2.5]' : 'text-slate-400'
                                }`}
                              />
                              <span>ตรวจสอบสัญญา</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => onPermissionDenied?.('ตรวจสอบสัญญา')}
                              className="inline-flex items-center gap-1 px-2 py-1.5 text-xs text-slate-400 bg-slate-100 border border-slate-200 rounded-lg cursor-not-allowed whitespace-nowrap"
                              title="ไม่มีสิทธิ์ตรวจสอบสัญญา"
                            >
                              <Lock className="w-3 h-3 text-slate-400" />
                              <span>ตรวจสอบ</span>
                            </button>
                          )
                        )}

                        {/* 3. ดูรายละเอียดสัญญาฉบับเต็ม: ไฮไลท์สำคัญตามคำสั่ง
                            "หรือใครแค่เข้ามาดูหน้า Dashboard และทะเบียนสัญญาได้ แต่กดเข้าไปดูรายละเอียดไม่ได้" */}
                        {hasContractFile && (
                          canViewDetails ? (
                            <button
                              onClick={() => handleDetailsClick(item)}
                              className="p-1.5 text-slate-500 hover:text-sky-700 hover:bg-sky-100 rounded-lg transition-colors cursor-pointer"
                              title="กดดูรายละเอียดสัญญาฉบับเต็ม"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleDetailsClick(item)}
                              className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer border border-rose-200 bg-rose-50/50"
                              title="ล็อค: ไม่มีสิทธิ์กดเข้าไปดูรายละเอียดสัญญา"
                            >
                              <Lock className="w-3.5 h-3.5" />
                            </button>
                          )
                        )}

                        {/* 4. สิทธิ์ลบข้อมูล (Delete action) */}
                        {canDeleteData && onDeleteConsumer && (
                          <button
                            onClick={() => {
                              if (window.confirm(`ยืนยันการลบข้อมูลสัญญาของผู้ใช้ไฟฟ้า CA: ${item.accountNumber}?`)) {
                                onDeleteConsumer(item);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
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
      <div className="px-5 py-3 bg-slate-50/60 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
        <div className="flex items-center gap-2">
          <span>สิทธิ์เข้าถึง:</span>
          {canViewDetails ? (
            <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              อนุญาตให้ดูรายละเอียดสัญญา
            </span>
          ) : (
            <span className="text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
              <Lock className="w-3 h-3 text-amber-600" />
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
