export type Language = 'ku' | 'en' | 'ar';

export type CategoryId = 'all' | 'books' | 'lab_gear' | 'electronics' | 'services' | 'dorm' | 'free_donation';

export type ItemCondition = 'brand_new' | 'like_new' | 'good' | 'acceptable';

export type UserRole = 'student' | 'lecturer' | 'staff' | 'alumni';

export interface University {
  id: string;
  name: {
    ku: string;
    en: string;
    ar: string;
  };
  shortName: string;
  city: string;
}

export interface ListingItem {
  id: string;
  title: {
    ku: string;
    en: string;
    ar: string;
  };
  description: {
    ku: string;
    en: string;
    ar: string;
  };
  priceIqd: number;
  priceUsd: number;
  isFreeDonation: boolean;
  category: CategoryId;
  condition: ItemCondition;
  department: string;
  universityId: string;
  campusLocation: string;
  images: string[];
  seller: {
    name: string;
    role: UserRole;
    department: string;
    university: string;
    verifiedStudentId: boolean;
    rating: number;
    phone: string;
    whatsapp: string;
    avatar: string;
    joinedYear: string;
  };
  highlights: string[];
  targetSemesters?: string;
  createdAt: string;
  views: number;
  likes: number;
}

export interface AiDescriptionResponse {
  title: string;
  description: string;
  highlights: string[];
  targetMajors: string[];
  tags: string[];
}

export interface AiPriceAdvisorResponse {
  recommendedPriceIqd: number;
  minPriceIqd: number;
  maxPriceIqd: number;
  recommendedPriceUsd: number;
  demandRating: string;
  appraisalVerdict: string;
  reasoning: string;
  sellerTips: string[];
  buyerInspectionTips: string[];
}

export interface AiSyllabusResponse {
  itemSummary: string;
  relevantCourses: string[];
  idealForStage: string;
  academicValueTip: string;
  studyRecommendations: string[];
}

export interface AiDealResponse {
  suggestedReplies: string[];
  safeMeetingSpots: string[];
  negotiationAdvice: string;
  safetyReminder: string;
}

export interface AppNotification {
  id: string;
  type: 'message' | 'price_drop' | 'interest';
  title: {
    ku: string;
    en: string;
    ar: string;
  };
  message: {
    ku: string;
    en: string;
    ar: string;
  };
  itemId?: string;
  timestamp: string;
  read: boolean;
  avatar?: string;
  itemTitle?: string;
  oldPrice?: number;
  newPrice?: number;
}

export interface DepartmentContribution {
  id: string;
  name: {
    ku: string;
    en: string;
    ar: string;
  };
  universityShort: string;
  universityName: {
    ku: string;
    en: string;
    ar: string;
  };
  booksShared: number;
  freeDonations: number;
  studentsHelped: number;
  estimatedSavingsIqd: number;
  color: string;
}

export interface StudentContributor {
  id: string;
  name: {
    ku: string;
    en: string;
    ar: string;
  };
  department: {
    ku: string;
    en: string;
    ar: string;
  };
  universityShort: string;
  universityName: {
    ku: string;
    en: string;
    ar: string;
  };
  avatar: string;
  role: UserRole;
  verified: boolean;
  booksShared: number;
  freeDonations: number;
  studentsHelped: number;
  estimatedSavingsIqd: number;
  badge: {
    ku: string;
    en: string;
    ar: string;
  };
  favoriteQuote?: {
    ku: string;
    en: string;
    ar: string;
  };
}

export interface ContributionCategoryDistribution {
  id: string;
  label: {
    ku: string;
    en: string;
    ar: string;
  };
  count: number;
  percentage: number;
  color: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  universityId: string;
  universityName: string;
  department: string;
  studentIdNumber: string;
  phone: string;
  whatsapp?: string;
  avatar: string;
  verifiedStudentId: boolean;
  joinedYear: string;
  campusWalletBalanceIqd: number;
  campusWalletBalanceUsd: number;
}

export type TransactionType = 'sale_earning' | 'purchase' | 'free_donation_saving' | 'wallet_deposit' | 'payout_withdrawal';

export interface AccountingTransaction {
  id: string;
  type: TransactionType;
  title: {
    ku: string;
    en: string;
    ar: string;
  };
  description: {
    ku: string;
    en: string;
    ar: string;
  };
  amountIqd: number;
  amountUsd: number;
  date: string;
  status: 'completed' | 'pending' | 'escrow';
  referenceItemId?: string;
  invoiceNumber: string;
  counterparty?: string;
  category?: string;
}

export interface AccountingSummary {
  walletBalanceIqd: number;
  walletBalanceUsd: number;
  totalEarningsIqd: number;
  totalEarningsUsd: number;
  totalExpensesIqd: number;
  totalExpensesUsd: number;
  totalDonationSavingsIqd: number;
  totalDonationSavingsUsd: number;
  completedTransactionsCount: number;
  pendingTransactionsCount: number;
}

