import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Users,
  KeyRound,
  Check,
  X,
  Lock,
  Unlock,
  AlertTriangle,
  RotateCcw,
  Save,
  Info,
  UserCheck,
  Eye,
  FilePlus,
  Edit3,
  Trash2,
  FileCheck2,
  LayoutDashboard,
  FileSpreadsheet,
} from 'lucide-react';
import {
  UserRole,
  RoleDefinition,
  RolePermissions,
  SystemUser,
  DEFAULT_ROLES,
  INITIAL_SYSTEM_USERS,
} from '../types/permissions';

interface PermissionsManagementProps {
  currentRole: UserRole;
  onChangeActiveRole: (role: UserRole) => void;
  rolesConfig: Record<UserRole, RoleDefinition>;
  onUpdateRolePermissions: (roleId: UserRole, permissions: RolePermissions) => void;
  onResetPermissions: () => void;
}

export const PermissionsManagement: React.FC<PermissionsManagementProps> = ({
  currentRole,
  onChangeActiveRole,
  rolesConfig,
  onUpdateRolePermissions,
  onResetPermissions,
}) => {
  const [users, setUsers] = useState<SystemUser[]>(INITIAL_SYSTEM_USERS);
  const [isSavedRecently, setIsSavedRecently] = useState(false);

  const handleTogglePermission = (roleId: UserRole, permKey: keyof RolePermissions) => {
    const updated = {
      ...rolesConfig[roleId].permissions,
      [permKey]: !rolesConfig[roleId].permissions[permKey],
    };
    onUpdateRolePermissions(roleId, updated);
    setIsSavedRecently(true);
    setTimeout(() => setIsSavedRecently(false), 2500);
  };

  const handleChangeUserRole = (userId: string, newRole: UserRole) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sky-200 text-xs font-medium mb-3 border border-white/10">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-300" />
            <span>ระบบควบคุมการเข้าถึงตามบทบาท (Role-Based Access Control: RBAC)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            การกำหนดสิทธิ์ผู้ใช้งานและสิทธิ์สัญญา
          </h1>
          <p className="mt-2 text-sm text-sky-100/90 leading-relaxed font-light">
            กำหนดและจำกัดสิทธิ์สำหรับเจ้าหน้าที่แต่ละกลุ่ม เช่น ใครมีสิทธิ์อัพโหลดไฟล์ แก้ไขข้อมูล ลบข้อมูล ตรวจสอบสัญญา
            หรือผู้เข้าชมที่เข้ามาดูเฉพาะหน้า Dashboard และทะเบียนสัญญาได้ แต่ไม่สามารถกดเข้าไปดูรายละเอียดสัญญา
          </p>
        </div>

        {/* Decorative blur */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* 2. Interactive Role Tester: สลับบทบาทเพื่อทดสอบสิทธิ์จริง */}
      <div className="bg-white rounded-2xl border border-sky-100 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-sky-100">
          <div>
            <div className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-sky-600" />
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                ทดลองสลับบทบาทผู้ใช้งาน (Interactive Role Simulator)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              คลิกเลือกบทบาทด้านล่างเพื่อทดสอบการแสดงผลและข้อจำกัดสิทธิ์จริงในระบบทันที
            </p>
          </div>
          {isSavedRecently && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full border border-emerald-200 animate-fade-in">
              <Check className="w-3.5 h-3.5" /> บันทึกสิทธิ์เรียบร้อย
            </span>
          )}
        </div>

        {/* Quick Role Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
          {(Object.keys(rolesConfig) as UserRole[]).map((rKey) => {
            const role = rolesConfig[rKey];
            const isCurrent = currentRole === rKey;

            return (
              <button
                key={rKey}
                onClick={() => onChangeActiveRole(rKey)}
                className={`p-3.5 rounded-xl border text-left transition-all duration-150 cursor-pointer relative ${
                  isCurrent
                    ? 'border-sky-500 bg-sky-50/70 shadow-xs ring-2 ring-sky-400/20'
                    : 'border-slate-200 hover:border-sky-300 hover:bg-slate-50/80'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${role.badgeColor}`}
                  >
                    {role.id === 'viewer' ? 'ดูข้อมูลอย่างเดียว' : 'เจ้าหน้าที่'}
                  </span>
                  {isCurrent && (
                    <span className="text-[10px] font-bold text-sky-600 bg-white px-2 py-0.5 rounded-full border border-sky-200">
                      กำลังใช้งาน
                    </span>
                  )}
                </div>
                <div className="font-bold text-xs text-slate-800 line-clamp-1">
                  {role.title}
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                  {role.description}
                </p>

                {/* Specific viewer alert badge */}
                {rKey === 'viewer' && (
                  <div className="mt-2 text-[10px] text-amber-700 bg-amber-50/90 px-2 py-1 rounded border border-amber-200 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-amber-600 shrink-0" />
                    <span>ล็อคสิทธิ์: ไม่ให้ดูรายละเอียดสัญญา</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. The Permissions Matrix Table */}
      <div className="bg-white rounded-2xl border border-sky-100 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-sky-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-sky-50/30 to-white">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-sky-600" />
              <span>ตารางกำหนดสิทธิ์ตามบทบาท (Permissions Matrix)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              คลิกที่ช่องทำเครื่องหมายเพื่อเปิด/ปิด สิทธิ์การดำเนินการสำหรับแต่ละบทบาท
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onResetPermissions}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              title="รีเซ็ตเป็นค่าเริ่มต้นของระบบ กฟภ."
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>รีเซ็ตค่ามาตรฐาน</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-medium">
                <th scope="col" className="py-3.5 px-4 text-xs font-semibold min-w-[200px]">
                  บทบาทผู้ใช้งาน (Role)
                </th>
                <th scope="col" className="py-3.5 px-3 text-xs font-semibold text-center whitespace-nowrap">
                  <div className="flex items-center justify-center gap-1">
                    <LayoutDashboard className="w-3.5 h-3.5 text-sky-600" />
                    <span>ดู Dashboard</span>
                  </div>
                </th>
                <th scope="col" className="py-3.5 px-3 text-xs font-semibold text-center whitespace-nowrap">
                  <div className="flex items-center justify-center gap-1">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-sky-600" />
                    <span>ดูทะเบียนสัญญา</span>
                  </div>
                </th>
                <th scope="col" className="py-3.5 px-3 text-xs font-semibold text-center whitespace-nowrap bg-amber-50/70 border-x border-amber-200/60">
                  <div className="flex items-center justify-center gap-1 text-amber-900 font-bold">
                    <Eye className="w-3.5 h-3.5 text-amber-600" />
                    <span>กดดูรายละเอียด</span>
                  </div>
                </th>
                <th scope="col" className="py-3.5 px-3 text-xs font-semibold text-center whitespace-nowrap">
                  <div className="flex items-center justify-center gap-1">
                    <FilePlus className="w-3.5 h-3.5 text-sky-600" />
                    <span>อัพโหลดไฟล์</span>
                  </div>
                </th>
                <th scope="col" className="py-3.5 px-3 text-xs font-semibold text-center whitespace-nowrap">
                  <div className="flex items-center justify-center gap-1">
                    <Edit3 className="w-3.5 h-3.5 text-sky-600" />
                    <span>แก้ไขข้อมูล</span>
                  </div>
                </th>
                <th scope="col" className="py-3.5 px-3 text-xs font-semibold text-center whitespace-nowrap">
                  <div className="flex items-center justify-center gap-1">
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    <span>ลบข้อมูล</span>
                  </div>
                </th>
                <th scope="col" className="py-3.5 px-3 text-xs font-semibold text-center whitespace-nowrap">
                  <div className="flex items-center justify-center gap-1">
                    <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>ตรวจสอบ/รับรองข้อมูล</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(Object.keys(rolesConfig) as UserRole[]).map((rKey) => {
                const role = rolesConfig[rKey];
                const p = role.permissions;
                const isSelected = currentRole === rKey;

                return (
                  <tr
                    key={rKey}
                    className={`transition-colors ${
                      isSelected ? 'bg-sky-50/40' : 'hover:bg-slate-50/60'
                    }`}
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full border ${role.badgeColor}`}
                        >
                          {role.title}
                        </span>
                        {isSelected && (
                          <span className="text-[10px] text-sky-700 bg-sky-100 font-semibold px-1.5 py-0.2 rounded">
                            กำลังเลือก
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 max-w-sm">
                        {role.department}
                      </p>
                    </td>

                    {/* 1. ดู Dashboard */}
                    <td className="py-4 px-3 text-center align-middle">
                      <button
                        onClick={() => handleTogglePermission(rKey, 'canViewDashboard')}
                        className={`w-7 h-7 rounded-lg inline-flex items-center justify-center cursor-pointer transition-colors ${
                          p.canViewDashboard
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                            : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                        }`}
                        title="ดู Dashboard"
                      >
                        {p.canViewDashboard ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                      </button>
                    </td>

                    {/* 2. ดูทะเบียนสัญญา */}
                    <td className="py-4 px-3 text-center align-middle">
                      <button
                        onClick={() => handleTogglePermission(rKey, 'canViewRegistry')}
                        className={`w-7 h-7 rounded-lg inline-flex items-center justify-center cursor-pointer transition-colors ${
                          p.canViewRegistry
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                            : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                        }`}
                        title="ดูทะเบียนสัญญา"
                      >
                        {p.canViewRegistry ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                      </button>
                    </td>

                    {/* 3. กดดูรายละเอียดสัญญา (พิเศษตามคำสั่ง: ใครแค่เข้ามาดูหน้า Dashboard และทะเบียนสัญญาได้ แต่กดเข้าไปดูรายละเอียดไม่ได้) */}
                    <td className="py-4 px-3 text-center align-middle bg-amber-50/30 border-x border-amber-200/50">
                      <button
                        onClick={() => handleTogglePermission(rKey, 'canViewDetails')}
                        className={`px-2.5 py-1 rounded-lg inline-flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition-colors ${
                          p.canViewDetails
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-rose-100 text-rose-700 hover:bg-rose-200 border border-rose-300'
                        }`}
                        title="กดดูรายละเอียดสัญญา"
                      >
                        {p.canViewDetails ? (
                          <>
                            <Unlock className="w-3.5 h-3.5" />
                            <span>ดูได้</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-3.5 h-3.5" />
                            <span>ล็อคดูไม่ได้</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* 4. อัพโหลดไฟล์ */}
                    <td className="py-4 px-3 text-center align-middle">
                      <button
                        onClick={() => handleTogglePermission(rKey, 'canUploadFiles')}
                        className={`w-7 h-7 rounded-lg inline-flex items-center justify-center cursor-pointer transition-colors ${
                          p.canUploadFiles
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                            : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                        }`}
                        title="อัพโหลดไฟล์"
                      >
                        {p.canUploadFiles ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                      </button>
                    </td>

                    {/* 5. แก้ไขข้อมูล */}
                    <td className="py-4 px-3 text-center align-middle">
                      <button
                        onClick={() => handleTogglePermission(rKey, 'canEditData')}
                        className={`w-7 h-7 rounded-lg inline-flex items-center justify-center cursor-pointer transition-colors ${
                          p.canEditData
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                            : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                        }`}
                        title="แก้ไขข้อมูล"
                      >
                        {p.canEditData ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                      </button>
                    </td>

                    {/* 6. ลบข้อมูล */}
                    <td className="py-4 px-3 text-center align-middle">
                      <button
                        onClick={() => handleTogglePermission(rKey, 'canDeleteData')}
                        className={`w-7 h-7 rounded-lg inline-flex items-center justify-center cursor-pointer transition-colors ${
                          p.canDeleteData
                            ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                            : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                        }`}
                        title="ลบข้อมูล"
                      >
                        {p.canDeleteData ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                      </button>
                    </td>

                    {/* 7. ตรวจสอบ/รับรองข้อมูล */}
                    <td className="py-4 px-3 text-center align-middle">
                      <button
                        onClick={() => handleTogglePermission(rKey, 'canVerifyContract')}
                        className={`w-7 h-7 rounded-lg inline-flex items-center justify-center cursor-pointer transition-colors ${
                          p.canVerifyContract
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                            : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                        }`}
                        title="ตรวจสอบ/รับรองข้อมูล"
                      >
                        {p.canVerifyContract ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Notice Info Box */}
        <div className="p-4 bg-sky-50/60 border-t border-sky-100 text-xs text-slate-600 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-sky-900">เกณฑ์การควบคุมสิทธิ์ตามข้อกำหนด:</span>
            <ul className="list-disc pl-4 mt-1 space-y-0.5 text-[11px] text-slate-600">
              <li>
                <strong>ผู้เข้าชมทั่วไป (Viewer):</strong> สามารถเปิดดูข้อมูลหน้า Dashboard สถานะสัญญา และตารางทะเบียนสัญญาได้ แต่เมื่อคลิกปุ่ม <strong>"ดูรายละเอียดสัญญา"</strong> ระบบจะล็อคและแจ้งเตือนว่าไม่มีสิทธิ์เข้าถึงเนื้อหาภายใน
              </li>
              <li>
                <strong>การอัพโหลด, แก้ไข, ลบข้อมูล และตรวจสอบสัญญา:</strong> สงวนไว้เฉพาะเจ้าหน้าที่ที่มีสิทธิ์ที่ได้รับอนุมัติเท่านั้น
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 4. User Accounts Table with Role Assignment */}
      <div className="bg-white rounded-2xl border border-sky-100 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-sky-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-sky-600" />
              <span>รายชื่อผู้ใช้งานและบทบาทที่ได้รับมอบหมาย</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              กำหนดบทบาทเฉพาะบุคคลเพื่อควบคุมสิทธิ์ในการจัดการสัญญา กฟภ.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
            {users.length} บัญชีผู้ใช้
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
                <th className="py-3 px-4">ชื่อ - นามสกุล / อีเมล</th>
                <th className="py-3 px-4">หน่วยงานสังกัด</th>
                <th className="py-3 px-4">บทบาทปัจจุบัน</th>
                <th className="py-3 px-4 text-center">สถานะ</th>
                <th className="py-3 px-4 text-right">ปรับเปลี่ยนบทบาท</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-500 to-cyan-400 text-white flex items-center justify-center font-bold text-xs">
                        {u.avatarText}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{u.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-600">{u.department}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        rolesConfig[u.role].badgeColor
                      }`}
                    >
                      {rolesConfig[u.role].title.split(' ')[0]}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      ใช้งานปกติ
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <select
                      value={u.role}
                      onChange={(e) => handleChangeUserRole(u.id, e.target.value as UserRole)}
                      className="text-xs py-1 px-2.5 border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer"
                    >
                      <option value="super_admin">ผู้ดูแลระบบสูงสุด</option>
                      <option value="legal_officer">นิติกรสัญญา / ผู้ตรวจสอบ</option>
                      <option value="data_officer">เจ้าหน้าที่บันทึกข้อมูล</option>
                      <option value="viewer">ผู้เข้าชมทั่วไป (Viewer)</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
