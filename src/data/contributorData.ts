import { DepartmentContribution, StudentContributor, ContributionCategoryDistribution } from '../types';

export const DEPARTMENTS_DATA: DepartmentContribution[] = [
  {
    id: 'dept-med-pharm',
    name: {
      ku: 'پزیشکی گشتی، ددان و دەرمانسازی',
      en: 'Medicine, Dentistry & Pharmacy',
      ar: 'الطب البشري وطب الأسنان والصيدلة',
    },
    universityShort: 'HMU / UOS',
    universityName: {
      ku: 'زانکۆی پزیشکی هەولێر و سلێمانی',
      en: 'Hawler Medical Univ. & Sulaimani',
      ar: 'جامعة هولير الطبية والسليمانية',
    },
    booksShared: 76,
    freeDonations: 48,
    studentsHelped: 164,
    estimatedSavingsIqd: 4250000,
    color: '#0284c7', // Sky-600
  },
  {
    id: 'dept-soft-eng',
    name: {
      ku: 'ئەندازیاری نەرمەکاڵا و کۆمپیوتەر',
      en: 'Software & Computer Engineering',
      ar: 'هندسة البرمجيات وتكنولوجيا المعلومات',
    },
    universityShort: 'EPU / UOS',
    universityName: {
      ku: 'پۆلیتەکنیکی هەولێر و سەڵاحەدین',
      en: 'Erbil Polytechnic & Salahaddin Univ.',
      ar: 'بوليتكنيك أربيل وصلاح الدين',
    },
    booksShared: 64,
    freeDonations: 42,
    studentsHelped: 138,
    estimatedSavingsIqd: 3150000,
    color: '#4f46e5', // Indigo-600
  },
  {
    id: 'dept-civil-arch',
    name: {
      ku: 'ئەندازیاری شارستانی و تەلارسازی',
      en: 'Civil & Architectural Engineering',
      ar: 'الهندسة المدنية والمعمارية',
    },
    universityShort: 'EPU / UOS',
    universityName: {
      ku: 'پۆلیتەکنیکی هەولێر و سەڵاحەدین',
      en: 'Erbil Polytechnic & Salahaddin Univ.',
      ar: 'بوليتكنيك أربيل وصلاح الدين',
    },
    booksShared: 52,
    freeDonations: 31,
    studentsHelped: 98,
    estimatedSavingsIqd: 2180000,
    color: '#059669', // Emerald-600
  },
  {
    id: 'dept-sciences',
    name: {
      ku: 'زانستە بنەڕەتییەکان و بایۆلۆجی',
      en: 'Basic Sciences & Biology',
      ar: 'العلوم الأساسية وعلم الأحياء',
    },
    universityShort: 'UOS-Suli',
    universityName: {
      ku: 'زانکۆی سلێمانی',
      en: 'University of Sulaimani',
      ar: 'جامعة السليمانية',
    },
    booksShared: 43,
    freeDonations: 26,
    studentsHelped: 82,
    estimatedSavingsIqd: 1490000,
    color: '#d97706', // Amber-600
  },
  {
    id: 'dept-mech-elect',
    name: {
      ku: 'ئەندازیاری کارەبا و میکانیک',
      en: 'Electrical & Mechanical Engineering',
      ar: 'الهندسة الكهربائية والميكانيكية',
    },
    universityShort: 'UOD',
    universityName: {
      ku: 'زانکۆی دهۆک',
      en: 'University of Duhok (UOD)',
      ar: 'جامعة دهوك',
    },
    booksShared: 36,
    freeDonations: 19,
    studentsHelped: 67,
    estimatedSavingsIqd: 1240000,
    color: '#7c3aed', // Violet-600
  },
  {
    id: 'dept-admin-econ',
    name: {
      ku: 'کارگێڕی کار و ئابووری',
      en: 'Business Administration & Economics',
      ar: 'إدارة الأعمال والعلوم الاقتصادية',
    },
    universityShort: 'UOS / UKH',
    universityName: {
      ku: 'سەڵاحەدین و کوردستان هەولێر',
      en: 'Salahaddin & Kurdistan Univ.',
      ar: 'صلاح الدين وجامعة كوردستان',
    },
    booksShared: 31,
    freeDonations: 16,
    studentsHelped: 56,
    estimatedSavingsIqd: 960000,
    color: '#db2777', // Pink-600
  },
  {
    id: 'dept-accounting',
    name: {
      ku: 'ژمێریاری و دارایی و بانک',
      en: 'Accounting, Finance & Banking',
      ar: 'المحاسبة والعلوم المالية والمصرفية',
    },
    universityShort: 'EPU / UOS',
    universityName: {
      ku: 'پۆلیتەکنیکی هەولێر و سەڵاحەدین',
      en: 'Erbil Polytechnic & Salahaddin Univ.',
      ar: 'بوليتكنيك أربيل وصلاح الدين',
    },
    booksShared: 29,
    freeDonations: 18,
    studentsHelped: 52,
    estimatedSavingsIqd: 890000,
    color: '#0891b2', // Cyan-600
  },
  {
    id: 'dept-law-humanities',
    name: {
      ku: 'یاسا و پەیوەندییە نێودەوڵەتییەکان',
      en: 'Law & International Relations',
      ar: 'القانون والعلوم السياسية',
    },
    universityShort: 'UOS-Suli / UOS',
    universityName: {
      ku: 'سلێمانی و سەڵاحەدین',
      en: 'Sulaimani & Salahaddin Univ.',
      ar: 'السليمانية وصلاح الدين',
    },
    booksShared: 26,
    freeDonations: 13,
    studentsHelped: 47,
    estimatedSavingsIqd: 730000,
    color: '#0d9488', // Teal-600
  },
];

