import React from 'react';
import { AppNotification, Language } from '../types';
import { 
  Bell, 
  X, 
  MessageSquare, 
  TrendingDown, 
  ChevronRight,
  ChevronLeft 
} from 'lucide-react';

interface NotificationToastProps {
  notification: AppNotification | null;
  language: Language;
  onClose: () => void;
  onClick: (itemId?: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
  language,
  onClose,
  onClick,
}) => {
  if (!notification) return null;

  return (
    <div className="fixed bottom-5 end-5 z-50 max-w-sm w-full bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-indigo-200/80 dark:border-slate-800 p-4 animate-in slide-in-from-bottom-5 duration-300">
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="shrink-0 pt-0.5">
          {notification.type === 'price_drop' ? (
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
              <TrendingDown className="w-5 h-5" />
            </div>
          ) : (
            <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs">
              <MessageSquare className="w-5 h-5" />
            </div>
          )}
        </div>

        {/* Text */}
        <div 
          onClick={() => {
            onClick(notification.itemId);
            onClose();
          }}
          className="flex-1 min-w-0 cursor-pointer space-y-1"
        >
          <div className="flex items-center justify-between">
            <h5 className="font-bold text-xs text-slate-900 dark:text-white truncate">
              {notification.title[language] || notification.title.en}
            </h5>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">
              {notification.timestamp}
            </span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
            {notification.message[language] || notification.message.en}
          </p>

          <div className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 pt-1">
            <span>
              {language === 'ku' ? 'بینینی وردەکارییەکان' : language === 'ar' ? 'عرض التفاصيل' : 'View Details'}
            </span>
            {language === 'en' ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition-colors cursor-pointer shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
