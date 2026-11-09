import React, { useState, useRef } from 'react';
import {
  X,
  Plus,
  Download,
  Trash2,
  FileText,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  FileCheck,
  Building2,
  Zap,
  Calendar,
  UserCheck,
  FilePlus,
  Shield,
  Layers,
  Paperclip,
  Check,
  RotateCcw
} from 'lucide-react';
import {
  ElectricityConsumer,
  ContractStatus,
  ContractDetails,
  AttachedFile,
  PEA_BRANCHES,
  PEABranch,
  VoltageLevel,
  SigningAuthority,
  SIGNING_AUTHORITIES,
  CONTRACT_TYPES,
  ContractType,
  ATTACHMENT_CATEGORIES
} from '../types/contract';
import { getStatusLabel, calculateSigningAuthority, getAuthorityRuleText, getAuthorityBadgeStyle } from '../utils/formatters';

interface ContractUploadModalProps {
  consumer: ElectricityConsumer | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveContract: (
    consumerId: string,
    contractDetails: ContractDetails,
    newStatus: ContractStatus,
    activityLog: string,
    attachedFilesCount?: number,
    verifiedFilesCount?: number,
    consumerUpdates?: Partial<ElectricityConsumer>
  ) => void;
}

export const ContractUploadModal: React.FC<ContractUploadModalProps> = ({
  consumer,
  isOpen,
  onClose,
  onSaveContract,
}) => {
  if (!isOpen || !consumer) return null;

  // Form Fields:
  // 1. กฟฟ.
  const [utility, setUtility] = useState<PEABranch>(
    (consumer.utility as PEABranch) || 'กฟจ.ชลบุรี'
  );
  const [utilityCode, setUtilityCode] = useState<string>(consumer.utilityCode || 'H01101');

  // 2. แรงดัน
  const [voltageLevel, setVoltageLevel] = useState<VoltageLevel>(
    (consumer.voltageLevel as VoltageLevel) || '22-33 kV'
  );

  // 3. ขนาดหม้อแปลง
  const [transformerSize, setTransformerSize] = useState<string>(
    consumer.transformerSize || '1,000 kVA'
  );

  // 4. หมายเลขผู้ใช้ไฟฟ้า
  const [accountNumber, setAccountNumber] = useState<string>(
    consumer.accountNumber || ''
  );

  // 5. ชื่อผู้ใช้ไฟฟ้า
  const [consumerName, setConsumerName] = useState<string>(
    consumer.consumerName || consumer.location.split(' ')[0] || ''
  );

  // 6. เลขที่สัญญา
  const [contractNumber, setContractNumber] = useState<string>(
    consumer.contractDetails?.contractNumber || `PPA-PEA-${consumer.utilityCode}/2026-${Math.floor(Math.random() * 800) + 100}`
  );

  // 7. วันที่ลงนาม
  const [contractDate, setContractDate] = useState<string>(
    consumer.contractDetails?.contractDate || new Date().toISOString().split('T')[0]
  );

  // คำนวณอำนาจลงนามแนะนำตามเกณฑ์
  const recommendedAuthority = calculateSigningAuthority(consumer.voltageLevel, consumer.transformerSize);

  // 8. อำนาจ
  const [signingAuthority, setSigningAuthority] = useState<SigningAuthority>(
    consumer.signingAuthority || consumer.contractDetails?.signingAuthority || recommendedAuthority
  );

  // Other contextual details
  const [location, setLocation] = useState<string>(consumer.location || '');
  const [contractType, setContractType] = useState<string>(() => {
    const existing = consumer.contractDetails?.contractType;
    if (existing && CONTRACT_TYPES.includes(existing as ContractType)) {
      return existing;
    }
    return 'สัญญาหลัก';
  });
  const [capacityKW, setCapacityKW] = useState<number>(
    consumer.contractDetails?.capacityKW || 1500
  );
  const [securityDeposit, setSecurityDeposit] = useState<number>(
    consumer.contractDetails?.securityDeposit || 1000000
  );

  // 9. เอกสารแนบ (Attachments)
  const [fileList, setFileList] = useState<AttachedFile[]>(() => {
    if (consumer.contractDetails?.files && consumer.contractDetails.files.length > 0) {
      return consumer.contractDetails.files;
    }
    if (consumer.contractDetails?.fileName) {
      return [
        {
          id: `f-${Date.now()}-1`,
          fileName: consumer.contractDetails.fileName,
          fileCategory: 'สัญญาซื้อขายไฟฟ้าฉบับจริง',
          fileSize: consumer.contractDetails.fileSize || '4.5 MB',
          pageCount: 16,
          uploadedAt: consumer.contractDetails.uploadedAt || new Date().toLocaleString('th-TH'),
          isVerified: consumer.contractStatus === 'completed',
          verifiedBy: consumer.contractDetails.reviewedBy,
          verifiedAt: consumer.contractDetails.reviewedAt,
        },
      ];
    }
    return [];
  });

  // Modal for Adding a new document
  const [isAddingDoc, setIsAddingDoc] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState<string>('สัญญาหลัก');
  const [newDocDescription, setNewDocDescription] = useState('');
  const [newDocFileName, setNewDocFileName] = useState('');
  const [newDocPageCount, setNewDocPageCount] = useState<number>(1);
  const [newDocSize, setNewDocSize] = useState<string>('3.5 MB');
  const [docError, setDocError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // คำนวณสถานะสัญญาอัตโนมัติ
  const computeStatus = (): ContractStatus => {
    if (fileList.length === 0) return 'pending_upload';
    if (consumer.contractStatus === 'needs_revision') {
      return 'pending_review';
    }
    const allVerified = fileList.length > 0 && fileList.every((f) => f.isVerified);
    if (allVerified) return 'completed';
    const someVerified = fileList.some((f) => f.isVerified);
    if (someVerified) return 'pending_review';
    return 'uploaded';
  };

  const autoStatus = computeStatus();

  // When utility changes, auto-update utilityCode
  const handleUtilityChange = (branchName: PEABranch) => {
    setUtility(branchName);
    const branch = PEA_BRANCHES.find((b) => b.name === branchName);
    if (branch) {
      setUtilityCode(branch.code);
      if (contractNumber.startsWith('PPA-PEA-')) {
        setContractNumber(`PPA-PEA-${branch.code}/${contractNumber.split('/')[1] || '0120'}`);
      }
    }
  };

  // Open add document dialog
  const handleOpenAddDoc = () => {
    setNewDocTitle('สัญญาหลัก');
    setNewDocDescription('');
    setNewDocFileName('');
    setNewDocPageCount(1);
    setNewDocSize('2.5 MB');
    setDocError('');
    setIsAddingDoc(true);
  };

  // Stepper handlers
  const handleIncrementPage = () => {
    setNewDocPageCount((prev) => prev + 1);
  };

  const handleDecrementPage = () => {
    setNewDocPageCount((prev) => (prev > 1 ? prev - 1 : 1));
  };

  // File input change
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewDocFileName(file.name);
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setNewDocSize(`${sizeMB} MB`);
    }
  };

  // Add new file to table
  const handleAddFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (newDocTitle === 'สัญญาแนบท้าย' && !newDocDescription.trim()) {
      setDocError('กรณีเลือก "สัญญาแนบท้าย" ต้องระบุรายละเอียดว่าสัญญาแนบท้ายอะไร');
      return;
    }
    setDocError('');

    const finalFileName =
      newDocFileName.trim() || `${newDocTitle.replace(/\s+/g, '_')}_${utilityCode}.pdf`;

    const newFile: AttachedFile = {
      id: `f-${Date.now()}`,
      fileName: finalFileName,
      fileCategory: newDocTitle,
      fileDetails: newDocDescription.trim() || undefined,
      fileSize: newDocSize,
      pageCount: newDocPageCount,
      uploadedAt: new Date().toLocaleString('th-TH'),
      isVerified: false,
    };

    setFileList((prev) => [...prev, newFile]);
    setIsAddingDoc(false);
    setNewDocFileName('');
    setNewDocDescription('');
    setDocError('');
  };

  // Remove file
  const handleRemoveFile = (id: string) => {
    setFileList((prev) => prev.filter((f) => f.id !== id));
  };

  // Toggle file verified status
  const handleToggleVerify = (id: string) => {
    setFileList((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          const next = !f.isVerified;
          return {
            ...f,
            isVerified: next,
            verifiedBy: next ? `เจ้าหน้าที่ ${utility}` : undefined,
            verifiedAt: next ? new Date().toLocaleString('th-TH') : undefined,
          };
        }
        return f;
      })
    );
  };

  // Mock download file
  const handleDownloadFile = (fileName: string) => {
    const dummyContent = `PEA CONTRACT DOCUMENT: ${fileName}\nUtility: ${utility} (${utilityCode})\nCA: ${accountNumber}\nSignatory Authority: ${signingAuthority}`;
    const blob = new Blob([dummyContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Save all changes
  const handleSave = () => {
    const attachedCount = fileList.length;
    const verifiedCount = fileList.filter((f) => f.isVerified).length;
    const finalStatus = computeStatus();

    const updatedDetails: ContractDetails = {
      contractNumber: contractNumber.trim() || `PPA-PEA-${utilityCode}/0101`,
      contractType,
      contractDate,
      effectiveDate: consumer.contractDetails?.effectiveDate || contractDate,
      expireDate: consumer.contractDetails?.expireDate || '2031-12-31',
      capacityKW,
      securityDeposit,
      signingAuthority,
      fileName: fileList.length > 0 ? fileList[0].fileName : undefined,
      fileSize: fileList.length > 0 ? fileList[0].fileSize : undefined,
      uploadedAt: fileList.length > 0 ? fileList[0].uploadedAt : undefined,
      reviewedBy: consumer.contractDetails?.reviewedBy,
      reviewedAt: consumer.contractDetails?.reviewedAt,
      reviewNotes: consumer.contractDetails?.reviewNotes,
      files: fileList,
    };

    const consumerUpdates: Partial<ElectricityConsumer> = {
      utility,
      utilityCode,
      voltageLevel,
      transformerSize,
      accountNumber: accountNumber.trim(),
      consumerName: consumerName.trim(),
      signingAuthority,
      location: location.trim(),
    };

    const logMsg = `บันทึกข้อมูลสัญญาเลขที่ ${contractNumber} (${consumerName}) แนบ ${attachedCount} ไฟล์, ตรวจแล้ว ${verifiedCount} ไฟล์`;

    onSaveContract(
      consumer.id,
      updatedDetails,
      finalStatus,
      logMsg,
      attachedCount,
      verifiedCount,
      consumerUpdates
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl max-w-4xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        {/* 1. Modal Top Purple Header Bar */}
        <div className="bg-[#702d8a] text-white px-5 py-3.5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5">
            <Layers className="w-5 h-5 text-purple-200" />
            <h3 className="text-base sm:text-lg font-bold tracking-tight">
              บันทึกรายละเอียดสัญญาซื้อขายไฟฟ้า (กฟภ.)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-purple-200 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors cursor-pointer"
            title="ปิดหน้าต่าง"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 bg-slate-50/50 dark:bg-slate-950/50">
          {/* แถบเตือนกรณีสถานะรอแก้ไขข้อมูล */}
          {consumer.contractStatus === 'needs_revision' && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-900 text-rose-900 dark:text-rose-200 space-y-2 shadow-xs animate-in fade-in">
              <div className="flex items-center gap-2 font-bold text-xs text-rose-800 dark:text-rose-300">
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                <span>สัญญานี้อยู่ในสถานะ "รอแก้ไขข้อมูล" (นำเข้าข้อมูลไม่ถูกต้อง)</span>
              </div>
              {consumer.contractDetails?.reviewNotes && (
                <div className="text-xs text-rose-700 dark:text-rose-300 bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-lg border border-rose-200 dark:border-rose-800 font-medium">
                  <strong>บันทึกความเห็นภาพรวม:</strong> {consumer.contractDetails.reviewNotes}
                </div>
              )}

              {fileList.filter((f) => f.needsRevision || f.revisionNote).length > 0 && (
                <div className="bg-white/95 dark:bg-slate-900/95 p-3 rounded-lg border border-rose-200 dark:border-rose-800 space-y-2">
                  <div className="text-xs font-bold text-rose-900 dark:text-rose-200 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                    <span>รายการไฟล์แนบที่ผู้ตรวจระบุจุดที่ต้องแก้ไข ({fileList.filter((f) => f.needsRevision || f.revisionNote).length} ไฟล์):</span>
                  </div>
                  <div className="space-y-1.5 pl-1">
                    {fileList
                      .filter((f) => f.needsRevision || f.revisionNote)
                      .map((rf) => (
                        <div key={rf.id} className="text-xs bg-rose-50/70 dark:bg-rose-950/50 p-2 rounded-lg border border-rose-200 dark:border-rose-800">
                          <div className="font-bold text-rose-950 dark:text-rose-200 flex items-center gap-1.5 flex-wrap">
                            <span>📄 {rf.fileName}</span>
                            <span className="text-[10px] bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-200 px-1.5 py-0.2 rounded font-medium">({rf.fileCategory})</span>
                          </div>
                          <div className="text-xs text-rose-700 dark:text-rose-300 mt-1 pl-2 border-l-2 border-rose-400">
                            <strong className="text-rose-900 dark:text-rose-200">หมายเหตุจุดที่ต้องแก้ไข: </strong>
                            <span>{rf.revisionNote || 'ข้อมูลไม่ถูกต้อง กรุณาแก้ไข'}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              <p className="text-[11px] text-rose-600 dark:text-rose-400 pt-0.5">
                เมื่อท่านแก้ไขข้อมูลรายละเอียดสัญญาและเอกสารแนบเรียบร้อยแล้ว ให้กดปุ่ม <strong>"ยืนยันการแก้ไข (ส่งไปรอตรวจสอบ)"</strong> ด้านล่าง ระบบจะเปลี่ยนสถานะเป็น "รอตรวจสอบไฟล์สัญญา" ทันที
              </p>
            </div>
          )}

          {/* ส่วนที่ 1: รายละเอียดสัญญา */}
          <div className="space-y-4 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#702d8a] dark:text-purple-400" />
                  <span>ส่วนที่ 1: ข้อมูลผู้ใช้ไฟฟ้าและข้อกำหนดสัญญา กฟภ.</span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  กรอกหรือแก้ไขข้อมูลการจำหน่ายไฟฟ้า พิกัดหม้อแปลง แรงดัน และอำนาจลงนาม
                </p>
              </div>
              <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950/60 text-[#702d8a] dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                CA: {accountNumber}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 1. กฟฟ. */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  กฟฟ. (การไฟฟ้า) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={utility}
                  onChange={(e) => handleUtilityChange(e.target.value as PEABranch)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-400 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none"
                >
                  {PEA_BRANCHES.map((b) => (
                    <option key={b.code} value={b.name} className="dark:bg-slate-900">
                      {b.name} ({b.code})
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 block">
                  รหัสการไฟฟ้า: <span className="font-mono font-semibold text-purple-700 dark:text-purple-400">{utilityCode}</span>
                </span>
              </div>

              {/* 2. แรงดัน */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  แรงดัน (Voltage Level) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={voltageLevel}
                  onChange={(e) => setVoltageLevel(e.target.value as VoltageLevel)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-400 focus:bg-white dark:focus:bg-slate-900 outline-none font-mono font-medium text-slate-800 dark:text-slate-200"
                >
                  <option value="22-33 kV" className="dark:bg-slate-900">22-33 kV (แรงดัน 22-33 kV)</option>
                  <option value="115 kV" className="dark:bg-slate-900">115 kV (แรงดัน 115 kV)</option>
                </select>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 block">
                  พิกัดระบบจำหน่าย/สายส่งไฟฟ้า กฟภ.
                </span>
              </div>

              {/* 3. ขนาดหม้อแปลง */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  ขนาดหม้อแปลง (Transformer Size) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={transformerSize}
                  onChange={(e) => setTransformerSize(e.target.value)}
                  placeholder="เช่น 1,000 kVA, 2,500 kVA"
                  className="w-full px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-400 focus:bg-white dark:focus:bg-slate-900 outline-none"
                />
              </div>

              {/* 4. หมายเลขผู้ใช้ไฟฟ้า */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  หมายเลขผู้ใช้ไฟฟ้า (CA) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="เช่น 020014892120"
                  className="w-full px-3 py-2 text-sm font-mono font-bold text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-400 focus:bg-white dark:focus:bg-slate-900 outline-none"
                />
              </div>

              {/* 5. ชื่อผู้ใช้ไฟฟ้า */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  ชื่อผู้ใช้ไฟฟ้า (ชื่อสถานประกอบการ / บุคคล) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={consumerName}
                  onChange={(e) => setConsumerName(e.target.value)}
                  placeholder="เช่น บริษัท สยาม ออโตโมทีฟ พาร์ทส์ จำกัด"
                  className="w-full px-3 py-2 text-sm font-medium text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-400 focus:bg-white dark:focus:bg-slate-900 outline-none"
                />
              </div>

              {/* 6. เลขที่สัญญา */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  เลขที่สัญญา <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={contractNumber}
                  onChange={(e) => setContractNumber(e.target.value)}
                  placeholder="เช่น PPA-PEA-H01101/0114"
                  className="w-full px-3 py-2 text-sm font-mono font-semibold text-purple-900 dark:text-purple-300 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-400 focus:bg-white dark:focus:bg-slate-900 outline-none"
                />
              </div>

              {/* 7. วันที่ลงนาม */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  วันที่ลงนาม <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={contractDate}
                  onChange={(e) => setContractDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-400 focus:bg-white dark:focus:bg-slate-900 outline-none font-medium"
                />
              </div>

              {/* 8. อำนาจ */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    อำนาจ (ผู้มีอำนาจลงนาม กฟภ.) <span className="text-rose-500">*</span>
                  </label>
                  {signingAuthority === recommendedAuthority ? (
                    <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      ตรงตามเกณฑ์หม้อแปลง ({recommendedAuthority})
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setSigningAuthority(recommendedAuthority)}
                      className="text-[11px] text-purple-700 dark:text-purple-300 hover:text-purple-900 dark:hover:text-purple-200 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800 transition-colors font-medium flex items-center gap-1 cursor-pointer"
                      title="กดเพื่อใช้อำนาจตามเกณฑ์ขนาดหม้อแปลงและแรงดัน"
                    >
                      <Zap className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                      ใช้อำนาจตามเกณฑ์ ({recommendedAuthority})
                    </button>
                  )}
                </div>

                <select
                  value={signingAuthority}
                  onChange={(e) => setSigningAuthority(e.target.value as SigningAuthority)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 text-purple-900 dark:text-purple-200 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-400 focus:bg-white dark:focus:bg-slate-900 outline-none font-semibold"
                >
                  {SIGNING_AUTHORITIES.map((auth) => (
                    <option key={auth.value} value={auth.value} className="dark:bg-slate-900">
                      {auth.label} - {auth.desc}
                    </option>
                  ))}
                </select>

                <div className="p-2.5 rounded-lg bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                  <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    <span>เกณฑ์กำหนดอำนาจ: 22 kV ≤ 2,500 kVA (ผจก.) | 22 kV &gt; 2,500 kVA (อฝ.สบ.) | 115 kV (ผชก.)</span>
                  </div>
                  <div className="text-slate-500 dark:text-slate-400">
                    ข้อมูลผู้ใช้ไฟ: แรงดัน <strong>{consumer.voltageLevel}</strong> | หม้อแปลง <strong>{consumer.transformerSize}</strong> → เกณฑ์แนะนำ: <strong className="text-purple-800 dark:text-purple-300">{recommendedAuthority}</strong>
                  </div>
                </div>
              </div>

              {/* ประเภทสัญญา */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  ประเภทสัญญา <span className="text-rose-500">*</span>
                </label>
                <select
                  value={contractType}
                  onChange={(e) => setContractType(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-400 focus:bg-white dark:focus:bg-slate-900 outline-none font-medium text-slate-900 dark:text-slate-100"
                >
                  {CONTRACT_TYPES.map((type) => (
                    <option key={type} value={type} className="dark:bg-slate-900">
                      {type}
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 block">
                  ประเภทสัญญาซื้อขายไฟฟ้า กฟภ.
                </span>
              </div>

              {/* สถานะสัญญา */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                  <span>สถานะสัญญา</span>
                  <span className="text-[10px] font-medium text-purple-800 dark:text-purple-300 bg-purple-100 dark:bg-purple-950/80 px-1.5 py-0.5 rounded border border-purple-200 dark:border-purple-800">
                    ขึ้นอัตโนมัติ
                  </span>
                </label>
                <div className="w-full px-3 py-2 text-sm bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        autoStatus === 'completed'
                          ? 'bg-emerald-500'
                          : autoStatus === 'pending_review'
                          ? 'bg-amber-500'
                          : autoStatus === 'needs_revision'
                          ? 'bg-rose-500'
                          : autoStatus === 'uploaded'
                          ? 'bg-sky-500'
                          : 'bg-slate-400'
                      }`}
                    />
                    <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                      {getStatusLabel(autoStatus)}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    {fileList.length === 0
                      ? 'ยังไม่แนบไฟล์'
                      : `แนบ ${fileList.length} ไฟล์ (${fileList.filter((f) => f.isVerified).length} ตรวจแล้ว)`}
                  </span>
                </div>
              </div>

              {/* สถานที่ใช้ไฟฟ้า */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  สถานที่ใช้ไฟฟ้า (ที่อยู่ติดตั้ง)
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="เช่น นิคมอุตสาหกรรมมาบตาพุด อ.เมือง จ.ระยอง"
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-400 focus:bg-white dark:focus:bg-slate-900 outline-none"
                />
              </div>
            </div>
          </div>

          {/* ส่วนที่ 2: เอกสารแนบ */}
          <div className="space-y-3 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            <div className="bg-[#702d8a] px-4 py-3 rounded-lg flex items-center justify-between text-white shadow-xs">
              <div className="flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-purple-200" />
                <span className="text-sm font-bold tracking-tight">
                  ส่วนที่ 2: เอกสารประกอบสัญญา (เอกสารแนบ {fileList.length} ไฟล์)
                </span>
              </div>
              <button
                type="button"
                onClick={handleOpenAddDoc}
                className="bg-[#22c55e] hover:bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-md shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>+ เพิ่มเอกสาร</span>
              </button>
            </div>

            {/* Data Table */}
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 font-semibold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">หัวข้อเอกสาร</th>
                    <th className="py-2.5 px-4 font-semibold">ชื่อไฟล์</th>
                    <th className="py-2.5 px-3 font-semibold text-center whitespace-nowrap">ขนาด (MB)</th>
                    <th className="py-2.5 px-3 font-semibold text-center whitespace-nowrap">จำนวนหน้า</th>
                    <th className="py-2.5 px-3 font-semibold text-center whitespace-nowrap">Download</th>
                    <th className="py-2.5 px-3 font-semibold text-center whitespace-nowrap">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {fileList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 dark:text-slate-500 font-medium">
                        ยังไม่มีเอกสารแนบ คลิกปุ่ม "+ เพิ่มเอกสาร" ด้านบนเพื่อแนบไฟล์สัญญา
                      </td>
                    </tr>
                  ) : (
                    fileList.map((file) => (
                      <tr key={file.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors">
                        <td className="py-2.5 px-4 font-medium text-slate-800 dark:text-slate-200">
                          <div className="flex items-start gap-2">
                            <FileText className="w-4 h-4 text-purple-700 dark:text-purple-400 shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-semibold text-slate-900 dark:text-white">{file.fileCategory}</span>
                                {file.fileCategory === 'สัญญาแนบท้าย' && (
                                  <span className="text-[10px] bg-purple-100 dark:bg-purple-950/80 text-[#702d8a] dark:text-purple-300 px-1.5 py-0.5 rounded font-bold border border-purple-200 dark:border-purple-800">
                                    แนบท้าย
                                  </span>
                                )}
                                {(file.needsRevision || file.revisionNote) && (
                                  <span className="text-[10px] bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 animate-pulse">
                                    <AlertTriangle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                                    ต้องแก้ไข
                                  </span>
                                )}
                                {file.isVerified && (
                                  <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 px-1.5 py-0.5 rounded-full font-semibold flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                    ตรวจแล้ว
                                  </span>
                                )}
                              </div>
                              {file.fileDetails && (
                                <span className="text-[11px] text-purple-900 dark:text-purple-300 block font-medium mt-0.5">
                                  {file.fileDetails}
                                </span>
                              )}

                              {(file.needsRevision || file.revisionNote) && (
                                <div className="mt-2 p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-900 dark:text-rose-200 space-y-1 shadow-2xs">
                                  <div className="font-bold text-rose-900 dark:text-rose-300 flex items-center gap-1.5">
                                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                                    <span>หมายเหตุจุดที่ต้องแก้ไข:</span>
                                  </div>
                                  <p className="text-xs text-rose-800 dark:text-rose-300 pl-5 font-normal leading-relaxed">
                                    {file.revisionNote || 'ข้อมูลหรือเอกสารไม่ถูกต้อง กรุณาแก้ไขและแนบไฟล์ใหม่'}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400 font-mono text-[11px] truncate max-w-[200px]" title={file.fileName}>
                          {file.fileName}
                        </td>
                        <td className="py-2.5 px-3 text-center text-slate-600 dark:text-slate-400 font-mono">
                          {file.fileSize}
                        </td>
                        <td className="py-2.5 px-3 text-center text-slate-600 dark:text-slate-400 font-mono">
                          {file.pageCount || '-'}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleDownloadFile(file.fileName)}
                            className="inline-flex items-center justify-center p-1 text-sky-600 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-200 hover:bg-sky-50 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer"
                            title="ดาวน์โหลดไฟล์"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleToggleVerify(file.id)}
                              className={`p-1 rounded text-xs transition-colors cursor-pointer ${
                                file.isVerified
                                  ? 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-800'
                                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                              }`}
                              title={file.isVerified ? 'ตรวจแล้ว' : 'กดเพื่อยืนยันการตรวจสอบ'}
                            >
                              <CheckCircle2 className={`w-4 h-4 ${file.isVerified ? 'text-emerald-600 dark:text-emerald-400 fill-emerald-50 dark:fill-emerald-950' : ''}`} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveFile(file.id)}
                              className="p-1 text-rose-500 hover:text-rose-700 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer"
                              title="ลบไฟล์เอกสาร"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer info */}
            <div className="px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span>
                เอกสารแนบทั้งหมด {fileList.length} รายการ (ตรวจสอบแล้ว {fileList.filter((f) => f.isVerified).length} รายการ)
              </span>
              <span className="text-[10px] text-purple-700 dark:text-purple-300 font-semibold">
                * สามารถแนบได้ทั้ง สัญญาหลัก และ สัญญาแนบท้าย
              </span>
            </div>
          </div>
        </div>

        {/* 4. Modal Bottom Footer */}
        <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-5 py-3 flex items-center justify-between">
          <div className="text-xs text-slate-500 dark:text-slate-400 hidden sm:flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">{utility} ({utilityCode})</span>
            <span>·</span>
            <span>อำนาจลงนาม: <strong className="text-[#702d8a] dark:text-purple-300">{signingAuthority}</strong></span>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="bg-[#dc2626] hover:bg-rose-700 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
              <span>ปิด</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              className={`font-semibold text-xs px-5 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-sm hover:shadow text-white ${
                consumer.contractStatus === 'needs_revision'
                  ? 'bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700'
                  : 'bg-[#22c55e] hover:bg-green-600'
              }`}
            >
              {consumer.contractStatus === 'needs_revision' ? (
                <>
                  <RotateCcw className="w-4 h-4 stroke-[2.5]" />
                  <span>ยืนยันการแก้ไข (ส่งไปรอตรวจสอบใหม่)</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>บันทึกข้อมูล</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 5. POPUP MODAL: "บันทึกข้อมูล" */}
      {isAddingDoc && (
        <div className="fixed inset-0 z-70 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-300 dark:border-slate-700 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col">
            <div className="bg-[#702d8a] text-white px-5 py-3 flex items-center justify-between shadow-xs">
              <span className="text-base font-bold tracking-tight">
                บันทึกข้อมูล
              </span>
              <button
                type="button"
                onClick={() => setIsAddingDoc(false)}
                className="text-purple-200 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
                title="ปิด"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddFile} className="p-6 space-y-4 text-xs">
              {/* Field 1: หัวข้อเอกสาร */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="sm:w-28 text-slate-800 dark:text-slate-200 font-semibold sm:text-right shrink-0">
                  หัวข้อเอกสาร :
                </label>
                <div className="flex-1 relative">
                  <select
                    value={newDocTitle}
                    onChange={(e) => setNewDocTitle(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg outline-none focus:border-[#702d8a] focus:ring-1 focus:ring-[#702d8a] bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
                    required
                  >
                    {ATTACHMENT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat} className="dark:bg-slate-900">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Field 2: รายละเอียด */}
              <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                <label className="sm:w-28 text-slate-800 dark:text-slate-200 font-semibold sm:text-right shrink-0 sm:pt-2">
                  รายละเอียด :{' '}
                  {newDocTitle === 'สัญญาแนบท้าย' && (
                    <span className="text-rose-500 font-bold">*</span>
                  )}
                </label>
                <div className="flex-1 space-y-1">
                  <textarea
                    rows={3}
                    value={newDocDescription}
                    onChange={(e) => {
                      setNewDocDescription(e.target.value);
                      if (docError) setDocError('');
                    }}
                    placeholder={
                      newDocTitle === 'สัญญาแนบท้าย'
                        ? 'บังคับระบุ: สัญญาแนบท้ายเรื่องใด (เช่น สัญญาแนบท้ายเพิ่มขนาดหม้อแปลง, ลดขนาดหม้อแปลง, สำรองฉุกเฉิน ฯลฯ)...'
                        : 'ระบุรายละเอียดเพิ่มเติมเกี่ยวกับเอกสาร...'
                    }
                    className={`w-full px-3 py-2 text-sm border rounded-lg outline-none focus:ring-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 resize-none ${
                      docError && newDocTitle === 'สัญญาแนบท้าย' && !newDocDescription.trim()
                        ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500 bg-rose-50/20'
                        : 'border-slate-300 dark:border-slate-700 focus:border-[#702d8a] focus:ring-[#702d8a]'
                    }`}
                    required={newDocTitle === 'สัญญาแนบท้าย'}
                  />
                  {newDocTitle === 'สัญญาแนบท้าย' && (
                    <p className="text-[11px] text-purple-700 dark:text-purple-300 font-medium">
                      * บังคับระบุรายละเอียด ว่าเป็นสัญญาแนบท้ายเรื่องใด
                    </p>
                  )}
                  {docError && (
                    <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{docError}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Field 3: จำนวนหน้า & ไฟล์เอกสาร */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 pt-1">
                <div className="flex items-center gap-2 sm:ml-[7.5rem]">
                  <label className="text-slate-800 dark:text-slate-200 font-semibold whitespace-nowrap">
                    จำนวนหน้า :
                  </label>
                  <div className="inline-flex items-center">
                    <button
                      type="button"
                      onClick={handleDecrementPage}
                      className="w-8 h-8 bg-[#702d8a] hover:bg-[#5a1e70] text-white rounded-l flex items-center justify-center font-bold text-base transition-colors cursor-pointer"
                      title="ลดจำนวนหน้า"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={999}
                      value={newDocPageCount}
                      onChange={(e) => setNewDocPageCount(Math.max(1, Number(e.target.value)))}
                      className="w-14 h-8 border-y border-slate-300 dark:border-slate-700 text-center font-mono text-sm font-semibold outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    />
                    <button
                      type="button"
                      onClick={handleIncrementPage}
                      className="w-8 h-8 bg-[#702d8a] hover:bg-[#5a1e70] text-white rounded-r flex items-center justify-center font-bold text-base transition-colors cursor-pointer"
                      title="เพิ่มจำนวนหน้า"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-slate-800 dark:text-slate-200 font-semibold whitespace-nowrap">
                    ไฟล์เอกสาร :
                  </label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.jpg,.png"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-1.5 bg-[#702d8a] hover:bg-[#5a1e70] text-white rounded font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>แนบไฟล์</span>
                  </button>
                  {newDocFileName ? (
                    <span className="font-mono text-[11px] text-purple-900 dark:text-purple-200 bg-purple-50 dark:bg-purple-950/80 px-2 py-1 rounded border border-purple-200 dark:border-purple-800 truncate max-w-[180px]" title={newDocFileName}>
                      {newDocFileName}
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 italic">
                      (เลือกไฟล์จากเครื่อง)
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom Footer Buttons */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="submit"
                  className="bg-[#702d8a] hover:bg-[#5a1e70] text-white font-semibold text-xs px-4 py-2 rounded transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>บันทึก</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsAddingDoc(false)}
                  className="bg-[#dc2626] hover:bg-rose-700 text-white font-semibold text-xs px-4 py-2 rounded transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <X className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>ปิด</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