export const STUDENTS_DATA: StudentContributor[] = [
  {
    id: 'contrib-1',
    name: {
      ku: 'هاوڕێ بەهمەن',
      en: 'Hawre Bahman',
      ar: 'هاوري بهمن',
    },
    department: {
      ku: 'کۆلێژی دەرمانسازی (قۆناغی ٤)',
      en: 'College of Pharmacy (Stage 4)',
      ar: 'كلية الصيدلة (المرحلة الرابعة)',
    },
    universityShort: 'UOS-Suli',
    universityName: {
      ku: 'زانکۆی سلێمانی',
      en: 'University of Sulaimani',
      ar: 'جامعة السليمانية',
    },
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    role: 'student',
    verified: true,
    booksShared: 17,
    freeDonations: 14,
    studentsHelped: 46,
    estimatedSavingsIqd: 840000,
    badge: {
      ku: '🥇 بەخشەری زێڕینی وەرز',
      en: '🥇 Semester Golden Donor',
      ar: '🥇 المتبرع الذهبي للفصل',
    },
    favoriteQuote: {
      ku: 'زانست کاتێک بەهای هەیە کە بیبەخشیتە هاوپۆل و نەوەکانی پاش خۆت.',
      en: 'Knowledge truly flourishes when passed freely to fellow students.',
      ar: 'قيم العلم تكتمل عندما نتقاسمه مع زملائنا الطلبة بالمحبة والتكافل.',
    },
  },
  {
    id: 'contrib-2',
    name: {
      ku: 'سارە جەمیل',
      en: 'Sara Jameel',
      ar: 'سارة جميل',
    },
    department: {
      ku: 'ئەندازیاری شارستانی و تەلارسازی',
      en: 'Civil & Architectural Engineering',
      ar: 'الهندسة المدنية والمعمارية',
    },
    universityShort: 'EPU',
    universityName: {
      ku: 'زانکۆی پۆلیتەکنیکی هەولێر',
      en: 'Erbil Polytechnic University',
      ar: 'جامعة أربيل التقنية',
    },
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    role: 'student',
    verified: true,
    booksShared: 14,
    freeDonations: 10,
    studentsHelped: 36,
    estimatedSavingsIqd: 560000,
    badge: {
      ku: '🥈 پاڵەوانی کتێبی خوێندکاران',
      en: '🥈 Campus Textbook Champion',
      ar: '🥈 بطلة تداول الكتب والملازم',
    },
    favoriteQuote: {
      ku: 'هەموو کتێبێک کە دەبەخشرێت، بارگرانییەک لەسەر شانی قوتابییەکی دەستکورت کەم دەکاتەوە.',
      en: 'Every shared book eases the financial burden of an ambitious peer.',
      ar: 'كل كتاب نهديه لزميل يخفف عنه عبئاً مادياً ويفتح له آفاقاً جديدة.',
    },
  },
  {
    id: 'contrib-3',
    name: {
      ku: 'د. سۆران ئەحمەد',
      en: 'Dr. Soran Ahmed',
      ar: 'د. سوران أحمد',
    },
    department: {
      ku: 'نەشتەرگەری و پزیشکی فێرکاری',
      en: 'Clinical Surgery & Medicine',
      ar: 'الجراحة السريرية والتعليم الطبي',
    },
    universityShort: 'HMU',
    universityName: {
      ku: 'زانکۆی پزیشکیی هەولێر',
      en: 'Hawler Medical University',
      ar: 'جامعة هولير الطبية',
    },
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=200&q=80',
    role: 'lecturer',
    verified: true,
    booksShared: 21,
    freeDonations: 7,
    studentsHelped: 52,
    estimatedSavingsIqd: 1350000,
    badge: {
      ku: '🥉 مامۆستای پشتگیریکاری فێرخوازان',
      en: '🥉 Faculty Mentorship Award',
      ar: '🥉 جائزة الأستاذ الداعم للطلبة',
    },
    favoriteQuote: {
      ku: 'پشتگیری لە خوێندکارانی پزیشکی بە دابینکردنی سەرچاوەی دەوڵەمەند، خزمەتە بە داهاتووی تەندروستی گەلەکەمان.',
      en: 'Equipping future doctors with vital literature secures our community health.',
      ar: 'دعم طلبة الطب بالمراجع والأدوات هو استثمار مباشر في مستقبل صحة مجتمعنا.',
    },
  },
  {
    id: 'contrib-4',
    name: {
      ku: 'ڕەوەند کاروان',
      en: 'Rawand Karwan',
      ar: 'رواند كاروان',
    },
    department: {
      ku: 'ئەندازیاری نەرمەکاڵا (قۆناغی ٤)',
      en: 'Software Engineering (Stage 4)',
      ar: 'هندسة البرمجيات (المرحلة 4)',
    },
    universityShort: 'EPU',
    universityName: {
      ku: 'زانکۆی پۆلیتەکنیکی هەولێر',
      en: 'Erbil Polytechnic University',
      ar: 'جامعة أربيل التقنية',
    },
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    role: 'student',
    verified: true,
    booksShared: 11,
    freeDonations: 8,
    studentsHelped: 28,
    estimatedSavingsIqd: 430000,
    badge: {
      ku: 'هاوکاری کۆد و ماتماتیک',
      en: 'Code & Math Contributor',
      ar: 'مساهم البرمجة والرياضيات',
    },
  },
  {
    id: 'contrib-5',
    name: {
      ku: 'ئالان بەرزان',
      en: 'Alan Barzan',
      ar: 'ألان برزان',
    },
    department: {
      ku: 'تەلارسازی و دیزاین',
      en: 'Architecture & Design',
      ar: 'الهندسة المعمارية والتصميم',
    },
    universityShort: 'UOS',
    universityName: {
      ku: 'زانکۆی سەڵاحەدین',
      en: 'Salahaddin University',
      ar: 'جامعة صلاح الدين',
    },
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    role: 'student',
    verified: true,
    booksShared: 9,
    freeDonations: 6,
    studentsHelped: 23,
    estimatedSavingsIqd: 390000,
    badge: {
      ku: 'بەخشەری پێداویستی تەلارسازی',
      en: 'Architectural Gear Donor',
      ar: 'متبرع بأدوات التصميم الهندسي',
    },
  },
  {
    id: 'contrib-6',
    name: {
      ku: 'هێڤی نەوزاد',
      en: 'Hevi Nawzad',
      ar: 'هيفي نوزاد',
    },
    department: {
      ku: 'ئەندازیاری میکانیک',
      en: 'Mechanical Engineering',
      ar: 'الهندسة الميكانيكية',
    },
    universityShort: 'UOD',
    universityName: {
      ku: 'زانکۆی دهۆک',
      en: 'University of Duhok',
      ar: 'جامعة دهوك',
    },
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    role: 'student',
    verified: true,
    booksShared: 8,
    freeDonations: 7,
    studentsHelped: 25,
    estimatedSavingsIqd: 360000,
    badge: {
      ku: 'پێشەنگی کەمپی دهۆک',
      en: 'Duhok Campus Pioneer',
      ar: 'رائدة التضامن في دهوك',
    },
  },
  {
    id: 'contrib-7',
    name: {
      ku: 'لاڤە کامەران',
      en: 'Lava Kamaran',
      ar: 'لافا كمران',
    },
    department: {
      ku: 'پزیشکی ددان (قۆناغی ٣)',
      en: 'Dentistry (Stage 3)',
      ar: 'طب وجراحة الفم والأسنان',
    },
    universityShort: 'UOS-Suli',
    universityName: {
      ku: 'زانکۆی سلێمانی',
      en: 'University of Sulaimani',
      ar: 'جامعة السليمانية',
    },
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    role: 'student',
    verified: true,
    booksShared: 8,
    freeDonations: 5,
    studentsHelped: 19,
    estimatedSavingsIqd: 310000,
    badge: {
      ku: 'هاوکاری تاقیگەی ددان',
      en: 'Dental Lab Supporter',
      ar: 'داعمة كيتات طب الأسنان',
    },
  },
];

