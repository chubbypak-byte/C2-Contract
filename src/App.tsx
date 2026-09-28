import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { StatsOverview } from './components/StatsOverview';
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
import { ElectricityConsumer, ContractStatus, ContractDetails, NotificationItem, AttachedFile } from './types/contract';
import { exportToCSV, getStatusLabel } from './utils/formatters';

export default function App() {
  const [consumers, setConsumers] = useState<ElectricityConsumer[]>(INITIAL_CONSUMERS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  // Filters
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

  // Filtered consumers logic
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

  // Handler: Add new consumer
  const handleAddConsumer = (newConsumer: ElectricityConsumer) => {
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
    setConsumers((prev) =>
      prev.map((c) => {
        if (c.id === consumerId) {
          const filesCount = attachedFilesCount !== undefined 
            ? attachedFilesCount 
            : (contractDetails.files ? contractDetails.files.length : (c.attachedFilesCount || 1));
          const verified = verifiedFilesCount !== undefined 
            ? verifiedFilesCount 
            : (newStatus === 'completed' ? filesCount : c.verifiedFilesCount);

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
      message: activityLog || `สัญญาเลขที่ ${contractDetails.contractNumber} เปลี่ยนสถานะเป็น ${getStatusLabel(newStatus)}`,
      type: newStatus === 'completed' ? 'success' : newStatus === 'pending_review' ? 'warning' : 'info',
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

  // Handler: Real-time simulation event
  const handleSimulateRealtimeEvent = () => {
    setIsSimulating(true);

    setTimeout(() => {
      // Find a consumer that can be advanced
      const candidateIndex = consumers.findIndex(
        (c) => c.contractStatus === 'pending_upload' || c.contractStatus === 'uploaded' || c.contractStatus === 'pending_review'
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
          nextVerified = nextAttached; // All verified
          title = '✅ อนุมัติสัญญาสำเร็จ';
          message = `สัญญาซื้อขายไฟฟ้าของ ${current.location.split(' ')[0]} ผ่านการตรวจครบทุกไฟล์ (${nextVerified}/${nextAttached}) และอนุมัติแล้ว`;
        }

        const updatedDetails: ContractDetails = current.contractDetails || {
          contractNumber: `PPA-AUTO-${Math.floor(Math.random() * 900) + 100}`,
          contractType: 'สัญญาซื้อขายไฟฟ้าแรงดันปานกลาง-สูง (TOU)',
          contractDate: new Date().toISOString().split('T')[0],
          effectiveDate: new Date().toISOString().split('T')[0],
          expireDate: '2031-12-31',
          capacityKW: 1200,
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
          type: nextStatus === 'completed' ? 'success' : nextStatus === 'pending_review' ? 'warning' : 'info',
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
        setSelectedForView(found);
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
    exportToCSV(filteredConsumers, `electricity_contracts_${new Date().toISOString().split('T')[0]}.csv`);
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
      {/* 1. Header with 3-zone Top Bar Contract */}
      <Header
        notifications={notifications}
        onOpenNotifications={() => setIsNotificationOpen(true)}
        onSimulateEvent={handleSimulateRealtimeEvent}
        isSimulating={isSimulating}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* 2. Modern Hero Banner with generated power grid graphic */}
        <HeroBanner
          onQuickSearchFocus={() => {
            const el = document.getElementById('table-section');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          pendingCount={pendingCount}
        />

        {/* 3. Summary Statistics Cards */}
        <StatsOverview
          consumers={consumers}
          onSelectTab={(tab) => {
            if (tab === 'ทั้งหมด' || tab === 'แนบไฟล์แล้ว' || tab === 'รอตรวจสอบไฟล์สัญญา' || tab === 'เสร็จสิ้น') {
              setActiveTab(tab as TabType);
            }
          }}
          activeTab={activeTab}
        />

        {/* 4. Table Section Container */}
        <section id="table-section" className="space-y-4">
          {/* Section Controls: Filter Tabs & Quick Action */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* REQUIRED: ตัวกรองตารางแบบ Tab ให้เลือก: ทั้งหมด, แนบไฟล์แล้ว, รอตรวจสอบไฟล์สัญญา, เสร็จสิ้น */}
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

          {/* Search Bar with live multi-criteria search and export */}
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

          {/* REQUIRED: หน้าแรก (หน้าหลัก) แสดงข้อมูลผู้ใช้ไฟฟ้า เป็นตาราง
              คอลัมน์: การไฟฟ้า, รหัสการไฟฟ้า, หมายเลขผู้ใช้ไฟฟ้า, การติดตั้ง, สถานที่ใช้ไฟฟ้า, ขนาดหม้อแปลง, แรงดัน, อำนาจลงนาม
              ปุ่ม: เพิ่มไฟล์สัญญาอยู่ข้างๆในแต่ละบรรทัด
              ปุ่ม: เพิ่มข้อมูลไว้ด้านขวาบนของตาราง */}
          <ConsumerTable
            consumers={filteredConsumers}
            onOpenUploadModal={(consumer) => setSelectedForUpload(consumer)}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onViewContract={(consumer) => setSelectedForView(consumer)}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-12 bg-white border-t border-sky-100 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">ระบบจัดเก็บและติดตามสัญญาซื้อขายไฟฟ้า</span>
            <span>·</span>
            <span>การไฟฟ้าส่วนภูมิภาค (กฟภ.)</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>รองรับ Vercel Deployment & PostgreSQL</span>
            <span>·</span>
            <span>สถาปัตยกรรม High-Availability</span>
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
          setSelectedForView(null);
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

      {/* Real-time Floating Toast Alert */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
