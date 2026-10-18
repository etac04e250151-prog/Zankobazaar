import React, { useRef, useEffect } from 'react';
import { AppNotification, Language, ListingItem } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { 
  Bell, 
  Check, 
  Trash2, 
  MessageSquare, 
  TrendingDown, 
  Sparkles, 
  ExternalLink,
  Clock,
  CheckCheck
} from 'lucide-react';

interface NotificationsPopoverProps {
  notifications: AppNotification[];
  language: Language;
  isOpen: boolean;
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onSelectNotificationItem: (itemId: string) => void;
  onSimulateNotification: () => void;
}

export const NotificationsPopover: React.FC<NotificationsPopoverProps> = ({
  notifications,
  language,
  isOpen,
  onClose,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  onSelectNotificationItem,
  onSimulateNotification,
}) => {
  const popoverRef = useRef<HTMLDivElement>(null);
  const t = TRANSLATIONS[language];
  const n = t.notifications;

  const unreadCount = notifications.filter((item) => !item.read).length;

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={popoverRef}
      className="absolute top-full end-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
    >
      {/* Header */}
      <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/80">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
            {n.title}
          </span>
          {unreadCount > 0 && (
            <span className="bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium flex items-center gap-1 cursor-pointer"
              title={n.markAllRead}
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{n.markAllRead}</span>
            </button>
          )}

          {notifications.length > 0 && (
            <button
              onClick={onClearAll}
              className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1 rounded-md transition-colors cursor-pointer"
              title={n.clearAll}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
        {notifications.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <Bell className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {n.empty}
            </p>
          </div>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                onMarkAsRead(item.id);
                if (item.itemId) {
                  onSelectNotificationItem(item.itemId);
                  onClose();
                }
              }}
              className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer text-xs ${
                item.read 
                  ? 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60' 
                  : 'bg-indigo-50/50 dark:bg-indigo-950/40 hover:bg-indigo-50/80 dark:hover:bg-indigo-950/60'
              }`}
            >
              {/* Icon / Avatar */}
              <div className="shrink-0 pt-0.5">
                {item.type === 'message' || item.type === 'interest' ? (
                  item.avatar ? (
                    <img
                      src={item.avatar}
                      alt="user"
                      className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                  )
                ) : (
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <TrendingDown className="w-4 h-4" />
                  </div>
                )}
              </div>

              {/* Text Body */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-1">
                  <h5 className={`font-semibold text-xs truncate ${item.read ? 'text-slate-800 dark:text-slate-200' : 'text-indigo-950 dark:text-indigo-200 font-bold'}`}>
                    {item.title[language] || item.title.en}
                  </h5>
                  {!item.read && (
                    <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 shrink-0" />
                  )}
                </div>

                <p className="text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                  {item.message[language] || item.message.en}
                </p>

                {/* Price difference (for price_drop) */}
                {item.type === 'price_drop' && item.oldPrice && item.newPrice && (
                  <div className="flex items-center gap-2 pt-0.5 font-mono text-[11px]">
                    <span className="line-through text-slate-400 dark:text-slate-500">
                      {item.oldPrice.toLocaleString()} {t.currency.iqd}
                    </span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      → {item.newPrice.toLocaleString()} {t.currency.iqd}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500 pt-0.5">
                  <Clock className="w-3 h-3" />
                  <span>{item.timestamp}</span>
                  {item.itemTitle && (
                    <>
                      <span>·</span>
                      <span className="truncate max-w-[140px] text-indigo-700 dark:text-indigo-400 font-medium">
                        {item.itemTitle}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer simulation button */}
      <div className="p-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex items-center justify-between text-xs">
        <button
          onClick={onSimulateNotification}
          className="w-full py-1.5 px-3 bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-600 text-indigo-700 dark:text-indigo-300 font-medium rounded-xl text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>{n.simulateTest}</span>
        </button>
      </div>
    </div>
  );
};
