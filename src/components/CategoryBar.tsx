import React from 'react';
import { CategoryId, Language } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { 
  Layers, 
  BookOpen, 
  Microscope, 
  Laptop, 
  GraduationCap, 
  Home, 
  Gift 
} from 'lucide-react';

interface CategoryBarProps {
  language: Language;
  selectedCategory: CategoryId;
  onSelectCategory: (category: CategoryId) => void;
  itemCounts: Record<CategoryId, number>;
}

export const CategoryBar: React.FC<CategoryBarProps> = ({
  language,
  selectedCategory,
  onSelectCategory,
  itemCounts,
}) => {
  const t = TRANSLATIONS[language];

  const categories: { id: CategoryId; label: string; icon: React.ReactNode; isAccent?: boolean }[] = [
    {
      id: 'all',
      label: t.categories.all,
      icon: <Layers className="w-4 h-4" />,
    },
    {
      id: 'books',
      label: t.categories.books,
      icon: <BookOpen className="w-4 h-4" />,
    },
    {
      id: 'lab_gear',
      label: t.categories.lab_gear,
      icon: <Microscope className="w-4 h-4" />,
    },
    {
      id: 'electronics',
      label: t.categories.electronics,
      icon: <Laptop className="w-4 h-4" />,
    },
    {
      id: 'services',
      label: t.categories.services,
      icon: <GraduationCap className="w-4 h-4" />,
    },
    {
      id: 'dorm',
      label: t.categories.dorm,
      icon: <Home className="w-4 h-4" />,
    },
    {
      id: 'free_donation',
      label: t.categories.free_donation,
      icon: <Gift className="w-4 h-4" />,
      isAccent: true,
    },
  ];

  return (
    <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-1.5 overflow-x-auto py-2.5 scrollbar-none">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const count = itemCounts[cat.id] || 0;

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? cat.isAccent
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-indigo-600 text-white shadow-sm'
                    : cat.isAccent
                    ? 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 bg-emerald-50/60 dark:bg-emerald-950/20'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span className={isSelected ? 'text-white' : cat.isAccent ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}>
                  {cat.icon}
                </span>
                <span>{cat.label}</span>
                <span
                  className={`text-[11px] px-1.5 py-0.2 rounded-md ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-mono'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
