import React, { useState } from 'react';
import { Language, AppNotification, UserAccount } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { NotificationsPopover } from './NotificationsPopover';
import { 
  GraduationCap, 
  Search, 
  Plus, 
  Sparkles, 
  ShieldCheck, 
  Heart, 
  Bell, 
  Globe2, 
  X,
  BookOpen,
  Trophy,
  Sun,
  Moon,
  Wallet,
  User,
  LogIn,
  Receipt,
  LayoutDashboard
} from 'lucide-react';

interface HeaderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenCreateModal: () => void;
  onOpenPriceModal: () => void;
  onOpenSafetyModal: () => void;
  wishlistCount: number;
  onToggleWishlistFilter: () => void;
  isWishlistOnly: boolean;
  notifications: AppNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAllNotifications: () => void;
  onSelectNotificationItem: (itemId: string) => void;
  onSimulateNotification: () => void;
  currentUser?: UserAccount | null;
  onOpenLogin: () => void;
  onOpenAccounting: () => void;
  onOpenDashboard?: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onLanguageChange,
  theme,
  onToggleTheme,
  searchQuery,
  onSearchChange,
  onOpenCreateModal,
  onOpenPriceModal,
  onOpenSafetyModal,
  wishlistCount,
  onToggleWishlistFilter,
  isWishlistOnly,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAllNotifications,
  onSelectNotificationItem,
  onSimulateNotification,
  currentUser,
  onOpenLogin,
  onOpenAccounting,
  onOpenDashboard,
  onLogout,
}) => {
  const t = TRANSLATIONS[language];
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      {/* Top Banner */}
      <div className="bg-slate-900 dark:bg-slate-950 text-slate-200 text-xs py-1.5 px-4 sm:px-6 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Quick theme status / tag */}
          <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              {language === 'ku' ? 'تۆڕی ئاڵوگۆڕی ئەکادیمی زانکۆکانی هەرێم' : language === 'ar' ? 'شبكة التبادل الأكاديمي للجامعات' : 'Kurdistan & Iraq Universities Exchange'}
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 text-xs text-slate-300 ms-auto">
            {/* Dark / Light Mode Toggle in Top Banner */}
            <button
              onClick={onToggleTheme}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors cursor-pointer text-xs"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden xs:inline">{language === 'ku' ? 'ڕووناک' : language === 'ar' ? 'فاتح' : 'Light'}</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-300" />
                  <span className="hidden xs:inline">{language === 'ku' ? 'تاریک' : language === 'ar' ? 'داكن' : 'Dark'}</span>
                </>
              )}
            </button>

            <span className="text-slate-700">|</span>

            <button
              onClick={onOpenSafetyModal}
              className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.safetyGuide}</span>
            </button>

            <span className="text-slate-700">|</span>

            {/* Language Switcher */}
            <div className="flex items-center gap-1.5">
              <Globe2 className="w-3.5 h-3.5 text-slate-400" />
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onLanguageChange('ku')}
                  className={`px-1.5 py-0.5 rounded text-xs transition-colors cursor-pointer ${
                    language === 'ku' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  کوردی
                </button>
                <button
                  onClick={() => onLanguageChange('en')}
                  className={`px-1.5 py-0.5 rounded text-xs transition-colors cursor-pointer ${
                    language === 'en' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => onLanguageChange('ar')}
                  className={`px-1.5 py-0.5 rounded text-xs transition-colors cursor-pointer ${
                    language === 'ar' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  عربي
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5">
        <div className="flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-700 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-100 dark:shadow-none">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl sm:text-2xl tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-700 dark:from-white dark:via-slate-100 dark:to-indigo-300 bg-clip-text text-transparent">
                  {t.appName}
                </span>
                <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/70 px-2 py-0.5 rounded-lg border border-indigo-200/60 dark:border-indigo-800">
                  {language === 'ku' ? 'زانکۆ بازاڕ' : language === 'ar' ? 'سوق الجامعة' : 'Campus'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block line-clamp-1 max-w-sm">
                {t.appSubtitle}
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-xl mx-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100/80 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm rounded-xl ps-10 pe-9 py-2.5 border border-slate-200 dark:border-slate-700 focus:border-indigo-600 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950 outline-none transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded cursor-pointer"
                  title="Clear"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Theme Toggle Button (Main action bar) */}
            <button
              onClick={onToggleTheme}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/70 transition-colors cursor-pointer"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>

            {/* AI Fair Price Appraiser CTA */}
            <button
              onClick={onOpenPriceModal}
              className="hidden lg:flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-indigo-900 dark:text-indigo-200 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100/80 dark:hover:bg-indigo-900/60 border border-indigo-200/70 dark:border-indigo-800 rounded-xl transition-colors cursor-pointer"
              title={t.aiPriceCheck}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>{t.aiPriceCheck}</span>
            </button>

            {/* Wishlist Toggle Button */}
            <button
              onClick={onToggleWishlistFilter}
              className={`p-2.5 rounded-xl border transition-colors relative cursor-pointer ${
                isWishlistOnly
                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
              title={t.addToWishlist}
            >
              <Heart className={`w-4 h-4 ${isWishlistOnly ? 'fill-rose-500 text-rose-500' : ''}`} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Notification Bell with Popover */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen((prev) => !prev)}
                className={`p-2.5 rounded-xl border transition-colors relative cursor-pointer ${
                  isNotificationsOpen || unreadNotificationsCount > 0
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
                title={t.notifications.title}
              >
                <Bell className="w-4 h-4" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>

              <NotificationsPopover
                notifications={notifications}
                language={language}
                isOpen={isNotificationsOpen}
                onClose={() => setIsNotificationsOpen(false)}
                onMarkAsRead={onMarkAsRead}
                onMarkAllAsRead={onMarkAllAsRead}
                onClearAll={onClearAllNotifications}
                onSelectNotificationItem={onSelectNotificationItem}
                onSimulateNotification={onSimulateNotification}
              />
            </div>


            {/* Campus Dashboard Button */}
            {onOpenDashboard && (
              <button
                onClick={onOpenDashboard}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-indigo-200/90 dark:border-indigo-800/80 bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100/80 dark:hover:bg-indigo-900/60 transition-colors cursor-pointer"
                title={t.dashboard.title}
              >
                <LayoutDashboard className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span className="hidden sm:inline font-semibold">{t.dashboard.title}</span>
              </button>
            )}

            {/* User Profile / Login Button */}
            {currentUser ? (
              <button
                onClick={onOpenLogin}
                className="flex items-center gap-2 p-1.5 pe-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-indigo-300 dark:hover:border-indigo-600 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                title={`${currentUser.name} (${currentUser.department})`}
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-lg object-cover ring-1 ring-indigo-500 shrink-0"
                />
                <span className="hidden md:inline text-xs font-bold max-w-[85px] truncate">
                  {currentUser.name.split(' ')[0]}
                </span>
              </button>
            ) : (
              <button
                onClick={onOpenLogin}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                title={t.auth.login}
              >
                <User className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <span className="hidden sm:inline">{t.auth.login}</span>
              </button>
            )}

            {/* Primary Post Item Button */}
            <button
              onClick={onOpenCreateModal}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-medium text-sm rounded-xl shadow-sm shadow-indigo-200 dark:shadow-none hover:shadow-indigo-300 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">{t.postListing}</span>
              <span className="sm:hidden">{language === 'en' ? 'Post' : 'دانان'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
