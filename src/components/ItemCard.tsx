import React from 'react';
import { ListingItem, Language } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { 
  MapPin, 
  Heart, 
  BadgeCheck, 
  MessageCircle,
} from 'lucide-react';

interface ItemCardProps {
  item: ListingItem;
  language: Language;
  onSelectItem: (item: ListingItem) => void;
  onOpenChat: (item: ListingItem) => void;
  isWishlisted: boolean;
  onToggleWishlist: (itemId: string) => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  language,
  onSelectItem,
  onOpenChat,
  isWishlisted,
  onToggleWishlist,
}) => {
  const t = TRANSLATIONS[language];
  const title = item.title[language] || item.title.en;

  const getConditionLabel = (condition: string) => {
    switch (condition) {
      case 'brand_new':
        return t.condition.brand_new;
      case 'like_new':
        return t.condition.like_new;
      case 'good':
        return t.condition.good;
      case 'acceptable':
        return t.condition.acceptable;
      default:
        return condition;
    }
  };

  const getCategoryName = (category: string) => {
    return t.categories[category as keyof typeof t.categories] || category;
  };

  return (
    <div className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-500/70 hover:shadow-lg hover:shadow-indigo-50/50 dark:hover:shadow-indigo-950/40 transition-all duration-200 flex flex-col overflow-hidden">
      {/* Image Container */}
      <div className="relative aspect-[4/3] bg-slate-100 dark:bg-slate-800 overflow-hidden cursor-pointer" onClick={() => onSelectItem(item)}>
        <img
          src={item.images[0] || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=900&q=80'}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Free Donation Banner or Condition Badge */}
        {item.isFreeDonation ? (
          <div className="absolute top-3 start-3 bg-emerald-600 text-white text-xs font-semibold px-2.5 py-1 rounded-lg shadow-sm">
            {t.freeItemBadge}
          </div>
        ) : (
          <div className="absolute top-3 start-3 bg-slate-900/85 dark:bg-slate-950/85 backdrop-blur-md text-white text-[11px] font-medium px-2 py-0.5 rounded-md border border-white/10">
            {getConditionLabel(item.condition)}
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(item.id);
          }}
          className={`absolute top-3 end-3 p-2 rounded-xl backdrop-blur-md transition-all cursor-pointer ${
            isWishlisted
              ? 'bg-white dark:bg-slate-800 text-rose-500 shadow-md'
              : 'bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-rose-500'
          }`}
          title={isWishlisted ? t.removeFromWishlist : t.addToWishlist}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        {/* Target Semester tag (if available) */}
        {item.targetSemesters && (
          <div className="absolute bottom-2 start-2 bg-slate-900/80 dark:bg-slate-950/80 backdrop-blur-sm text-slate-200 text-[10px] px-2 py-0.5 rounded border border-white/10">
            {item.targetSemesters}
          </div>
        )}
      </div>

      {/* Card Content Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Metadata */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1.5 line-clamp-1">
            <span className="font-medium text-indigo-700 dark:text-indigo-400">{getCategoryName(item.category)}</span>
            <span aria-hidden="true">·</span>
            <span>{item.department}</span>
          </div>

          {/* Title */}
          <h3 
            onClick={() => onSelectItem(item)}
            className="font-semibold text-slate-900 dark:text-slate-100 text-base leading-snug line-clamp-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer mb-2"
          >
            {title}
          </h3>

          {/* Campus Handover Spot */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 mb-3">
            <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
            <span className="line-clamp-1">{item.campusLocation}</span>
          </div>
        </div>

        {/* Bottom Section: Price & Seller Info */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
          {/* Price */}
          <div>
            {item.isFreeDonation ? (
              <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                {language === 'en' ? 'Free (0 IQD)' : 'خۆڕایی (٠ دینار)'}
              </span>
            ) : (
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-bold text-slate-900 dark:text-slate-100 font-mono tabular-nums">
                  {item.priceIqd.toLocaleString()}
                </span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {t.currency.iqd}
                </span>
                {item.priceUsd > 0 && (
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                    (~${item.priceUsd})
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Seller / Contact Button */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onOpenChat(item)}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              title={t.chatDirectly}
            >
              <MessageCircle className="w-4 h-4" />
            </button>
            <button
              onClick={() => onSelectItem(item)}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 dark:hover:bg-indigo-600 hover:text-white dark:hover:text-white text-slate-700 dark:text-slate-200 text-xs font-medium rounded-xl transition-colors cursor-pointer"
            >
              {language === 'ku' ? 'بینین' : language === 'ar' ? 'عرض' : 'View'}
            </button>
          </div>
        </div>

        {/* Verified Student / Faculty Tag */}
        <div className="mt-2.5 pt-2 border-t border-slate-50 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <img 
              src={item.seller.avatar} 
              alt={item.seller.name} 
              className="w-4 h-4 rounded-full object-cover" 
            />
            <span className="line-clamp-1 max-w-[120px]">{item.seller.name}</span>
          </div>

          <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
            <BadgeCheck className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
            <span>
              {item.seller.role === 'lecturer'
                ? t.verifiedLecturer
                : item.seller.role === 'staff'
                ? t.verifiedStaff
                : t.verifiedStudent}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
