import React, { useState } from 'react';
import { Language, UserAccount, UserRole } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { UNIVERSITIES } from '../data/mockItems';
import { 
  X, 
  LogIn, 
  UserPlus, 
  GraduationCap, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  Wallet, 
  Building2, 
  Phone, 
  Mail, 
  Lock, 
  User, 
  LogOut,
  ArrowRight,
  Loader2,
  LayoutDashboard
} from 'lucide-react';
import {
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  logoutFirebase,
  formatAuthError
} from '../lib/firebaseAuth';

interface LoginModalProps {
  language: Language;
  isOpen: boolean;
  currentUser: UserAccount | null;
  onClose: () => void;
  onLogin: (user: UserAccount) => void;
  onLogout: () => void;
  onOpenAccounting?: () => void;
  onOpenDashboard?: () => void;
}

export const DEMO_ACCOUNTS: UserAccount[] = [
  {
    id: 'user-rawand',
    name: 'ڕەوەند کاروان (Rawand)',
    email: 'rawand.karwan@epu.edu.iq',
    role: 'student',
    universityId: 'epu',
    universityName: 'Erbil Polytechnic University (EPU)',
    department: 'Software Engineering (ئەندازیاری نەرمەکاڵا)',
    studentIdNumber: 'EPU-2023-8819',
    phone: '+964 750 442 8190',
    whatsapp: '9647504428190',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    verifiedStudentId: true,
    joinedYear: '2023',
    campusWalletBalanceIqd: 45000,
    campusWalletBalanceUsd: 30,
  },
  {
    id: 'user-darya',
    name: 'دەریـا ساڵح (Darya - Accounting)',
    email: 'darya.accounting@su.edu.krd',
    role: 'student',
    universityId: 'salahaddin',
    universityName: 'Salahaddin University - Erbil',
    department: 'Accounting & Finance (بەشی ژمێریاری و دارایی)',
    studentIdNumber: 'UOS-ACC-2024-114',
    phone: '+964 750 621 9904',
    whatsapp: '9647506219904',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    verifiedStudentId: true,
    joinedYear: '2024',
    campusWalletBalanceIqd: 82000,
    campusWalletBalanceUsd: 55,
  },
  {
    id: 'user-soran',
    name: 'د. سۆران ئەحمەد (Dr. Soran)',
    email: 'soran.ahmed@hmu.edu.krd',
    role: 'lecturer',
    universityId: 'hmu',
    universityName: 'Hawler Medical University (HMU)',
    department: 'College of Medicine (کۆلێژی پزیشکی گشتی)',
    studentIdNumber: 'HMU-FAC-5091',
    phone: '+964 750 119 4432',
    whatsapp: '9647501194432',
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=200&q=80',
    verifiedStudentId: true,
    joinedYear: '2021',
    campusWalletBalanceIqd: 140000,
    campusWalletBalanceUsd: 95,
  },
];

