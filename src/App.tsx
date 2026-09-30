import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { Sidebar, MainNavTab } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { PermissionsManagement } from './components/PermissionsManagement';
import { FilterTabs, TabType } from './components/FilterTabs';
import { SearchBar } from './components/SearchBar';
import { ConsumerTable } from './components/ConsumerTable';
import { AddConsumerModal } from './components/AddConsumerModal';
import { ContractUploadModal } from './components/ContractUploadModal';
import { ContractDetailDrawer } from './components/ContractDetailDrawer';
import { ContractVerificationPage } from './components/ContractVerificationPage';
import { NotificationDrawer } from './components/NotificationDrawer';
import { Toast, ToastMessage } from './components/Toast';
import { INITIAL_CONSUMERS, INITIAL_NOTIFICATIONS } from './data/initialData';
import {
  ElectricityConsumer,
  ContractStatus,
  ContractDetails,
  NotificationItem,
  AttachedFile,
  CONTRACT_TYPES,
} from './types/contract';
import {
  UserRole,
  RoleDefinition,
  RolePermissions,
  DEFAULT_ROLES,
} from './types/permissions';
import { exportToCSV, getStatusLabel } from './utils/formatters';

export default function App() {
  const [consumers, setConsumers] = useState<ElectricityConsumer[]>(INITIAL_CONSUMERS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  // Main Navigation Tab (Left Sidebar)
  // 1. Dashboard สถานะสัญญาซื้อขายไฟฟ้า
  // 2. ทะเบียนสัญญาซื้อขายไฟฟ้า
  // 3. การกำหนดสิทธิ์
  const [currentNavTab, setCurrentNavTab] = useState<MainNavTab>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Role & Permissions State (RBAC)
  const [currentRole, setCurrentRole] = useState<UserRole>('legal_officer');
  const [rolesConfig, setRolesConfig] = useState<Record<UserRole, RoleDefinition>>(DEFAULT_ROLES);

  const activeRoleDefinition = rolesConfig[currentRole];
  const activePermissions = activeRoleDefinition.permissions;

  // Filters for Tab 2: ทะเบียนสัญญาซื้อขายไฟฟ้า
  const [activeTab, setActiveTab] = useState<TabType>('ทั้งหมด');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUtility, setSelectedUtility] = useState('all');
  const [selectedVoltage, setSelectedVoltage] = useState('all');

  // Modals & Drawers
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedForUpload, setSelectedForUpload] = useState<ElectricityConsumer | null>(null);
  const [selectedForView, setSelectedForView] = useState<ElectricityConsumer | null>(null);
  const [selectedForVerification, setSelectedForVerification] = useState<ElectricityConsumer | null>(null);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // Filtered consumers logic for registry
  const filteredConsumers = useMemo(() => {
    return consumers.filter((item) => {
      // 1. Tab filter
      if (activeTab === 'แนบไฟล์แล้ว' && item.contractStatus !== 'uploaded') {
        return false;
      }
      if (activeTab === 'รอตรวจสอบไฟล์สัญญา' && item.contractStatus !== 'pending_review') {
        return false;
      }
      if (activeTab === 'เสร็จสิ้น' && item.contractStatus !== 'completed') {
        return false;
      }

      // 2. Utility agency filter
      if (selectedUtility !== 'all') {
        if (item.utility !== selectedUtility && !item.utility.includes(selectedUtility)) return false;
      }

      // 3. Voltage filter
      if (selectedVoltage !== 'all' && item.voltageLevel !== selectedVoltage) {
        return false;
      }

      // 4. Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchAccount = item.accountNumber.toLowerCase().includes(q);
        const matchInstall = item.installationNumber.toLowerCase().includes(q);
        const matchCode = item.utilityCode.toLowerCase().includes(q);
        const matchLocation = item.location.toLowerCase().includes(q);
        const matchSignatory = item.authorizedSignatory.toLowerCase().includes(q);
        const matchUtility = item.utility.toLowerCase().includes(q);
        const matchContractNo = item.contractDetails?.contractNumber?.toLowerCase().includes(q) || false;

        if (
          !matchAccount &&
          !matchInstall &&
          !matchCode &&
          !matchLocation &&
          !matchSignatory &&
          !matchUtility &&
          !matchContractNo
        ) {
          return false;
        }
      }

      return true;
    });
  }, [consumers, activeTab, selectedUtility, selectedVoltage, searchQuery]);

  // Handler: Permission Denied Toast
  const handlePermissionDenied = (actionName: string) => {
    setToast({
      id: `toast-perm-${Date.now()}`,
      title: 'สิทธิ์การใช้งานถูกจำกัด',
      message: `บทบาท "${activeRoleDefinition.title.split(' ')[0]}" ไม่มีสิทธิ์ "${actionName}" ตามนโยบายความปลอดภัย`,
      type: 'warning',
    });
  };

  // Handler: Add new consumer
  const handleAddConsumer = (newConsumer: ElectricityConsumer) => {
    if (!activePermissions.canEditData) {
      handlePermissionDenied('เพิ่มข้อมูลผู้ใช้ไฟฟ้า');
      return;
    }

    setConsumers((prev) => [newConsumer, ...prev]);

    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'เพิ่มข้อมูลผู้ใช้ไฟฟ้ารายใหม่',
      message: `บันทึกข้อมูล ${newConsumer.location.split(' ')[0]} หมายเลข CA: ${newConsumer.accountNumber} เรียบร้อย`,
      type: 'info',
      timestamp: 'เมื่อสักครู่',
      consumerId: newConsumer.id,
      accountNumber: newConsumer.accountNumber,
      isRead: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);

    setToast({
      id: `toast-${Date.now()}`,
      title: 'เพิ่มข้อมูลสำเร็จ',
      message: `บันทึกข้อมูล ${newConsumer.location.split(' ')[0]} เรียบร้อยแล้ว`,
      type: 'success',
    });
  };

  // Handler: Delete consumer
  const handleDeleteConsumer = (consumer: ElectricityConsumer) => {
    if (!activePermissions.canDeleteData) {
      handlePermissionDenied('ลบข้อมูลสัญญา');
      return;
    }

    setConsumers((prev) => prev.filter((c) => c.id !== consumer.id));
    setToast({
      id: `toast-${Date.now()}`,
      title: 'ลบข้อมูลสำเร็จ',
      message: `ลบข้อมูลสัญญาหมายเลข CA: ${consumer.accountNumber} เรียบร้อยแล้ว`,
      type: 'info',
    });
  };

  // Handler: Save / Upload contract
  const handleSaveContract = (
    consumerId: string,
    contractDetails: ContractDetails,
    newStatus: ContractStatus,
    activityLog: string,
    attachedFilesCount?: number,
    verifiedFilesCount?: number,
    consumerUpdates?: Partial<ElectricityConsumer>
  ) => {
    if (!activePermissions.canUploadFiles && !activePermissions.canEditData) {
      handlePermissionDenied('อัพโหลดหรือแก้ไขไฟล์สัญญา');
      return;
    }

    setConsumers((prev) =>
      prev.map((c) => {
        if (c.id === consumerId) {
          const filesCount =
            attachedFilesCount !== undefined
              ? attachedFilesCount
              : contractDetails.files
              ? contractDetails.files.length
              : c.attachedFilesCount || 1;
          const verified =
            verifiedFilesCount !== undefined
              ? verifiedFilesCount
              : newStatus === 'completed'
              ? filesCount
              : c.verifiedFilesCount;

          return {
            ...c,
            ...consumerUpdates,
            contractDetails,
            contractStatus: newStatus,
            attachedFilesCount: filesCount,
            verifiedFilesCount: verified,
            updatedAt: new Date().toLocaleString('th-TH'),
          };
        }
        return c;
      })
    );

    const target = consumers.find((c) => c.id === consumerId);

    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: `อัปเดตสถานะสัญญา: ${getStatusLabel(newStatus)}`,
      message:
        activityLog ||
        `สัญญาเลขที่ ${contractDetails.contractNumber} เปลี่ยนสถานะเป็น ${getStatusLabel(newStatus)}`,
      type:
        newStatus === 'completed'
          ? 'success'
          : newStatus === 'pending_review'
          ? 'warning'
          : 'info',
      timestamp: 'เมื่อสักครู่',
      consumerId,
      accountNumber: target?.accountNumber,
      isRead: false,
      statusChange: newStatus,
    };
    setNotifications((prev) => [newNotif, ...prev]);

    setToast({
      id: `toast-${Date.now()}`,
      title: `สถานะสัญญา: ${getStatusLabel(newStatus)}`,
      message: `บันทึกและอัปเดตสถานะสัญญา ${contractDetails.contractNumber} สำเร็จ`,
      type: newStatus === 'completed' ? 'success' : 'info',
    });
  };

  // Handler: Confirm contract verification from verification page
  const handleConfirmVerification = (
    consumerId: string,
    verifiedFiles: AttachedFile[],
    reviewNotes: string,
    reviewerName: string
  ) => {
    if (!activePermissions.canVerifyContract) {
      handlePermissionDenied('ตรวจสอบและรับรองสัญญา');
      return;
    }

    setConsumers((prev) =>
      prev.map((c) => {
        if (c.id === consumerId) {
          const updatedDetails: ContractDetails = {
            ...c.contractDetails,
            contractNumber:
              c.contractDetails?.contractNumber || `PPA-PEA-${c.utilityCode}/0101`,
            contractType:
              c.contractDetails?.contractType &&
              (CONTRACT_TYPES as readonly string[]).includes(c.contractDetails.contractType)
                ? c.contractDetails.contractType
                : 'สัญญาหลัก',
            contractDate: c.contractDetails?.contractDate || '2026-01-15',
            expireDate: c.contractDetails?.expireDate || '2031-01-31',
            securityDeposit: c.contractDetails?.securityDeposit || 1000000,
            signingAuthority:
              c.contractDetails?.signingAuthority || c.signingAuthority || 'ผจก.',
            reviewedBy: reviewerName,
            reviewedAt: new Date().toLocaleString('th-TH'),
            reviewNotes,
            files: verifiedFiles,
          };

          return {
            ...c,
            contractDetails: updatedDetails,
            contractStatus: 'completed' as ContractStatus,
            attachedFilesCount: verifiedFiles.length,
            verifiedFilesCount: verifiedFiles.length,
            updatedAt: new Date().toLocaleString('th-TH'),
          };
        }
        return c;
      })
    );

    const target = consumers.find((c) => c.id === consumerId);

    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'อนุมัติและรับรองสัญญาเรียบร้อย',
      message: `สัญญาซื้อขายไฟฟ้าของ ${
        target?.consumerName || target?.location.split(' ')[0]
      } ตรวจสอบและรับรองสำเร็จแล้ว`,
      type: 'success',
      timestamp: 'เมื่อสักครู่',
      consumerId,
      accountNumber: target?.accountNumber,
      isRead: false,
      statusChange: 'completed',
    };
    setNotifications((prev) => [newNotif, ...prev]);

    setToast({
      id: `toast-${Date.now()}`,
      title: 'รับรองสัญญาสำเร็จ',
      message: `ตรวจสอบและรับรองสัญญาซื้อขายไฟฟ้าเรียบร้อยแล้ว สถานะเปลี่ยนเป็น เสร็จสิ้น`,
      type: 'success',
    });
  };

  // Handler: Return to home page (กดรูปสายฟ้า ให้กลับหน้าหลักทุกครั้ง)
  const handleGoHome = () => {
    setSelectedForVerification(null);
    setSelectedForUpload(null);
    setSelectedForView(null);
    setIsAddModalOpen(false);
    setIsNotificationOpen(false);
    setCurrentNavTab('dashboard');
    setActiveTab('ทั้งหมด');
    setSearchQuery('');
    setSelectedUtility('all');
    setSelectedVoltage('all');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setToast({
      id: `toast-${Date.now()}`,
      title: 'กลับสู่ Dashboard หน้าหลัก',
      message: 'รีเซ็ตมุมมองและแสดงแดชบอร์ดภาพรวมเรียบร้อย',
      type: 'info',
    });
  };

  // Handler: Real-time simulation event
  const handleSimulateRealtimeEvent = () => {
    setIsSimulating(true);

    setTimeout(() => {
      const candidateIndex = consumers.findIndex(
        (c) =>
          c.contractStatus === 'pending_upload' ||
          c.contractStatus === 'uploaded' ||
          c.contractStatus === 'pending_review'
      );

      if (candidateIndex !== -1) {
        const current = consumers[candidateIndex];
        let nextStatus: ContractStatus = 'uploaded';
        let title = '';
        let message = '';
        let nextAttached = current.attachedFilesCount || 2;
        let nextVerified = current.verifiedFilesCount || 0;

        if (current.contractStatus === 'pending_upload') {
          nextStatus = 'uploaded';
          nextAttached = 2;
          nextVerified = 0;
          title = '⚡ เอกสารเข้าใหม่แบบเรียลไทม์';
          message = `${current.location.split(' ')[0]} ได้อัปโหลดไฟล์สัญญาซื้อขายไฟฟ้าฉบับลงนาม (แนบ ${nextAttached} ไฟล์) เข้าระบบแล้ว`;
        } else if (current.contractStatus === 'uploaded') {
          nextStatus = 'pending_review';
          nextAttached = current.attachedFilesCount || 3;
          nextVerified = Math.max(1, (current.verifiedFilesCount || 0) + 1);
          title = '⏳ ตรวจสอบเอกสารสัญญา';
          message = `สัญญาของ ${current.location.split(' ')[0]} ตรวจแล้ว ${nextVerified}/${nextAttached} ไฟล์ อยู่ระหว่างตรวจพิกัดหม้อแปลง ${current.transformerSize}`;
        } else {
          nextStatus = 'completed';
          nextAttached = Math.max(1, current.attachedFilesCount);
          nextVerified = nextAttached;
          title = '✅ อนุมัติสัญญาสำเร็จ';
          message = `สัญญาซื้อขายไฟฟ้าของ ${current.location.split(' ')[0]} ผ่านการตรวจครบทุกไฟล์ (${nextVerified}/${nextAttached}) และอนุมัติแล้ว`;
        }

        const updatedDetails: ContractDetails = current.contractDetails || {
          contractNumber: `PPA-AUTO-${Math.floor(Math.random() * 900) + 100}`,
          contractType: 'สัญญาหลัก',
          contractDate: new Date().toISOString().split('T')[0],
          expireDate: '2031-12-31',
          securityDeposit: 850000,
          fileName: `สัญญาซื้อขายไฟฟ้า_${current.location.split(' ')[0]}_ลงนาม.pdf`,
          fileSize: '4.6 MB',
          uploadedAt: new Date().toLocaleString('th-TH'),
        };

        setConsumers((prev) =>
          prev.map((item, idx) =>
            idx === candidateIndex
              ? {
                  ...item,
                  contractStatus: nextStatus,
                  attachedFilesCount: nextAttached,
                  verifiedFilesCount: nextVerified,
                  contractDetails: updatedDetails,
                  updatedAt: new Date().toLocaleString('th-TH'),
                }
              : item
          )
        );

        const simNotif: NotificationItem = {
          id: `notif-${Date.now()}`,
          title,
          message,
          type:
            nextStatus === 'completed'
              ? 'success'
              : nextStatus === 'pending_review'
              ? 'warning'
              : 'info',
          timestamp: 'เมื่อสักครู่',
          consumerId: current.id,
          accountNumber: current.accountNumber,
          isRead: false,
          statusChange: nextStatus,
        };
        setNotifications((prev) => [simNotif, ...prev]);

        setToast({
          id: `toast-${Date.now()}`,
          title,
          message,
          type: nextStatus === 'completed' ? 'success' : 'warning',
        });
      } else {
        setToast({
          id: `toast-${Date.now()}`,
          title: 'จำลองการแจ้งเตือนสด',
          message: 'ระบบทำงานเป็นปกติ เอกสารสัญญาทั้งหมดอยู่ในสถานะเสร็จสิ้นและตรวจครบถ้วน',
          type: 'info',
        });
      }

      setIsSimulating(false);
    }, 600);
  };

  const handleMarkAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleSelectNotification = (notif: NotificationItem) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
    );
    if (notif.consumerId) {
      const found = consumers.find((c) => c.id === notif.consumerId);
      if (found) {
        setIsNotificationOpen(false);
        if (activePermissions.canViewDetails) {
          setSelectedForView(found);
        } else {
          setCurrentNavTab('registry');
          handlePermissionDenied('กดดูรายละเอียดสัญญา');
        }
      }
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedUtility('all');
    setSelectedVoltage('all');
    setActiveTab('ทั้งหมด');
  };

  const handleExportCSV = () => {
    exportToCSV(
      filteredConsumers,
      `electricity_contracts_${new Date().toISOString().split('T')[0]}.csv`
    );
    setToast({
      id: `toast-${Date.now()}`,
      title: 'ส่งออกไฟล์ CSV สำเร็จ',
      message: `ส่งออกข้อมูลจำนวน ${filteredConsumers.length} รายการ เรียบร้อยแล้ว`,
      type: 'success',
    });
  };

  const pendingCount = consumers.filter((c) => c.contractStatus === 'pending_review').length;

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 flex flex-col font-['Prompt','Plus_Jakarta_Sans',sans-serif]">
      {/* 1. Header with Brand, Logo, Title, and User Profile / Role Switcher */}
      <Header
        notifications={notifications}
        onOpenNotifications={() => setIsNotificationOpen(true)}
        onSimulateEvent={handleSimulateRealtimeEvent}
        isSimulating={isSimulating}
        onGoHome={handleGoHome}
        currentRole={activeRoleDefinition}
        rolesConfig={rolesConfig}
        onChangeRole={(newRole) => {
          setCurrentRole(newRole);
          setToast({
            id: `toast-role-${Date.now()}`,
            title: `สลับบทบาทเป็น: ${rolesConfig[newRole].title.split(' ')[0]}`,
            message:
              newRole === 'viewer'
                ? 'คุณอยู่ในสิทธิ์ผู้เข้าชม (Viewer): ดู Dashboard และทะเบียนได้ แต่ไม่สามารถกดดูรายละเอียดสัญญาได้'
                : `อัปเดตสิทธิ์การใช้งานตามบทบาทเรียบร้อยแล้ว`,
            type: newRole === 'viewer' ? 'warning' : 'info',
          });
        }}
        onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
      />

      {/* Main Layout: Left Sidebar + Right Content Area */}
      <div className="flex-1 flex flex-row w-full max-w-[1600px] mx-auto">
        {/* REQUIRED: แถบเมนูมาอยู่ข้างซ้าย มี tab ดังนี้
            1. Dashboard สถานะสัญญาซื้อขายไฟฟ้า
            2. ทะเบียนสัญญาซื้อขายไฟฟ้า
            3. การกำหนดสิทธิ์ */}
        <Sidebar
          currentTab={currentNavTab}
          onSelectTab={(tab) => setCurrentNavTab(tab)}
          pendingReviewCount={pendingCount}
          totalContractsCount={consumers.length}
          currentRole={activeRoleDefinition}
          canViewPermissions={activePermissions.canManagePermissions}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Right Main Content Area */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          {/* TAB 1: Dashboard สถานะสัญญาซื้อขายไฟฟ้า */}
          {currentNavTab === 'dashboard' && (
            <DashboardView
              consumers={consumers}
              onGoToRegistry={(tabFilter) => {
                if (tabFilter && (tabFilter === 'ทั้งหมด' || tabFilter === 'แนบไฟล์แล้ว' || tabFilter === 'รอตรวจสอบไฟล์สัญญา' || tabFilter === 'เสร็จสิ้น')) {
                  setActiveTab(tabFilter as TabType);
                }
                setCurrentNavTab('registry');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onVerifyConsumer={(consumer) => {
                if (!activePermissions.canVerifyContract) {
                  handlePermissionDenied('ตรวจสอบสัญญา');
                  return;
                }
                setSelectedForVerification(consumer);
              }}
              canVerifyContract={activePermissions.canVerifyContract}
              canViewDetails={activePermissions.canViewDetails}
            />
          )}

          {/* TAB 2: ทะเบียนสัญญาซื้อขายไฟฟ้า */}
          {currentNavTab === 'registry' && (
            <div className="space-y-5">
              {/* Registry Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-sky-100 shadow-xs">
                <div>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                    ทะเบียนสัญญาซื้อขายไฟฟ้า
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    ศูนย์รวมข้อมูลสัญญาผู้ใช้ไฟฟ้ารายใหญ่ การไฟฟ้าส่วนภูมิภาค (กฟภ.) ค้นหา กรองสถานะ และตรวจรับไฟล์สัญญา
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="text-xs font-semibold px-3 py-1 bg-sky-50 text-sky-700 rounded-full border border-sky-200">
                    ทั้งหมด {consumers.length} รายการ
                  </span>
                </div>
              </div>

              {/* Section Controls: Filter Tabs */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                <FilterTabs
                  activeTab={activeTab}
                  onChangeTab={setActiveTab}
                  consumers={consumers}
                />

                <div className="text-xs text-slate-500 flex items-center gap-1.5 self-end md:self-center">
                  <span>สถานะตัวกรอง:</span>
                  <span className="font-semibold text-sky-800">{activeTab}</span>
                </div>
              </div>

              {/* Search Bar with multi-criteria search and CSV export */}
              <SearchBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedUtility={selectedUtility}
                onUtilityChange={setSelectedUtility}
                selectedVoltage={selectedVoltage}
                onVoltageChange={setSelectedVoltage}
                onExport={handleExportCSV}
                onReset={handleResetFilters}
                filteredCount={filteredConsumers.length}
                totalCount={consumers.length}
              />

              {/* Consumer Table with Enforced Permissions */}
              <ConsumerTable
                consumers={filteredConsumers}
                onOpenUploadModal={(consumer) => {
                  if (!activePermissions.canUploadFiles) {
                    handlePermissionDenied('อัพโหลดไฟล์สัญญา');
                    return;
                  }
                  setSelectedForUpload(consumer);
                }}
                onOpenAddModal={() => {
                  if (!activePermissions.canEditData) {
                    handlePermissionDenied('เพิ่มข้อมูลผู้ใช้ไฟฟ้า');
                    return;
                  }
                  setIsAddModalOpen(true);
                }}
                onViewContract={(consumer) => {
                  if (!activePermissions.canViewDetails) {
                    handlePermissionDenied('กดดูรายละเอียดสัญญา');
                    return;
                  }
                  setSelectedForView(consumer);
                }}
                onVerifyContract={(consumer) => {
                  if (!activePermissions.canVerifyContract) {
                    handlePermissionDenied('ตรวจสอบสัญญา');
                    return;
                  }
                  setSelectedForVerification(consumer);
                }}
                onDeleteConsumer={handleDeleteConsumer}
                canViewDetails={activePermissions.canViewDetails}
                canUploadFiles={activePermissions.canUploadFiles}
                canVerifyContract={activePermissions.canVerifyContract}
                canEditData={activePermissions.canEditData}
                canDeleteData={activePermissions.canDeleteData}
                onPermissionDenied={handlePermissionDenied}
              />
            </div>
          )}

          {/* TAB 3: การกำหนดสิทธิ์ */}
          {currentNavTab === 'permissions' && (
            <PermissionsManagement
              currentRole={currentRole}
              onChangeActiveRole={(newRole) => {
                setCurrentRole(newRole);
                setToast({
                  id: `toast-role-${Date.now()}`,
                  title: `สลับบทบาทเป็น: ${rolesConfig[newRole].title.split(' ')[0]}`,
                  message:
                    newRole === 'viewer'
                      ? 'คุณอยู่ในสิทธิ์ผู้เข้าชม (Viewer): ดู Dashboard และทะเบียนได้ แต่ไม่สามารถกดดูรายละเอียดสัญญาได้'
                      : `อัปเดตสิทธิ์การใช้งานตามบทบาทเรียบร้อยแล้ว`,
                  type: newRole === 'viewer' ? 'warning' : 'info',
                });
              }}
              rolesConfig={rolesConfig}
              onUpdateRolePermissions={(roleId, newPermissions) => {
                setRolesConfig((prev) => ({
                  ...prev,
                  [roleId]: {
                    ...prev[roleId],
                    permissions: newPermissions,
                  },
                }));
                setToast({
                  id: `toast-save-perm-${Date.now()}`,
                  title: 'บันทึกการกำหนดสิทธิ์สำเร็จ',
                  message: `อัปเดตสิทธิ์สำหรับบทบาท ${rolesConfig[roleId].title.split(' ')[0]} เรียบร้อยแล้ว`,
                  type: 'success',
                });
              }}
              onResetPermissions={() => {
                setRolesConfig(DEFAULT_ROLES);
                setToast({
                  id: `toast-reset-perm-${Date.now()}`,
                  title: 'รีเซ็ตสิทธิ์มาตรฐาน กฟภ.',
                  message: 'คืนค่าสิทธิ์ตามมาตรฐานของระบบเรียบร้อยแล้ว',
                  type: 'info',
                });
              }}
            />
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="mt-auto bg-white border-t border-sky-100 py-6 text-xs text-slate-500">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">ระบบจัดเก็บและติดตามสัญญาซื้อขายไฟฟ้า</span>
            <span>·</span>
            <span>การไฟฟ้าส่วนภูมิภาค (กฟภ.)</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>พร้อมใช้งานบน Vercel & PostgreSQL</span>
            <span>·</span>
            <span>ระบบกำหนดสิทธิ์ RBAC 4 ระดับ</span>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <AddConsumerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddConsumer}
      />

      <ContractUploadModal
        consumer={selectedForUpload}
        isOpen={Boolean(selectedForUpload)}
        onClose={() => setSelectedForUpload(null)}
        onSaveContract={handleSaveContract}
      />

      <ContractDetailDrawer
        consumer={selectedForView}
        isOpen={Boolean(selectedForView)}
        onClose={() => setSelectedForView(null)}
        onEditContract={(consumer) => {
          if (!activePermissions.canUploadFiles && !activePermissions.canEditData) {
            handlePermissionDenied('แก้ไขสัญญา');
            return;
          }
          setSelectedForView(null);
          setSelectedForUpload(consumer);
        }}
        onVerifyContract={(consumer) => {
          if (!activePermissions.canVerifyContract) {
            handlePermissionDenied('ตรวจสอบสัญญา');
            return;
          }
          setSelectedForView(null);
          setSelectedForVerification(consumer);
        }}
      />

      {/* หน้าตรวจสอบสัญญาซื้อขายไฟฟ้า (แบบแยก 2 ฝั่ง ซ้าย: รายละเอียดสัญญา / ขวา: หน้าสัญญาซื้อขายไฟฟ้า) */}
      <ContractVerificationPage
        consumer={selectedForVerification}
        isOpen={Boolean(selectedForVerification)}
        onClose={() => setSelectedForVerification(null)}
        onConfirmVerification={handleConfirmVerification}
        onOpenUploadModal={(consumer) => {
          if (!activePermissions.canUploadFiles) {
            handlePermissionDenied('อัพโหลดไฟล์สัญญา');
            return;
          }
          setSelectedForVerification(null);
          setSelectedForUpload(consumer);
        }}
      />

      <NotificationDrawer
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={handleMarkAllNotificationsAsRead}
        onSelectNotification={handleSelectNotification}
        onTriggerSimulation={handleSimulateRealtimeEvent}
        isSimulating={isSimulating}
      />

      {/* Floating Toast Alert */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
