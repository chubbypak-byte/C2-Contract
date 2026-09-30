import React from 'react';
import { Search, X, Download, Filter, RotateCcw, Building2, User } from 'lucide-react';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedUtility: string;
  onUtilityChange: (utility: string) => void;
  selectedVoltage: string;
  onVoltageChange: (voltage: string) => void;
  selectedAuthority: string;
  onAuthorityChange: (authority: string) => void;
  onExport: () => void;
  onReset: () => void;
  filteredCount: number;
  totalCount: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedUtility,
  onUtilityChange,
  selectedVoltage,
  onVoltageChange,
  selectedAuthority,
  onAuthorityChange,
  onExport,
  onReset,
  filteredCount,
  totalCount,
}) => {
  const isFiltered =
    searchQuery !== '' ||
    selectedUtility !== 'all' ||
    selectedVoltage !== 'all' ||
    selectedAuthority !== 'all';

  return (
    <div className="bg-white p-4 rounded-2xl border border-sky-100 shadow-2xs space-y-3">
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search Input Box with prominent consumer name search highlight */}
        <div className="relative flex-1 group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-sky-600 transition-colors">
            <Search className="w-4 h-4 text-sky-500" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="ค้นหาด้วยชื่อผู้ใช้ไฟฟ้า (เช่น บจก. สยาม, ระยอง), หมายเลข CA, เลขที่สัญญา, การติดตั้ง, รหัสการไฟฟ้า..."
            className="w-full pl-10 pr-9 py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-sm text-slate-800 placeholder-slate-400 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-3 focus:ring-sky-100 transition-all outline-none font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              title="ล้างคำค้นหา"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Dropdown Filters & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Utility Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedUtility}
              onChange={(e) => onUtilityChange(e.target.value)}
              className="bg-transparent text-xs font-medium text-slate-700 outline-none cursor-pointer"
            >
              <option value="all">การไฟฟ้า: ทั้งหมด</option>
              <option value="กฟจ.ชลบุรี">กฟจ.ชลบุรี (H01101)</option>
              <option value="กฟจ.ระยอง">กฟจ.ระยอง (H02101)</option>
              <option value="กฟส.เพ">กฟส.เพ (H02202)</option>
              <option value="กฟจ.จันทบุรี">กฟจ.จันทบุรี (H03108)</option>
              <option value="กฟส.ท่าใหม่">กฟส.ท่าใหม่ (H03202)</option>
              <option value="กฟส.ขลุง">กฟส.ขลุง (H03302)</option>
            </select>
          </div>

          {/* Voltage Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
            <select
              value={selectedVoltage}
              onChange={(e) => onVoltageChange(e.target.value)}
              className="bg-transparent text-xs font-medium text-slate-700 outline-none cursor-pointer"
            >
              <option value="all">แรงดัน: ทุกระดับ</option>
              <option value="22-33 kV">22-33 kV</option>
              <option value="115 kV">115 kV</option>
            </select>
          </div>

          {/* Authority Filter: ผจก. อฝ.สบ หรือ ผชก. (22 kV <= 2500 = ผจก, 22 kV > 2500 = อฝ.สบ, 115 kV = ผชก) */}
          <div className="flex items-center gap-1.5 bg-purple-50/70 border border-purple-200 rounded-xl px-2.5 py-1.5">
            <span className="text-[11px] font-bold text-purple-800">อำนาจ:</span>
            <select
              value={selectedAuthority}
              onChange={(e) => onAuthorityChange(e.target.value)}
              className="bg-transparent text-xs font-semibold text-purple-900 outline-none cursor-pointer"
            >
              <option value="all">อำนาจ: ทุกระดับ</option>
              <option value="ผจก.">ผจก. (22 kV ≤ 2,500 kVA)</option>
              <option value="อฝ.สบ.">อฝ.สบ. (22 kV &gt; 2,500 kVA)</option>
              <option value="ผชก.">ผชก. (115 kV)</option>
            </select>
          </div>

          {/* Reset Filters */}
          {isFiltered && (
            <button
              onClick={onReset}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors cursor-pointer"
              title="ล้างตัวกรองทั้งหมด"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>รีเซ็ต</span>
            </button>
          )}

          {/* Export CSV */}
          <button
            onClick={onExport}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-sky-50/50 border border-slate-200 hover:border-sky-300 rounded-xl transition-colors cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-sky-600" />
            <span className="hidden sm:inline">ส่งออก CSV</span>
          </button>
        </div>
      </div>

      {/* Quick Search Tag Badges & Results feedback */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
          <span className="text-slate-400 flex items-center gap-1">
            <Search className="w-3 h-3 text-sky-500" />
            ค้นหาด่วน:
          </span>
          <button
            type="button"
            onClick={() => onSearchChange('สยาม')}
            className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-sky-100 text-slate-600 hover:text-sky-800 transition-colors cursor-pointer flex items-center gap-1"
          >
            <User className="w-3 h-3 text-sky-600" />
            <span>ชื่อ: บจก. สยาม</span>
          </button>
          <button
            type="button"
            onClick={() => onSearchChange('ระยอง')}
            className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-sky-100 text-slate-600 hover:text-sky-800 transition-colors cursor-pointer flex items-center gap-1"
          >
            <Building2 className="w-3 h-3 text-sky-600" />
            <span>ชื่อ: บจก. ระยอง</span>
          </button>
          <button
            type="button"
            onClick={() => onSearchChange('จันทบุรี')}
            className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-sky-100 text-slate-600 hover:text-sky-800 transition-colors cursor-pointer flex items-center gap-1"
          >
            <span>ชื่อ: จันทบุรี</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {searchQuery && (
            <div className="text-sky-600 truncate max-w-xs font-medium">
              คำค้น: "{searchQuery}"
            </div>
          )}
          <div className="shrink-0">
            แสดงผล <span className="font-semibold text-slate-800 font-mono tabular-nums">{filteredCount}</span> รายการ
            {totalCount !== filteredCount && (
              <span> (จาก <span className="font-mono tabular-nums">{totalCount}</span> รายการ)</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
