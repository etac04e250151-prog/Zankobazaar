import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { 
  Language, 
  ListingItem, 
} from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { 
  DEPARTMENTS_DATA, 
  STUDENTS_DATA, 
  CATEGORY_DISTRIBUTION 
} from '../data/contributorData';
import { 
  Trophy, 
  Gift, 
  BookOpen, 
  Users, 
  Sparkles, 
  Heart, 
  TrendingUp, 
  CheckCircle2, 
  GraduationCap, 
  Info,
  Medal
} from 'lucide-react';

interface TopContributorsSectionProps {
  language: Language;
  items: ListingItem[];
  theme?: 'light' | 'dark';
  onOpenCreateModal: () => void;
  onFilterByCategory?: (category: any) => void;
}

type ViewMode = 'departments' | 'students';
type MetricFilter = 'all' | 'freeDonations' | 'books';

export function TopContributorsSection({
  language,
  items,
  theme = 'light',
  onOpenCreateModal,
}: TopContributorsSectionProps) {
  const t = TRANSLATIONS[language];
  const copy = t.topContributors;

  const [viewMode, setViewMode] = useState<ViewMode>('departments');
  const [metricFilter, setMetricFilter] = useState<MetricFilter>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [kudosGiven, setKudosGiven] = useState<Record<string, number>>({});
  const [kudosFeedback, setKudosFeedback] = useState<string | null>(null);

  // SVG Refs for D3
  const barChartSvgRef = useRef<SVGSVGElement | null>(null);
  const donutSvgRef = useRef<SVGSVGElement | null>(null);
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const [chartWidth, setChartWidth] = useState<number>(600);

  // Measure container width
  useEffect(() => {
    if (!chartContainerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setChartWidth(Math.floor(entry.contentRect.width));
        }
      }
    });
    observer.observe(chartContainerRef.current);
    return () => observer.disconnect();
  }, []);

  // Merge base data with live items
  const departments = useMemo(() => {
    return DEPARTMENTS_DATA.map((dept) => {
      const matchingItems = items.filter(item => 
        item.department.toLowerCase().includes(dept.id.replace('dept-', '')) ||
        dept.name.en.toLowerCase().includes(item.department.toLowerCase())
      );
      const extraFree = matchingItems.filter(i => i.isFreeDonation).length;
      const extraBooks = matchingItems.filter(i => i.category === 'books').length;
      
      return {
        ...dept,
        freeDonations: dept.freeDonations + extraFree,
        booksShared: dept.booksShared + extraBooks,
        totalActivity: (dept.booksShared + extraBooks) + (dept.freeDonations + extraFree),
      };
    });
  }, [items]);

  const students = useMemo(() => {
    return STUDENTS_DATA.map((student) => {
      const extraKudos = kudosGiven[student.id] || 0;
      return {
        ...student,
        totalActivity: student.booksShared + student.freeDonations + extraKudos,
      };
    });
  }, [kudosGiven]);

  // Overall totals
  const overallMetrics = useMemo(() => {
    const totalDeptBooks = departments.reduce((acc, d) => acc + d.booksShared, 0);
    const totalDeptDonations = departments.reduce((acc, d) => acc + d.freeDonations, 0);
    const totalDeptHelped = departments.reduce((acc, d) => acc + d.studentsHelped, 0);
    const totalDeptSavings = departments.reduce((acc, d) => acc + d.estimatedSavingsIqd, 0);

    return {
      totalShared: totalDeptBooks + totalDeptDonations,
      booksShared: totalDeptBooks,
      freeDonations: totalDeptDonations,
      studentsHelped: totalDeptHelped,
      estimatedSavingsIqd: totalDeptSavings,
    };
  }, [departments]);

  // Top 3 Podium
  const podiumList = useMemo(() => {
    if (viewMode === 'departments') {
      const sorted = [...departments].sort((a, b) => {
        if (metricFilter === 'freeDonations') return b.freeDonations - a.freeDonations;
        if (metricFilter === 'books') return b.booksShared - a.booksShared;
        return (b.booksShared + b.freeDonations) - (a.booksShared + a.freeDonations);
      });
      return sorted.slice(0, 3);
    } else {
      const sorted = [...students].sort((a, b) => {
        if (metricFilter === 'freeDonations') return b.freeDonations - a.freeDonations;
        if (metricFilter === 'books') return b.booksShared - a.booksShared;
        return b.totalActivity - a.totalActivity;
      });
      return sorted.slice(0, 3);
    }
  }, [departments, students, viewMode, metricFilter]);

  const handleSendKudos = (id: string, name: string) => {
    setKudosGiven(prev => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
    setKudosFeedback(`${copy.podium.kudosSent} (${name})`);
    setTimeout(() => {
      setKudosFeedback(null);
    }, 4000);
  };

  // Format currency
  const formatIqd = (amount: number) => {
    return new Intl.NumberFormat(language === 'en' ? 'en-US' : 'ar-IQ').format(amount);
  };

  // ==========================================
  // D3 Bar / Leaderboard Chart Render
  // ==========================================
  useEffect(() => {
    if (!barChartSvgRef.current) return;

    const svg = d3.select(barChartSvgRef.current);
    svg.selectAll('*').remove();

    const isDark = theme === 'dark' || document.documentElement.classList.contains('dark');
    const width = Math.max(chartWidth, 340);
    const isMobile = width < 560;

    // Prepare chart data
    const rawData = viewMode === 'departments' 
      ? departments.map((d) => {
          const val = metricFilter === 'freeDonations' 
            ? d.freeDonations 
            : metricFilter === 'books' 
            ? d.booksShared 
            : (d.booksShared + d.freeDonations);
          return {
            id: d.id,
            name: d.name[language] || d.name.en,
            subLabel: d.universityShort,
            books: d.booksShared,
            donations: d.freeDonations,
            helped: d.studentsHelped,
            savings: d.estimatedSavingsIqd,
            color: d.color,
            val,
            raw: d,
          };
        })
      : students.map((s, index) => {
          const val = metricFilter === 'freeDonations' 
            ? s.freeDonations 
            : metricFilter === 'books' 
            ? s.booksShared 
            : s.totalActivity;
          return {
            id: s.id,
            name: s.name[language] || s.name.en,
            subLabel: `${s.department[language] || s.department.en} (${s.universityShort})`,
            books: s.booksShared,
            donations: s.freeDonations,
            helped: s.studentsHelped,
            savings: s.estimatedSavingsIqd,
            color: index === 0 ? '#f59e0b' : index === 1 ? '#94a3b8' : index === 2 ? '#d97706' : '#6366f1',
            val,
            raw: s,
          };
        });

    const data = [...rawData].sort((a, b) => b.val - a.val);

    const margin = {
      top: 24,
      right: isMobile ? 55 : 80,
      bottom: 30,
      left: isMobile ? 130 : 190,
    };

    const rowHeight = isMobile ? 48 : 54;
    const height = margin.top + margin.bottom + (data.length * rowHeight);

    svg.attr('viewBox', `0 0 ${width} ${height}`)
       .attr('width', '100%')
       .attr('height', height);

    const defs = svg.append('defs');

    data.forEach((d, i) => {
      const grad = defs.append('linearGradient')
        .attr('id', `bar-grad-${i}`)
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '100%')
        .attr('y2', '0%');

      grad.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', d.color)
        .attr('stop-opacity', isDark ? 0.9 : 0.82);

      grad.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', d.color)
        .attr('stop-opacity', 1.0);
    });

    const maxVal = d3.max(data, d => d.val) || 10;
    const xScale = d3.scaleLinear()
      .domain([0, maxVal * 1.15])
      .range([margin.left, width - margin.right]);

    const yScale = d3.scaleBand()
      .domain(data.map(d => d.id))
      .range([margin.top, height - margin.bottom])
      .padding(0.28);

    // Gridlines
    const xTicks = xScale.ticks(isMobile ? 3 : 5);
    const gridGroup = svg.append('g').attr('class', 'grid-lines');
    
    xTicks.forEach(tick => {
      gridGroup.append('line')
        .attr('x1', xScale(tick))
        .attr('x2', xScale(tick))
        .attr('y1', margin.top)
        .attr('y2', height - margin.bottom)
        .attr('stroke', isDark ? '#334155' : '#f1f5f9')
        .attr('stroke-dasharray', '3,3');

      gridGroup.append('text')
        .attr('x', xScale(tick))
        .attr('y', height - margin.bottom + 18)
        .attr('text-anchor', 'middle')
        .attr('fill', isDark ? '#64748b' : '#94a3b8')
        .attr('font-size', '10px')
        .attr('font-weight', '500')
        .text(tick);
    });

    // Bars container
    const rows = svg.append('g')
      .attr('class', 'data-rows')
      .selectAll('g')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'row-group')
      .attr('transform', d => `translate(0, ${yScale(d.id)})`)
      .style('cursor', 'pointer')
      .on('mouseenter', function (event, d) {
        d3.select(this).select('.main-bar')
          .transition()
          .duration(180)
          .attr('filter', isDark ? 'drop-shadow(0 4px 10px rgba(99, 102, 241, 0.4))' : 'drop-shadow(0 4px 8px rgba(99, 102, 241, 0.25))')
          .attr('transform', 'scale(1.01, 1)');
        setSelectedId(d.id);
      })
      .on('mouseleave', function () {
        d3.select(this).select('.main-bar')
          .transition()
          .duration(180)
          .attr('filter', 'none')
          .attr('transform', 'scale(1, 1)');
      })
      .on('click', function(event, d) {
        setSelectedId(prev => prev === d.id ? null : d.id);
      });

    // Background track bar
    rows.append('rect')
      .attr('x', margin.left)
      .attr('y', 0)
      .attr('width', width - margin.left - margin.right)
      .attr('height', yScale.bandwidth())
      .attr('rx', 8)
      .attr('fill', isDark ? '#1e293b' : '#f8fafc');

    // Foreground animated bar
    rows.append('rect')
      .attr('class', 'main-bar')
      .attr('x', margin.left)
      .attr('y', 0)
      .attr('height', yScale.bandwidth())
      .attr('rx', 8)
      .attr('fill', (d, i) => `url(#bar-grad-${i})`)
      .attr('width', 0)
      .transition()
      .duration(650)
      .delay((d, i) => i * 45)
      .ease(d3.easeCubicOut)
      .attr('width', d => Math.max(xScale(d.val) - margin.left, 6));

    if (metricFilter === 'all') {
      rows.append('rect')
        .attr('x', d => {
          const booksWidth = Math.max(xScale(d.books) - margin.left, 0);
          return margin.left + booksWidth;
        })
        .attr('y', 0)
        .attr('width', 2)
        .attr('height', yScale.bandwidth())
        .attr('fill', '#ffffff')
        .attr('opacity', isDark ? 0.8 : 0.6);
    }

    // Rank Pill / Number Badge
    rows.append('circle')
      .attr('cx', 16)
      .attr('cy', yScale.bandwidth() / 2)
      .attr('r', 11)
      .attr('fill', (d, i) => isDark 
        ? (i === 0 ? '#78350f' : i === 1 ? '#334155' : i === 2 ? '#7c2d12' : '#1e293b') 
        : (i === 0 ? '#fef3c7' : i === 1 ? '#f1f5f9' : i === 2 ? '#ffedd5' : '#f8fafc'))
      .attr('stroke', (d, i) => i === 0 ? '#f59e0b' : i === 1 ? '#94a3b8' : i === 2 ? '#d97706' : (isDark ? '#334155' : '#e2e8f0'))
      .attr('stroke-width', 1.2);

    rows.append('text')
      .attr('x', 16)
      .attr('y', yScale.bandwidth() / 2 + 3.5)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('font-weight', '700')
      .attr('fill', (d, i) => isDark 
        ? (i === 0 ? '#fde68a' : i === 1 ? '#cbd5e1' : i === 2 ? '#fed7aa' : '#94a3b8')
        : (i === 0 ? '#b45309' : i === 1 ? '#475569' : i === 2 ? '#9a3412' : '#64748b'))
      .text((d, i) => (i + 1));

    // Department / Student Name
    rows.append('text')
      .attr('x', 34)
      .attr('y', yScale.bandwidth() / 2 - 2)
      .attr('text-anchor', 'start')
      .attr('fill', isDark ? '#f8fafc' : '#1e293b')
      .attr('font-size', isMobile ? '11px' : '12px')
      .attr('font-weight', '700')
      .text(d => {
        const maxLen = isMobile ? 14 : 22;
        return d.name.length > maxLen ? d.name.slice(0, maxLen) + '…' : d.name;
      });

    // Subtitle (Campus / Major)
    rows.append('text')
      .attr('x', 34)
      .attr('y', yScale.bandwidth() / 2 + 12)
      .attr('text-anchor', 'start')
      .attr('fill', isDark ? '#94a3b8' : '#64748b')
      .attr('font-size', '10px')
      .attr('font-weight', '500')
      .text(d => {
        const maxLen = isMobile ? 16 : 24;
        return d.subLabel.length > maxLen ? d.subLabel.slice(0, maxLen) + '…' : d.subLabel;
      });

    // End Value Label
    rows.append('text')
      .attr('x', d => xScale(d.val) + 8)
      .attr('y', yScale.bandwidth() / 2 + 4)
      .attr('text-anchor', 'start')
      .attr('fill', isDark ? '#f1f5f9' : '#0f172a')
      .attr('font-size', isMobile ? '11px' : '12px')
      .attr('font-weight', '800')
      .attr('font-family', 'ui-monospace, SFMono-Regular, monospace')
      .text(d => `${d.val}`);

  }, [chartWidth, viewMode, metricFilter, departments, students, language, theme]);

  // ==========================================
  // D3 Donut / Pie Chart Render
  // ==========================================
  useEffect(() => {
    if (!donutSvgRef.current) return;

    const svg = d3.select(donutSvgRef.current);
    svg.selectAll('*').remove();

    const isDark = theme === 'dark' || document.documentElement.classList.contains('dark');
    const size = 220;
    const radius = size / 2;
    const innerRadius = radius * 0.62;

    svg.attr('viewBox', `0 0 ${size} ${size}`)
       .attr('width', '100%')
       .attr('height', size);

    const g = svg.append('g')
      .attr('transform', `translate(${radius}, ${radius})`);

    const pie = d3.pie<typeof CATEGORY_DISTRIBUTION[0]>()
      .value(d => d.count)
      .sort(null)
      .padAngle(0.04);

    const arc = d3.arc<d3.PieArcDatum<typeof CATEGORY_DISTRIBUTION[0]>>()
      .innerRadius(innerRadius)
      .outerRadius(radius - 6)
      .cornerRadius(6);

    const hoverArc = d3.arc<d3.PieArcDatum<typeof CATEGORY_DISTRIBUTION[0]>>()
      .innerRadius(innerRadius - 2)
      .outerRadius(radius - 1)
      .cornerRadius(6);

    const arcs = g.selectAll('.arc')
      .data(pie(CATEGORY_DISTRIBUTION))
      .enter()
      .append('g')
      .attr('class', 'arc')
      .style('cursor', 'pointer');

    arcs.append('path')
      .attr('d', arc)
      .attr('fill', d => d.data.color)
      .attr('opacity', 0.92)
      .on('mouseenter', function (event, d) {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('d', hoverArc as any)
          .attr('opacity', 1.0)
          .attr('filter', 'drop-shadow(0 4px 6px rgba(0,0,0,0.25))');

        centerVal.text(`${d.data.count}`);
        centerLabel.text(`${d.data.percentage}%`);
      })
      .on('mouseleave', function () {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('d', arc as any)
          .attr('opacity', 0.92)
          .attr('filter', 'none');

        centerVal.text(`${overallMetrics.totalShared}`);
        centerLabel.text(copy.metrics.totalShared);
      });

    // Center Content
    const centerGroup = g.append('g').attr('text-anchor', 'middle');

    const centerVal = centerGroup.append('text')
      .attr('y', 4)
      .attr('font-size', '20px')
      .attr('font-weight', '900')
      .attr('fill', isDark ? '#f8fafc' : '#0f172a')
      .attr('font-family', 'ui-monospace, SFMono-Regular, monospace')
      .text(`${overallMetrics.totalShared}`);

    const centerLabel = centerGroup.append('text')
      .attr('y', 20)
      .attr('font-size', '9px')
      .attr('font-weight', '600')
      .attr('fill', isDark ? '#94a3b8' : '#64748b')
      .text(language === 'ku' ? 'کۆی گشتی' : language === 'ar' ? 'الإجمالي' : 'Total');

  }, [overallMetrics, copy, language, theme]);

  return (
    <section id="top-contributors" className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 border-t border-slate-200 dark:border-slate-800 pt-14 pb-12 scroll-mt-16 transition-colors">
      {/* Decorative background glow accents */}
      <div className="absolute top-0 start-1/4 w-96 h-96 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 end-1/4 w-96 h-96 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 space-y-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200/60 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
              <span>{copy.sectionBadge}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
              <span>{copy.title}</span>
              <Trophy className="w-6 h-6 text-amber-500 shrink-0" />
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
              {copy.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xs text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs shadow-emerald-500/50" />
              <span>{copy.semesterLabel}</span>
            </div>

            <button
              onClick={onOpenCreateModal}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-2 cursor-pointer"
            >
              <Gift className="w-4 h-4 text-indigo-200" />
              <span>{copy.cta.button}</span>
            </button>
          </div>
        </div>

        {/* Global Impact Summary 4-Grid Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{copy.metrics.totalShared}</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
              {overallMetrics.totalShared}+
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              {language === 'ku' && 'کتێب، مەلازم و ئامێری تاقیگە'}
              {language === 'en' && 'Textbooks, notes & lab tools'}
              {language === 'ar' && 'كتب وملازم وأدوات مختبرية'}
            </p>
          </div>

          <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{copy.metrics.freeDonations}</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Gift className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {overallMetrics.freeDonations}
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              {language === 'ku' && 'بەخشراوی تەواو خۆڕایی و بێبەرامبەر'}
              {language === 'en' && '100% Free peer-to-peer gifts'}
              {language === 'ar' && 'إهداءات مجانية 100% بين الطلبة'}
            </p>
          </div>

          <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-sky-200 dark:hover:border-sky-800 transition-colors space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{copy.metrics.studentsHelped}</span>
              <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-sky-600 dark:text-sky-400 font-mono">
              {overallMetrics.studentsHelped}+
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              {language === 'ku' && 'خوێندکاری سوودمەند لە کەمپەکان'}
              {language === 'en' && 'Students supported across campuses'}
              {language === 'ar' && 'طالباً استلموا المواد والمراجع'}
            </p>
          </div>

          <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-amber-200 dark:hover:border-amber-800 transition-colors space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{copy.metrics.estSavings}</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Trophy className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono truncate">
              {formatIqd(overallMetrics.estimatedSavingsIqd)} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">{t.currency.iqd}</span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              {language === 'ku' && 'پاشەکەوتکراو لە کڕینی کتێبی نوێ'}
              {language === 'en' && 'Saved from commercial textbook costs'}
              {language === 'ar' && 'توفير مباشر في كلف شراء المراجع'}
            </p>
          </div>
        </div>

        {/* Kudos alert notification toast banner if triggered */}
        {kudosFeedback && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 rounded-2xl text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-2 shadow-xs animate-in fade-in duration-300">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500 animate-bounce" />
            <span>{kudosFeedback}</span>
          </div>
        )}

        {/* View Mode & Filter Switcher */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          {/* Mode Switcher */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-full sm:w-auto">
            <button
              onClick={() => {
                setViewMode('departments');
                setSelectedId(null);
              }}
              className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                viewMode === 'departments'
                  ? 'bg-white dark:bg-slate-700 text-indigo-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {copy.viewMode.departments}
            </button>

            <button
              onClick={() => {
                setViewMode('students');
                setSelectedId(null);
              }}
              className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                viewMode === 'students'
                  ? 'bg-white dark:bg-slate-700 text-indigo-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {copy.viewMode.students}
            </button>
          </div>

          {/* Metric Filter Tabs */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setMetricFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer shrink-0 ${
                metricFilter === 'all'
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {copy.filters.all}
            </button>
            <button
              onClick={() => setMetricFilter('freeDonations')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
                metricFilter === 'freeDonations'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700 dark:hover:text-emerald-400'
              }`}
            >
              <Gift className="w-3.5 h-3.5" />
              <span>{copy.filters.freeDonations}</span>
            </button>
            <button
              onClick={() => setMetricFilter('books')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
                metricFilter === 'books'
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-700 dark:hover:text-indigo-400'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{copy.filters.books}</span>
            </button>
          </div>
        </div>

        {/* Top 3 Podium Cards */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Medal className="w-4 h-4 text-amber-500" />
              <span>{copy.podium.title}</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">
              {metricFilter === 'freeDonations' ? copy.filters.freeDonations : metricFilter === 'books' ? copy.filters.books : copy.filters.all}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {podiumList.map((entry: any, index) => {
              const rankColor = index === 0 
                ? 'from-amber-500/10 dark:from-amber-950/20 via-amber-50 dark:via-slate-900 to-white dark:to-slate-900 border-amber-300 dark:border-amber-700/60' 
                : index === 1 
                ? 'from-slate-200/40 dark:from-slate-800/40 via-slate-50 dark:via-slate-900 to-white dark:to-slate-900 border-slate-300 dark:border-slate-700' 
                : 'from-orange-500/10 dark:from-orange-950/20 via-orange-50 dark:via-slate-900 to-white dark:to-slate-900 border-orange-300 dark:border-orange-700/60';
              
              const rankBadge = index === 0 
                ? 'bg-amber-500 text-white' 
                : index === 1 
                ? 'bg-slate-500 text-white' 
                : 'bg-orange-600 text-white';

              const rankLabel = index === 0 
                ? copy.podium.rank1 
                : index === 1 
                ? copy.podium.rank2 
                : copy.podium.rank3;

              const isDept = viewMode === 'departments';
              const name = entry.name[language] || entry.name.en;
              const sub = isDept 
                ? (entry.universityName[language] || entry.universityName.en) 
                : (entry.department[language] || entry.department.en);

              return (
                <div 
                  key={entry.id}
                  className={`p-5 rounded-2xl border bg-gradient-to-b ${rankColor} shadow-xs relative flex flex-col justify-between space-y-4`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {isDept ? (
                        <div 
                          className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-black shadow-xs"
                          style={{ backgroundColor: entry.color }}
                        >
                          <GraduationCap className="w-6 h-6" />
                        </div>
                      ) : (
                        <div className="relative">
                          <img 
                            src={entry.avatar} 
                            alt={name}
                            className="w-11 h-11 rounded-xl object-cover border-2 border-white dark:border-slate-700 shadow-xs"
                          />
                          {entry.verified && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-white dark:fill-slate-900 absolute -bottom-1 -end-1" />
                          )}
                        </div>
                      )}

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 text-[10px] font-black rounded-full uppercase tracking-wider ${rankBadge}`}>
                            {rankLabel}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                          {name}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                          {sub}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Highlights Metric pill */}
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-800 text-xs">
                    <div className="p-2 bg-white/80 dark:bg-slate-800/80 rounded-xl">
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-medium">
                        {copy.metrics.booksShared}
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-100 font-mono text-sm">
                        {entry.booksShared}
                      </span>
                    </div>

                    <div className="p-2 bg-white/80 dark:bg-slate-800/80 rounded-xl">
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-medium">
                        {copy.metrics.freeDonations}
                      </span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                        {entry.freeDonations}
                      </span>
                    </div>
                  </div>

                  {/* Quote or details */}
                  {!isDept && entry.favoriteQuote && (
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 italic bg-white/60 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200/40 dark:border-slate-700/60 leading-relaxed">
                      "{entry.favoriteQuote[language] || entry.favoriteQuote.en}"
                    </p>
                  )}

                  {/* Kudos button for students */}
                  {!isDept && (
                    <button
                      onClick={() => handleSendKudos(entry.id, name)}
                      className="w-full py-2 bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-slate-700 hover:border-rose-200 text-rose-600 dark:text-rose-400 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                      <span>{copy.podium.sendKudos} ({kudosGiven[entry.id] || 0})</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* D3 Visualizations Dual Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Main D3 Bar Chart */}
          <div 
            ref={chartContainerRef}
            className="lg:col-span-8 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span>
                    {viewMode === 'departments' 
                      ? copy.chart.titleDepartments 
                      : copy.chart.titleStudents}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                  {copy.chart.clickToInspect}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono text-[10px] font-semibold rounded-lg border border-slate-200/50 dark:border-slate-700/50">
                  {copy.chart.d3Tag}
                </span>
              </div>
            </div>

            {/* D3 Render Target SVG */}
            <div className="overflow-x-auto w-full">
              <svg ref={barChartSvgRef} className="w-full transition-all duration-300" />
            </div>

            {/* Chart Legend */}
            <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 gap-3">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-indigo-600" />
                  <span>{copy.metrics.booksShared}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-emerald-600" />
                  <span>{copy.metrics.freeDonations}</span>
                </div>
              </div>

              <span className="text-[11px] text-slate-400 dark:text-slate-500">
                {copy.chart.axisScore}
              </span>
            </div>
          </div>

          {/* D3 Donut & Category Distribution */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5 transition-colors">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                {copy.chart.breakdownTitle}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {copy.semesterLabel}
              </p>
            </div>

            {/* Donut Chart SVG */}
            <div className="flex justify-center py-1">
              <svg ref={donutSvgRef} className="max-w-[220px] h-auto" />
            </div>

            {/* Category breakdown rows */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              {CATEGORY_DISTRIBUTION.map((cat) => (
                <div key={cat.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span 
                        className="w-2.5 h-2.5 rounded-full shrink-0" 
                        style={{ backgroundColor: cat.color }} 
                      />
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {cat.label[language] || cat.label.en}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                      {cat.count} ({cat.percentage}%)
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${cat.percentage}%`,
                        backgroundColor: cat.color 
                      }} 
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Campus Sharing Ethics Note */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                <Info className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>
                  {language === 'ku' && 'یاسای هاوکاری ئەکادیمی زانکۆ'}
                  {language === 'en' && 'Campus Academic Honor Code'}
                  {language === 'ar' && 'ميثاق التكافل الأكاديمي'}
                </span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                {language === 'ku' && 'هەموو ئەو سەرچاوانەی بە خۆڕایی دادەنرێن دەچنە ڕیزبەندی گشتی بەشەکەت لە کەمپ تاوەکو پێگەی هاوکاری زانکۆکەت بەرز بکەنەوە.'}
                {language === 'en' && 'All free study donations directly raise your department ranking and provide accredited credit to university student unions.'}
                {language === 'ar' && 'كل إهداء مجاني يرفع تصنيف كليتك في لائحة الشرف الجامعية ويعزز التكافل بين طلبة الجامعات.'}
              </p>
            </div>
          </div>
        </div>

        {/* Motivational Call-to-Action Bar */}
        <div className="rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md border border-indigo-700/40">
          <div className="space-y-2 max-w-2xl text-center md:text-start">
            <h3 className="text-xl sm:text-2xl font-black text-white">
              {copy.cta.title}
            </h3>
            <p className="text-xs sm:text-sm text-indigo-200 leading-relaxed font-normal">
              {copy.cta.desc}
            </p>
          </div>

          <button
            onClick={onOpenCreateModal}
            className="px-6 py-3 bg-white hover:bg-indigo-50 active:bg-indigo-100 text-indigo-900 font-black text-sm rounded-2xl shadow-lg transition-all cursor-pointer shrink-0"
          >
            {copy.cta.button}
          </button>
        </div>

      </div>
    </section>
  );
}
