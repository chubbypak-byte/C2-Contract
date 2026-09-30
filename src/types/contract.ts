export type ContractStatus = 'pending_upload' | 'uploaded' | 'pending_review' | 'completed';

export type PEABranch =
  | 'กฟจ.ชลบุรี'
  | 'กฟจ.ระยอง'
  | 'กฟส.เพ'
  | 'กฟจ.จันทบุรี'
  | 'กฟส.ท่าใหม่'
  | 'กฟส.ขลุง';

export const PEA_BRANCHES: { name: PEABranch; code: string; province: string }[] = [
  { name: 'กฟจ.ชลบุรี', code: 'H01101', province: 'ชลบุรี' },
  { name: 'กฟจ.ระยอง', code: 'H02101', province: 'ระยอง' },
  { name: 'กฟส.เพ', code: 'H02202', province: 'ระยอง' },
  { name: 'กฟจ.จันทบุรี', code: 'H03108', province: 'จันทบุรี' },
  { name: 'กฟส.ท่าใหม่', code: 'H03202', province: 'จันทบุรี' },
  { name: 'กฟส.ขลุง', code: 'H03302', province: 'จันทบุรี' },
];

export type VoltageLevel = '22-33 kV' | '115 kV';
export const VOLTAGE_LEVELS: VoltageLevel[] = ['22-33 kV', '115 kV'];

// ประเภทสัญญาตามข้อกำหนด มี 7 ประเภท
export const CONTRACT_TYPES = [
  'สัญญาหลัก',
  'สัญญาแนบท้ายเพิ่มขนาดหม้อแปลง',
  'สัญญาแนบท้ายลดขนาดหม้อแปลง',
  'สัญญาแนบท้ายกรณีใช้ไฟฟ้าวงจร 22-33 เป็นสำรองฉุกเฉิน',
  'สัญญาแนบท้ายไฟสำรอง',
  'สัญญาแนบท้ายเปลี่ยนแปลงชื่อ',
  'สัญญาแนบท้ายกรณีใช้ไฟฟ้าวงจร 115 สำรองฉุกเฉิน 115',
] as const;

export type ContractType = typeof CONTRACT_TYPES[number];

// เอกสารและไฟล์แนบ จะมีแค่สัญญาหลัก กับ สัญญาแนบท้ายเท่านั้น
export const ATTACHMENT_CATEGORIES = ['สัญญาหลัก', 'สัญญาแนบท้าย'] as const;
export type AttachmentCategory = typeof ATTACHMENT_CATEGORIES[number];

export type UtilityProvider = PEABranch | string;

export type SigningAuthority = 'ผจก.' | 'อฝ.สบ.' | 'ผชก.';
export const SIGNING_AUTHORITIES: { value: SigningAuthority; label: string; desc: string }[] = [
  { value: 'ผจก.', label: 'ผจก. (ผู้จัดการการไฟฟ้า)', desc: 'ผู้จัดการการไฟฟ้าส่วนภูมิภาค' },
  { value: 'อฝ.สบ.', label: 'อฝ.สบ. (ผู้อำนวยการฝ่าย)', desc: 'ผู้อำนวยการฝ่ายสัญญาและบริการระบบจำหน่าย' },
  { value: 'ผชก.', label: 'ผชก. (ผู้ช่วยผู้ว่าการ)', desc: 'ผู้ช่วยผู้ว่าการการไฟฟ้าส่วนภูมิภาค' },
];

export interface AttachedFile {
  id: string;
  fileName: string;
  fileCategory: string; // เช่น สัญญาซื้อขายไฟฟ้าหลัก, หนังสือค้ำประกัน, แผนผังระบบไฟฟ้า, ผลทดสอบหม้อแปลง
  fileDetails?: string; // รายละเอียดเอกสาร
  fileSize: string;
  pageCount?: number; // จำนวนหน้า (ตามระบบ PLMS กฟภ.)
  uploadedAt: string;
  isVerified: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
}

export interface ElectricityConsumer {
  id: string;
  utility: UtilityProvider; // การไฟฟ้า (กฟฟ.)
  utilityCode: string; // รหัสการไฟฟ้า
  accountNumber: string; // หมายเลขผู้ใช้ไฟฟ้า (CA)
  consumerName?: string; // ชื่อผู้ใช้ไฟฟ้า
  installationNumber: string; // การติดตั้ง
  location: string; // สถานที่ใช้ไฟฟ้า (ที่อยู่)
  transformerSize: string; // ขนาดหม้อแปลง (เช่น 1,250 kVA)
  voltageLevel: string; // แรงดัน (22-33 kV, 115 kV)
  authorizedSignatory: string; // อำนาจลงนาม (ชื่อ-นามสกุล และตำแหน่ง)
  signingAuthority?: SigningAuthority; // อำนาจ (ผจก., อฝ.สบ., ผชก.)
  signatoryPosition?: string;
  contactPhone?: string;
  contactEmail?: string;
  contractStatus: ContractStatus;
  attachedFilesCount: number; // ไฟล์แนบกี่ไฟล์
  verifiedFilesCount: number; // ตรวจแล้วกี่ไฟล์
  contractDetails?: ContractDetails;
  updatedAt: string;
  createdAt: string;
}

export interface ContractDetails {
  contractNumber: string; // เลขที่สัญญา
  contractType: string; // ประเภทสัญญาซื้อขายไฟฟ้า
  contractDate: string; // วันที่ลงนาม / วันที่ทำสัญญา
  effectiveDate?: string; // วันที่เริ่มมีผล (นำออกจากหน้าจอตรวจสอบสัญญาตามคำสั่ง)
  expireDate: string; // วันสิ้นสุดสัญญา
  capacityKW?: number; // กำลังผลิต/ความต้องการพลังไฟฟ้า (kW/MW)
  securityDeposit?: number; // วงเงินหลักประกันสัญญา (บาท)
  signingAuthority?: SigningAuthority; // อำนาจ (ผจก., อฝ.สบ., ผชก.)
  fileName?: string; // ชื่อไฟล์สัญญาหลักที่แนบ
  fileSize?: string;
  uploadedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
  reviewedAt?: string;
  files?: AttachedFile[]; // รายการไฟล์แนบทั้งหมด
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  timestamp: string;
  consumerId?: string;
  accountNumber?: string;
  isRead: boolean;
  statusChange?: ContractStatus;
}
