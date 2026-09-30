import React, { useState, useRef } from 'react';
import {
  X,
  Plus,
  Trash2,
  FileText,
  CheckCircle2,
  AlertCircle,
  Building2,
  Zap,
  Shield,
  Layers,
  Paperclip,
  Check,
  Download
} from 'lucide-react';
import {
  ElectricityConsumer,
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
import { calculateSigningAuthority, getAuthorityRuleText } from '../utils/formatters';

interface AddConsumerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (consumer: ElectricityConsumer) => void;
}

export const AddConsumerModal: React.FC<AddConsumerModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  if (!isOpen) return null;

  // --- ส่วนที่ 1: ข้อมูลผู้ใช้ไฟฟ้าและข้อกำหนดสัญญา กฟภ. (ให้กรอกเองทั้งหมด) ---
  const [utility, setUtility] = useState<PEABranch>('กฟจ.ชลบุรี');
  const [utilityCode, setUtilityCode] = useState('H01101');
  const [voltageLevel, setVoltageLevel] = useState<VoltageLevel>('22-33 kV');
  const [transformerSize, setTransformerSize] = useState('1,000 kVA');
  const [accountNumber, setAccountNumber] = useState('');
  const [consumerName, setConsumerName] = useState('');
  const [contractNumber, setContractNumber] = useState('');
  const [contractDate, setContractDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [signingAuthority, setSigningAuthority] = useState<SigningAuthority>('ผจก.');
  const [contractType, setContractType] = useState<string>('สัญญาหลัก');
  const [location, setLocation] = useState('');

  // --- ส่วนที่ 2: เอกสารประกอบสัญญา (บังคับแนบไฟล์) ---
  const [fileList, setFileList] = useState<AttachedFile[]>([]);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Popup Modal state for adding a document
  const [isAddingDoc, setIsAddingDoc] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState<string>('สัญญาหลัก');
  const [newDocDescription, setNewDocDescription] = useState('');
  const [newDocFileName, setNewDocFileName] = useState('');
  const [newDocPageCount, setNewDocPageCount] = useState<number>(1);
  const [newDocSize, setNewDocSize] = useState<string>('3.5 MB');
  const [docError, setDocError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // คำนวณอำนาจลงนามแนะนำตามเกณฑ์: 22 kV <= 2500 = ผจก, 22 kV > 2500 = อฝ.สบ, 115 kV = ผชก
  const recommendedAuthority = calculateSigningAuthority(voltageLevel, transformerSize);

  // เมื่อเลือกการไฟฟ้า
  const handleUtilityChange = (branchName: PEABranch) => {
    setUtility(branchName);
    const branch = PEA_BRANCHES.find((b) => b.name === branchName);
    if (branch) {
      setUtilityCode(branch.code);
      if (!contractNumber || contractNumber.startsWith('PPA-PEA-')) {
        setContractNumber(`PPA-PEA-${branch.code}/2026-${Math.floor(Math.random() * 800) + 100}`);
      }
    }
  };

  // ตรวจสอบความถูกต้อง: บังคับทุกการกรอก และบังคับแนบไฟล์ด้วย
  const validate = () => {
    const errs: Record<string, string> = {};

    if (!utility) errs.utility = 'กรุณาเลือกการไฟฟ้า';
    if (!utilityCode.trim()) errs.utilityCode = 'กรุณาระบุรหัสการไฟฟ้า';
    if (!voltageLevel) errs.voltageLevel = 'กรุณาเลือกระดับแรงดัน';
    if (!transformerSize.trim()) errs.transformerSize = 'กรุณาระบุขนาดหม้อแปลง';
    if (!accountNumber.trim()) errs.accountNumber = 'กรุณาระบุหมายเลขผู้ใช้ไฟฟ้า (CA)';
    if (!consumerName.trim()) errs.consumerName = 'กรุณาระบุชื่อผู้ใช้ไฟฟ้า';
    if (!contractNumber.trim()) errs.contractNumber = 'กรุณาระบุเลขที่สัญญา';
    if (!contractDate.trim()) errs.contractDate = 'กรุณาระบุวันที่ลงนามสัญญา';
    if (!signingAuthority) errs.signingAuthority = 'กรุณาเลือกผู้มีอำนาจลงนาม';
    if (!contractType) errs.contractType = 'กรุณาเลือกประเภทสัญญา';
    if (!location.trim()) errs.location = 'กรุณาระบุสถานที่ใช้ไฟฟ้า';

    // บังคับแนบไฟล์เอกสารในส่วนที่ 2 อย่างน้อย 1 รายการ
    if (fileList.length === 0) {
      errs.fileList = 'บังคับแนบไฟล์เอกสารประกอบสัญญา: กรุณากดปุ่ม "+ เพิ่มเอกสาร" เพื่อแนบไฟล์สัญญาอย่างน้อย 1 รายการ';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
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

  // File selection
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
      newDocFileName.trim() || `${newDocTitle.replace(/\s+/g, '_')}_${utilityCode || 'doc'}.pdf`;

    const newFile: AttachedFile = {
      id: `f-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
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
    if (errors.fileList) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.fileList;
        return next;
      });
    }
  };

  // Remove file
  const handleRemoveFile = (id: string) => {
    setFileList((prev) => prev.filter((f) => f.id !== id));
  };

  // Mock download
  const handleDownloadFile = (fileName: string) => {
    const dummyContent = `PEA CONTRACT DOCUMENT: ${fileName}\nUtility: ${utility} (${utilityCode})\nCA: ${accountNumber}\nContract: ${contractNumber}`;
    const blob = new Blob([dummyContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Submit handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    const primaryFile = fileList[0];
    const newConsumer: ElectricityConsumer = {
      id: `c-${Date.now()}`,
      utility,
      utilityCode: utilityCode.trim(),
      accountNumber: accountNumber.trim(),
      consumerName: consumerName.trim(),
      installationNumber: contractNumber.trim(),
      location: location.trim(),
      transformerSize: transformerSize.trim(),
      voltageLevel,
      signingAuthority,
      authorizedSignatory: signingAuthority,
      contractStatus: 'uploaded', // บังคับแนบไฟล์แล้ว จึงเริ่มต้นเป็น uploaded (แนบไฟล์แล้ว)
      attachedFilesCount: fileList.length,
      verifiedFilesCount: 0,
      contractDetails: {
        contractNumber: contractNumber.trim(),
        contractType,
        contractDate,
        effectiveDate: contractDate,
        expireDate: new Date(Date.now() + 365 * 24 * 3600 * 1000 * 5).toISOString().split('T')[0],
        signingAuthority,
        fileName: primaryFile.fileName,
        fileSize: primaryFile.fileSize,
        uploadedAt: primaryFile.uploadedAt,
        files: fileList,
      },
      updatedAt: new Date().toLocaleString('th-TH'),
      createdAt: new Date().toLocaleString('th-TH'),
    };

    onAdd(newConsumer);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        {/* 1. Purple Header Bar (matching PLMS pea.co.th style) */}
        <div className="bg-[#702d8a] text-white px-5 py-3.5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5">
            <Layers className="w-5 h-5 text-purple-200" />
            <div>
              <h3 className="text-base sm:text-lg font-bold tracking-tight">
                เพิ่มข้อมูลผู้ใช้ไฟฟ้าและเอกสารสัญญา (กฟภ.)
              </h3>
              <p className="text-xs text-purple-200/90">
                กรอกข้อมูลผู้ใช้ไฟฟ้า ข้อกำหนดสัญญา และแนบไฟล์เอกสารประกอบสัญญา (บังคับทุกช่องและบังคับแนบไฟล์)
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

        {/* 2. Modal Body Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 bg-slate-50/50">
          {/* แจ้งเตือน Validation หากมีข้อผิดพลาด */}
          {Object.keys(errors).length > 0 && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-rose-900">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>กรุณากรอกข้อมูลให้ครบถ้วนทุกช่อง และแนบไฟล์เอกสารประกอบสัญญา</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-rose-700 pl-1">
                {Object.values(errors).map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* ส่วนที่ 1: ข้อมูลผู้ใช้ไฟฟ้าและข้อกำหนดสัญญา กฟภ. (ให้กรอกเองทั้งหมด) */}
          <div className="space-y-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#702d8a]" />
                  <span>ส่วนที่ 1: ข้อมูลผู้ใช้ไฟฟ้าและข้อกำหนดสัญญา กฟภ.</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  กรอกข้อมูลการจำหน่ายไฟฟ้า พิกัดหม้อแปลง แรงดัน และอำนาจลงนาม (บังคับกรอกทุกช่อง)
                </p>
              </div>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-purple-50 text-[#702d8a] border border-purple-200">
                กรอกเองทั้งหมด
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 1. กฟฟ. (การไฟฟ้า) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  กฟฟ. (การไฟฟ้า) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={utility}
                  onChange={(e) => handleUtilityChange(e.target.value as PEABranch)}
                  className={`w-full px-3 py-2 text-sm bg-slate-50 border rounded-lg focus:ring-2 focus:ring-purple-400 focus:bg-white outline-none ${
                    errors.utility ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                  }`}
                  required
                >
                  {PEA_BRANCHES.map((b) => (
                    <option key={b.code} value={b.name}>
                      {b.name} ({b.code})
                    </option>
                  ))}
                </select>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                  <span>รหัสการไฟฟ้า: <span className="font-mono font-semibold text-purple-700">{utilityCode}</span></span>
                </div>
              </div>

              {/* รหัสการไฟฟ้า (ให้กรอก/แก้ไขได้เอง) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  รหัสการไฟฟ้า <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={utilityCode}
                  onChange={(e) => setUtilityCode(e.target.value)}
                  placeholder="เช่น H01101"
                  className={`w-full px-3 py-2 text-sm font-mono bg-slate-50 border rounded-lg focus:ring-2 focus:ring-purple-400 focus:bg-white outline-none ${
                    errors.utilityCode ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                  }`}
                  required
                />
              </div>

              {/* 2. แรงดัน (drop down เลือก 22-33 kV กับ 115 kV) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  แรงดัน (Voltage Level) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={voltageLevel}
                  onChange={(e) => {
                    const newV = e.target.value as VoltageLevel;
                    setVoltageLevel(newV);
                    const autoAuth = calculateSigningAuthority(newV, transformerSize);
                    setSigningAuthority(autoAuth);
                  }}
                  className={`w-full px-3 py-2 text-sm bg-slate-50 border rounded-lg focus:ring-2 focus:ring-purple-400 focus:bg-white outline-none font-mono font-medium text-slate-800 ${
                    errors.voltageLevel ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                  }`}
                  required
                >
                  <option value="22-33 kV">22-33 kV (แรงดัน 22-33 kV)</option>
                  <option value="115 kV">115 kV (แรงดัน 115 kV)</option>
                </select>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  พิกัดระบบจำหน่าย/สายส่งไฟฟ้า กฟภ.
                </span>
              </div>

              {/* 3. ขนาดหม้อแปลง (ให้กรอกเองทั้งหมด) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ขนาดหม้อแปลง (Transformer Size) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={transformerSize}
                  onChange={(e) => {
                    const newSize = e.target.value;
                    setTransformerSize(newSize);
                    const autoAuth = calculateSigningAuthority(voltageLevel, newSize);
                    setSigningAuthority(autoAuth);
                  }}
                  placeholder="เช่น 1,000 kVA, 2,500 kVA, 5,000 kVA"
                  className={`w-full px-3 py-2 text-sm font-mono bg-slate-50 border rounded-lg focus:ring-2 focus:ring-purple-400 focus:bg-white outline-none ${
                    errors.transformerSize ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                  }`}
                  required
                />
              </div>

              {/* 4. หมายเลขผู้ใช้ไฟฟ้า (CA) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  หมายเลขผู้ใช้ไฟฟ้า (CA) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="เช่น 020014892120 (12 หลัก)"
                  className={`w-full px-3 py-2 text-sm font-mono font-bold text-slate-900 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-purple-400 focus:bg-white outline-none ${
                    errors.accountNumber ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                  }`}
                  required
                />
              </div>

              {/* 5. ชื่อผู้ใช้ไฟฟ้า */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ชื่อผู้ใช้ไฟฟ้า (ชื่อสถานประกอบการ / บุคคล) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={consumerName}
                  onChange={(e) => setConsumerName(e.target.value)}
                  placeholder="เช่น บริษัท สยาม ออโตโมทีฟ พาร์ทส์ จำกัด"
                  className={`w-full px-3 py-2 text-sm font-medium text-slate-900 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-purple-400 focus:bg-white outline-none ${
                    errors.consumerName ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                  }`}
                  required
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
                  className={`w-full px-3 py-2 text-sm font-mono font-semibold text-purple-900 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-purple-400 focus:bg-white outline-none ${
                    errors.contractNumber ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                  }`}
                  required
                />
              </div>

              {/* 7. วันที่ลงนาม */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  วันที่ลงนาม <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={contractDate}
                  onChange={(e) => setContractDate(e.target.value)}
                  className={`w-full px-3 py-2 text-sm bg-slate-50 border rounded-lg focus:ring-2 focus:ring-purple-400 focus:bg-white outline-none font-medium ${
                    errors.contractDate ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                  }`}
                  required
                />
              </div>

              {/* 8. อำนาจ (drop down เลือก ผจก. อฝ.สบ. ผชก.) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-700">
                    อำนาจ (ผู้มีอำนาจลงนาม กฟภ.) <span className="text-rose-500">*</span>
                  </label>
                  {signingAuthority === recommendedAuthority ? (
                    <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      ตรงตามเกณฑ์หม้อแปลง ({recommendedAuthority})
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setSigningAuthority(recommendedAuthority)}
                      className="text-[11px] text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-2 py-0.5 rounded border border-purple-200 transition-colors font-medium flex items-center gap-1 cursor-pointer"
                      title="กดเพื่อใช้อำนาจตามเกณฑ์ขนาดหม้อแปลงและแรงดัน"
                    >
                      <Zap className="w-3 h-3 text-purple-600" />
                      ใช้อำนาจตามเกณฑ์ ({recommendedAuthority})
                    </button>
                  )}
                </div>

                <select
                  value={signingAuthority}
                  onChange={(e) => setSigningAuthority(e.target.value as SigningAuthority)}
                  className={`w-full px-3 py-2 text-sm bg-slate-50 border rounded-lg focus:ring-2 focus:ring-purple-400 focus:bg-white outline-none font-semibold text-purple-900 ${
                    errors.signingAuthority ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                  }`}
                  required
                >
                  {SIGNING_AUTHORITIES.map((auth) => (
                    <option key={auth.value} value={auth.value}>
                      {auth.label} - {auth.desc}
                    </option>
                  ))}
                </select>

                {/* กล่องอธิบายเกณฑ์หม้อแปลง */}
                <div className="p-2.5 rounded-lg bg-slate-100/80 border border-slate-200 text-[11px] text-slate-600 space-y-1">
                  <div className="font-semibold text-slate-800 flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-purple-600" />
                    <span>เกณฑ์กำหนดอำนาจ: 22 kV ≤ 2,500 kVA (ผจก.) | 22 kV &gt; 2,500 kVA (อฝ.สบ.) | 115 kV (ผชก.)</span>
                  </div>
                  <div className="text-slate-500">
                    ข้อมูลผู้ใช้ไฟ: แรงดัน <strong>{voltageLevel}</strong> | หม้อแปลง <strong>{transformerSize}</strong> → เกณฑ์แนะนำ: <strong className="text-purple-800">{recommendedAuthority}</strong>
                  </div>
                </div>
              </div>

              {/* 9. ประเภทสัญญา (มี 7 ประเภทตามข้อกำหนด) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ประเภทสัญญา <span className="text-rose-500">*</span>
                </label>
                <select
                  value={contractType}
                  onChange={(e) => setContractType(e.target.value)}
                  className={`w-full px-3 py-2 text-sm bg-slate-50 border rounded-lg focus:ring-2 focus:ring-purple-400 focus:bg-white outline-none font-medium text-slate-900 ${
                    errors.contractType ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                  }`}
                  required
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

              {/* 10. สถานที่ใช้ไฟฟ้า */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  สถานที่ใช้ไฟฟ้า (ที่อยู่ติดตั้ง) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="เช่น นิคมอุตสาหกรรมมาบตาพุด อ.เมือง จ.ระยอง"
                  className={`w-full px-3 py-2 text-sm bg-slate-50 border rounded-lg focus:ring-2 focus:ring-purple-400 focus:bg-white outline-none ${
                    errors.location ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                  }`}
                  required
                />
              </div>
            </div>
          </div>

          {/* ส่วนที่ 2: เอกสารประกอบสัญญา (บังคับแนบไฟล์) */}
          <div className="space-y-3 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            {/* Purple Section Header with Green "+ เพิ่มเอกสาร" Button */}
            <div className="bg-[#702d8a] px-4 py-3 rounded-lg flex items-center justify-between text-white shadow-xs">
              <div className="flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-purple-200" />
                <span className="text-sm font-bold tracking-tight">
                  ส่วนที่ 2: เอกสารประกอบสัญญา (เอกสารแนบ {fileList.length} ไฟล์) <span className="text-amber-300 font-bold">* บังคับแนบไฟล์</span>
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

            {/* แจ้งเตือนเมื่อยังไม่ได้แนบไฟล์ */}
            {errors.fileList && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-300 text-rose-700 text-xs flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errors.fileList}</span>
              </div>
            )}

            {/* Data Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/90 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">หัวข้อเอกสาร</th>
                    <th className="py-2.5 px-4 font-semibold">ชื่อไฟล์</th>
                    <th className="py-2.5 px-3 font-semibold text-center whitespace-nowrap">ขนาด (MB)</th>
                    <th className="py-2.5 px-3 font-semibold text-center whitespace-nowrap">จำนวนหน้า</th>
                    <th className="py-2.5 px-3 font-semibold text-center whitespace-nowrap">Download</th>
                    <th className="py-2.5 px-3 font-semibold text-center whitespace-nowrap">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {fileList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                        <div className="flex flex-col items-center gap-1">
                          <Paperclip className="w-6 h-6 text-slate-300" />
                          <span>ยังไม่มีเอกสารแนบ (บังคับแนบไฟล์อย่างน้อย 1 รายการ)</span>
                          <span className="text-purple-700 text-xs font-semibold">คลิกปุ่ม "+ เพิ่มเอกสาร" สีเขียวด้านบนเพื่อแนบไฟล์</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    fileList.map((file) => (
                      <tr key={file.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-4 font-medium text-slate-800">
                          <div className="flex items-start gap-2">
                            <FileText className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-semibold text-slate-900">{file.fileCategory}</span>
                                {file.fileCategory === 'สัญญาแนบท้าย' && (
                                  <span className="text-[10px] bg-purple-100 text-[#702d8a] px-1.5 py-0.5 rounded font-bold">
                                    แนบท้าย
                                  </span>
                                )}
                              </div>
                              {file.fileDetails && (
                                <span className="text-[11px] text-purple-900 block font-medium mt-0.5">
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
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(file.id)}
                            className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                            title="ลบไฟล์เอกสาร"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer info */}
            <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-[11px] text-slate-500">
              <span>
                เอกสารแนบทั้งหมด {fileList.length} รายการ <span className="text-purple-700 font-semibold">(บังคับแนบไฟล์ก่อนบันทึก)</span>
              </span>
              <span className="text-[10px] text-purple-700 font-semibold">
                * สามารถแนบได้ทั้ง สัญญาหลัก และ สัญญาแนบท้าย
              </span>
            </div>
          </div>

          {/* 3. Modal Bottom Footer Actions */}
          <div className="bg-white border-t border-slate-200 pt-4 flex items-center justify-between">
            <div className="text-xs text-slate-500 hidden sm:flex items-center gap-2">
              <span className="font-semibold text-slate-700">{utility} ({utilityCode})</span>
              <span>·</span>
              <span>อำนาจลงนาม: <strong className="text-[#702d8a]">{signingAuthority}</strong></span>
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
                type="submit"
                className="bg-[#22c55e] hover:bg-green-600 text-white font-semibold text-xs px-5 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-sm hover:shadow"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>บันทึกข้อมูลผู้ใช้ไฟฟ้าและสัญญา</span>
              </button>
            </div>
          </div>
        </form>

        {/* 4. POPUP MODAL: "บันทึกข้อมูล" เพิ่มเอกสารแนบ */}
        {isAddingDoc && (
          <div className="fixed inset-0 z-70 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-3 sm:p-4">
            <div className="bg-white rounded-xl shadow-2xl border border-slate-300 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col">
              {/* Top Purple Header Bar */}
              <div className="bg-[#702d8a] text-white px-5 py-3 flex items-center justify-between shadow-xs">
                <span className="text-base font-bold tracking-tight">
                  บันทึกข้อมูลเอกสารแนบ
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

              {/* Form Fields */}
              <form onSubmit={handleAddFile} className="p-6 space-y-4 text-xs">
                {/* Field 1: หัวข้อเอกสาร */}
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

                {/* Field 2: รายละเอียด */}
                <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                  <label className="sm:w-28 text-slate-800 font-semibold sm:text-right shrink-0 sm:pt-2">
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
                      className={`w-full px-3 py-2 text-sm border rounded-lg outline-none focus:ring-1 bg-white text-slate-900 resize-none ${
                        docError && newDocTitle === 'สัญญาแนบท้าย' && !newDocDescription.trim()
                          ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500 bg-rose-50/20'
                          : 'border-slate-300 focus:border-[#702d8a] focus:ring-[#702d8a]'
                      }`}
                      required={newDocTitle === 'สัญญาแนบท้าย'}
                    />
                    {newDocTitle === 'สัญญาแนบท้าย' && (
                      <p className="text-[11px] text-purple-700 font-medium">
                        * บังคับระบุรายละเอียด ว่าเป็นสัญญาแนบท้ายเรื่องใด
                      </p>
                    )}
                    {docError && (
                      <p className="text-xs text-rose-600 font-semibold flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{docError}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Field 3: จำนวนหน้า & ไฟล์เอกสาร */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 pt-1">
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

                {/* Footer Buttons */}
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
    </div>
  );
};
