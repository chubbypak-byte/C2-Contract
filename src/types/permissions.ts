export type UserRole = 'super_admin' | 'legal_officer' | 'data_officer' | 'viewer';

export interface RolePermissions {
  canViewDashboard: boolean; // เข้าดูหน้า Dashboard
  canViewRegistry: boolean; // เข้าดูหน้าทะเบียนสัญญา
  canViewDetails: boolean; // กดเข้าไปดูรายละเอียดสัญญาได้
  canUploadFiles: boolean; // อัพโหลดไฟล์สัญญา
  canEditData: boolean; // แก้ไขข้อมูล
  canDeleteData: boolean; // ลบข้อมูล
  canVerifyContract: boolean; // ตรวจสอบ/รับรองสัญญา
  canManagePermissions: boolean; // กำหนดสิทธิ์
}

export interface RoleDefinition {
  id: UserRole;
  title: string;
  department: string;
  badgeColor: string;
  description: string;
  permissions: RolePermissions;
}

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  avatarText: string;
  lastActive: string;
  status: 'active' | 'inactive';
}

export const DEFAULT_ROLES: Record<UserRole, RoleDefinition> = {
  super_admin: {
    id: 'super_admin',
    title: 'ผู้ดูแลระบบสูงสุด (Super Admin)',
    department: 'ฝ่ายบริหารสัญญาและเทคโนโลยีสารสนเทศ กฟภ.',
    badgeColor: 'bg-purple-100 text-purple-700 border-purple-200',
    description: 'มีสิทธิ์สมบูรณ์ในการจัดการระบบ ดู Dashboard, ทะเบียน, ดูรายละเอียด, อัพโหลด, แก้ไข, ลบข้อมูล, ตรวจสอบสัญญา และกำหนดสิทธิ์ผู้ใช้งาน',
    permissions: {
      canViewDashboard: true,
      canViewRegistry: true,
      canViewDetails: true,
      canUploadFiles: true,
      canEditData: true,
      canDeleteData: true,
      canVerifyContract: true,
      canManagePermissions: true,
    },
  },
  legal_officer: {
    id: 'legal_officer',
    title: 'นิติกรสัญญา / ผู้ตรวจสอบ (Legal Officer)',
    department: 'ฝ่ายนิติการและสัญญาซื้อขายไฟฟ้า กฟภ.',
    badgeColor: 'bg-sky-100 text-sky-800 border-sky-200',
    description: 'มีสิทธิ์ดู Dashboard, ทะเบียน, ดูรายละเอียด, ตรวจสอบรับรองสัญญา, อัพโหลดเอกสาร และแก้ไขข้อมูลสัญญา (ไม่มีสิทธิ์ลบข้อมูลและกำหนดสิทธิ์)',
    permissions: {
      canViewDashboard: true,
      canViewRegistry: true,
      canViewDetails: true,
      canUploadFiles: true,
      canEditData: true,
      canDeleteData: false,
      canVerifyContract: true,
      canManagePermissions: false,
    },
  },
  data_officer: {
    id: 'data_officer',
    title: 'เจ้าหน้าที่บันทึกข้อมูล (Data Entry Officer)',
    department: 'แผนกบริการลูกค้าและสัญญา กฟภ. สาขา',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    description: 'มีสิทธิ์ดู Dashboard, ทะเบียนสัญญา, กดดูรายละเอียด และอัพโหลดไฟล์สัญญาหลัก/แนบท้าย (ไม่มีสิทธิ์แก้ไข ลบ หรือตรวจสอบรับรองสัญญา)',
    permissions: {
      canViewDashboard: true,
      canViewRegistry: true,
      canViewDetails: true,
      canUploadFiles: true,
      canEditData: false,
      canDeleteData: false,
      canVerifyContract: false,
      canManagePermissions: false,
    },
  },
  viewer: {
    id: 'viewer',
    title: 'ผู้เข้าชมทั่วไป / หน่วยงานภายนอก (Viewer)',
    department: 'หน่วยงานประสานงานภายนอก / ผู้สังเกตการณ์',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    description: 'เข้ามาดูหน้า Dashboard สถานะสัญญา และหน้าทะเบียนสัญญาได้เท่านั้น แต่ไม่สามารถกดเข้าไปดูรายละเอียดสัญญาได้ และไม่มีสิทธิ์อัพโหลด แก้ไข หรือลบข้อมูลใดๆ',
    permissions: {
      canViewDashboard: true,
      canViewRegistry: true,
      canViewDetails: false, // ข้อกำหนดสำคัญ: ใครแค่เข้ามาดูหน้า Dashboard และทะเบียนสัญญาได้ แต่กดเข้าไปดูรายละเอียดไม่ได้
      canUploadFiles: false,
      canEditData: false,
      canDeleteData: false,
      canVerifyContract: false,
      canManagePermissions: false,
    },
  },
};

export const INITIAL_SYSTEM_USERS: SystemUser[] = [
  {
    id: 'usr-1',
    name: 'นายกิตติคุณ นิติสารัตถ์',
    email: 'kittikun.pea@pea.co.th',
    role: 'super_admin',
    department: 'ฝ่ายนิติการและสัญญาซื้อขายไฟฟ้า',
    avatarText: 'กต',
    lastActive: 'เมื่อสักครู่',
    status: 'active',
  },
  {
    id: 'usr-2',
    name: 'น.ส.วรรณิศา รัตนประสิทธิ์',
    email: 'wannisa.rat@pea.co.th',
    role: 'legal_officer',
    department: 'กลุ่มงานตรวจสอบสัญญา กฟจ.ชลบุรี',
    avatarText: 'วน',
    lastActive: '10 นาทีที่แล้ว',
    status: 'active',
  },
  {
    id: 'usr-3',
    name: 'นายธนาธิป สิทธิโชค',
    email: 'thanathip.sit@pea.co.th',
    role: 'data_officer',
    department: 'แผนกบริการลูกค้าสัมพันธ์ กฟจ.ระยอง',
    avatarText: 'ธน',
    lastActive: '2 ชั่วโมงที่แล้ว',
    status: 'active',
  },
  {
    id: 'usr-4',
    name: 'นายพงษ์ศักดิ์ ธรรมรัตน์ (ผู้ตรวจสอบภายนอก)',
    email: 'pongsak.auditor@external.pea.co.th',
    role: 'viewer',
    department: 'คณะผู้ตรวจติดตามและประเมินผลภายนอก',
    avatarText: 'พศ',
    lastActive: '1 วันที่แล้ว',
    status: 'active',
  },
];