export const CATEGORY_DISTRIBUTION: ContributionCategoryDistribution[] = [
  {
    id: 'books',
    label: {
      ku: 'کتێبی زانستی و نێودەوڵەتی',
      en: 'Textbooks & Academic References',
      ar: 'الكتب والمراجع الأكاديمية',
    },
    count: 245,
    percentage: 43,
    color: '#4f46e5', // Indigo-600
  },
  {
    id: 'notes',
    label: {
      ku: 'مەلازم و پوختەی وانەی قوتابیان',
      en: 'Study Notes & Exam Summaries',
      ar: 'الملازم وملخصات الامتحانات',
    },
    count: 154,
    percentage: 27,
    color: '#059669', // Emerald-600
  },
  {
    id: 'lab_gear',
    label: {
      ku: 'ئامێری تاقیگە و کەرەستەی پزیشکی',
      en: 'Lab Gear & Clinical Tools',
      ar: 'مستلزمات المختبرات والأجهزة الطبية',
    },
    count: 102,
    percentage: 18,
    color: '#0284c7', // Sky-600
  },
  {
    id: 'tools',
    label: {
      ku: 'حاسیبە و کەرەستەی ئەندازیاری',
      en: 'Calculators & Drafting Kits',
      ar: 'الحاسبات وأدوات الرسم الهندسي',
    },
    count: 68,
    percentage: 12,
    color: '#d97706', // Amber-600
  },
];
