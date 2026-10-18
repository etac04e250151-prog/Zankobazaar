import React, { useState } from 'react';
import { ListingItem, Language, AiSyllabusResponse } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { CampusMapIndicator } from './CampusMapIndicator';
import { 
  X, 
  MapPin, 
  Sparkles, 
  CheckCircle2, 
  Calendar, 
  Heart, 
  Share2, 
  MessageSquare, 
  ExternalLink, 
  BadgeCheck,
  BookOpen,
  GraduationCap,
  Loader2
} from 'lucide-react';

interface ItemDetailModalProps {
  item: ListingItem;
  language: Language;
  onClose: () => void;
  onOpenChat: (item: ListingItem) => void;
  isWishlisted: boolean;
  onToggleWishlist: (itemId: string) => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  language,
  onClose,
  onOpenChat,
  isWishlisted,
  onToggleWishlist,
}) => {
  const t = TRANSLATIONS[language];
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [syllabusData, setSyllabusData] = useState<AiSyllabusResponse | null>(null);
  const [isLoadingSyllabus, setIsLoadingSyllabus] = useState(false);
  const [syllabusError, setSyllabusError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const title = item.title[language] || item.title.en;
  const description = item.description[language] || item.description.en;

  const handleAnalyzeSyllabus = async () => {
    setIsLoadingSyllabus(true);
    setSyllabusError(null);
    try {
      const res = await fetch('/api/ai/syllabus-analyzer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemName: title,
          major: item.department,
          language,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setSyllabusData(data.data);
      } else {
        setSyllabusError(data.error || 'Failed to analyze');
      }
    } catch (err: any) {
      console.error(err);
      setSyllabusError(err.message || 'Error connecting to Gemini');
    } finally {
      setIsLoadingSyllabus(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const getConditionText = (condition: string) => {
    return t.condition[condition as keyof typeof t.condition] || condition;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-indigo-700 dark:text-indigo-400">{t.categories[item.category as keyof typeof t.categories] || item.category}</span>
            <span>·</span>
            <span>{item.department}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer text-xs flex items-center gap-1.5"
              title="Share"
            >
              <Share2 className="w-4 h-4" />
              {copiedLink && <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">Copied!</span>}
            </button>
            <button
              onClick={() => onToggleWishlist(item.id)}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                isWishlisted ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/40' : 'text-slate-500 dark:text-slate-400 hover:text-rose-500 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column: Image Gallery */}
            <div className="space-y-3">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800">
                <img
                  src={item.images[activeImageIndex] || item.images[0]}
                  alt={title}
                  className="w-full h-full object-cover"
                />
                {item.isFreeDonation && (
                  <div className="absolute top-3 start-3 bg-emerald-600 text-white text-xs font-semibold px-3 py-1 rounded-lg shadow-md">
                    {t.freeItemBadge}
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {item.images.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {item.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                        activeImageIndex === idx ? 'border-indigo-600 scale-95' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="thumb" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Campus Meetup Point & Visual Map Indicator */}
              <CampusMapIndicator
                campusLocation={item.campusLocation}
                universityId={item.universityId}
                language={language}
              />
            </div>

            {/* Right Column: Title, Price, Description, Seller */}
            <div className="space-y-5">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-tight mb-2">
                  {title}
                </h2>

                {/* Price Display */}
                <div className="flex items-baseline gap-2">
                  {item.isFreeDonation ? (
                    <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                      {language === 'en' ? 'Free Student Donation (0 IQD)' : 'بەخشش و خۆڕایی (٠ دینار)'}
                    </div>
                  ) : (
                    <>
                      <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums">
                        {item.priceIqd.toLocaleString()}
                      </span>
                      <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
                        {t.currency.iqd}
                      </span>
                      {item.priceUsd > 0 && (
                        <span className="text-sm text-slate-400 dark:text-slate-500 font-mono">
                          (~${item.priceUsd})
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Condition & Status Row */}
              <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400 py-2 border-y border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 dark:text-slate-500">{t.condition.label}:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{getConditionText(item.condition)}</span>
                </div>
                <span>·</span>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                  <span>{item.createdAt}</span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  {t.itemDetails}
                </h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {description}
                </p>
              </div>

              {/* Highlights */}
              {item.highlights && item.highlights.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    {t.highlights}
                  </h4>
                  <ul className="space-y-1.5">
                    {item.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Seller Profile Card */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.seller.avatar}
                      alt={item.seller.name}
                      className="w-12 h-12 rounded-full object-cover border border-white dark:border-slate-700 shadow-sm"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-sm text-slate-900 dark:text-white">{item.seller.name}</span>
                        <BadgeCheck className="w-4 h-4 text-emerald-500" />
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{item.seller.department}</p>
                      <p className="text-[11px] text-indigo-700 dark:text-indigo-400 font-medium">{item.seller.university}</p>
                    </div>
                  </div>

                  <div className="text-end">
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      ★ {item.seller.rating} / 5.0
                    </div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500">
                      {t.sellerRating}
                    </div>
                  </div>
                </div>

                {/* Seller Actions */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={() => onOpenChat(item)}
                    className="flex items-center justify-center gap-2 py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{t.chatDirectly}</span>
                  </button>

                  <a
                    href={`https://wa.me/${item.seller.whatsapp}?text=${encodeURIComponent(
                      language === 'ku'
                        ? `سڵاو کاک ${item.seller.name}، من ئەم کەلوپەلەم لە Zankobazaar بینی: ${title}`
                        : `Hello ${item.seller.name}, I am interested in your listing on Zankobazaar: ${title}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-semibold transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>{t.whatsappChat}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* AI Academic Course & Syllabus Analyzer Section */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
            <div className="bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/50 dark:from-slate-800 dark:via-slate-850 dark:to-indigo-950/40 rounded-2xl border border-indigo-100 dark:border-slate-700 p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-sm">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {t.aiSyllabusMatch}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {language === 'ku' && 'پشکنینی گونجانی کتێبەکە لەگەڵ وانەکانی بەش و تاقیکردنەوەکان بە Gemini AI'}
                      {language === 'en' && 'Verify university course alignment and syllabus relevance with Gemini AI'}
                      {language === 'ar' && 'فحص مدى تطابق المرجع مع مقررات الكلية والامتحانات عبر نماذج Gemini'}
                    </p>
                  </div>
                </div>

                {!syllabusData && (
                  <button
                    onClick={handleAnalyzeSyllabus}
                    disabled={isLoadingSyllabus}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isLoadingSyllabus ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>{t.analyzing}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{t.analyzeWithAi}</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Analysis Result Display */}
              {syllabusData && (
                <div className="space-y-4 pt-2 border-t border-indigo-100/80 dark:border-slate-700 animate-in fade-in duration-300">
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    {syllabusData.itemSummary}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-indigo-50 dark:border-slate-700 space-y-1.5">
                      <span className="font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        {language === 'ku' ? 'وانە و کۆرسە پەیوەندیدارەکان:' : language === 'ar' ? 'المقررات والمناهج المعنية:' : 'Relevant Courses:'}
                      </span>
                      <ul className="space-y-1 text-slate-600 dark:text-slate-300">
                        {syllabusData.relevantCourses.map((c, i) => (
                          <li key={i} className="flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-indigo-400" />
                            <span>{c}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-indigo-50 dark:border-slate-700 space-y-1.5">
                      <span className="font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        {language === 'ku' ? 'ئامۆژگاری سەرکەوتن لە خوێندن:' : language === 'ar' ? 'نصيحة التفوق الأكاديمي:' : 'Study Recommendations:'}
                      </span>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                        {syllabusData.academicValueTip}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {syllabusError && (
                <div className="text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-xl border border-rose-100 dark:border-rose-900">
                  {syllabusError}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
