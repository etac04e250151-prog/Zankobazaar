import React, { useState, useEffect, useMemo } from 'react';
import { 
  Language, 
  CategoryId, 
  ListingItem,
  AppNotification,
  UserAccount,
  AccountingTransaction 
} from './types';
import { TRANSLATIONS } from './i18n/translations';
import { INITIAL_ITEMS, UNIVERSITIES } from './data/mockItems';
import { Header } from './components/Header';
import { CategoryBar } from './components/CategoryBar';
import { ItemCard } from './components/ItemCard';
import { FilterSidebar } from './components/FilterSidebar';
import { ItemDetailModal } from './components/ItemDetailModal';
import { CreateListingModal } from './components/CreateListingModal';
import { AiPriceAppraiserModal } from './components/AiPriceAppraiserModal';
import { CampusChatModal } from './components/CampusChatModal';
import { SafetyGuideModal } from './components/SafetyGuideModal';
import { NotificationToast } from './components/NotificationToast';
import { TopContributorsSection } from './components/TopContributorsSection';
import { LoginModal, DEMO_ACCOUNTS } from './components/LoginModal';
import { AccountingModal } from './components/AccountingModal';
import { DashboardOverviewModal } from './components/DashboardOverviewModal';
import { subscribeToAuthChanges, logoutFirebase } from './lib/firebaseAuth';
import { 
  subscribeToMarketplaceItems, 
  saveListingItemToFirestore, 
  deleteListingItemFromFirestore,
  subscribeToTransactions,
  saveTransactionToFirestore,
  saveUserProfileToFirestore 
} from './lib/firestoreService';
import { 
  Sparkles, 
  Gift, 
  GraduationCap, 
  BookOpen, 
  ShieldCheck, 
  SlidersHorizontal,
  ChevronRight,
  ChevronLeft,
  Heart
} from 'lucide-react';

// Real clean state: all dummy notifications deleted
const DEFAULT_NOTIFICATIONS: AppNotification[] = [];

