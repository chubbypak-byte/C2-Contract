import React from 'react';
import {
  X,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  CheckCheck,
  RefreshCw,
  Zap,
  ArrowRight
} from 'lucide-react';
import { NotificationItem, ElectricityConsumer } from '../types/contract';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllAsRead: () => void;
  onSelectNotification: (notification: NotificationItem) => void;
  onTriggerSimulation: () => void;
  isSimulating: boolean;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onSelectNotification,
  onTriggerSimulation,
  isSimulating,
}) => {
  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'warning':
        return <Clock className="w-4 h-4 text-amber-600" />;
      case 'alert':
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      case 'info':
      default:
        return <Info className="w-4 h-4 text-sky-600" />;
    }
  };

  const getBgStyle = (type: NotificationItem['type']) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-50/80 border-emerald-200 text-emerald-800';
      case 'warning':
        return 'bg-amber-50/80 border-amber-200 text-amber-800';
      case 'alert':
        return 'bg-rose-50/80 border-rose-200 text-rose-800';
      case 'info':
      default:
        return 'bg-sky-50/80 border-sky-200 text-sky-800';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col border-l border-sky-100 animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-4 border-b border-sky-100 bg-gradient-to-r from-sky-50 via-white to-sky-50/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-500 text-white rounded-xl shadow-xs">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">แจ้งเตือนสถานะเอกสาร</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-bold text-white bg-rose-500 rounded-full font-mono tabular-nums">
                    {unreadCount} ใหม่
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                ระบบอัปเดตและแจ้งเตือนสถานะสัญญาแบบ Real-time
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Controls */}
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
          <button
            onClick={onMarkAllAsRead}
            disabled={unreadCount === 0}
            className="flex items-center gap-1 text-slate-600 hover:text-sky-700 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>ทำเครื่องหมายอ่านแล้วทั้งหมด</span>
          </button>

          <button
            onClick={onTriggerSimulation}
            disabled={isSimulating}
            className="flex items-center gap-1.5 text-sky-700 font-medium hover:text-sky-900 cursor-pointer"
          >
            <RefreshCw className={`w-3 h-3 ${isSimulating ? 'animate-spin' : ''}`} />
            <span>จำลองเหตุการณ์สด</span>
          </button>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-xs">ไม่มีรายการแจ้งเตือนในขณะนี้</p>
            </div>
          ) : (
            notifications.map((item) => {
              return (
                <div
                  key={item.id}
                  onClick={() => onSelectNotification(item)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    item.isRead
                      ? 'bg-white border-slate-200/80 hover:border-sky-200 hover:bg-slate-50/50'
                      : 'bg-sky-50/40 border-sky-200 shadow-2xs hover:bg-sky-50/70'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 border ${getBgStyle(item.type)}`}>
                      {getIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <h4 className="text-xs font-bold text-slate-800 truncate">
                          {item.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                          {item.timestamp}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {item.message}
                      </p>
                      {item.accountNumber && (
                        <div className="mt-1.5 flex items-center gap-2 text-[10px]">
                          <span className="font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            CA: {item.accountNumber}
                          </span>
                          <span className="text-sky-600 flex items-center gap-0.5 hover:underline">
                            ดูรายละเอียด <ArrowRight className="w-2.5 h-2.5" />
                          </span>
                        </div>
                      )}
                    </div>
                    {!item.isRead && (
                      <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0 mt-1"></span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 text-[11px] text-slate-500 text-center">
          เชื่อมต่อระบบแจ้งเตือนแบบ Webhook / Server-Sent Events พร้อมใช้งาน
        </div>
      </div>
    </div>
  );
};
