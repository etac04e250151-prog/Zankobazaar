import React, { useState } from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { UNIVERSITIES } from '../data/mockItems';
import { 
  MapPin, 
  ExternalLink, 
  Navigation, 
  ShieldCheck, 
  Building, 
  Compass, 
  CheckCircle2,
  Info
} from 'lucide-react';

interface CampusMapIndicatorProps {
  campusLocation: string;
  universityId: string;
  language: Language;
}

interface CampusBuilding {
  id: string;
  name: { ku: string; en: string; ar: string };
  code: string;
  x: number; // percentage on map
  y: number; // percentage on map
  type: 'library' | 'engineering' | 'cafeteria' | 'gate' | 'medical' | 'dorm';
}

export const CampusMapIndicator: React.FC<CampusMapIndicatorProps> = ({
  campusLocation,
  universityId,
  language,
}) => {
  const university = UNIVERSITIES.find((u) => u.id === universityId) || UNIVERSITIES[0];
  const uniName = university.name[language] || university.name.en;

  // Detect which campus building/area matches the item's location
  const locLower = campusLocation.toLowerCase();
  
  let activeBuildingType: 'library' | 'engineering' | 'cafeteria' | 'gate' | 'medical' | 'dorm' = 'library';
  let zoneName = {
    ku: 'ناوچەی B: کتێبخانەی ناوەندی و هۆڵی خوێندنەوە',
    en: 'Zone B: Central Library & Study Halls',
    ar: 'المنطقة B: المكتبة المركزية وقاعات المطالعة',
  };

  if (locLower.includes('کتێبخانە') || locLower.includes('library') || locLower.includes('مكتب')) {
    activeBuildingType = 'library';
    zoneName = {
      ku: 'ناوچەی B: کتێبخانەی ناوەندی و خوێندنەوە',
      en: 'Zone B: Central Library & Reading Halls',
      ar: 'المنطقة B: المكتبة المركزية وقاعات القراءة',
    };
  } else if (locLower.includes('ئەندازیاری') || locLower.includes('تەکنیکی') || locLower.includes('engineering') || locLower.includes('هندس')) {
    activeBuildingType = 'engineering';
    zoneName = {
      ku: 'ناوچەی E: کۆلێژی تەکنیکی و ئەندازیاری',
      en: 'Zone E: Engineering & Tech Faculty',
      ar: 'المنطقة E: كلية الهندسة والتكنولوجيا',
    };
  } else if (locLower.includes('پزیشک') || locLower.includes('نەخۆشخانە') || locLower.includes('medical') || locLower.includes('طب')) {
    activeBuildingType = 'medical';
    zoneName = {
      ku: 'ناوچەی M: کەمپی پزیشکی و نەخۆشخانەی فێرکاری',
      en: 'Zone M: Medical Campus & Teaching Hospital',
      ar: 'المنطقة M: المجمع الطبي والمستشفى التعليمي',
    };
  } else if (locLower.includes('بەشە ناوخۆیی') || locLower.includes('dorm') || locLower.includes('سكن')) {
    activeBuildingType = 'dorm';
    zoneName = {
      ku: 'ناوچەی D: بەشە ناوخۆییەکانی قوتابیان',
      en: 'Zone D: Student Dormitories',
      ar: 'المنطقة D: مجمع الأقسام الداخلية',
    };
  } else if (locLower.includes('کافیتریا') || locLower.includes('cafeteria') || locLower.includes('سەنتەر') || locLower.includes('center')) {
    activeBuildingType = 'cafeteria';
    zoneName = {
      ku: 'ناوچەی C: کافیتریای سەرەکی و سەنتەری قوتابیان',
      en: 'Zone C: Student Center & Main Cafeteria',
      ar: 'المنطقة C: الكافتيريا ومركز شؤون الطلبة',
    };
  } else {
    activeBuildingType = 'gate';
    zoneName = {
      ku: 'ناوچەی G: دەروازەی سەرەکی و هۆڵی پێشوازی',
      en: 'Zone G: Main Campus Gate & Reception',
      ar: 'المنطقة G: بوابة الحرم الجامعي وقاعة الاستقبال',
    };
  }

  // Pre-configured campus landmark buildings on stylized SVG
  const campusBuildings: CampusBuilding[] = [
    {
      id: 'gate',
      name: { ku: 'دەروازەی سەرەکی کەمپ', en: 'Main Campus Gate', ar: 'البوابة الرئيسية للحرم' },
      code: 'GATE-01',
      x: 18,
      y: 78,
      type: 'gate',
    },
    {
      id: 'library',
      name: { ku: 'کتێبخانەی ناوەندی', en: 'Central Library', ar: 'المكتبة المركزية' },
      code: 'LIB-B',
      x: 52,
      y: 35,
      type: 'library',
    },
    {
      id: 'engineering',
      name: { ku: 'کۆلێژی ئەندازیاری و تاقیگە', en: 'Engineering & Labs', ar: 'كلية الهندسة والمختبرات' },
      code: 'ENG-E',
      x: 80,
      y: 42,
      type: 'engineering',
    },
    {
      id: 'cafeteria',
      name: { ku: 'کافیتریای زانکۆ و خوێندکاران', en: 'Campus Cafeteria', ar: 'كافتيريا الطلبة' },
      code: 'CAF-C',
      x: 35,
      y: 50,
      type: 'cafeteria',
    },
    {
      id: 'medical',
      name: { ku: 'باڵەخانەی پزیشکی و کلینیک', en: 'Medical Building', ar: 'المبنى الطبي والعيادات' },
      code: 'MED-M',
      x: 75,
      y: 75,
      type: 'medical',
    },
  ];

  const activeBuilding = campusBuildings.find((b) => b.type === activeBuildingType) || campusBuildings[1];
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>(activeBuilding.id);

  // Google Maps Search link
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${uniName} ${campusLocation}`
  )}`;

  return (
    <div className="rounded-2xl border border-indigo-200/80 dark:border-slate-800 bg-gradient-to-b from-indigo-50/70 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950 overflow-hidden shadow-xs">
      {/* Header bar */}
      <div className="px-4 py-3 border-b border-indigo-100 dark:border-slate-800 flex items-center justify-between bg-indigo-100/50 dark:bg-slate-800/60">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-xs">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-indigo-950 dark:text-white block">
              {language === 'ku' && 'نەخشەی دیاریکەری شوێنی کەمپ'}
              {language === 'en' && 'Campus Building & Exchange Map'}
              {language === 'ar' && 'مخطط مباني الحرم ونقطة التسليم'}
            </span>
            <span className="text-[11px] text-indigo-700 dark:text-indigo-400 font-medium">
              {uniName}
            </span>
          </div>
        </div>

        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-slate-700 rounded-lg text-[11px] font-semibold transition-colors shadow-2xs"
          title="Google Maps"
        >
          <Navigation className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
          <span>{language === 'ku' ? 'گوگڵ ماپس' : language === 'ar' ? 'خرائط غوغل' : 'Google Maps'}</span>
          <ExternalLink className="w-2.5 h-2.5 opacity-60" />
        </a>
      </div>

      {/* Interactive Stylized Campus Layout Map */}
      <div className="relative h-48 sm:h-52 w-full bg-slate-100/90 dark:bg-slate-950 overflow-hidden select-none border-b border-indigo-100/60 dark:border-slate-800">
        {/* Background Stylized Campus Grid & Pathways */}
        <svg className="absolute inset-0 w-full h-full text-slate-300 dark:text-slate-800" preserveAspectRatio="none">
          <defs>
            <pattern id="campus-grid" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(99, 102, 241, 0.07)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#campus-grid)" />

          {/* Stylized Campus Walkways */}
          <path
            d="M 50 200 L 120 130 L 250 130 L 320 80 L 480 80"
            fill="none"
            stroke="#cbd5e1"
            className="dark:stroke-slate-700"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M 120 130 L 120 60 L 250 60"
            fill="none"
            stroke="#cbd5e1"
            className="dark:stroke-slate-700"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            d="M 250 130 L 340 180 L 450 180"
            fill="none"
            stroke="#cbd5e1"
            className="dark:stroke-slate-700"
            strokeWidth="6"
            strokeLinecap="round"
          />

          {/* Green zones / University gardens */}
          <rect x="20" y="20" width="80" height="50" rx="12" fill="#dcfce7" className="dark:fill-emerald-950" opacity="0.6" />
          <rect x="220" y="145" width="90" height="40" rx="10" fill="#dcfce7" className="dark:fill-emerald-950" opacity="0.6" />
          <circle cx="280" cy="95" r="16" fill="#e0e7ff" className="dark:fill-indigo-950" opacity="0.7" />
        </svg>

        {/* Central Fountain / Quad icon */}
        <div className="absolute top-[42%] left-[48%] -translate-x-1/2 -translate-y-1/2 text-[9px] font-bold text-indigo-400 bg-white/70 dark:bg-slate-900/80 px-2 py-0.5 rounded-full border border-indigo-100 dark:border-slate-800 pointer-events-none">
          {language === 'ku' ? 'مەیدانی کەمپ' : language === 'ar' ? 'ساحة الحرم' : 'Campus Quad'}
        </div>

        {/* Campus Buildings Pins */}
        {campusBuildings.map((b) => {
          const isTargeted = b.type === activeBuildingType;
          const isSelected = selectedBuildingId === b.id;

          return (
            <div
              key={b.id}
              onClick={() => setSelectedBuildingId(b.id)}
              style={{ top: `${b.y}%`, left: `${b.x}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
            >
              {/* Highlight Pulse Ripple for targeted item location */}
              {isTargeted && (
                <div className="absolute inset-0 -m-3 rounded-full bg-indigo-500/25 animate-ping pointer-events-none" />
              )}

              {/* Pin container */}
              <div
                className={`relative flex items-center justify-center rounded-xl p-1.5 transition-all shadow-md ${
                  isTargeted
                    ? 'bg-indigo-600 text-white ring-4 ring-indigo-300/60 scale-110 z-20'
                    : isSelected
                    ? 'bg-slate-900 text-white z-10'
                    : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:border-slate-700'
                }`}
              >
                {b.type === 'library' && <Building className="w-3.5 h-3.5" />}
                {b.type === 'engineering' && <Compass className="w-3.5 h-3.5" />}
                {b.type === 'cafeteria' && <MapPin className="w-3.5 h-3.5" />}
                {b.type === 'gate' && <Navigation className="w-3.5 h-3.5" />}
                {b.type === 'medical' && <Building className="w-3.5 h-3.5" />}
              </div>

              {/* Pin Label Tooltip */}
              <div
                className={`absolute top-full mt-1.5 start-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded-md text-[10px] font-bold shadow-md transition-all pointer-events-none z-30 ${
                  isTargeted
                    ? 'bg-indigo-900 text-white'
                    : 'bg-white text-slate-800 border border-slate-200 opacity-90 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700'
                }`}
              >
                {b.name[language] || b.name.en}
                {isTargeted && ' ★'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Details Bar below map */}
      <div className="p-4 space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
              <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{campusLocation}</span>
            </div>
            <p className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-400">
              {zoneName[language] || zoneName.en}
            </p>
          </div>

          <div className="shrink-0 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>
              {language === 'ku' ? 'ناوچەی پارێزراو' : language === 'ar' ? 'منطقة آمنة' : 'Safe Campus Zone'}
            </span>
          </div>
        </div>

        {/* Practical meetup tips */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 shrink-0" />
            <span>
              {language === 'ku' && 'ڕادەستکردن لە ڕۆژدا لە شوێنی گشتی کەمپ ئەنجام دەدرێت.'}
              {language === 'en' && 'Physical exchange is conducted in illuminated campus public areas.'}
              {language === 'ar' && 'تتم المعاينة في وضح النهار في الساحات والمباني العامة بالجامعة.'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