export const LoginModal: React.FC<LoginModalProps> = ({
  language,
  isOpen,
  currentUser,
  onClose,
  onLogin,
  onLogout,
  onOpenAccounting,
  onOpenDashboard,
}) => {
  const [tab, setTab] = useState<'signin' | 'register'>('signin');
  const [emailOrId, setEmailOrId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Register Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regUniversityId, setRegUniversityId] = useState('epu');
  const [regDepartment, setRegDepartment] = useState('Accounting & Finance (بەشی ژمێریاری)');
  const [regStudentId, setRegStudentId] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('student');
  const [regPhone, setRegPhone] = useState('+964 750 ');

  if (!isOpen) return null;

  const t = TRANSLATIONS[language];
  const a = t.auth;

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsGoogleLoading(true);
    try {
      const user = await signInWithGoogle(language);
      onLogin(user);
      onClose();
    } catch (err: any) {
      setError(formatAuthError(err, language));
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedInput = emailOrId.trim();
    if (!trimmedInput) {
      setError(
        language === 'ku'
          ? 'تکایە ئیمەیڵ یان کۆدی زانکۆ بنووسە'
          : language === 'ar'
          ? 'يرجى كتابة البريد أو رقم الطالب'
          : 'Please enter university email or student ID'
      );
      return;
    }

    // Match existing demo account if user selects or types demo account
    const matched = DEMO_ACCOUNTS.find(
      (u) =>
        u.email.toLowerCase() === trimmedInput.toLowerCase() ||
        u.studentIdNumber.toLowerCase() === trimmedInput.toLowerCase()
    );

    // If demo account matched and user didn't enter a password, allow 1-click test login
    if (matched && !password) {
      onLogin(matched);
      onClose();
      return;
    }

    if (!password) {
      setError(
        language === 'ku'
          ? 'تکایە وشەی تێپەڕ بنووسە'
          : language === 'ar'
          ? 'يرجى إدخال كلمة المرور'
          : 'Please enter your password'
      );
      return;
    }

    const emailToUse = trimmedInput.includes('@') ? trimmedInput : `${trimmedInput}@epu.edu.iq`;

    setIsLoading(true);
    try {
      const user = await signInWithEmail(emailToUse, password, language);
      onLogin(user);
      onClose();
    } catch (err: any) {
      if (matched) {
        onLogin(matched);
        onClose();
      } else {
        setError(formatAuthError(err, language));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = regName.trim();
    const trimmedEmail = regEmail.trim();
    const trimmedPassword = regPassword.trim();

    if (!trimmedName || !trimmedEmail) {
      setError(
        language === 'ku'
          ? 'تکایە ناوی تەواو و ئیمەیڵ بنووسە'
          : language === 'ar'
          ? 'يرجى إدخال الاسم والبريد'
          : 'Please provide full name and university email'
      );
      return;
    }

    if (!trimmedPassword || trimmedPassword.length < 6) {
      setError(
        language === 'ku'
          ? 'وشەی تێپەڕ دەبێت لانیکەم ٦ پیت یان ژمارە بێت'
          : language === 'ar'
          ? 'يجب أن تتكون كلمة المرور من 6 أحرف على الأقل'
          : 'Password must be at least 6 characters'
      );
      return;
    }

    const selectedUni = UNIVERSITIES.find((u) => u.id === regUniversityId) || UNIVERSITIES[0];

    setIsLoading(true);
    try {
      const user = await signUpWithEmail(
        trimmedEmail,
        trimmedPassword,
        {
          name: trimmedName,
          universityId: selectedUni.id,
          universityName: selectedUni.name[language],
          department: regDepartment.trim() || 'Accounting & Administration',
          role: regRole,
          studentIdNumber: regStudentId.trim() || `${selectedUni.shortName}-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          phone: regPhone.trim(),
        },
        language
      );
      onLogin(user);
      onClose();
    } catch (err: any) {
      setError(formatAuthError(err, language));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectDemo = (account: UserAccount) => {
    onLogin(account);
    onClose();
  };

  const handleLogoutClick = async () => {
    try {
      await logoutFirebase();
    } catch (e) {
      // non-blocking
    }
    onLogout();
    setTab('signin');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200 dark:shadow-none">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {currentUser ? a.myAccount : a.login}
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300">
                  {currentUser ? a.verifiedBadge : 'Kurdistan Universities'}
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {currentUser ? `${currentUser.universityName} • ${currentUser.department}` : a.signInDesc}
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Active Logged In View */}
          {currentUser ? (
            <div className="space-y-5">
              <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/30 border border-indigo-200/80 dark:border-slate-800 flex items-center gap-4">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-indigo-500 shadow-md"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                      {currentUser.name}
                    </h3>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 truncate">
                    {currentUser.department}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-mono mt-0.5">
                    ID: {currentUser.studentIdNumber} • {currentUser.email}
                  </p>
                </div>
              </div>

              {/* Wallet & Accounting Quick Card */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block">
                      {t.accounting.walletBalance}
                    </span>
                    <span className="text-base font-black text-slate-900 dark:text-white font-mono">
                      {currentUser.campusWalletBalanceIqd.toLocaleString()} {t.currency.iqd}
                      <span className="text-xs font-normal text-slate-400 ms-2">
                        (~${currentUser.campusWalletBalanceUsd})
                      </span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {onOpenDashboard && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenDashboard();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>{t.dashboard.title}</span>
                    </button>
                  )}
                  {onOpenAccounting && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenAccounting();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>{t.accounting.title}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Logout & Actions */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={handleLogoutClick}
                  className="px-4 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 border border-rose-200 dark:border-rose-900 rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{a.logout}</span>
                </button>

                <button
                  onClick={handleLogoutClick}
                  className="text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer"
                >
                  {a.switchAccount}
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Tabs: Sign In / Register */}
              <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => {
                    setTab('signin');
                    setError(null);
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    tab === 'signin'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>{a.login}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTab('register');
                    setError(null);
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    tab === 'register'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{a.register}</span>
                </button>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 dark:text-rose-400">
                  {error}
                </div>
              )}

              {/* Google Sign In Option */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading || isGoogleLoading}
                  className="w-full py-2.5 px-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 active:bg-slate-100 dark:active:bg-slate-700/80 text-slate-700 dark:text-slate-200 font-semibold text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs hover:border-slate-300 dark:hover:border-slate-600 transition-all cursor-pointer flex items-center justify-center gap-2.5 disabled:opacity-60"
                >
                  {isGoogleLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-600 dark:text-indigo-400" />
                  ) : (
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  )}
                  <span>
                    {isGoogleLoading
                      ? (language === 'ku' ? 'چاوەڕوانبە...' : language === 'ar' ? 'جارٍ الاتصال بـ Google...' : 'Connecting to Google...')
                      : (a.googleSignIn || 'Continue with Google')}
                  </span>
                </button>

                {/* Divider */}
                <div className="relative flex items-center justify-center">
                  <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
                  <span className="bg-white dark:bg-slate-900 px-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 shrink-0">
                    {a.orDivider || 'or'}
                  </span>
                  <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
                </div>
              </div>

              {tab === 'signin' ? (
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      {a.emailOrStudentId}
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={emailOrId}
                        onChange={(e) => setEmailOrId(e.target.value)}
                        placeholder={a.emailPlaceholder}
                        className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm rounded-xl ps-10 pe-4 py-2.5 border border-slate-200 dark:border-slate-700 focus:border-indigo-600 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      {a.password}
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={a.passwordPlaceholder}
                        className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm rounded-xl ps-10 pe-4 py-2.5 border border-slate-200 dark:border-slate-700 focus:border-indigo-600 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-60 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-200 dark:shadow-none transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <LogIn className="w-4 h-4" />
                    )}
                    <span>{isLoading ? (language === 'ku' ? 'چاوەڕوانبە...' : language === 'ar' ? 'جارٍ تسجيل الدخول...' : 'Signing In...') : a.signInBtn}</span>
                  </button>
                </form>
              ) : (
                <form onSubmit={handleRegister} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {a.fullName} *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder={a.fullNamePlaceholder}
                        required
                        className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm rounded-xl ps-10 pe-4 py-2 border border-slate-200 dark:border-slate-700 focus:border-indigo-600 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        {a.university}
                      </label>
                      <select
                        value={regUniversityId}
                        onChange={(e) => setRegUniversityId(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-700 outline-none cursor-pointer"
                      >
                        {UNIVERSITIES.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name[language]}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        {a.role}
                      </label>
                      <select
                        value={regRole}
                        onChange={(e) => setRegRole(e.target.value as UserRole)}
                        className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-700 outline-none cursor-pointer"
                      >
                        <option value="student">{t.filterByRole.student}</option>
                        <option value="lecturer">{t.filterByRole.lecturer}</option>
                        <option value="staff">{t.filterByRole.staff}</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {a.department}
                    </label>
                    <input
                      type="text"
                      value={regDepartment}
                      onChange={(e) => setRegDepartment(e.target.value)}
                      placeholder={a.departmentPlaceholder}
                      className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-700 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        {a.emailOrStudentId} *
                      </label>
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="user@epu.edu.iq"
                        required
                        className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-700 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        {a.password} * (min. 6)
                      </label>
                      <div className="relative">
                        <Lock className="w-3.5 h-3.5 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="password"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder={a.passwordPlaceholder}
                          required
                          minLength={6}
                          className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs rounded-xl ps-9 pe-3 py-2 border border-slate-200 dark:border-slate-700 outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        {a.studentId}
                      </label>
                      <input
                        type="text"
                        value={regStudentId}
                        onChange={(e) => setRegStudentId(e.target.value)}
                        placeholder={a.studentIdPlaceholder}
                        className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-700 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        {a.phone}
                      </label>
                      <input
                        type="text"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="+964 750 000 0000"
                        className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-700 outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <UserPlus className="w-4 h-4" />
                    )}
                    <span>{isLoading ? (language === 'ku' ? 'دروستکردنی هەژمار...' : language === 'ar' ? 'جارٍ إنشاء الحساب...' : 'Creating Account...') : a.createAccountBtn}</span>
                  </button>
                </form>
              )}


            </>
          )}
        </div>
      </div>
    </div>
  );
};
