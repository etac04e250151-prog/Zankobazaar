import React, { useState, useMemo } from 'react';
import { 
  Language, 
  UserAccount, 
  AccountingTransaction, 
  TransactionType 
} from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { 
  X, 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Sparkles, 
  Gift, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Printer, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  PlusCircle, 
  Building, 
  Receipt, 
  FileText, 
  Download,
  CreditCard,
  DollarSign
} from 'lucide-react';

interface AccountingModalProps {
  language: Language;
  isOpen: boolean;
  currentUser: UserAccount | null;
  transactions: AccountingTransaction[];
  onClose: () => void;
  onAddTransaction: (tx: AccountingTransaction) => void;
  onUpdateWalletBalance: (newIqd: number, newUsd: number) => void;
  onOpenLogin: () => void;
}

export const AccountingModal: React.FC<AccountingModalProps> = ({
  language,
  isOpen,
  currentUser,
  transactions,
  onClose,
  onAddTransaction,
  onUpdateWalletBalance,
  onOpenLogin,
}) => {
  const [filterType, setFilterType] = useState<'all' | TransactionType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoiceTx, setSelectedInvoiceTx] = useState<AccountingTransaction | null>(null);

  // Deposit & Payout Form Dialogs
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState('25000');
  const [depositMethod, setDepositMethod] = useState('FastPay');

  const [isPayoutOpen, setIsPayoutOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('20000');
  const [payoutMethod, setPayoutMethod] = useState('First Iraqi Bank (FIB)');

  if (!isOpen) return null;

  const t = TRANSLATIONS[language];
  const acc = t.accounting;

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      if (filterType !== 'all' && tx.type !== filterType) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        tx.invoiceNumber.toLowerCase().includes(q) ||
        tx.title[language].toLowerCase().includes(q) ||
        (tx.counterparty && tx.counterparty.toLowerCase().includes(q))
      );
    });
  }, [transactions, filterType, searchQuery, language]);

  // Financial aggregates
  const stats = useMemo(() => {
    let earningsIqd = 0;
    let expensesIqd = 0;
    let savingsIqd = 0;

    transactions.forEach((tx) => {
      if (tx.type === 'sale_earning') earningsIqd += tx.amountIqd;
      if (tx.type === 'purchase') expensesIqd += tx.amountIqd;
      if (tx.type === 'free_donation_saving') savingsIqd += tx.amountIqd;
    });

    const netProfitIqd = earningsIqd - expensesIqd;

    return {
      walletIqd: currentUser ? currentUser.campusWalletBalanceIqd : 0,
      walletUsd: currentUser ? currentUser.campusWalletBalanceUsd : 0,
      earningsIqd,
      expensesIqd,
      savingsIqd,
      netProfitIqd,
    };
  }, [transactions, currentUser]);

  const handleConfirmDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(depositAmount);
    if (!val || val <= 0) return;

    const usdVal = Math.round(val / 1500);
    const newTx: AccountingTransaction = {
      id: `tx-dep-${Date.now()}`,
      type: 'wallet_deposit',
      title: {
        ku: `زیادکردنی باڵانس لە ڕێگەی ${depositMethod}`,
        en: `Campus Wallet Deposit via ${depositMethod}`,
        ar: `شحن رصيد المحفظة عبر ${depositMethod}`,
      },
      description: {
        ku: `باڵانسی خێرا بە سەرکەوتوویی زیادکرا بۆ هەژماری زانکۆ.`,
        en: `Instant credit deposit added to campus exchange wallet.`,
        ar: `تم شحن الرصيد الفوري بنجاح لمحفظة التبادل الجامعي.`,
      },
      amountIqd: val,
      amountUsd: usdVal,
      date: new Date().toISOString().split('T')[0],
      status: 'completed',
      invoiceNumber: `DEP-${Math.floor(100000 + Math.random() * 900000)}`,
      counterparty: depositMethod,
    };

    onAddTransaction(newTx);
    if (currentUser) {
      onUpdateWalletBalance(
        currentUser.campusWalletBalanceIqd + val,
        currentUser.campusWalletBalanceUsd + usdVal
      );
    }
    setIsDepositOpen(false);
  };

  const handleConfirmPayout = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(payoutAmount);
    if (!val || val <= 0) return;

    if (currentUser && currentUser.campusWalletBalanceIqd < val) {
      alert(language === 'ku' ? 'باڵانسی جزدان بەش ناکات بۆ ئەم بڕە' : 'Insufficient balance for this payout amount');
      return;
    }

    const usdVal = Math.round(val / 1500);
    const newTx: AccountingTransaction = {
      id: `tx-pay-${Date.now()}`,
      type: 'payout_withdrawal',
      title: {
        ku: `داواکاری ڕاکێشانی پارە بۆ ${payoutMethod}`,
        en: `Sales Earnings Payout to ${payoutMethod}`,
        ar: `طلب سحب أرباح المبيعات إلى ${payoutMethod}`,
      },
      description: {
        ku: `پارەی فرۆشتنی کەلوپەل بە سەرکەوتوویی نێردرا بۆ شێوازی هەڵبژێردراو.`,
        en: `Book sale revenue successfully remitted to chosen payout channel.`,
        ar: `تم إرسال عوائد بيع الكتب بنجاح إلى وسيلة السحب المختارة.`,
      },
      amountIqd: val,
      amountUsd: usdVal,
      date: new Date().toISOString().split('T')[0],
      status: 'completed',
      invoiceNumber: `PAY-${Math.floor(100000 + Math.random() * 900000)}`,
      counterparty: payoutMethod,
    };

    onAddTransaction(newTx);
    if (currentUser) {
      onUpdateWalletBalance(
        Math.max(0, currentUser.campusWalletBalanceIqd - val),
        Math.max(0, currentUser.campusWalletBalanceUsd - usdVal)
      );
    }
    setIsPayoutOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-200 dark:shadow-none">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {acc.title}
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300">
                  {acc.zeroCommissionBadge}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {currentUser ? `${currentUser.name} (${currentUser.department})` : acc.subtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* User Not Logged in Prompt */}
          {!currentUser && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                    {language === 'ku' ? 'تکایە سەرەتا بچۆژوورەوە بۆ بینینی ژمێریاری کەسی' : language === 'ar' ? 'يرجى تسجيل الدخول لعرض حسابك المالي الشخصي' : 'Sign in to access your personal campus wallet and balance'}
                  </h4>
                  <p className="text-[11px] text-amber-700 dark:text-amber-300">
                    {language === 'ku' ? 'دەتوانیت سەیری دەفتەری گشتی و چاپی پسوولەی فەرمی بکەیت' : 'You can view public campus transaction logs or sign in for your balance'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onOpenLogin();
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                {t.auth.login}
              </button>
            </div>
          )}

          {/* Financial Cards Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Wallet Balance */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-md shadow-indigo-200/50 dark:shadow-none space-y-2">
              <div className="flex items-center justify-between text-indigo-100 text-xs">
                <span>{acc.walletBalance}</span>
                <Wallet className="w-4 h-4 text-indigo-200" />
              </div>
              <div className="text-xl sm:text-2xl font-black font-mono">
                {stats.walletIqd.toLocaleString()} {t.currency.iqd}
              </div>
              <div className="text-[11px] text-indigo-200">
                ≈ ${stats.walletUsd.toLocaleString()} USD
              </div>
            </div>

            {/* Total Sales Earnings */}
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 space-y-2">
              <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
                <span>{acc.totalEarnings}</span>
                <TrendingUp className="w-4 h-4" />
              </div>
              <div className="text-lg sm:text-xl font-black font-mono text-emerald-800 dark:text-emerald-200">
                +{stats.earningsIqd.toLocaleString()} {t.currency.iqd}
              </div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400">
                {language === 'ku' ? 'داهاتی فرۆشتنی کتێب' : 'Book sales revenue'}
              </div>
            </div>

            {/* Expenses */}
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 space-y-2">
              <div className="flex items-center justify-between text-rose-700 dark:text-rose-400 text-xs font-semibold">
                <span>{acc.totalExpenses}</span>
                <TrendingDown className="w-4 h-4" />
              </div>
              <div className="text-lg sm:text-xl font-black font-mono text-rose-800 dark:text-rose-200">
                -{stats.expensesIqd.toLocaleString()} {t.currency.iqd}
              </div>
              <div className="text-[11px] text-rose-600 dark:text-rose-400">
                {language === 'ku' ? 'کڕینی پێداویستی خوێندن' : 'Materials purchased'}
              </div>
            </div>

            {/* Free Donation Savings */}
            <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900 space-y-2">
              <div className="flex items-center justify-between text-sky-700 dark:text-sky-400 text-xs font-semibold">
                <span>{acc.donationSavings}</span>
                <Gift className="w-4 h-4 text-sky-500" />
              </div>
              <div className="text-lg sm:text-xl font-black font-mono text-sky-800 dark:text-sky-200">
                {stats.savingsIqd.toLocaleString()} {t.currency.iqd}
              </div>
              <div className="text-[11px] text-sky-600 dark:text-sky-400">
                {language === 'ku' ? 'پاشەکەوت بە کتێبی بەخشش' : 'Saved through donations'}
              </div>
            </div>
          </div>

          {/* Quick Wallet Actions */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              onClick={() => setIsDepositOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{acc.addFunds}</span>
            </button>

            <button
              onClick={() => setIsPayoutOpen(true)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-700 dark:hover:bg-slate-600 text-xs font-semibold rounded-xl flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>{acc.requestPayout}</span>
            </button>

            <button
              onClick={() => {
                if (transactions.length > 0) {
                  setSelectedInvoiceTx(transactions[0]);
                }
              }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-2 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            >
              <FileText className="w-4 h-4 text-indigo-500" />
              <span>{acc.downloadInvoice}</span>
            </button>
          </div>

          {/* Transactions Ledger Area */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{acc.transactions}</span>
                  <span className="text-xs text-slate-400 font-mono">({filteredTransactions.length})</span>
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {acc.studentAccountLedger}
                </p>
              </div>

              {/* Search & Filter */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={acc.searchLedgerPlaceholder}
                    className="w-44 sm:w-56 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs rounded-xl ps-8 pe-3 py-1.5 border border-slate-200 dark:border-slate-700 outline-none"
                  />
                </div>

                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs rounded-xl px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 outline-none cursor-pointer"
                >
                  <option value="all">{acc.allTransactions}</option>
                  <option value="sale_earning">{acc.income}</option>
                  <option value="purchase">{acc.expense}</option>
                  <option value="free_donation_saving">{acc.savings}</option>
                  <option value="payout_withdrawal">{acc.payouts}</option>
                </select>
              </div>
            </div>

            {/* Transactions List */}
            {filteredTransactions.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
                {acc.emptyTransactions}
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
                {filteredTransactions.map((tx) => {
                  const isEarning = tx.type === 'sale_earning' || tx.type === 'wallet_deposit';
                  const isSaving = tx.type === 'free_donation_saving';

                  return (
                    <div
                      key={tx.id}
                      className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            isSaving
                              ? 'bg-sky-100 text-sky-600 dark:bg-sky-950/70 dark:text-sky-300'
                              : isEarning
                              ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/70 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-600 dark:bg-rose-950/70 dark:text-rose-300'
                          }`}
                        >
                          {isSaving ? (
                            <Gift className="w-4 h-4" />
                          ) : isEarning ? (
                            <ArrowDownLeft className="w-4 h-4" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {tx.title[language]}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              {tx.invoiceNumber}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {tx.description[language]} {tx.counterparty ? `• ${tx.counterparty}` : ''}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-end">
                          <span
                            className={`text-xs font-bold font-mono block ${
                              isSaving
                                ? 'text-sky-600 dark:text-sky-400'
                                : isEarning
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-slate-900 dark:text-slate-100'
                            }`}
                          >
                            {isSaving ? '' : isEarning ? '+' : '-'}
                            {tx.amountIqd.toLocaleString()} {t.currency.iqd}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {tx.date}
                          </span>
                        </div>

                        <button
                          onClick={() => setSelectedInvoiceTx(tx)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                          title="View Invoice"
                        >
                          <Receipt className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Deposit Dialog */}
      {isDepositOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-emerald-500" />
                <span>{acc.addFunds}</span>
              </h3>
              <button
                onClick={() => setIsDepositOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmDeposit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {acc.depositAmount}
                </label>
                <input
                  type="number"
                  min="5000"
                  step="5000"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-base font-mono font-bold rounded-xl px-4 py-2.5 border border-slate-200 dark:border-slate-700 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {acc.depositMethod}
                </label>
                <select
                  value={depositMethod}
                  onChange={(e) => setDepositMethod(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs rounded-xl px-3 py-2.5 border border-slate-200 dark:border-slate-700 outline-none cursor-pointer"
                >
                  <option value="FastPay">FastPay (فاسپەی)</option>
                  <option value="First Iraqi Bank (FIB)">First Iraqi Bank (FIB / بانکی عێراقی یەکەم)</option>
                  <option value="ZainCash">ZainCash (زین کاش)</option>
                  <option value="Campus Union Cash Desk">Campus Student Union Desk (کاشی یەکێتی قوتابیان)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-md transition-all cursor-pointer"
              >
                {acc.confirmDeposit}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Payout Dialog */}
      {isPayoutOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-indigo-500" />
                <span>{acc.requestPayout}</span>
              </h3>
              <button
                onClick={() => setIsPayoutOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmPayout} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {acc.depositAmount}
                </label>
                <input
                  type="number"
                  min="5000"
                  step="5000"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-base font-mono font-bold rounded-xl px-4 py-2.5 border border-slate-200 dark:border-slate-700 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {acc.payoutMethod}
                </label>
                <select
                  value={payoutMethod}
                  onChange={(e) => setPayoutMethod(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs rounded-xl px-3 py-2.5 border border-slate-200 dark:border-slate-700 outline-none cursor-pointer"
                >
                  <option value="FastPay">FastPay (فاسپەی)</option>
                  <option value="First Iraqi Bank (FIB)">First Iraqi Bank (FIB)</option>
                  <option value="ZainCash">ZainCash (زین کاش)</option>
                  <option value="Student Union Cash Handover">Student Union Cash Desk Handover</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md transition-all cursor-pointer"
              >
                {acc.confirmPayout}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Official Printable Invoice Modal */}
      {selectedInvoiceTx && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5">
            {/* Invoice Top Actions */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  {acc.officialReceiptTitle}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                  title="Print"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedInvoiceTx(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Invoice Sheet */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4 text-xs font-sans">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-base font-black text-indigo-700 dark:text-indigo-400">
                    {t.appName}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Kurdistan Higher Education Campus Exchange
                  </p>
                </div>
                <div className="text-end">
                  <div className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                    {selectedInvoiceTx.invoiceNumber}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {selectedInvoiceTx.date}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-1.5">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {selectedInvoiceTx.title[language]}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {selectedInvoiceTx.description[language]}
                </p>
                {selectedInvoiceTx.counterparty && (
                  <div className="text-[11px] text-slate-400">
                    Channel: {selectedInvoiceTx.counterparty}
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center text-xs font-bold border-t border-slate-200 dark:border-slate-700 pt-3">
                <span className="text-slate-600 dark:text-slate-300">{acc.amount}:</span>
                <span className="text-base font-black font-mono text-slate-900 dark:text-white">
                  {selectedInvoiceTx.amountIqd.toLocaleString()} {t.currency.iqd}
                  <span className="text-xs font-normal text-slate-400 ms-1.5">
                    (${selectedInvoiceTx.amountUsd})
                  </span>
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-[10px] text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{acc.taxExemptStudent}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
