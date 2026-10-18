import React, { useState } from 'react';
import { Language, CategoryId, ItemCondition, ListingItem, UserRole, UserAccount } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { UNIVERSITIES } from '../data/mockItems';
import { 
  X, 
  Sparkles, 
  Loader2, 
  Check, 
} from 'lucide-react';

interface CreateListingModalProps {
  language: Language;
  onClose: () => void;
  onAddItem: (item: ListingItem) => void;
  currentUser?: UserAccount | null;
}

export const CreateListingModal: React.FC<CreateListingModalProps> = ({
  language,
  onClose,
  onAddItem,
  currentUser,
}) => {
  const t = TRANSLATIONS[language];
  const m = t.createModal;

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CategoryId>('books');
  const [department, setDepartment] = useState(currentUser?.department || '');
  const [universityId, setUniversityId] = useState(currentUser?.universityId || 'epu');
  const [condition, setCondition] = useState<ItemCondition>('like_new');
  const [priceIqd, setPriceIqd] = useState<number>(15000);
  const [priceUsd, setPriceUsd] = useState<number>(10);
  const [isFreeDonation, setIsFreeDonation] = useState(false);
  const [campusLocation, setCampusLocation] = useState('کۆلێژی تەکنیکی ئەندازیاری - بەردەم کتێبخانە (EPU)');
  const [sellerNotes, setSellerNotes] = useState('');
  const [description, setDescription] = useState('');
  const [highlights, setHighlights] = useState('');
  const [sellerName, setSellerName] = useState(currentUser?.name || (language === 'ku' ? 'قوتابی زانکۆ' : 'Campus Member'));
  const [sellerRole, setSellerRole] = useState<UserRole>(currentUser?.role || 'student');
  const [phone, setPhone] = useState(currentUser?.phone || '+964 750 000 0000');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=900&q=80');

  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiGeneratedSuccess, setAiGeneratedSuccess] = useState(false);

  // Preset academic image alternatives
  const presetImages = [
    { label: 'Books', url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=900&q=80' },
    { label: 'Medical', url: 'https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&w=900&q=80' },
    { label: 'Laptop', url: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=900&q=80' },
    { label: 'Engineering', url: 'https://images.unsplash.com/photo-1581291518655-9523c93209dd?auto=format&fit=crop&w=900&q=80' },
    { label: 'Calculator', url: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=900&q=80' },
    { label: 'Services', url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=900&q=80' },
  ];

  const handleGenerateWithAi = async () => {
    if (!title) {
      setAiError(language === 'ku' ? 'تکایە سەرەتا ناوی کەلوپەلەکە بنووسە' : 'Please provide item title first');
      return;
    }

    setIsGeneratingAi(true);
    setAiError(null);
    setAiGeneratedSuccess(false);

    try {
      const res = await fetch('/api/ai/describe-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          category,
          department,
          condition,
          notes: sellerNotes,
          language,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        if (json.data.title && !title) setTitle(json.data.title);
        setDescription(json.data.description || '');
        if (json.data.highlights && Array.isArray(json.data.highlights)) {
          setHighlights(json.data.highlights.join('\n'));
        }
        setAiGeneratedSuccess(true);
      } else {
        setAiError(json.error || 'Failed to generate');
      }
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || 'Error communicating with Gemini');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    const highlightArray = highlights
      .split('\n')
      .map((h) => h.trim())
      .filter(Boolean);

    const newItem: ListingItem = {
      id: `item-${Date.now()}`,
      title: {
        ku: title,
        en: title,
        ar: title,
      },
      description: {
        ku: description || title,
        en: description || title,
        ar: description || title,
      },
      priceIqd: isFreeDonation ? 0 : priceIqd,
      priceUsd: isFreeDonation ? 0 : priceUsd,
      isFreeDonation,
      category,
      condition,
      department: department || 'General Academic',
      universityId,
      campusLocation: campusLocation || 'University Campus Gate',
      images: [imageUrl],
      seller: {
        name: sellerName || 'Campus Student',
        role: sellerRole,
        department: department || 'Engineering / IT',
        university: UNIVERSITIES.find((u) => u.id === universityId)?.name[language] || 'EPU',
        verifiedStudentId: true,
        rating: 5.0,
        phone,
        whatsapp: phone.replace(/[^0-9]/g, '') || '9647500000000',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        joinedYear: '2026',
      },
      highlights: highlightArray.length > 0 ? highlightArray : ['کەلوپەلی ئەکادیمی پاک و ڕێکخراو'],
      targetSemesters: 'قۆناغە پەیوەندیدارەکان',
      createdAt: new Date().toISOString().split('T')[0],
      views: 1,
      likes: 0,
    };

    onAddItem(newItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/60">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {m.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {m.subtitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5">
          {/* Item Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              {m.itemName} *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={m.itemNamePlaceholder}
              className="w-full text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl px-3.5 py-2.5 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-600 outline-none transition-all"
            />
          </div>

          {/* Category, Department, University Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {m.category}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryId)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl px-3 py-2.5 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-600 outline-none cursor-pointer"
              >
                <option value="books">{t.categories.books}</option>
                <option value="lab_gear">{t.categories.lab_gear}</option>
                <option value="electronics">{t.categories.electronics}</option>
                <option value="services">{t.categories.services}</option>
                <option value="dorm">{t.categories.dorm}</option>
                <option value="free_donation">{t.categories.free_donation}</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {m.department}
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder={m.departmentPlaceholder}
                className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl px-3 py-2.5 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-600 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {m.university}
              </label>
              <select
                value={universityId}
                onChange={(e) => setUniversityId(e.target.value)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl px-3 py-2.5 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-600 outline-none cursor-pointer"
              >
                {UNIVERSITIES.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.shortName} - {u.city}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Condition, Campus Handover Spot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {m.condition}
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as ItemCondition)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl px-3 py-2.5 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-600 outline-none cursor-pointer"
              >
                <option value="brand_new">{t.condition.brand_new}</option>
                <option value="like_new">{t.condition.like_new}</option>
                <option value="good">{t.condition.good}</option>
                <option value="acceptable">{t.condition.acceptable}</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {m.campusLocation}
              </label>
              <input
                type="text"
                value={campusLocation}
                onChange={(e) => setCampusLocation(e.target.value)}
                placeholder={m.campusLocationPlaceholder}
                className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl px-3 py-2.5 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-600 outline-none"
              />
            </div>
          </div>

          {/* Pricing Row */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {language === 'ku' ? 'نرخ و شێوازی پێشکەشکردن' : language === 'ar' ? 'السعر ونوع العرض' : 'Pricing Options'}
              </span>

              <label className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFreeDonation}
                  onChange={(e) => setIsFreeDonation(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
                <span>{m.markAsFree}</span>
              </label>
            </div>

            {!isFreeDonation && (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1 block">
                    {m.priceIqd}
                  </label>
                  <input
                    type="number"
                    value={priceIqd}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setPriceIqd(val);
                      setPriceUsd(Math.round(val / 1460));
                    }}
                    className="w-full text-sm font-mono bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 focus:border-indigo-600 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1 block">
                    {m.priceUsd}
                  </label>
                  <input
                    type="number"
                    value={priceUsd}
                    onChange={(e) => setPriceUsd(Number(e.target.value))}
                    className="w-full text-sm font-mono bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 focus:border-indigo-600 outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Quick Notes + Gemini AI Generator Banner */}
          <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/70 dark:border-indigo-900/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                  {language === 'ku' ? 'داڕشتنی زیرەکانەی وەسف بە Gemini' : language === 'ar' ? 'صياغة الوصف الذكي عبر Gemini' : 'AI Description Generator'}
                </span>
              </div>

              <button
                type="button"
                onClick={handleGenerateWithAi}
                disabled={isGeneratingAi}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                {isGeneratingAi ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{m.generating}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{m.generateWithAi}</span>
                  </>
                )}
              </button>
            </div>

            <textarea
              rows={2}
              value={sellerNotes}
              onChange={(e) => setSellerNotes(e.target.value)}
              placeholder={m.sellerNotesPlaceholder}
              className="w-full text-xs bg-white dark:bg-slate-800 border border-indigo-100 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-2.5 focus:border-indigo-600 outline-none"
            />

            {aiError && (
              <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{aiError}</p>
            )}
            {aiGeneratedSuccess && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                {language === 'ku' ? 'وەسفی ئەکادیمی بە سەرکەوتوویی دروستکرا!' : 'Description generated successfully!'}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              {m.description}
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={m.descriptionPlaceholder}
              className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-3 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-600 outline-none transition-all leading-relaxed"
            />
          </div>

          {/* Highlights */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              {m.highlights}
            </label>
            <textarea
              rows={2}
              value={highlights}
              onChange={(e) => setHighlights(e.target.value)}
              placeholder={m.highlightsPlaceholder}
              className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-2.5 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-600 outline-none"
            />
          </div>

          {/* Image Presets */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              {m.imageUrl}
            </label>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {presetImages.map((p, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setImageUrl(p.url)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors shrink-0 cursor-pointer ${
                    imageUrl === p.url
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-medium'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 focus:border-indigo-600 outline-none"
            />
          </div>

          {/* Seller details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                {m.sellerName}
              </label>
              <input
                type="text"
                value={sellerName}
                onChange={(e) => setSellerName(e.target.value)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-2.5 py-2 focus:border-indigo-600 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                {m.sellerRole}
              </label>
              <select
                value={sellerRole}
                onChange={(e) => setSellerRole(e.target.value as UserRole)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl px-2.5 py-2 focus:border-indigo-600 outline-none cursor-pointer"
              >
                <option value="student">{t.verifiedStudent}</option>
                <option value="lecturer">{t.verifiedLecturer}</option>
                <option value="staff">{t.verifiedStaff}</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                {m.phone}
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-2.5 py-2 focus:border-indigo-600 outline-none"
              />
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-3">
            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer"
            >
              {m.submitBtn}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
