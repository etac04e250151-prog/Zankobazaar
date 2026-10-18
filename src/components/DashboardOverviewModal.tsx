import React, { useState } from 'react';
import { 
  Language, 
  ListingItem, 
  UserAccount, 
  AccountingTransaction 
} from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { 
  X, 
  LayoutDashboard, 
  Package, 
  Wallet, 
  GraduationCap, 
  CheckCircle2, 
  Plus, 
  ArrowUpRight, 
  Eye, 
  Heart, 
  Database, 
  Sparkles, 
  Trash2, 
  FileText, 
  ChevronRight,
  TrendingUp,
  Gift,
  Building2,
  Phone,
  ShieldCheck,
  Tag
} from 'lucide-react';

interface DashboardOverviewModalProps {
  language: Language;
  isOpen: boolean;
  currentUser: UserAccount | null;
  items: ListingItem[];
  transactions: AccountingTransaction[];
  onClose: () => void;
  onOpenCreateListing: () => void;
  onOpenAccounting: () => void;
  onOpenProfile: () => void;
  onSelectItemForDetail: (item: ListingItem) => void;
  onDeleteItem?: (itemId: string) => void;
}

export const DashboardOverviewModal: React.FC<DashboardOverviewModalProps> = ({
  language,
  isOpen,
  currentUser,
  items,
  transactions,
  onClose,
  onOpenCreateListing,
  onOpenAccounting,
  onOpenProfile,
  onSelectItemForDetail,
  onDeleteItem,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'myListings' | 'financials' | 'profile'>('overview');

  if (!isOpen) return null;

  const t = TRANSLATIONS[language];
  const d = t.dashboard;
  const isRtl = language !== 'en';

  // Filter items belonging to current user (by id, seller name, or email)
  const userItems = items.filter((item) => {
    if (!currentUser) return false;
    return (
      (item.seller as any)?.userId === currentUser.id ||
      item.seller?.name?.toLowerCase().includes(currentUser.name.toLowerCase().split(' ')[0]) ||
      (item as any)?.userId === currentUser.id
    );
  });

  // Calculate statistics
  const userActiveListingsCount = userItems.length;
  const userTotalViews = userItems.reduce((acc, it) => acc + (it.views || 0), 0);
  const userTotalLikes = userItems.reduce((acc, it) => acc + (it.likes || 0), 0);
  const userFreeDonationsCount = userItems.filter((it) => it.isFreeDonation).length;

  // Transactions calculations
  const totalIncome = transactions
    .filter((tx) => tx.type === 'sale_earning' || tx.type === 'wallet_deposit')
    .reduce((acc, tx) => acc + tx.amountIqd, 0);

  const totalExpense = transactions
    .filter((tx) => tx.type === 'purchase' || tx.type === 'payout_withdrawal')
    .reduce((acc, tx) => acc + tx.amountIqd, 0);

  const totalDonationSavings = transactions
    .filter((tx) => tx.type === 'free_donation_saving')
    .reduce((acc, tx) => acc + tx.amountIqd, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200 dark:shadow-none">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {d.title}
                </h2>
                {/* Real-time Firestore Cloud Live Badge */}
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <Database className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span>Firestore Live</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {currentUser 
                  ? `${currentUser.name} • ${currentUser.universityName}` 
                  : d.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto bg-slate-50/40 dark:bg-slate-900/40">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'overview'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>{d.overview}</span>
          </button>

          <button
            onClick={() => setActiveTab('myListings')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'myListings'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>{d.myListings}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold">
              {userActiveListingsCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('financials')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'financials'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>{d.financials}</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'profile'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>{d.profile}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* 4 Summary Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Active Listings */}
                <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/60 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-indigo-800 dark:text-indigo-300">
                      {d.activeListings}
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                      <Package className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                      {userActiveListingsCount}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {items.length} in campus
                    </span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-indigo-100 dark:border-indigo-900/40 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3 text-indigo-500" />
                      {userTotalViews} views
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3 text-rose-500" />
                      {userTotalLikes} saves
                    </span>
                  </div>
                </div>

                {/* Campus Wallet */}
                <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/60 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                      {d.walletCredit}
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <Wallet className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                      {currentUser ? currentUser.campusWalletBalanceIqd.toLocaleString() : '0'}
                    </span>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                      {t.currency.iqd}
                    </span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-emerald-100 dark:border-emerald-900/40 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 dark:text-slate-400 font-mono">
                      ~${currentUser?.campusWalletBalanceUsd || 0} USD
                    </span>
                    <button 
                      onClick={onOpenAccounting}
                      className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>Ledger</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Academic Community Impact */}
                <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/60 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                      {d.academicImpact}
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                      <Gift className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                      {userFreeDonationsCount}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      free donations
                    </span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-amber-100 dark:border-amber-900/40 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span>Student Aid</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">
                      {totalDonationSavings > 0 ? `${totalDonationSavings.toLocaleString()} ${t.currency.iqd}` : '100% Peer-to-Peer'}
                    </span>
                  </div>
                </div>

                {/* Campus Standing / University */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {currentUser?.role === 'lecturer' ? 'Faculty Member' : 'Student Status'}
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    </div>
                  </div>
                  <div className="truncate">
                    <span className="text-sm font-bold text-slate-900 dark:text-white truncate block">
                      {currentUser ? currentUser.department : 'Kurdistan Universities'}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      {currentUser ? currentUser.studentIdNumber : 'Guest Account'}
                    </span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      Verified ID
                    </span>
                    <span className="text-slate-400 font-normal">Class of 2026</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions Card */}
              <div className="p-4.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 text-white flex flex-wrap items-center justify-between gap-4 shadow-md shadow-indigo-200 dark:shadow-none">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>{d.quickActions}</span>
                  </h3>
                  <p className="text-xs text-indigo-100">
                    Trade course textbooks, inspect official invoices, or add items to the university marketplace.
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => {
                      onClose();
                      onOpenCreateListing();
                    }}
                    className="px-3.5 py-2 rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{d.postNew}</span>
                  </button>

                  <button
                    onClick={() => {
                      onClose();
                      onOpenAccounting();
                    }}
                    className="px-3.5 py-2 rounded-xl bg-indigo-800/80 hover:bg-indigo-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-indigo-400/30"
                  >
                    <Wallet className="w-3.5 h-3.5" />
                    <span>{d.openLedger}</span>
                  </button>
                </div>
              </div>

              {/* Recent User Items Preview */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Package className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>{d.myListings}</span>
                  </h4>
                  <button
                    onClick={() => setActiveTab('myListings')}
                    className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>View all ({userItems.length})</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {userItems.length === 0 ? (
                  <div className="text-center py-8 px-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-400 space-y-2">
                    <Package className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
                    <p className="text-xs">{d.noListingsYet}</p>
                    <button
                      onClick={() => {
                        onClose();
                        onOpenCreateListing();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:bg-indigo-100 transition-colors cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{d.postNew}</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {userItems.slice(0, 3).map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          onClose();
                          onSelectItemForDetail(item);
                        }}
                        className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-pointer flex gap-3 group"
                      >
                        <img
                          src={item.images[0] || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=300&q=80'}
                          alt={item.title.ku || item.title.en}
                          className="w-16 h-16 rounded-xl object-cover ring-1 ring-slate-100 dark:ring-slate-700 shrink-0 group-hover:scale-102 transition-transform"
                        />
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                              {item.title[language] || item.title.en}
                            </h5>
                            <span className="text-[10px] text-slate-400 truncate block">
                              {item.department}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                            <span>
                              {item.isFreeDonation ? 'خۆڕایی (Free)' : `${item.priceIqd.toLocaleString()} ${t.currency.iqd}`}
                            </span>
                            <span className="text-[10px] font-normal text-slate-400 flex items-center gap-0.5">
                              <Eye className="w-3 h-3" />
                              {item.views}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: MY LISTINGS */}
          {activeTab === 'myListings' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {d.myListings}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Manage and inspect items you uploaded to the academic exchange.
                  </p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onOpenCreateListing();
                  }}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{d.postNew}</span>
                </button>
              </div>

              {userItems.length === 0 ? (
                <div className="text-center py-12 px-4 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
                  <Package className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    {d.noListingsYet}
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Help your fellow campus students by passing down your previous semester books or engineering equipment.
                  </p>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenCreateListing();
                    }}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{d.postNew}</span>
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-800/40">
                  {userItems.map((item) => (
                    <div 
                      key={item.id} 
                      className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/60 transition-colors"
                    >
                      <div 
                        className="flex items-center gap-3.5 min-w-0 cursor-pointer flex-1"
                        onClick={() => {
                          onClose();
                          onSelectItemForDetail(item);
                        }}
                      >
                        <img
                          src={item.images[0] || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=200&q=80'}
                          alt={item.title[language] || item.title.en}
                          className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate hover:text-indigo-600">
                            {item.title[language] || item.title.en}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                            <span className="capitalize">{item.category}</span>
                            <span>•</span>
                            <span>{item.department}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3 text-slate-400" />
                              {item.views}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-end">
                          <span className="text-xs font-black font-mono text-indigo-600 dark:text-indigo-400 block">
                            {item.isFreeDonation ? 'خۆڕایی (Free)' : `${item.priceIqd.toLocaleString()} ${t.currency.iqd}`}
                          </span>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                            {d.statusActive}
                          </span>
                        </div>

                        {onDeleteItem && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(d.confirmDelete)) {
                                onDeleteItem(item.id);
                              }
                            }}
                            className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer"
                            title={d.deleteListing}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: FINANCIALS */}
          {activeTab === 'financials' && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-slate-50 to-indigo-50/10 dark:from-slate-800 dark:to-slate-800/50 border border-emerald-200/60 dark:border-slate-700 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
                    {d.walletCredit}
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">
                      {currentUser ? currentUser.campusWalletBalanceIqd.toLocaleString() : '0'}
                    </span>
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
                      {t.currency.iqd}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onClose();
                      onOpenAccounting();
                    }}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
                  >
                    <Wallet className="w-4 h-4" />
                    <span>{d.openLedger}</span>
                  </button>
                </div>
              </div>

              {/* Transactions summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] text-slate-500 block">
                    {t.accounting.totalEarnings}
                  </span>
                  <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
                    +{totalIncome.toLocaleString()} {t.currency.iqd}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] text-slate-500 block">
                    {t.accounting.totalExpenses}
                  </span>
                  <span className="text-lg font-black text-rose-600 dark:text-rose-400 font-mono">
                    -{totalExpense.toLocaleString()} {t.currency.iqd}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] text-slate-500 block">
                    {t.accounting.donationSavings}
                  </span>
                  <span className="text-lg font-black text-amber-600 dark:text-amber-400 font-mono">
                    {totalDonationSavings.toLocaleString()} {t.currency.iqd}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              {currentUser ? (
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center gap-5">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-20 h-20 rounded-2xl object-cover ring-2 ring-indigo-500 shadow-md shrink-0"
                  />
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {currentUser.name}
                      </h3>
                      <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {currentUser.universityName} • {currentUser.department}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-mono bg-slate-200/80 dark:bg-slate-700/80 px-2 py-0.5 rounded-md">
                        ID: {currentUser.studentIdNumber}
                      </span>
                      <span>•</span>
                      <span>{currentUser.email}</span>
                      <span>•</span>
                      <span>{currentUser.phone}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onClose();
                      onOpenProfile();
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    {t.auth.myAccount}
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-xs text-slate-500 mb-3">Please sign in to view your academic student identity.</p>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenProfile();
                    }}
                    className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold cursor-pointer"
                  >
                    {t.auth.login}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
