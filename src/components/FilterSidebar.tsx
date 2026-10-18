import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { UNIVERSITIES } from '../data/mockItems';
import { 
  SlidersHorizontal, 
  RotateCcw, 
  Building2, 
  ShieldCheck, 
  ArrowUpDown, 
  Tag 
} from 'lucide-react';

interface FilterSidebarProps {
  language: Language;
  selectedUniversity: string;
  onSelectUniversity: (id: string) => void;
  selectedCondition: string;
  onSelectCondition: (cond: string) => void;
  selectedRole: string;
  onSelectRole: (role: string) => void;
  sortBy: string;
  onSortByChange: (sort: string) => void;
  maxPrice: number;
  onMaxPriceChange: (price: number) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  language,
  selectedUniversity,
  onSelectUniversity,
  selectedCondition,
  onSelectCondition,
  selectedRole,
  onSelectRole,
  sortBy,
  onSortByChange,
  maxPrice,
  onMaxPriceChange,
  onResetFilters,
  hasActiveFilters,
}) => {
  const t = TRANSLATIONS[language];

  return (
    <aside className="w-full lg:w-64 space-y-6 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 transition-colors">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-bold text-sm">
          <SlidersHorizontal className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>{language === 'ku' ? 'فلتەرەکانی گەڕان' : language === 'ar' ? 'خيارات الفلترة' : 'Filters'}</span>
        </div>

        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>{t.resetFilters}</span>
          </button>
        )}
      </div>

      {/* Sort By */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          <span>{t.sortBy.label}</span>
        </label>
        <select
          value={sortBy}
          onChange={(e) => onSortByChange(e.target.value)}
          className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-800 dark:text-slate-200 focus:border-indigo-600 dark:focus:border-indigo-500 outline-none cursor-pointer"
        >
          <option value="newest">{t.sortBy.newest}</option>
          <option value="price_asc">{t.sortBy.priceLow}</option>
          <option value="price_desc">{t.sortBy.priceHigh}</option>
          <option value="popular">{t.sortBy.popular}</option>
        </select>
      </div>

      {/* Universities */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <Building2 className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          <span>{t.universities}</span>
        </label>
        <select
          value={selectedUniversity}
          onChange={(e) => onSelectUniversity(e.target.value)}
          className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-800 dark:text-slate-200 focus:border-indigo-600 dark:focus:border-indigo-500 outline-none cursor-pointer"
        >
          <option value="all">{t.allUniversities}</option>
          {UNIVERSITIES.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name[language] || u.name.en}
            </option>
          ))}
        </select>
      </div>

      {/* Item Condition */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          <span>{t.condition.label}</span>
        </label>
        <div className="space-y-1.5">
          {[
            { id: 'all', label: t.condition.all },
            { id: 'brand_new', label: t.condition.brand_new },
            { id: 'like_new', label: t.condition.like_new },
            { id: 'good', label: t.condition.good },
            { id: 'acceptable', label: t.condition.acceptable },
          ].map((c) => (
            <label
              key={c.id}
              className={`flex items-center justify-between p-2 rounded-xl text-xs transition-colors cursor-pointer ${
                selectedCondition === c.id
                  ? 'bg-indigo-50/80 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="condition"
                  checked={selectedCondition === c.id}
                  onChange={() => onSelectCondition(c.id)}
                  className="text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                />
                <span>{c.label}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Seller Role */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          <span>{t.filterByRole.label}</span>
        </label>
        <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          {[
            { id: 'all', label: t.filterByRole.all },
            { id: 'student', label: t.filterByRole.student },
            { id: 'lecturer', label: t.filterByRole.lecturer },
            { id: 'staff', label: t.filterByRole.staff },
          ].map((r) => (
            <button
              key={r.id}
              onClick={() => onSelectRole(r.id)}
              className={`py-1.5 text-[10px] font-medium rounded-lg transition-all cursor-pointer truncate text-center ${
                selectedRole === r.id
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Max Price Filter */}
      <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {language === 'ku' ? 'بەرزترین نرخ' : language === 'ar' ? 'الحد الأقصى للسعر' : 'Max Price'}
          </span>
          <span className="font-bold text-slate-900 dark:text-slate-100 font-mono">
            {maxPrice.toLocaleString()} {t.currency.iqd}
          </span>
        </div>
        <input
          type="range"
          min={5000}
          max={1500000}
          step={5000}
          value={maxPrice}
          onChange={(e) => onMaxPriceChange(Number(e.target.value))}
          className="w-full accent-indigo-600 cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 font-mono">
          <span>5,000</span>
          <span>1,500,000 {t.currency.iqd}</span>
        </div>
      </div>
    </aside>
  );
};
