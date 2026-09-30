import React, { useState } from 'react';
import { X, Building2, Zap, User, FileText, CheckCircle2, AlertCircle, Info, Sparkles, ShieldCheck } from 'lucide-react';
import {
  ElectricityConsumer,
  UtilityProvider,
  PEA_BRANCHES,
  PEABranch,
  VoltageLevel,
  VOLTAGE_LEVELS,
  SigningAuthority,
  SIGNING_AUTHORITIES,
  CONTRACT_TYPES,
  ContractType
} from '../types/contract';
import { calculateSigningAuthority, getAuthorityRuleText, getAuthorityBadgeStyle } from '../utils/formatters';

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

  const [utility, setUtility] = useState<PEABranch>('กฟจ.ชลบุรี');
  const [utilityCode, setUtilityCode] = useState('H01101');
  const [accountNumber, setAccountNumber] = useState('');
  const [consumerName, setConsumerName] = useState('');
  const [installationNumber, setInstallationNumber] = useState('');
  const [location, setLocation] = useState('');
  const [transformerSize, setTransformerSize] = useState('1,000 kVA');
  const [voltageLevel, setVoltageLevel] = useState<VoltageLevel>('22-33 kV');
  const [signingAuthority, setSigningAuthority] = useState<SigningAuthority>('ผจก.');

  // Optional initial contract attach
  const [attachContractNow, setAttachContractNow] = useState(false);
  const [contractNumber, setContractNumber] = useState('');
  const [contractType, setContractType] = useState<string>('สัญญาหลัก');
  const [fileName, setFileName] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!accountNumber.trim()) newErrors.accountNumber = 'กรุณาระบุหมายเลขผู้ใช้ไฟฟ้า';
    if (!installationNumber.trim()) newErrors.installationNumber = 'กรุณาระบุเลขที่สัญญา';
    if (!location.trim()) newErrors.location = 'กรุณาระบุสถานที่ใช้ไฟฟ้า';
    if (attachContractNow && !contractNumber.trim()) {
      newErrors.contractNumber = 'กรุณาระบุเลขที่สัญญา';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const newConsumer: ElectricityConsumer = {
      id: `c-${Date.now()}`,
      utility,
      utilityCode,
      accountNumber: accountNumber.trim(),
      consumerName: consumerName.trim() || location.split(' ')[0],
      installationNumber: installationNumber.trim(),
      location: location.trim(),
      transformerSize,
      voltageLevel,
      signingAuthority,
      authorizedSignatory: signingAuthority,
      contractStatus: attachContractNow && fileName ? 'uploaded' : 'pending_upload',
      attachedFilesCount: attachContractNow && fileName ? 1 : 0,
      verifiedFilesCount: 0,
      contractDetails: attachContractNow && fileName
        ? {
            contractNumber: contractNumber.trim() || `PPA-${Date.now()}`,
            contractType,
            contractDate: new Date().toISOString().split('T')[0],
            effectiveDate: new Date().toISOString().split('T')[0],
            expireDate: new Date(Date.now() + 365 * 24 * 3600 * 1000 * 5).toISOString().split('T')[0],
            fileName,
            fileSize: '3.4 MB',
            uploadedAt: new Date().toLocaleString('th-TH'),
          }
        : undefined,
      updatedAt: new Date().toLocaleString('th-TH'),
      createdAt: new Date().toLocaleString('th-TH'),
    };

    onAdd(newConsumer);
    onClose();
  };

  const handleUtilityChange = (branchName: PEABranch) => {
    setUtility(branchName);
    const branch = PEA_BRANCHES.find((b) => b.name === branchName);
    if (branch) {
      setUtilityCode(branch.code);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-sky-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-sky-50 via-cyan-50/50 to-white border-b border-sky-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-500 text-white rounded-xl shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">เพิ่มข้อมูลผู้ใช้ไฟฟ้าใหม่</h3>
              <p className="text-xs text-slate-500">บันทึกข้อมูลหน่วยงาน พิกัดหม้อแปลง แรงดัน และอำนาจลงนาม (กฟภ.)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Row 1: การไฟฟ้า & รหัสการไฟฟ้า */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                การไฟฟ้า (กฟภ.) <span className="text-rose-500">*</span>
              </label>
              <select
                value={utility}
                onChange={(e) => handleUtilityChange(e.target.value as PEABranch)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-400 focus:bg-white outline-none"
              >
                {PEA_BRANCHES.map((b) => (
                  <option key={b.code} value={b.name}>
                    {b.name} ({b.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                รหัสการไฟฟ้า <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={utilityCode}
                onChange={(e) => setUtilityCode(e.target.value)}
                placeholder="เช่น H01101"
                className="w-full px-3 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-400 focus:bg-white outline-none"
              />
            </div>
          </div>

          {/* Row 2: หมายเลขผู้ใช้ไฟฟ้า (CA) & การติดตั้ง */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                หมายเลขผู้ใช้ไฟฟ้า (CA) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="เช่น 020014892120 (12 หลัก)"
                className={`w-full px-3 py-2 text-sm font-mono bg-slate-50 border rounded-xl focus:ring-2 focus:ring-sky-400 focus:bg-white outline-none ${
                  errors.accountNumber ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                }`}
              />
              {errors.accountNumber && (
                <p className="text-[11px] text-rose-500 mt-1">{errors.accountNumber}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                เลขที่สัญญา (Contract No.) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={installationNumber}
                onChange={(e) => setInstallationNumber(e.target.value)}
                placeholder="เช่น PPA-PEA-4829103"
                className={`w-full px-3 py-2 text-sm font-mono bg-slate-50 border rounded-xl focus:ring-2 focus:ring-sky-400 focus:bg-white outline-none ${
                  errors.installationNumber ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                }`}
              />
              {errors.installationNumber && (
                <p className="text-[11px] text-rose-500 mt-1">{errors.installationNumber}</p>
              )}
            </div>
          </div>

          {/* Row 2.5: ชื่อผู้ใช้ไฟฟ้า */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ชื่อผู้ใช้ไฟฟ้า (สถานประกอบการ / นิติบุคคล) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={consumerName}
              onChange={(e) => setConsumerName(e.target.value)}
              placeholder="เช่น บริษัท ไฮเทค แมนูแฟคเจอริ่ง จำกัด"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-400 focus:bg-white outline-none font-medium"
            />
          </div>

          {/* Row 3: สถานที่ใช้ไฟฟ้า */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              สถานที่ใช้ไฟฟ้า (ที่อยู่ติดตั้ง) <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={2}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="เช่น นิคมอุตสาหกรรมอีสเทิร์นซีบอร์ด อ.ปลวกแดง จ.ระยอง"
              className={`w-full px-3 py-2 text-sm bg-slate-50 border rounded-xl focus:ring-2 focus:ring-sky-400 focus:bg-white outline-none resize-none ${
                errors.location ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
              }`}
            />
            {errors.location && (
              <p className="text-[11px] text-rose-500 mt-1">{errors.location}</p>
            )}
          </div>

          {/* Row 4: ขนาดหม้อแปลง & แรงดัน พร้อมเกณฑ์กำหนดอำนาจลงนาม กฟภ. */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ขนาดหม้อแปลง (Transformer) <span className="text-rose-500">*</span>
              </label>
              <select
                value={transformerSize}
                onChange={(e) => {
                  const newSize = e.target.value;
                  setTransformerSize(newSize);
                  // คำนวณอำนาจลงนามอัตโนมัติตามเกณฑ์: 22 kV <= 2500 = ผจก, 22 kV > 2500 = อฝ.สบ., 115 kV = ผชก.
                  const autoAuth = calculateSigningAuthority(voltageLevel, newSize);
                  setSigningAuthority(autoAuth);
                }}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-400 focus:bg-white outline-none font-mono"
              >
                <option value="500 kVA">500 kVA (≤ 2,500 kVA - ผจก.)</option>
                <option value="800 kVA">800 kVA (≤ 2,500 kVA - ผจก.)</option>
                <option value="1,000 kVA">1,000 kVA (≤ 2,500 kVA - ผจก.)</option>
                <option value="1,250 kVA">1,250 kVA (≤ 2,500 kVA - ผจก.)</option>
                <option value="1,600 kVA">1,600 kVA (≤ 2,500 kVA - ผจก.)</option>
                <option value="2,000 kVA">2,000 kVA (≤ 2,500 kVA - ผจก.)</option>
                <option value="2,500 kVA">2,500 kVA (≤ 2,500 kVA - ผจก.)</option>
                <option value="3,150 kVA">3,150 kVA (&gt; 2,500 kVA - อฝ.สบ.)</option>
                <option value="4,000 kVA">4,000 kVA (&gt; 2,500 kVA - อฝ.สบ.)</option>
                <option value="5,000 kVA">5,000 kVA (&gt; 2,500 kVA - อฝ.สบ.)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                แรงดัน (Voltage Level) <span className="text-rose-500">*</span>
              </label>
              <select
                value={voltageLevel}
                onChange={(e) => {
                  const newVoltage = e.target.value as VoltageLevel;
                  setVoltageLevel(newVoltage);
                  // คำนวณอำนาจลงนามอัตโนมัติตามเกณฑ์
                  const autoAuth = calculateSigningAuthority(newVoltage, transformerSize);
                  setSigningAuthority(autoAuth);
                }}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-400 focus:bg-white outline-none font-mono"
              >
                <option value="22-33 kV">22-33 kV (ระบบแรงดัน 22-33 kV)</option>
                <option value="115 kV">115 kV (ระบบแรงดันสูงพิเศษ 115 kV)</option>
              </select>
            </div>
          </div>

          {/* กล่องสรุปเกณฑ์อำนาจลงนาม กฟภ. (22 kV <= 2500 = ผจก, 22 kV > 2500 = อฝ.สบ, 115 kV = ผชก) */}
          <div className="bg-purple-50/70 border border-purple-200/80 rounded-xl p-3 text-xs space-y-1.5">
            <div className="flex items-center justify-between font-bold text-purple-950">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-purple-700" />
                <span>เกณฑ์กำหนดอำนาจลงนามสัญญา กฟภ.</span>
              </span>
              <span className="text-[11px] bg-purple-200 text-purple-900 px-2 py-0.5 rounded-full font-mono font-semibold">
                คำนวณอัตโนมัติ
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 pt-1 text-[11px]">
              <div
                className={`p-1.5 rounded-lg border transition-all ${
                  voltageLevel === '22-33 kV' && parseInt(transformerSize.replace(/[^0-9]/g, ''), 10) <= 2500
                    ? 'bg-sky-100/90 border-sky-300 text-sky-950 font-bold ring-2 ring-sky-400'
                    : 'bg-white/60 border-slate-200 text-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>22 kV ≤ 2,500 kVA</span>
                  <span className="text-sky-700 font-extrabold">ผจก.</span>
                </div>
                <div className="text-[10px] text-slate-500 font-normal">ผู้จัดการ กฟภ.</div>
              </div>

              <div
                className={`p-1.5 rounded-lg border transition-all ${
                  voltageLevel === '22-33 kV' && parseInt(transformerSize.replace(/[^0-9]/g, ''), 10) > 2500
                    ? 'bg-amber-100/90 border-amber-300 text-amber-950 font-bold ring-2 ring-amber-400'
                    : 'bg-white/60 border-slate-200 text-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>22 kV &gt; 2,500 kVA</span>
                  <span className="text-amber-700 font-extrabold">อฝ.สบ.</span>
                </div>
                <div className="text-[10px] text-slate-500 font-normal">ผอ.ฝ่ายสัญญาฯ</div>
              </div>

              <div
                className={`p-1.5 rounded-lg border transition-all ${
                  voltageLevel === '115 kV'
                    ? 'bg-purple-100/90 border-purple-300 text-purple-950 font-bold ring-2 ring-purple-400'
                    : 'bg-white/60 border-slate-200 text-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>115 kV</span>
                  <span className="text-purple-700 font-extrabold">ผชก.</span>
                </div>
                <div className="text-[10px] text-slate-500 font-normal">ผู้ช่วยผู้ว่าการ</div>
              </div>
            </div>

            <div className="text-[11px] text-purple-900 pt-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              <span>ผลการคำนวณตามข้อมูลปัจจุบัน: <strong>{getAuthorityRuleText(voltageLevel, transformerSize)}</strong></span>
            </div>
          </div>

          {/* Row 5: ผู้มีอำนาจลงนาม (ระบุแค่ว่าอำนาจใคร เช่น ผจก., อฝ.สบ., ผชก.) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                ผู้มีอำนาจลงนาม <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-purple-700 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-purple-600" />
                กำหนดตามเกณฑ์หม้อแปลงอัตโนมัติ
              </span>
            </div>
            <select
              value={signingAuthority}
              onChange={(e) => setSigningAuthority(e.target.value as SigningAuthority)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-400 focus:bg-white outline-none font-semibold text-purple-900"
            >
              {SIGNING_AUTHORITIES.map((auth) => (
                <option key={auth.value} value={auth.value}>
                  {auth.label} - {auth.desc}
                </option>
              ))}
            </select>
            <span className="text-[11px] text-slate-400 mt-1 block">
              ระดับอำนาจลงนามสัญญาของ กฟภ.: {SIGNING_AUTHORITIES.find((a) => a.value === signingAuthority)?.desc}
            </span>
          </div>

          {/* Option: แนบสัญญาเลยหรือไม่ */}
          <div className="pt-2 border-t border-slate-100">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={attachContractNow}
                onChange={(e) => setAttachContractNow(e.target.checked)}
                className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-400"
              />
              <span className="text-xs font-semibold text-slate-800">
                ต้องการแนบไฟล์สัญญาซื้อขายไฟฟ้าทันที
              </span>
            </label>

            {attachContractNow && (
              <div className="mt-3 p-3 bg-sky-50/50 rounded-xl border border-sky-200 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">เลขที่สัญญา</label>
                    <input
                      type="text"
                      value={contractNumber}
                      onChange={(e) => setContractNumber(e.target.value)}
                      placeholder="เช่น PPA-PEA-2026/0580"
                      className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-slate-200 rounded-lg outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">ประเภทสัญญา</label>
                    <select
                      value={contractType}
                      onChange={(e) => setContractType(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-none text-slate-900 font-medium"
                    >
                      {CONTRACT_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">ชื่อไฟล์สัญญา</label>
                    <input
                      type="text"
                      value={fileName}
                      onChange={(e) => setFileName(e.target.value)}
                      placeholder="เช่น สัญญาซื้อขายไฟฟ้า_2026.pdf"
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs shadow-sky-300 transition-all cursor-pointer"
            >
              บันทึกข้อมูลผู้ใช้ไฟฟ้า
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
