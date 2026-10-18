import React, { useState } from 'react';
import { Language, CategoryId, ItemCondition, AiPriceAdvisorResponse } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { 
  X, 
  Sparkles, 
  Loader2, 
  TrendingUp, 
  ShieldCheck, 
  CheckCircle
} from 'lucide-react';

interface AiPriceAppraiserModalProps {
  language: Language;
  onClose: () => void;
}

export const AiPriceAppraiserModal: React.FC<AiPriceAppraiserModalProps> = ({
  language,
  onClose,
}) => {
  const t = TRANSLATIONS[language];
  const p = t.priceModal;

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CategoryId>('books');
  const [condition, setCondition] = useState<ItemCondition>('like_new');
  const [originalPrice, setOriginalPrice] = useState('');
  const [department, setDepartment] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AiPriceAdvisorResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAppraise = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/ai/price-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          category,
          condition,
          originalPrice,
          department,
          language,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setResult(json.data);
      } else {
        setError(json.error || 'Failed to appraise price');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Connection error with Gemini server');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-indigo-50/70 to-purple-50/70 dark:from-slate-800/90 dark:to-indigo-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {p.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {p.subtitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scroll Content */}
        <div className="overflow-y-auto p-6 space-y-6">
          <form onSubmit={handleAppraise} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {p.itemTitle} *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={p.itemTitlePlaceholder}
                className="w-full text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3.5 py-2.5 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-600 dark:focus:border-indigo-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {p.category}
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as CategoryId)}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl px-3 py-2.5 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-600 dark:focus:border-indigo-500 outline-none cursor-pointer"
                >
                  <option value="books">{t.categories.books}</option>
                  <option value="lab_gear">{t.categories.lab_gear}</option>
                  <option value="electronics">{t.categories.electronics}</option>
                  <option value="services">{t.categories.services}</option>
                  <option value="dorm">{t.categories.dorm}</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {p.condition}
                </label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as ItemCondition)}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl px-3 py-2.5 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-600 dark:focus:border-indigo-500 outline-none cursor-pointer"
                >
                  <option value="brand_new">{t.condition.brand_new}</option>
                  <option value="like_new">{t.condition.like_new}</option>
                  <option value="good">{t.condition.good}</option>
                  <option value="acceptable">{t.condition.acceptable}</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {p.originalPrice}
                </label>
                <input
                  type="text"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                  placeholder="e.g. 50,000 IQD"
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl px-3 py-2.5 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-600 dark:focus:border-indigo-500 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !title}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{p.analyzing}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{p.analyzePriceBtn}</span>
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900 rounded-xl text-xs text-rose-700 dark:text-rose-300">
              {error}
            </div>
          )}

          {/* Appraisal Result Card */}
          {result && (
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800 animate-in fade-in duration-300">
              {/* Top Highlights Box */}
              <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-semibold text-indigo-900 dark:text-indigo-300 block">
                    {p.recommendedFairPrice}
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-2xl font-black text-indigo-950 dark:text-white font-mono tabular-nums">
                      {result.recommendedPriceIqd.toLocaleString()}
                    </span>
                    <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400">
                      {t.currency.iqd}
                    </span>
                    <span className="text-xs text-indigo-600 dark:text-indigo-400 font-mono">
                      (~${result.recommendedPriceUsd})
                    </span>
                  </div>
                </div>

                <div className="text-end">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                    {p.fairRange}
                  </span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">
                    {result.minPriceIqd.toLocaleString()} - {result.maxPriceIqd.toLocaleString()} {t.currency.iqd}
                  </span>
                  <div className="mt-1">
                    <span className="text-[10px] font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                      {p.demandLevel}: {result.demandRating}
                    </span>
                  </div>
                </div>
              </div>

              {/* Verdict & Reasoning */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {p.verdict}: {result.appraisalVerdict}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  {result.reasoning}
                </p>
              </div>

              {/* Two columns: Tips for Seller & Inspection for Buyer */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Seller tips */}
                <div className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl space-y-1.5">
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs">
                    <CheckCircle className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    {p.sellerAdvice}
                  </span>
                  <ul className="space-y-1 text-slate-600 dark:text-slate-300">
                    {result.sellerTips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-indigo-400 font-bold">·</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Buyer tips */}
                <div className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl space-y-1.5">
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    {p.buyerAdvice}
                  </span>
                  <ul className="space-y-1 text-slate-600 dark:text-slate-300">
                    {result.buyerInspectionTips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-500 font-bold">·</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