export default function App() {
  const [language, setLanguage] = useState<Language>('ku');
  const [items, setItems] = useState<ListingItem[]>(() => {
    const saved = localStorage.getItem('zankobazaar_items') || localStorage.getItem('unibazaar_items');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Clean out legacy mock dummy data
        return Array.isArray(parsed) ? parsed.filter((it: any) => !it.id?.startsWith('item-')) : [];
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('zankobazaar_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('zankobazaar_wishlist') || localStorage.getItem('unibazaar_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('zankobazaar_notifications');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed.filter((n: any) => !n.id?.startsWith('notif-')) : [];
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  // Current Logged-in User Account
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem('zankobazaar_current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    // Default to the verified student demo account so the user immediately experiences the logged-in student & accounting features
    return DEMO_ACCOUNTS[0];
  });

  // Campus Student Accounting Ledger Transactions
  const [transactions, setTransactions] = useState<AccountingTransaction[]>(() => {
    const saved = localStorage.getItem('zankobazaar_transactions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    // Initial real ledger transaction for student wallet
    return [
      {
        id: 'tx-welcome-01',
        type: 'wallet_deposit',
        title: {
          ku: 'باڵانسی خزمەتگوزاری ئەکادیمی زانکۆ بازاڕ',
          en: 'Campus Exchange Starter Balance',
          ar: 'رصيد الانضمام الأكاديمي لسوق الجامعة',
        },
        description: {
          ku: 'باڵانسی بەردەستی جزدانی خوێندکار بۆ کڕینی کتێب و کەرەستە لە کەمپدا.',
          en: 'Available student wallet credit for acquiring campus textbooks and gear.',
          ar: 'رصيد المحفظة الطلابية المتاح لشراء الكتب والمستلزمات في الحرم الجامعي.',
        },
        amountIqd: 45000,
        amountUsd: 30,
        date: '2026-10-16',
        status: 'completed',
        invoiceNumber: 'INV-2026-EPU-001',
        counterparty: 'Campus Exchange Union',
      },
    ];
  });

  const [activeToast, setActiveToast] = useState<AppNotification | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('all');
  const [selectedUniversity, setSelectedUniversity] = useState('all');
  const [selectedCondition, setSelectedCondition] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [maxPrice, setMaxPrice] = useState(1500000);
  const [isWishlistOnly, setIsWishlistOnly] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Modals state
  const [selectedItemForDetail, setSelectedItemForDetail] = useState<ListingItem | null>(null);
  const [selectedItemForChat, setSelectedItemForChat] = useState<ListingItem | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAccountingModalOpen, setIsAccountingModalOpen] = useState(false);
  const [isDashboardModalOpen, setIsDashboardModalOpen] = useState(false);

  const t = TRANSLATIONS[language];

  // Sync RTL and lang attribute
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'en' ? 'ltr' : 'rtl';
  }, [language]);

  // Sync Theme with html class & persist
  useEffect(() => {
    localStorage.setItem('zankobazaar_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Persist items
  useEffect(() => {
    localStorage.setItem('zankobazaar_items', JSON.stringify(items));
  }, [items]);

  // Persist wishlist
  useEffect(() => {
    localStorage.setItem('zankobazaar_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Persist notifications
  useEffect(() => {
    localStorage.setItem('zankobazaar_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Persist currentUser & sync to Firestore
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('zankobazaar_current_user', JSON.stringify(currentUser));
      saveUserProfileToFirestore(currentUser.id, currentUser);
    } else {
      localStorage.removeItem('zankobazaar_current_user');
    }
  }, [currentUser]);

  // Subscribe to Firebase Authentication state changes
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((firebaseUser) => {
      if (firebaseUser) {
        setCurrentUser(firebaseUser);
      }
    }, language);

    return () => unsubscribe();
  }, [language]);

  // Subscribe to real-time Firestore Marketplace items
  useEffect(() => {
    const unsubscribe = subscribeToMarketplaceItems((firestoreItems) => {
      if (firestoreItems && firestoreItems.length > 0) {
        setItems(firestoreItems);
      }
    });

    return () => unsubscribe();
  }, []);

  // Subscribe to real-time Firestore Accounting transactions
  useEffect(() => {
    const unsubscribe = subscribeToTransactions((firestoreTxs) => {
      if (firestoreTxs && firestoreTxs.length > 0) {
        setTransactions(firestoreTxs);
      }
    });

    return () => unsubscribe();
  }, []);

  // Persist transactions
  useEffect(() => {
    localStorage.setItem('zankobazaar_transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Auto-dismiss active toast after 6 seconds
  useEffect(() => {
    if (activeToast) {
      const timer = setTimeout(() => {
        setActiveToast(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [activeToast]);

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
  };

  const handleSelectNotificationItem = (itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    if (item) {
      setSelectedItemForDetail(item);
    }
  };

  const handleSimulateNotification = () => {
    const isMessage = Math.random() > 0.5;

    if (isMessage) {
      const targetItem = items[Math.floor(Math.random() * items.length)];
      const studentNames = [
        { name: 'سارە جەمیل', en: 'Sara Jameel', ar: 'سارة جميل', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80' },
        { name: 'ئالان بەرزان', en: 'Alan Barzan', ar: 'ألان برزان', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80' },
        { name: 'هێڤی نەوزاد', en: 'Hevi Nawzad', ar: 'هيفي نوزاد', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80' },
      ];
      const student = studentNames[Math.floor(Math.random() * studentNames.length)];

      const newNotif: AppNotification = {
        id: `notif-${Date.now()}`,
        type: 'message',
        title: {
          ku: `پەیامی نوێ لەسەر «${targetItem.title.ku || targetItem.title.en}»`,
          en: `New interest in "${targetItem.title.en}"`,
          ar: `استفسار جديد حول «${targetItem.title.ar || targetItem.title.en}»`,
        },
        message: {
          ku: `${student.name}: سڵاو، من حەزم بە کڕینی ئەم کەلوپەلەیە. ئایا دەتوانین لە کەمپ چاوپێکەوتن بکەین بۆ بینینی؟`,
          en: `${student.en}: Hi! I'm interested in this item. Can we coordinate a campus handover?`,
          ar: `${student.ar}: مرحباً، أنا مهتم بالحصول على هذا العنصر. هل يمكننا التنسيق للمعاينة بالحرم؟`,
        },
        itemId: targetItem.id,
        timestamp: language === 'ku' ? 'ئێستا' : language === 'ar' ? 'الآن' : 'Just now',
        read: false,
        avatar: student.avatar,
        itemTitle: targetItem.title[language] || targetItem.title.en,
      };

      setNotifications((prev) => [newNotif, ...prev]);
      setActiveToast(newNotif);
    } else {
      const targetItem = items.find((i) => !i.isFreeDonation) || items[0];
      const discountAmount = Math.max(3000, Math.round(targetItem.priceIqd * 0.15));
      const newPrice = Math.max(1000, targetItem.priceIqd - discountAmount);

      setItems((prev) =>
        prev.map((i) =>
          i.id === targetItem.id
            ? {
                ...i,
                priceIqd: newPrice,
                priceUsd: Math.round(newPrice / 1460),
              }
            : i
        )
      );

      const newNotif: AppNotification = {
        id: `notif-${Date.now()}`,
        type: 'price_drop',
        title: {
          ku: `داشکاندنی نرخی دڵخوازەکەت: ${targetItem.title.ku || targetItem.title.en}`,
          en: `Price Drop on Wishlist: ${targetItem.title.en}`,
          ar: `تخفيض سعر عنصر بالمفضلة: ${targetItem.title.ar || targetItem.title.en}`,
        },
        message: {
          ku: `نرخی ئەم کەلوپەلەی دڵخوازت لە ${targetItem.priceIqd.toLocaleString()} د.ع دابەزی بۆ ${newPrice.toLocaleString()} د.ع!`,
          en: `Price dropped from ${targetItem.priceIqd.toLocaleString()} IQD to ${newPrice.toLocaleString()} IQD!`,
          ar: `انخفض السعر من ${targetItem.priceIqd.toLocaleString()} د.ع إلى ${newPrice.toLocaleString()} د.ع!`,
        },
        itemId: targetItem.id,
        oldPrice: targetItem.priceIqd,
        newPrice,
        timestamp: language === 'ku' ? 'ئێستا' : language === 'ar' ? 'الآن' : 'Just now',
        read: false,
        itemTitle: targetItem.title[language] || targetItem.title.en,
      };

      setNotifications((prev) => [newNotif, ...prev]);
      setActiveToast(newNotif);
    }
  };

  const toggleWishlist = (itemId: string) => {
    setWishlist((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const handleLogin = (user: UserAccount) => {
    setCurrentUser(user);
  };

  const handleLogout = async () => {
    try {
      await logoutFirebase();
    } catch (e) {
      // non-blocking
    }
    setCurrentUser(null);
  };

  const handleAddTransaction = (newTx: AccountingTransaction) => {
    setTransactions((prev) => [newTx, ...prev]);
    saveTransactionToFirestore(newTx);
  };

  const handleUpdateWalletBalance = (newIqd: number, newUsd: number) => {
    if (currentUser) {
      const updated = {
        ...currentUser,
        campusWalletBalanceIqd: newIqd,
        campusWalletBalanceUsd: newUsd,
      };
      setCurrentUser(updated);
      saveUserProfileToFirestore(currentUser.id, updated);
    }
  };

  const handleAddItem = (newItem: ListingItem) => {
    setItems((prev) => [newItem, ...prev]);
    saveListingItemToFirestore(newItem);

    // Automatically record in campus student accounting ledger
    const isDonation = newItem.isFreeDonation;
    const newTx: AccountingTransaction = {
      id: `tx-list-${Date.now()}`,
      type: isDonation ? 'free_donation_saving' : 'sale_earning',
      title: {
        ku: isDonation
          ? `بەخشینی خۆڕایی: ${newItem.title.ku || newItem.title.en}`
          : `دانانی کەلوپەل بۆ فرۆشتن: ${newItem.title.ku || newItem.title.en}`,
        en: isDonation
          ? `Free Academic Donation: ${newItem.title.en}`
          : `New Campus Listing: ${newItem.title.en}`,
        ar: isDonation
          ? `إهداء دراسي مجاني: ${newItem.title.ar || newItem.title.en}`
          : `عرض مادة للبيع: ${newItem.title.ar || newItem.title.en}`,
      },
      description: {
        ku: `تۆمارکرا لە بەشی ${newItem.department} - کەمپ`,
        en: `Listed under ${newItem.department} - Campus`,
        ar: `أدرجت ضمن قسم ${newItem.department} - الحرم الجامعي`,
      },
      amountIqd: newItem.priceIqd,
      amountUsd: newItem.priceUsd,
      date: new Date().toISOString().split('T')[0],
      status: 'completed',
      referenceItemId: newItem.id,
      invoiceNumber: `LST-${Math.floor(100000 + Math.random() * 900000)}`,
      counterparty: newItem.campusLocation,
    };
    setTransactions((prev) => [newTx, ...prev]);
    saveTransactionToFirestore(newTx);
  };

  const handleDeleteItem = (itemId: string) => {
    setItems((prev) => prev.filter((it) => it.id !== itemId));
    deleteListingItemFromFirestore(itemId);
  };

  // Filter and sort items
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const title = (item.title[language] || item.title.en).toLowerCase();
          const desc = (item.description[language] || item.description.en).toLowerCase();
          const dept = item.department.toLowerCase();
          const loc = item.campusLocation.toLowerCase();
          const sellerName = item.seller.name.toLowerCase();

          if (!title.includes(q) && !desc.includes(q) && !dept.includes(q) && !loc.includes(q) && !sellerName.includes(q)) {
            return false;
          }
        }

        // Category
        if (selectedCategory !== 'all') {
          if (item.category !== selectedCategory) return false;
        }

        // University
        if (selectedUniversity !== 'all') {
          if (item.universityId !== selectedUniversity) return false;
        }

        // Condition
        if (selectedCondition !== 'all') {
          if (item.condition !== selectedCondition) return false;
        }

        // Seller Role
        if (selectedRole !== 'all') {
          if (item.seller.role !== selectedRole) return false;
        }

        // Price
        if (!item.isFreeDonation && item.priceIqd > maxPrice) {
          return false;
        }

        // Wishlist Only
        if (isWishlistOnly && !wishlist.includes(item.id)) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') {
          return a.priceIqd - b.priceIqd;
        }
        if (sortBy === 'price_desc') {
          return b.priceIqd - a.priceIqd;
        }
        if (sortBy === 'popular') {
          return b.views - a.views;
        }
        // Newest
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [
    items,
    searchQuery,
    selectedCategory,
    selectedUniversity,
    selectedCondition,
    selectedRole,
    sortBy,
    maxPrice,
    isWishlistOnly,
    wishlist,
    language,
  ]);

  // Item counts per category
  const itemCounts = useMemo(() => {
    const counts: Record<CategoryId, number> = {
      all: items.length,
      books: 0,
      lab_gear: 0,
      electronics: 0,
      services: 0,
      dorm: 0,
      free_donation: 0,
    };

    items.forEach((item) => {
      if (counts[item.category] !== undefined) {
        counts[item.category]++;
      }
    });

    return counts;
  }, [items]);

  const hasActiveFilters =
    selectedUniversity !== 'all' ||
    selectedCondition !== 'all' ||
    selectedRole !== 'all' ||
    maxPrice < 1500000 ||
    isWishlistOnly ||
    selectedCategory !== 'all' ||
    Boolean(searchQuery);

  const resetAllFilters = () => {
    setSelectedUniversity('all');
    setSelectedCondition('all');
    setSelectedRole('all');
    setMaxPrice(1500000);
    setIsWishlistOnly(false);
    setSelectedCategory('all');
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      {/* App Header */}
      <Header
        language={language}
        onLanguageChange={setLanguage}
        theme={theme}
        onToggleTheme={toggleTheme}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        onOpenPriceModal={() => setIsPriceModalOpen(true)}
        onOpenSafetyModal={() => setIsSafetyModalOpen(true)}
        wishlistCount={wishlist.length}
        onToggleWishlistFilter={() => setIsWishlistOnly((prev) => !prev)}
        isWishlistOnly={isWishlistOnly}
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
        onClearAllNotifications={handleClearAllNotifications}
        onSelectNotificationItem={handleSelectNotificationItem}
        onSimulateNotification={handleSimulateNotification}
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onOpenAccounting={() => setIsAccountingModalOpen(true)}
        onOpenDashboard={() => setIsDashboardModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Category Segmented Bar */}
      <CategoryBar
        language={language}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        itemCounts={itemCounts}
      />

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Hero / Solidarity Highlight Banner */}
        {selectedCategory === 'all' && !searchQuery && !isWishlistOnly && (
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 sm:p-8 shadow-xl">
            <div className="relative z-10 max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-semibold backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
                <span>
                  {language === 'ku' && 'ژینگەی نوێی خوێندنی ئەکادیمی بە پاڵپشتی ژیریی دەستکرد'}
                  {language === 'en' && 'Smart Campus Academic Exchange with Gemini AI'}
                  {language === 'ar' && 'بيئة أكاديمية ذكية مدعومة بتقنيات Gemini AI'}
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent drop-shadow-sm">
                {language === 'ku' && 'پێداویستییەکانت لێرە بکڕە و بفرۆشە'}
                {language === 'en' && 'Buy & Sell Your Academic Supplies Here'}
                {language === 'ar' && 'اشترِ وبِع كافة مستلزماتك الجامعية هنا'}
              </h1>

              <p className="text-sm sm:text-base md:text-lg text-white/95 font-medium leading-relaxed max-w-2xl bg-white/10 backdrop-blur-md px-5 py-3.5 rounded-2xl border border-white/20 shadow-lg shadow-indigo-950/20">
                {language === 'ku' && 'ئەپێک بۆ بازاڕکردنی ئۆنلاین، کڕین و فرۆشتن بۆ قوتابیان، مامۆستا و کارمەندانی زانکۆکان'}
                {language === 'en' && 'An online marketplace for buying and selling for university students, faculty, and campus staff.'}
                {language === 'ar' && 'تطبيق للتسوق الإلكتروني، البيع والشراء لطلاب وأساتذة وموظفي الجامعات.'}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-5 py-2.5 bg-white text-indigo-900 hover:bg-indigo-50 active:bg-indigo-100 font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer"
                >
                  {t.postListing}
                </button>

                <button
                  onClick={() => setIsPriceModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-indigo-700/60 hover:bg-indigo-700 border border-indigo-400/40 text-white font-medium text-xs sm:text-sm rounded-xl transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-indigo-300" />
                  <span>{t.aiPriceCheck}</span>
                </button>

                <button
                  onClick={() => setSelectedCategory('free_donation')}
                  className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600/80 hover:bg-emerald-600 text-white font-medium text-xs sm:text-sm rounded-xl transition-all cursor-pointer"
                >
                  <Gift className="w-4 h-4 text-emerald-200" />
                  <span>{t.categories.free_donation}</span>
                </button>
              </div>
            </div>

            {/* Subtle decorative background graphic */}
            <div className="absolute top-0 end-0 -mt-8 -me-8 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 end-12 opacity-15 hidden md:block pointer-events-none">
              <GraduationCap className="w-64 h-64 text-white" />
            </div>
          </div>
        )}

        {/* Free Student Exchange Callout (When category is free_donation) */}
        {selectedCategory === 'free_donation' && (
          <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Gift className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-emerald-950 dark:text-emerald-200">
                  {t.freeDonationCornerTitle}
                </h3>
                <p className="text-xs text-emerald-800 dark:text-emerald-300">
                  {t.freeDonationCornerDesc}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setIsCreateModalOpen(true);
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              + {language === 'ku' ? 'کتێبێک ببەخشە بە خۆڕایی' : language === 'ar' ? 'تبرع بكتاب مجاناً' : 'Donate a Textbook'}
            </button>
          </div>
        )}

        {/* Mobile Filter Toggle Button */}
        <div className="flex lg:hidden items-center justify-between">
          <button
            onClick={() => setShowMobileFilters((prev) => !prev)}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 shadow-xs cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>{language === 'ku' ? 'فلتەرکردن و زانکۆکان' : language === 'ar' ? 'تصفية حسب الجامعة' : 'Filter by Campus'}</span>
          </button>

          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            {filteredItems.length} {language === 'ku' ? 'کەلوپەل' : language === 'ar' ? 'إعلان' : 'items'}
          </span>
        </div>

        {/* Layout: Sidebar + Listings Grid */}
        <div className="flex flex-col lg:flex-row items-start gap-6">
          {/* Sidebar for Desktop or when opened on Mobile */}
          <div className={`${showMobileFilters ? 'block' : 'hidden lg:block'} w-full lg:w-64 shrink-0`}>
            <FilterSidebar
              language={language}
              selectedUniversity={selectedUniversity}
              onSelectUniversity={setSelectedUniversity}
              selectedCondition={selectedCondition}
              onSelectCondition={setSelectedCondition}
              selectedRole={selectedRole}
              onSelectRole={setSelectedRole}
              sortBy={sortBy}
              onSortByChange={setSortBy}
              maxPrice={maxPrice}
              onMaxPriceChange={setMaxPrice}
              onResetFilters={resetAllFilters}
              hasActiveFilters={hasActiveFilters}
            />
          </div>

          {/* Listings Grid Area */}
          <div className="flex-1 w-full space-y-4">
            {/* Grid Header Info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {selectedCategory === 'all'
                    ? language === 'ku'
                      ? 'هەموو کەلوپەلە بەردەستەکان'
                      : language === 'ar'
                      ? 'كافة المعروضات في الجامعات'
                      : 'All Campus Listings'
                    : t.categories[selectedCategory as keyof typeof t.categories]}
                </h2>
                <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                  ({filteredItems.length})
                </span>
              </div>

              {isWishlistOnly && (
                <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium">
                  <Heart className="w-4 h-4 fill-rose-500" />
                  <span>{language === 'ku' ? 'تەنها دڵخوازەکانت' : language === 'ar' ? 'المفضلة فقط' : 'Wishlist Only'}</span>
                </div>
              )}
            </div>

            {/* Empty State */}
            {filteredItems.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
                <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                  {t.noItemsFound}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  {language === 'ku' && 'دەتوانیت مەرجەکانی فلتەر کەم بکەیتەوە یان خۆت یەکەم کەس بە کە ئەم کەلوپەلە بڵاوبکەیتەوە.'}
                  {language === 'en' && 'Try clearing filters or be the first student to post this item on your campus!'}
                  {language === 'ar' && 'جرب إعادة تعيين الفلاتر أو كن أول من يضيف هذا العنصر بالحرم الجامعي.'}
                </p>
                <div className="pt-2 flex justify-center gap-2">
                  <button
                    onClick={resetAllFilters}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    {t.resetFilters}
                  </button>
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    {t.postListing}
                  </button>
                </div>
              </div>
            ) : (
              /* Items Grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredItems.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    language={language}
                    onSelectItem={setSelectedItemForDetail}
                    onOpenChat={setSelectedItemForChat}
                    isWishlisted={wishlist.includes(item.id)}
                    onToggleWishlist={toggleWishlist}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer with D3 Top Contributors Section */}
      <footer className="mt-16 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 transition-colors">
        <TopContributorsSection
          language={language}
          items={items}
          theme={theme}
          onOpenCreateModal={() => setIsCreateModalOpen(true)}
          onFilterByCategory={(cat) => setSelectedCategory(cat)}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8 border-t border-slate-200 dark:border-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <span className="font-bold text-base text-slate-900 dark:text-white">
                  {t.appName}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {t.footer.aboutText}
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                {language === 'ku' ? 'زانکۆکانی بەشداربوو' : language === 'ar' ? 'الجامعات والكليات' : 'Campuses Supported'}
              </h4>
              <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
                {UNIVERSITIES.map((u) => (
                  <li key={u.id} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    {u.name[language] || u.name.en}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{t.footer.safetyTitle}</span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {t.footer.safetyText}
              </p>
              <button
                onClick={() => setIsSafetyModalOpen(true)}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                {t.safetyGuide} →
              </button>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400 dark:text-slate-500">
            <p>{t.footer.copyright}</p>
            <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/50 dark:border-indigo-800/60 px-3 py-1 rounded-lg">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
              <span className="font-medium">
                {language === 'ku' ? 'تایبەتمەندی زیرەکی دەستکرد بە مۆدێلی Gemini Flash' : 'Powered by Gemini Flash AI'}
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {selectedItemForDetail && (
        <ItemDetailModal
          item={selectedItemForDetail}
          language={language}
          onClose={() => setSelectedItemForDetail(null)}
          onOpenChat={(item) => {
            setSelectedItemForDetail(null);
            setSelectedItemForChat(item);
          }}
          isWishlisted={wishlist.includes(selectedItemForDetail.id)}
          onToggleWishlist={toggleWishlist}
        />
      )}

      {selectedItemForChat && (
        <CampusChatModal
          item={selectedItemForChat}
          language={language}
          onClose={() => setSelectedItemForChat(null)}
        />
      )}

      {isCreateModalOpen && (
        <CreateListingModal
          language={language}
          onClose={() => setIsCreateModalOpen(false)}
          onAddItem={handleAddItem}
          currentUser={currentUser}
        />
      )}

      {/* User Login & Profile Modal */}
      <LoginModal
        language={language}
        isOpen={isLoginModalOpen}
        currentUser={currentUser}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onOpenAccounting={() => setIsAccountingModalOpen(true)}
        onOpenDashboard={() => setIsDashboardModalOpen(true)}
      />

      {/* Campus Dashboard Overview Modal */}
      <DashboardOverviewModal
        language={language}
        isOpen={isDashboardModalOpen}
        currentUser={currentUser}
        items={items}
        transactions={transactions}
        onClose={() => setIsDashboardModalOpen(false)}
        onOpenCreateListing={() => setIsCreateModalOpen(true)}
        onOpenAccounting={() => setIsAccountingModalOpen(true)}
        onOpenProfile={() => setIsLoginModalOpen(true)}
        onSelectItemForDetail={(item) => setSelectedItemForDetail(item)}
        onDeleteItem={handleDeleteItem}
      />

      {/* Campus Accounting & Student Ledger Modal */}
      <AccountingModal
        language={language}
        isOpen={isAccountingModalOpen}
        currentUser={currentUser}
        transactions={transactions}
        onClose={() => setIsAccountingModalOpen(false)}
        onAddTransaction={handleAddTransaction}
        onUpdateWalletBalance={handleUpdateWalletBalance}
        onOpenLogin={() => setIsLoginModalOpen(true)}
      />

      {isPriceModalOpen && (
        <AiPriceAppraiserModal
          language={language}
          onClose={() => setIsPriceModalOpen(false)}
        />
      )}

      {isSafetyModalOpen && (
        <SafetyGuideModal
          language={language}
          onClose={() => setIsSafetyModalOpen(false)}
        />
      )}

      {/* Real-time Notification Toast Alert */}
      <NotificationToast
        notification={activeToast}
        language={language}
        onClose={() => setActiveToast(null)}
        onClick={(itemId) => {
          if (itemId) handleSelectNotificationItem(itemId);
        }}
      />
    </div>
  );
}
