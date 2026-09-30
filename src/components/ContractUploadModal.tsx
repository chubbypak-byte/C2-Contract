import React, { useState, useRef } from 'react';
import {
  X,
  Plus,
  Download,
  Trash2,
  FileText,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Building2,
  Zap,
  Calendar,
  UserCheck,
  FilePlus,
  Shield,
  Layers,
  Paperclip,
  Check
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
import { getStatusLabel } from '../utils/formatters';

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

  // Tabs: 'รายละเอียดสัญญา' | 'เอกสารแนบ'
  const [activeTab, setActiveTab] = useState<'details' | 'attachments'>('details');

  // Form Fields as explicitly requested:
  // 1. กฟฟ. (drop down เลือก การไฟฟ้า)
  const [utility, setUtility] = useState<PEABranch>(
    (consumer.utility as PEABranch) || 'กฟจ.ชลบุรี'
  );
  const [utilityCode, setUtilityCode] = useState<string>(consumer.utilityCode || 'H01101');

  // 2. แรงดัน (drop down เลือก 22-33 kV กับ 115 kV)
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

  // 8. อำนาจ (drop down เลือก ผจก. อฝ.สบ. ผชก.)
  const [signingAuthority, setSigningAuthority] = useState<SigningAuthority>(
    consumer.signingAuthority || consumer.contractDetails?.signingAuthority || 'ผจก.'
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

  // Modal for Adding a new document (Matching the user's second screenshot)
  const [isAddingDoc, setIsAddingDoc] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState<string>('สัญญาหลัก');
  const [newDocDescription, setNewDocDescription] = useState('');
  const [newDocFileName, setNewDocFileName] = useState('');
  const [newDocPageCount, setNewDocPageCount] = useState<number>(1);
  const [newDocSize, setNewDocSize] = useState<string>('3.5 MB');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // คำนวณสถานะสัญญาอัตโนมัติ (ไม่ให้เลือกตามคำสั่งผู้ใช้)
  const computeStatus = (): ContractStatus => {
    if (fileList.length === 0) return 'pending_upload';
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

    // Auto calculate status automatically based on attached and verified files
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        {/* 1. Modal Top Purple Header Bar (matching PLMS pea.co.th style) */}
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

        {/* 2. Top Tab Navigation (matching the screenshot PLMS tab bar) */}
        <div className="bg-white border-b border-slate-200 px-5 flex items-center gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`py-3 px-4 text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'details'
                ? 'border-[#702d8a] text-[#702d8a]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>รายละเอียดสัญญา</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('attachments')}
            className={`py-3 px-4 text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'attachments'
                ? 'border-[#702d8a] text-[#702d8a]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Paperclip className="w-4 h-4" />
            <span>เอกสารแนบ</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'attachments'
                  ? 'bg-purple-100 text-[#702d8a]'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {fileList.length}
            </span>
          </button>
        </div>

        {/* 3. Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 bg-slate-50/50">
          {activeTab === 'details' && (
            <div className="space-y-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="border-b border-slate-100 pb-3">
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#702d8a]" />
                  <span>ข้อมูลผู้ใช้ไฟฟ้าและข้อกำหนดสัญญา กฟภ.</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  กรอกหรือแก้ไขข้อมูลการจำหน่ายไฟฟ้า พิกัดหม้อแปลง แรงดัน และอำนาจลงนาม
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. กฟฟ. (drop down เลือก การไฟฟ้า) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    กฟฟ. (การไฟฟ้า) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={utility}
                    onChange={(e) => handleUtilityChange(e.target.value as PEABranch)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:bg-white outline-none"
                  >
                    {PEA_BRANCHES.map((b) => (
                      <option key={b.code} value={b.name}>
                        {b.name} ({b.code})
                      </option>
                    ))}
                  </select>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    รหัสการไฟฟ้า: <span className="font-mono font-semibold text-purple-700">{utilityCode}</span>
                  </span>
                </div>

                {/* 2. แรงดัน (drop down เลือก 22-33 kV กับ 115 kV) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    แรงดัน (Voltage Level) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={voltageLevel}
                    onChange={(e) => setVoltageLevel(e.target.value as VoltageLevel)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:bg-white outline-none font-mono font-medium text-slate-800"
                  >
                    <option value="22-33 kV">22-33 kV (แรงดัน 22-33 kV)</option>
                    <option value="115 kV">115 kV (แรงดัน 115 kV)</option>
                  </select>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    พิกัดระบบจำหน่าย/สายส่งไฟฟ้า กฟภ.
                  </span>
                </div>

                {/* 3. ขนาดหม้อแปลง */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ขนาดหม้อแปลง (Transformer Size) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={transformerSize}
                    onChange={(e) => setTransformerSize(e.target.value)}
                    placeholder="เช่น 1,000 kVA, 2,500 kVA"
                    className="w-full px-3 py-2 text-sm font-mono bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:bg-white outline-none"
                  />
                </div>

                {/* 4. หมายเลขผู้ใช้ไฟฟ้า */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    หมายเลขผู้ใช้ไฟฟ้า (CA) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="เช่น 020014892120"
                    className="w-full px-3 py-2 text-sm font-mono font-bold text-slate-900 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:bg-white outline-none"
                  />
                </div>

                {/* 5. ชื่อผู้ใช้ไฟฟ้า */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ชื่อผู้ใช้ไฟฟ้า (ชื่อสถานประกอบการ / บุคคล) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={consumerName}
                    onChange={(e) => setConsumerName(e.target.value)}
                    placeholder="เช่น บริษัท สยาม ออโตโมทีฟ พาร์ทส์ จำกัด"
                    className="w-full px-3 py-2 text-sm font-medium text-slate-900 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:bg-white outline-none"
                  />
                </div>

                {/* 6. เลขที่สัญญา */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    เลขที่สัญญา <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={contractNumber}
                    onChange={(e) => setContractNumber(e.target.value)}
                    placeholder="เช่น PPA-PEA-H01101/0114"
                    className="w-full px-3 py-2 text-sm font-mono font-semibold text-purple-900 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:bg-white outline-none"
                  />
                </div>

                {/* 7. วันที่ลงนาม */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    วันที่ลงนาม <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={contractDate}
                      onChange={(e) => setContractDate(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:bg-white outline-none font-medium"
                    />
                  </div>
                </div>

                {/* 8. อำนาจ (drop down เลือก ผจก. อฝ.สบ. ผชก.) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    อำนาจ (ผู้มีอำนาจลงนาม กฟภ.) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={signingAuthority}
                    onChange={(e) => setSigningAuthority(e.target.value as SigningAuthority)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:bg-white outline-none font-semibold text-purple-900"
                  >
                    {SIGNING_AUTHORITIES.map((auth) => (
                      <option key={auth.value} value={auth.value}>
                        {auth.label}
                      </option>
                    ))}
                  </select>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    {SIGNING_AUTHORITIES.find((a) => a.value === signingAuthority)?.desc}
                  </span>
                </div>

                {/* ประเภทสัญญา (มี 7 ประเภทตามข้อกำหนด) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ประเภทสัญญา <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={contractType}
                    onChange={(e) => setContractType(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:bg-white outline-none font-medium text-slate-900"
                  >
                    {CONTRACT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    ประเภทสัญญาซื้อขายไฟฟ้า กฟภ.
                  </span>
                </div>

                {/* สถานะสัญญา (ขึ้นอัตโนมัติตามสถานะเอกสารจริง ไม่ให้เลือก) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                    <span>สถานะสัญญา</span>
                    <span className="text-[10px] font-medium text-purple-800 bg-purple-100 px-1.5 py-0.5 rounded border border-purple-200">
                      ขึ้นอัตโนมัติ
                    </span>
                  </label>
                  <div className="w-full px-3 py-2 text-sm bg-slate-100 border border-slate-300 rounded-lg flex items-center justify-between shadow-2xs">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          autoStatus === 'completed'
                            ? 'bg-emerald-500'
                            : autoStatus === 'pending_review'
                            ? 'bg-amber-500'
                            : autoStatus === 'uploaded'
                            ? 'bg-sky-500'
                            : 'bg-slate-400'
                        }`}
                      />
                      <span className="font-semibold text-slate-800 text-xs">
                        {getStatusLabel(autoStatus)}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-500">
                      {fileList.length === 0
                        ? 'ยังไม่แนบไฟล์'
                        : `แนบ ${fileList.length} ไฟล์ (${fileList.filter((f) => f.isVerified).length} ตรวจแล้ว)`}
                    </span>
                  </div>
                </div>

                {/* สถานที่ใช้ไฟฟ้า */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    สถานที่ใช้ไฟฟ้า (ที่อยู่ติดตั้ง)
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="เช่น นิคมอุตสาหกรรมมาบตาพุด อ.เมือง จ.ระยอง"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:bg-white outline-none"
                  />
                </div>
              </div>

              {/* Quick shortcut to Attachments */}
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between bg-purple-50/50 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-xs text-purple-900">
                  <Paperclip className="w-4 h-4 text-[#702d8a]" />
                  <span>มีไฟล์แนบในระบบแล้ว <strong>{fileList.length} ไฟล์</strong></span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('attachments')}
                  className="px-3 py-1.5 bg-[#702d8a] text-white text-xs font-semibold rounded-lg hover:bg-purple-800 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>ไปที่หน้าแนบไฟล์</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'attachments' && (
            <div className="space-y-6">
              {/* Table Section: เอกสารประกอบสัญญา (Matching screenshot's purple bar table) */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                {/* Purple Section Header with Green "+ เพิ่มเอกสาร" Button */}
                <div className="bg-[#702d8a] px-4 py-2.5 flex items-center justify-between text-white">
                  <span className="text-sm font-bold tracking-tight">
                    เอกสารประกอบสัญญา
                  </span>
                  <button
                    type="button"
                    onClick={handleOpenAddDoc}
                    className="bg-[#22c55e] hover:bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-md shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>เพิ่มเอกสาร</span>
                  </button>
                </div>

                {/* Data Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100/90 text-slate-700 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-4 font-semibold">หัวข้อเอกสาร</th>
                        <th className="py-2.5 px-4 font-semibold">ชื่อไฟล์</th>
                        <th className="py-2.5 px-3 font-semibold text-center whitespace-nowrap">ขนาด (MB)</th>
                        <th className="py-2.5 px-3 font-semibold text-center whitespace-nowrap">จำนวนหน้า</th>
                        <th className="py-2.5 px-3 font-semibold text-center whitespace-nowrap">Download</th>
                        <th className="py-2.5 px-3 font-semibold text-center whitespace-nowrap">อื่น ๆ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {fileList.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                            No data available in table
                          </td>
                        </tr>
                      ) : (
                        fileList.map((file) => (
                          <tr key={file.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-2.5 px-4 font-medium text-slate-800">
                              <div className="flex items-start gap-2">
                                <FileText className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
                                <div>
                                  <span>{file.fileCategory}</span>
                                  {file.fileDetails && (
                                    <span className="text-[11px] text-slate-400 block font-normal">
                                      {file.fileDetails}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-2.5 px-4 text-slate-600 font-mono text-[11px] truncate max-w-[200px]" title={file.fileName}>
                              {file.fileName}
                            </td>
                            <td className="py-2.5 px-3 text-center text-slate-600 font-mono">
                              {file.fileSize}
                            </td>
                            <td className="py-2.5 px-3 text-center text-slate-600 font-mono">
                              {file.pageCount || '-'}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleDownloadFile(file.fileName)}
                                className="inline-flex items-center justify-center p-1 text-sky-600 hover:text-sky-800 hover:bg-sky-50 rounded transition-colors cursor-pointer"
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
                                      ? 'text-emerald-700 hover:bg-emerald-50'
                                      : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                                  }`}
                                  title={file.isVerified ? 'ตรวจแล้ว' : 'กดเพื่อยืนยันการตรวจสอบ'}
                                >
                                  <CheckCircle2 className={`w-4 h-4 ${file.isVerified ? 'text-emerald-600 fill-emerald-50' : ''}`} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveFile(file.id)}
                                  className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors cursor-pointer"
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

                {/* Table Footer info matching PLMS */}
                <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>
                    Showing {fileList.length > 0 ? 1 : 0} to {fileList.length} of {fileList.length} entries
                  </span>
                  <div className="flex items-center gap-1">
                    <button type="button" disabled className="px-2 py-0.5 border border-slate-200 rounded text-slate-400 bg-white">Previous</button>
                    <button type="button" disabled className="px-2 py-0.5 border border-slate-200 rounded text-slate-400 bg-white">Next</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 4. Modal Bottom Footer (Matching screenshot with Red "✖ ปิด" button) */}
        <div className="bg-white border-t border-slate-200 px-5 py-3 flex items-center justify-between">
          <div className="text-xs text-slate-500 hidden sm:flex items-center gap-2">
            <span className="font-semibold text-slate-700">{utility} ({utilityCode})</span>
            <span>·</span>
            <span>อำนาจลงนาม: <strong className="text-[#702d8a]">{signingAuthority}</strong></span>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {/* Red Close Button as in screenshot: [✖ ปิด] */}
            <button
              type="button"
              onClick={onClose}
              className="bg-[#dc2626] hover:bg-rose-700 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
              <span>ปิด</span>
            </button>

            {/* Save Button */}
            <button
              type="button"
              onClick={handleSave}
              className="bg-[#22c55e] hover:bg-green-600 text-white font-semibold text-xs px-5 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-sm hover:shadow"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>บันทึกข้อมูล</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5. POPUP MODAL: "บันทึกข้อมูล" (ตรงตามภาพตัวอย่างหน้าต่างเพิ่มเอกสารของระบบ PLMS ทุกประการ แต่ไม่มี อื่น ๆ) */}
      {isAddingDoc && (
        <div className="fixed inset-0 z-70 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-300 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col">
            {/* Top Purple Header Bar: บันทึกข้อมูล */}
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

            {/* Form Fields matching the screenshot */}
            <form onSubmit={handleAddFile} className="p-6 space-y-4 text-xs">
              {/* Field 1: หัวข้อเอกสาร (มีแค่สัญญาหลัก กับ สัญญาแนบท้ายเท่านั้น) : */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="sm:w-28 text-slate-800 font-semibold sm:text-right shrink-0">
                  หัวข้อเอกสาร :
                </label>
                <div className="flex-1 relative">
                  <select
                    value={newDocTitle}
                    onChange={(e) => setNewDocTitle(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:border-[#702d8a] focus:ring-1 focus:ring-[#702d8a] bg-white text-slate-900 font-semibold"
                    required
                  >
                    {ATTACHMENT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Field 2: รายละเอียด : */}
              <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                <label className="sm:w-28 text-slate-800 font-semibold sm:text-right shrink-0 sm:pt-2">
                  รายละเอียด :
                </label>
                <div className="flex-1">
                  <textarea
                    rows={4}
                    value={newDocDescription}
                    onChange={(e) => setNewDocDescription(e.target.value)}
                    placeholder="ระบุรายละเอียดเพิ่มเติมเกี่ยวกับเอกสาร..."
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:border-[#702d8a] focus:ring-1 focus:ring-[#702d8a] bg-white text-slate-900 resize-none"
                  />
                </div>
              </div>

              {/* Field 3: Row with จำนวนหน้า : & ไฟล์เอกสาร : */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 pt-1">
                {/* จำนวนหน้า : with [-] [1] [+] Stepper */}
                <div className="flex items-center gap-2 sm:ml-[7.5rem]">
                  <label className="text-slate-800 font-semibold whitespace-nowrap">
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
                      className="w-14 h-8 border-y border-slate-300 text-center font-mono text-sm font-semibold outline-none bg-white text-slate-900"
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

                {/* ไฟล์เอกสาร : with [📄 แนบไฟล์] Button */}
                <div className="flex items-center gap-2">
                  <label className="text-slate-800 font-semibold whitespace-nowrap">
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
                    <span className="font-mono text-[11px] text-purple-900 bg-purple-50 px-2 py-1 rounded border border-purple-200 truncate max-w-[180px]" title={newDocFileName}>
                      {newDocFileName}
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400 italic">
                      (เลือกไฟล์จากเครื่อง)
                    </span>
                  )}
                </div>
              </div>

              {/* หมายเหตุ: ไม่มีส่วน "อื่น ๆ" ตามคำสั่งผู้ใช้ */}

              {/* Bottom Footer Buttons matching screenshot: [✔ บันทึก] [✖ ปิด] */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
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
