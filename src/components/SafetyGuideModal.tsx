import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { 
  X, 
  ShieldCheck, 
  Sun, 
  Eye, 
  CreditCard, 
  AlertTriangle,
  Building2 
} from 'lucide-react';

interface SafetyGuideModalProps {
  language: Language;
  onClose: () => void;
}

export const SafetyGuideModal: React.FC<SafetyGuideModalProps> = ({
  language,
  onClose,
}) => {
  const t = TRANSLATIONS[language];

  const safetyRules = {
    ku: [
      {
        icon: <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
        title: 'هەمیشە لەناو کەمپ چاوپێکەوتن بکە',
        desc: 'چاوپێکەوتنەکان لە شوێنە فەرمییەکانی زانکۆ بکەن وەک کتێبخانەی ناوەندی، هۆڵی کۆلێژ، کافیتریای سەرەکی، یان بەردەم دەروازەی زانکۆ.',
      },
      {
        icon: <Sun className="w-5 h-5 text-amber-500 dark:text-amber-400" />,
        title: 'لە کاتی دەوامی فەرمی و ڕۆژدا بێت',
        desc: 'ڕادەستکردنی کەلوپەل لە نێوان کاتژمێر ٨ی بەیانی بۆ ٣ی پاشنیوەڕۆ لە کاتی هەبوونی قوتابیان ئەنجام بدە.',
      },
      {
        icon: <Eye className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
        title: 'پێش پارەدان پشکنینی تەواو بکە',
        desc: 'بۆ کتێبەکان لاپەڕەکان بپشکنە، بۆ ئامێری ئەلیکترۆنی (لاپتۆپ و حاسیبە) کێبڵ و بارگاویکەر و باترییەکەی تاقی بکەرەوە.',
      },
      {
        icon: <CreditCard className="w-5 h-5 text-rose-500 dark:text-rose-400" />,
        title: 'پارەی پێشەکی مەدە (نەقدی ڕاستەوخۆ)',
        desc: 'هەرگیز پێش وەرگرتنی کەلوپەلەکە پارە حەواڵە مەکە. ئاڵوگۆڕ دەست بە دەست لەناو زانکۆ بکرێت.',
      },
      {
        icon: <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
        title: 'پشتڕاستکردنەوەی پێناسی زانکۆ (Student ID)',
        desc: 'بۆ دڵنیایی زیاتر لە ناسنامەی قوتابی یان مامۆستای بەرامبەر دڵنیابە لە ڕێگەی کارتی زانکۆوە.',
      },
    ],
    en: [
      {
        icon: <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
        title: 'Always Meet on Campus',
        desc: 'Exchange items exclusively in well-trafficked university campus zones like the Central Library, Faculty Cafeteria, or Student Center.',
      },
      {
        icon: <Sun className="w-5 h-5 text-amber-500 dark:text-amber-400" />,
        title: 'Meet During Daytime Hours',
        desc: 'Schedule handovers between 8:00 AM and 3:00 PM during active university lecture hours.',
      },
      {
        icon: <Eye className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
        title: 'Inspect Thoroughly Before Payment',
        desc: 'Check textbook pages for tears/missing leaves; test laptops, calculators, and lab tools on campus power outlets.',
      },
      {
        icon: <CreditCard className="w-5 h-5 text-rose-500 dark:text-rose-400" />,
        title: 'No Advance Payments (Cash on Delivery)',
        desc: 'Never transfer funds or wire cash in advance. Only pay after inspecting and taking possession of the item.',
      },
      {
        icon: <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
        title: 'Verify University Affiliation',
        desc: 'Ask to verify the student or faculty university badge for mutual security and accountability.',
      },
    ],
    ar: [
      {
        icon: <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
        title: 'اللقاء دائماً داخل الحرم الجامعي',
        desc: 'احرص على إتمام كافة المقابلات في أماكن عامة بالجامعة مثل المكتبة المركزية، الكافتيريا، أو مركز شؤون الطلبة.',
      },
      {
        icon: <Sun className="w-5 h-5 text-amber-500 dark:text-amber-400" />,
        title: 'المعاينة في أوقات الدوام الرسمي',
        desc: 'اختر مواعيد بين الثامنة صباحاً والثالثة ظهراً أثناء وجود الطلاب والأساتذة بالحرم الجامعي.',
      },
      {
        icon: <Eye className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
        title: 'فحص السلعة جيداً قبل الدفع',
        desc: 'تأكد من سلامة صفحات الكتب وتجربة الأجهزة الإلكترونية (لابتوب، حاسبة) ومعدات المختبر عملياً.',
      },
      {
        icon: <CreditCard className="w-5 h-5 text-rose-500 dark:text-rose-400" />,
        title: 'عدم دفع أي عربون مسبق',
        desc: 'لا تقم بأي تحويل مالي قبل استلام السلعة ومعاينتها يداً بيد داخل الحرم الجامعي.',
      },
      {
        icon: <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
        title: 'التحقق من الهوية الجامعية',
        desc: 'يمكنك التأكد من بطاقة الطالب أو باج التدريسي الجامعي لتعزيز الثقة والأمان المتبادل.',
      },
    ],
  };

  const list = safetyRules[language] || safetyRules.en;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t.safetyGuide}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'ku' && 'ڕێنمایی فەرمی بۆ مامەڵەی سەلامەت و دڵنیابەخش لەناو زانکۆ'}
                {language === 'en' && 'Official guidelines for secure transactions within university premises'}
                {language === 'ar' && 'إرشادات رسمية للتبادل الآمن والمضمون داخل أروقة الجامعة'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Rules Body */}
        <div className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
          {list.map((rule, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-start gap-3.5"
            >
              <div className="p-2 bg-white dark:bg-slate-700 rounded-xl shadow-xs shrink-0">
                {rule.icon}
              </div>
              <div className="space-y-1">
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  {rule.title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {rule.desc}
                </p>
              </div>
            </div>
          ))}

          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-0.5">
                {language === 'ku' ? 'تێبینی بۆ قوتابیان:' : language === 'ar' ? 'تنبيه هام للطلبة:' : 'Student Notice:'}
              </span>
              <span>
                {language === 'ku' && 'ئەگەر هەر هەڵسوکەوتێکی گوماناوی بینرا، دەتوانیت بە ئاسانی پۆلیسی پاسەوانی کەمپ یان بەرپرسی بەش ئاگادار بکەیتەوە.'}
                {language === 'en' && 'If you encounter any suspicious activity, immediately notify campus security or your department head.'}
                {language === 'ar' && 'في حال وجود أي سلوك مريب، يمكنك مراجعة أمن الحرم الجامعي أو رئاسة القسم فوراً.'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            {language === 'ku' ? 'تێگەیشتم، سوپاس' : language === 'ar' ? 'حسناً، فهمت ذلك' : 'Got it, thanks'}
          </button>
        </div>
      </div>
    </div>
  );
};
