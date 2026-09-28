import React from 'react';
import { ElectricityConsumer } from '../types/contract';

export type TabType = 'ทั้งหมด' | 'แนบไฟล์แล้ว' | 'รอตรวจสอบไฟล์สัญญา' | 'เสร็จสิ้น';

interface FilterTabsProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  consumers: ElectricityConsumer[];
}

export const FilterTabs: React.FC<FilterTabsProps> = ({
  activeTab,
  onChangeTab,
  consumers,
}) => {
  const counts = {
    ทั้งหมด: consumers.length,
    แนบไฟล์แล้ว: consumers.filter((c) => c.contractStatus === 'uploaded').length,
    รอตรวจสอบไฟล์สัญญา: consumers.filter((c) => c.contractStatus === 'pending_review').length,
    เสร็จสิ้น: consumers.filter((c) => c.contractStatus === 'completed').length,
  };

  const tabs: { label: TabType; count: number }[] = [
    { label: 'ทั้งหมด', count: counts['ทั้งหมด'] },
    { label: 'แนบไฟล์แล้ว', count: counts['แนบไฟล์แล้ว'] },
    { label: 'รอตรวจสอบไฟล์สัญญา', count: counts['รอตรวจสอบไฟล์สัญญา'] },
    { label: 'เสร็จสิ้น', count: counts['เสร็จสิ้น'] },
  ];

  return (
    <div className="flex items-center gap-1.5 p-1.5 bg-sky-50/80 border border-sky-100 rounded-xl overflow-x-auto">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.label;
        return (
          <button
            key={tab.label}
            onClick={() => onChangeTab(tab.label)}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
              isActive
                ? 'bg-white text-sky-800 shadow-xs border border-sky-200/80 font-semibold'
                : 'text-slate-600 hover:text-sky-900 hover:bg-sky-100/50'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-2 py-0.5 text-xs rounded-full font-mono tabular-nums transition-colors ${
                isActive
                  ? 'bg-sky-100 text-sky-800 font-bold'
                  : 'bg-white/80 text-slate-500 border border-slate-200/50'
              }`}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
