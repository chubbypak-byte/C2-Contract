import { ContractStatus } from '../types/contract';

export function getStatusLabel(status: ContractStatus): string {
  switch (status) {
    case 'uploaded':
      return 'แนบไฟล์แล้ว';
    case 'pending_review':
      return 'รอตรวจสอบไฟล์สัญญา';
    case 'needs_revision':
      return 'รอแก้ไขข้อมูล';
    case 'completed':
      return 'เสร็จสิ้น';
    case 'pending_upload':
    default:
      return 'ยังไม่แนบไฟล์';
  }
}

export function getStatusStyle(status: ContractStatus): {
  badgeBg: string;
  dotColor: string;
  textColor: string;
  borderColor: string;
} {
  switch (status) {
    case 'uploaded':
      return {
        badgeBg: 'bg-sky-50 text-sky-700 border-sky-200',
        dotColor: 'bg-sky-500',
        textColor: 'text-sky-700',
        borderColor: 'border-sky-200',
      };
    case 'pending_review':
      return {
        badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
        dotColor: 'bg-amber-500',
        textColor: 'text-amber-700',
        borderColor: 'border-amber-200',
      };
    case 'needs_revision':
      return {
        badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
        dotColor: 'bg-rose-500',
        textColor: 'text-rose-700',
        borderColor: 'border-rose-200',
      };
    case 'completed':
      return {
        badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dotColor: 'bg-emerald-500',
        textColor: 'text-emerald-700',
        borderColor: 'border-emerald-200',
      };
    case 'pending_upload':
    default:
      return {
        badgeBg: 'bg-slate-100 text-slate-600 border-slate-200',
        dotColor: 'bg-slate-400',
        textColor: 'text-slate-600',
        borderColor: 'border-slate-200',
      };
  }
}

export function formatCurrency(amount?: number): string {
  if (amount === undefined || amount === null) return '-';
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function exportToCSV(data: any[], filename = 'electricity_contracts.csv') {
  if (!data || data.length === 0) return;

  const headers = [
    'การไฟฟ้า',
    'รหัสการไฟฟ้า',
    'หมายเลขผู้ใช้ไฟฟ้า (CA)',
    'การติดตั้ง',
    'สถานที่ใช้ไฟฟ้า',
    'ขนาดหม้อแปลง',
    'แรงดัน',
    'อำนาจลงนาม',
    'ไฟล์แนบ',
    'ตรวจแล้ว',
    'สถานะสัญญา',
    'เลขที่สัญญา',
  ];

  const rows = data.map((item) => [
    `"${item.utility || ''}"`,
    `"${item.utilityCode || ''}"`,
    `"${item.accountNumber || ''}"`,
    `"${item.installationNumber || ''}"`,
    `"${(item.location || '').replace(/"/g, '""')}"`,
    `"${item.transformerSize || ''}"`,
    `"${item.voltageLevel || ''}"`,
    `"${(item.authorizedSignatory || '').replace(/"/g, '""')}"`,
    `"${item.attachedFilesCount || 0} ไฟล์"`,
    `"${item.verifiedFilesCount || 0}/${item.attachedFilesCount || 0} ไฟล์"`,
    `"${getStatusLabel(item.contractStatus)}"`,
    `"${item.contractDetails?.contractNumber || '-'}"`,
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
