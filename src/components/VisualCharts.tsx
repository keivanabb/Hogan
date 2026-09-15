import React, { useState, useMemo } from 'react';
import {
  Radar,
  BarChart3,
  GitCompare,
  AlertTriangle,
  CheckCircle2,
  Info,
  TrendingUp,
  TrendingDown,
  Layers,
  Sparkles,
  ShieldAlert,
  Brain,
  Award,
  Users,
  Target,
  ChevronRight,
  Filter
} from 'lucide-react';
import { HoganHDS, HoganHPI, SwiftCognitive, AssessmentReport } from '../types/assessment';
import { sampleCaseStudies } from '../data/samplePresets';

export interface VisualChartsProps {
  hpi: HoganHPI;
  hds: HoganHDS;
  swift: SwiftCognitive;
  candidateName?: string;
  targetJobTitle?: string;
  savedReports?: AssessmentReport[];
}

interface RadarAxis {
  key: string;
  label: string;
  enLabel: string;
  val1: number;
  val2?: number;
  benchmark?: number;
  desc: string;
  dangerThreshold?: number; // e.g. 70 for HDS
  higherIsBetter?: boolean;
}

// Convert polar coordinates to Cartesian for regular polygon
function polarToCartesian(cx: number, cy: number, r: number, angleIndex: number, totalAxes: number): [number, number] {
  const angle = (2 * Math.PI * angleIndex) / totalAxes - Math.PI / 2;
  const x = cx + r * Math.cos(angle);
  const y = cy + r * Math.sin(angle);
  return [x, y];
}

// Generate SVG points string
function generatePolygonPoints(
  axes: RadarAxis[],
  getValue: (axis: RadarAxis) => number,
  cx: number,
  cy: number,
  maxR: number
): string {
  return axes
    .map((axis, i) => {
      const val = Math.max(0, Math.min(100, getValue(axis)));
      const r = (val / 100) * maxR;
      const [x, y] = polarToCartesian(cx, cy, r, i, axes.length);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
}

// Reusable SVG Radar Chart Component
interface RadarChartSVGProps {
  axes: RadarAxis[];
  title: string;
  subtitle: string;
  candidate1Name: string;
  candidate2Name?: string;
  hasComparison: boolean;
  showBenchmark: boolean;
  dangerThreshold?: number;
  onSelectAxis?: (axis: RadarAxis) => void;
  selectedKey?: string;
  categoryBadge?: string;
}

const RadarChartSVG: React.FC<RadarChartSVGProps> = ({
  axes,
  title,
  subtitle,
  candidate1Name,
  candidate2Name,
  hasComparison,
  showBenchmark,
  dangerThreshold,
  onSelectAxis,
  selectedKey,
  categoryBadge
}) => {
  const cx = 250;
  const cy = 230;
  const maxR = 140;
  const numAxes = axes.length;

  const rings = [20, 40, 60, 80, 100];

  const poly1 = useMemo(() => {
    return generatePolygonPoints(axes, (a) => a.val1, cx, cy, maxR);
  }, [axes, cx, cy, maxR]);

  const poly2 = useMemo(() => {
    if (!hasComparison) return '';
    return generatePolygonPoints(axes, (a) => a.val2 ?? 50, cx, cy, maxR);
  }, [axes, hasComparison, cx, cy, maxR]);

  const polyBenchmark = useMemo(() => {
    if (!showBenchmark) return '';
    return generatePolygonPoints(axes, (a) => a.benchmark ?? 65, cx, cy, maxR);
  }, [axes, showBenchmark, cx, cy, maxR]);

  // Points for candidate 1 vertices
  const points1 = useMemo(() => {
    return axes.map((axis, i) => {
      const val = Math.max(0, Math.min(100, axis.val1));
      const r = (val / 100) * maxR;
      const [x, y] = polarToCartesian(cx, cy, r, i, numAxes);
      return { axis, x, y, val, isDanger: dangerThreshold ? val >= dangerThreshold : false };
    });
  }, [axes, cx, cy, maxR, numAxes, dangerThreshold]);

  // Points for candidate 2 vertices
  const points2 = useMemo(() => {
    if (!hasComparison) return [];
    return axes.map((axis, i) => {
      const val = Math.max(0, Math.min(100, axis.val2 ?? 50));
      const r = (val / 100) * maxR;
      const [x, y] = polarToCartesian(cx, cy, r, i, numAxes);
      return { axis, x, y, val, isDanger: dangerThreshold ? val >= dangerThreshold : false };
    });
  }, [axes, hasComparison, cx, cy, maxR, numAxes, dangerThreshold]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
      {/* Chart Header */}
      <div className="border-b border-slate-100 pb-3 mb-2 flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-slate-900 text-sm md:text-base flex items-center gap-1.5">
              <Radar className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>{title}</span>
            </h4>
            {categoryBadge && (
              <span className="text-[10px] font-black bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded-full">
                {categoryBadge}
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{subtitle}</p>
        </div>

        {dangerThreshold && (
          <div className="flex items-center gap-1 bg-rose-50 border border-rose-200 text-rose-800 px-2 py-1 rounded-md text-[10px] font-bold shrink-0">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            <span>مرز بحرانی: ۷۰٪+</span>
          </div>
        )}
      </div>

      {/* SVG Container */}
      <div className="relative w-full flex items-center justify-center overflow-hidden py-1">
        <svg
          viewBox="0 0 500 460"
          className="w-full max-w-[460px] h-auto select-none"
          style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.02))' }}
        >
          <defs>
            {/* Candidate 1 Gradient */}
            <radialGradient id="candidate1Grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#4338ca" stopOpacity="0.15" />
            </radialGradient>

            {/* Candidate 2 Gradient */}
            <radialGradient id="candidate2Grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#b45309" stopOpacity="0.15" />
            </radialGradient>

            {/* Danger Zone Radial Pattern */}
            <radialGradient id="dangerZoneGrad" cx="50%" cy="50%" r="50%">
              <stop offset="65%" stopColor="#fee2e2" stopOpacity="0" />
              <stop offset="70%" stopColor="#fca5a5" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.12" />
            </radialGradient>
          </defs>

          {/* Danger zone perimeter shading if dangerThreshold is set */}
          {dangerThreshold && (
            <circle
              cx={cx}
              cy={cy}
              r={maxR}
              fill="url(#dangerZoneGrad)"
              className="pointer-events-none"
            />
          )}

          {/* Concentric Guide Rings */}
          {rings.map((pct) => {
            const ringR = (pct / 100) * maxR;
            const ringPoints = Array.from({ length: numAxes })
              .map((_, i) => {
                const [x, y] = polarToCartesian(cx, cy, ringR, i, numAxes);
                return `${x.toFixed(1)},${y.toFixed(1)}`;
              })
              .join(' ');

            const isDangerRing = dangerThreshold && pct === 70;

            return (
              <g key={pct}>
                <polygon
                  points={ringPoints}
                  fill={pct === 100 ? '#f8fafc' : 'none'}
                  stroke={isDangerRing ? '#ef4444' : '#e2e8f0'}
                  strokeWidth={isDangerRing ? '1.5' : '1'}
                  strokeDasharray={isDangerRing ? '4 3' : 'none'}
                  opacity={isDangerRing ? 0.9 : 0.8}
                />
                {/* Ring Scale Number Label */}
                <text
                  x={cx + 4}
                  y={cy - ringR - 2}
                  fontSize="9"
                  fill={isDangerRing ? '#dc2626' : '#94a3b8'}
                  fontWeight={isDangerRing ? 'bold' : 'normal'}
                  textAnchor="start"
                >
                  {pct}%
                </text>
              </g>
            );
          })}

          {/* Radial Spokes / Axes */}
          {axes.map((axis, i) => {
            const [x, y] = polarToCartesian(cx, cy, maxR, i, numAxes);
            const isSelected = selectedKey === axis.key;
            return (
              <line
                key={axis.key}
                x1={cx}
                y1={cy}
                x2={x}
                y2={y}
                stroke={isSelected ? '#4f46e5' : '#cbd5e1'}
                strokeWidth={isSelected ? '2' : '1'}
                strokeDasharray="2 2"
              />
            );
          })}

          {/* Target Benchmark Polygon (if toggled) */}
          {showBenchmark && polyBenchmark && (
            <polygon
              points={polyBenchmark}
              fill="none"
              stroke="#10b981"
              strokeWidth="2"
              strokeDasharray="4 3"
              opacity="0.85"
            />
          )}

          {/* Candidate 2 Polygon (if comparison active) */}
          {hasComparison && poly2 && (
            <polygon
              points={poly2}
              fill="url(#candidate2Grad)"
              stroke="#d97706"
              strokeWidth="2.5"
              strokeDasharray="5 3"
              opacity="0.9"
            />
          )}

          {/* Candidate 1 Polygon (Primary Candidate) */}
          <polygon
            points={poly1}
            fill="url(#candidate1Grad)"
            stroke="#4f46e5"
            strokeWidth="2.5"
            opacity="0.95"
          />

          {/* Candidate 2 Vertex Marks (Diamonds) */}
          {hasComparison &&
            points2.map((p, i) => (
              <g key={`p2-${i}`}>
                <rect
                  x={p.x - 3.5}
                  y={p.y - 3.5}
                  width="7"
                  height="7"
                  transform={`rotate(45 ${p.x} ${p.y})`}
                  fill="#d97706"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
              </g>
            ))}

          {/* Candidate 1 Vertex Circles with pulses on Danger Points */}
          {points1.map((p, i) => {
            const isSelected = selectedKey === p.axis.key;
            return (
              <g
                key={`p1-${i}`}
                className="cursor-pointer transition-transform"
                onClick={() => onSelectAxis && onSelectAxis(p.axis)}
              >
                {p.isDanger && (
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="8"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="1.5"
                    opacity="0.8"
                    className="animate-ping"
                  />
                )}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isSelected ? '6' : p.isDanger ? '5' : '4'}
                  fill={p.isDanger ? '#ef4444' : '#4f46e5'}
                  stroke="#ffffff"
                  strokeWidth="2"
                />
              </g>
            );
          })}

          {/* Outer Labels with Value Badges */}
          {axes.map((axis, i) => {
            const labelR = maxR + 26;
            const [lx, ly] = polarToCartesian(cx, cy, labelR, i, numAxes);
            const isSelected = selectedKey === axis.key;
            const isDanger = dangerThreshold ? axis.val1 >= dangerThreshold : false;

            // Smart anchor calculation based on horizontal position
            const cosAngle = Math.cos((2 * Math.PI * i) / numAxes - Math.PI / 2);
            let textAnchor: 'start' | 'middle' | 'end' = 'middle';
            if (cosAngle > 0.3) textAnchor = 'start';
            else if (cosAngle < -0.3) textAnchor = 'end';

            const score1 = axis.val1;
            const score2 = axis.val2;

            return (
              <g
                key={`label-${axis.key}`}
                className="cursor-pointer group"
                onClick={() => onSelectAxis && onSelectAxis(axis)}
              >
                {/* Main Label */}
                <text
                  x={lx}
                  y={ly}
                  textAnchor={textAnchor}
                  fontSize="11"
                  fontFamily="Vazirmatn, sans-serif"
                  fontWeight={isSelected || isDanger ? 'bold' : '500'}
                  fill={isDanger ? '#dc2626' : isSelected ? '#1e1b4b' : '#334155'}
                >
                  {axis.label}
                </text>

                {/* English sub-label & values */}
                <text
                  x={lx}
                  y={ly + 13}
                  textAnchor={textAnchor}
                  fontSize="9.5"
                  fontFamily="sans-serif"
                  fill="#64748b"
                >
                  <tspan
                    fontWeight="bold"
                    fill={isDanger ? '#dc2626' : '#4f46e5'}
                  >
                    {score1}%
                  </tspan>
                  {hasComparison && score2 !== undefined && (
                    <tspan fill="#d97706" fontWeight="bold">
                      {' '}vs {score2}%
                    </tspan>
                  )}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend Footer */}
      <div className="border-t border-slate-100 pt-2.5 mt-1 flex flex-wrap items-center justify-between gap-2 text-[11px]">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-indigo-600 border border-white shadow-xs"></span>
            <span className="font-semibold text-slate-800">{candidate1Name}</span>
          </div>

          {hasComparison && candidate2Name && (
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-amber-500 border border-white shadow-xs"></span>
              <span className="font-semibold text-amber-900">{candidate2Name}</span>
            </div>
          )}

          {showBenchmark && (
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 border-b-2 border-dashed border-emerald-500"></span>
              <span className="text-emerald-700 font-medium">بنچمارک مطلوب</span>
            </div>
          )}
        </div>

        <span className="text-slate-400 text-[10px]">روی هر بعد جهت مشاهده جزئیات کلیک کنید</span>
      </div>
    </div>
  );
};

export const VisualCharts: React.FC<VisualChartsProps> = ({
  hpi,
  hds,
  swift,
  candidateName = 'کاندیدای ارشد (کد C-101)',
  targetJobTitle = 'مدیر ارشد پروژه‌های استراتژیک تلکام',
  savedReports = []
}) => {
  // Active View Tab inside charts
  const [chartViewMode, setChartViewMode] = useState<'radars' | 'infographics' | 'headToHead'>('radars');

  // Selected comparison candidate
  // Default to second sample preset if available, else benchmark
  const [comparisonTargetId, setComparisonTargetId] = useState<string>('telecom-core-ops-director');
  const [showBenchmarkLine, setShowBenchmarkLine] = useState<boolean>(true);

  // Selected axis for deep-dive detail inspector card
  const [selectedAxisDetail, setSelectedAxisDetail] = useState<RadarAxis | null>(null);

  // All selectable comparison candidates
  const allComparisonOptions = useMemo(() => {
    const list: Array<{
      id: string;
      name: string;
      role: string;
      hpi: HoganHPI;
      hds: HoganHDS;
      swift: SwiftCognitive;
      isBenchmark?: boolean;
    }> = [];

    // Add benchmark option
    list.push({
      id: 'ideal-job-benchmark',
      name: 'بنچمارک ایده‌آل شغل (Ideal Telecom Benchmark)',
      role: targetJobTitle,
      hpi: {
        adjustment: 72,
        ambition: 75,
        sociability: 60,
        interpersonalSensitivity: 68,
        prudence: 65,
        inquisitive: 80,
        learningApproach: 80
      },
      hds: {
        excitable: 35,
        skeptical: 35,
        cautious: 38,
        reserved: 35,
        leisurely: 30,
        bold: 55,
        mischievous: 25,
        colorful: 45,
        imaginative: 40,
        diligent: 50,
        dutiful: 45
      },
      swift: {
        verbalReasoning: 75,
        numericalReasoning: 85,
        abstractReasoning: 82,
        overallPercentile: 84,
        speedVsAccuracy: 'متعادل'
      },
      isBenchmark: true
    });

    // Add sample presets
    sampleCaseStudies.forEach((cs) => {
      list.push({
        id: cs.id,
        name: cs.resume.fullName,
        role: cs.jd.jobTitle,
        hpi: cs.hpi,
        hds: cs.hds,
        swift: cs.swift
      });
    });

    // Add saved reports from pipeline
    savedReports.forEach((sr) => {
      if (!list.some((item) => item.id === sr.id)) {
        list.push({
          id: sr.id,
          name: sr.candidateName,
          role: sr.targetJobTitle,
          hpi: sr.hpi,
          hds: sr.hds,
          swift: sr.swift
        });
      }
    });

    return list;
  }, [targetJobTitle, savedReports]);

  // Selected comparison profile
  const activeComparisonCandidate = useMemo(() => {
    if (comparisonTargetId === 'none') return null;
    return allComparisonOptions.find((c) => c.id === comparisonTargetId) || null;
  }, [comparisonTargetId, allComparisonOptions]);

  // 1. HDS Radar Axes (11 Dark Side Derailers)
  const hdsRadarAxes: RadarAxis[] = useMemo(() => {
    const list = [
      { key: 'excitable', label: 'هیجان‌پذیری', enLabel: 'Excitable', val1: hds.excitable, desc: 'انفجار خلقی، بی‌صبری و سرخوردگی در شرایط فشار و بحران' },
      { key: 'skeptical', label: 'بدگمانی', enLabel: 'Skeptical', val1: hds.skeptical, desc: 'سوءظن مزمن به نیت همکاران، توهم توطئه و اصطکاک بین‌معاونتی' },
      { key: 'cautious', label: 'احتیاط افراطی', enLabel: 'Cautious', val1: hds.cautious, desc: 'ترس شدید از شکست، فلج تحلیلی و به تعویق انداختن تصمیمات بحرانی' },
      { key: 'reserved', label: 'انزواطلبی', enLabel: 'Reserved', val1: hds.reserved, desc: 'عقب‌نشینی، سکوت و قطع ارتباط با تیم و رده‌های بالا در بحران' },
      { key: 'leisurely', label: 'مقاومت منفی', enLabel: 'Leisurely', val1: hds.leisurely, desc: 'لجاجت پنهان، تاخیر عامدانه و تظاهر به موافقت بدون اجرا' },
      { key: 'bold', label: 'تکبر و خودشیفتگی', enLabel: 'Bold', val1: hds.bold, desc: 'توهم خطاناپذیری، عدم پذیرش انتقاد و ریسک‌پذیری بی‌پروایانه' },
      { key: 'mischievous', label: 'ریسک ناسالم', enLabel: 'Mischievous', val1: hds.mischievous, desc: 'قانون‌گریزی، دور زدن رویه‌های ایمنی و تعهدات غیرواقعی' },
      { key: 'colorful', label: 'نمایشگری', enLabel: 'Colorful', val1: hds.colorful, desc: 'جلب توجه سطحی در جلسات، هایپ پروژه‌ها و حواس‌پرتی عملیاتی' },
      { key: 'imaginative', label: 'خیال‌پردازی', enLabel: 'Imaginative', val1: hds.imaginative, desc: 'ارائه طرح‌های دور از ذهن و نادیده گرفتن محدودیت‌های فنی' },
      { key: 'diligent', label: 'وسواس و ریزمدیریتی', enLabel: 'Diligent', val1: hds.diligent, desc: 'میکرومنیجمنت شدید، ناتوانی در تفویض اختیار و خستگی تیم' },
      { key: 'dutiful', label: 'فرمان‌برداری کورکورانه', enLabel: 'Dutiful', val1: hds.dutiful, desc: 'ناتوانی در نه گفتن به مدیران ارشد و فدا کردن ظرفیت تیم' }
    ];

    return list.map((item) => ({
      ...item,
      val2: activeComparisonCandidate?.hds[item.key as keyof HoganHDS],
      benchmark: 35,
      dangerThreshold: 70,
      higherIsBetter: false
    }));
  }, [hds, activeComparisonCandidate]);

  // 2. HPI Radar Axes (7 Bright Side Traits)
  const hpiRadarAxes: RadarAxis[] = useMemo(() => {
    const list = [
      { key: 'adjustment', label: 'تطبیق‌پذیری', enLabel: 'Adjustment', val1: hpi.adjustment, benchmark: 70, desc: 'خونسردی، مدیریت استرس و عدم بروز اضطراب در تعاملات' },
      { key: 'ambition', label: 'جاه‌طلبی', enLabel: 'Ambition', val1: hpi.ambition, benchmark: 75, desc: 'انگیزه هدایت تیم، رقابت‌پذیری و پذیرش مسئولیت لیدری' },
      { key: 'sociability', label: 'جامعه‌پذیری', enLabel: 'Sociability', val1: hpi.sociability, benchmark: 60, desc: 'برقراری ارتباطات شبکه‌ای و حضور فعال در گردهمایی‌ها' },
      { key: 'interpersonalSensitivity', label: 'حساسیت بین‌فردی', enLabel: 'Sensitivity', val1: hpi.interpersonalSensitivity, benchmark: 70, desc: 'همدلی، درک احساسات دیگران و مهارت‌های دیپلماتیک' },
      { key: 'prudence', label: 'احتیاط و وجدان', enLabel: 'Prudence', val1: hpi.prudence, benchmark: 65, desc: 'سازمان‌یافتگی، انضباط کاری و پایبندی به استانداردها' },
      { key: 'inquisitive', label: 'کنجکاوی فکری', enLabel: 'Inquisitive', val1: hpi.inquisitive, benchmark: 80, desc: 'تفکر استراتژیک کلان، خلاقیت و نگاه پیشرو به فناوری' },
      { key: 'learningApproach', label: 'رویکرد یادگیری', enLabel: 'Learning', val1: hpi.learningApproach, benchmark: 80, desc: 'اشتیاق به یادگیری دانش تخصصی و به‌روز نگه‌داشتن داده‌ها' }
    ];

    return list.map((item) => ({
      ...item,
      val2: activeComparisonCandidate?.hpi[item.key as keyof HoganHPI],
      higherIsBetter: true
    }));
  }, [hpi, activeComparisonCandidate]);

  // 3. Swift Cognitive Radar Axes (4 Aptitude Scales)
  const swiftRadarAxes: RadarAxis[] = useMemo(() => {
    const list = [
      { key: 'verbalReasoning', label: 'استدلال کلامی', enLabel: 'Verbal', val1: swift.verbalReasoning, benchmark: 75, desc: 'درک متون استراتژیک، اقناع منطقی در مذاکرات تجاری و گزارش‌نویسی' },
      { key: 'numericalReasoning', label: 'استدلال محاسباتی', enLabel: 'Numerical', val1: swift.numericalReasoning, benchmark: 85, desc: 'تحلیل شاخص‌های ترافیک شبکه، بودجه مالی و سنجه‌های SLA' },
      { key: 'abstractReasoning', label: 'استدلال انتزاعی', enLabel: 'Abstract', val1: swift.abstractReasoning, benchmark: 80, desc: 'کشف الگو در معماری‌های نوین، حل مسائل پیچیده مفهومی و سناریوسازی' },
      { key: 'overallPercentile', label: 'صدک هوش کل', enLabel: 'Cognitive Index', val1: swift.overallPercentile, benchmark: 82, desc: 'ظرفیت پردازش ذهنی کل در میان جمعیت استاندارد مدیران' }
    ];

    return list.map((item) => ({
      ...item,
      val2: activeComparisonCandidate?.swift[item.key as keyof SwiftCognitive] as number | undefined,
      higherIsBetter: true
    }));
  }, [swift, activeComparisonCandidate]);

  // 4. Holistic Strategic 5-Pillar Radar (Composite Strategic Match)
  const holisticRadarAxes: RadarAxis[] = useMemo(() => {
    const calcPillars = (pHpi: HoganHPI, pHds: HoganHDS, pSwift: SwiftCognitive) => {
      // Cognitive
      const cog = Math.round((pSwift.verbalReasoning * 1.2 + pSwift.numericalReasoning * 1.5 + pSwift.abstractReasoning * 1.3) / 4);
      // Derailer resilience: 100 minus weighted critical derailers
      const critHds = (pHds.excitable + pHds.skeptical + pHds.cautious + pHds.reserved + pHds.diligent) / 5;
      const res = Math.max(10, Math.min(100, Math.round(100 - critHds * 0.82)));
      // Leadership & Drive
      const lead = Math.round((pHpi.ambition * 1.7 + pHpi.adjustment + (pHds.bold > 20 && pHds.bold < 75 ? pHds.bold : 35)) / 3.7);
      // Diplomacy & Alignment
      const dip = Math.round((pHpi.interpersonalSensitivity * 1.6 + pHpi.sociability + (100 - pHds.skeptical)) / 3.6);
      // Process & SLA Discipline
      const proc = Math.round((pHpi.prudence * 1.6 + pHpi.learningApproach + (100 - pHds.mischievous)) / 3.6);

      return { cog, res, lead, dip, proc };
    };

    const c1 = calcPillars(hpi, hds, swift);
    const c2 = activeComparisonCandidate
      ? calcPillars(activeComparisonCandidate.hpi, activeComparisonCandidate.hds, activeComparisonCandidate.swift)
      : null;

    return [
      {
        key: 'cog',
        label: 'هوش تحلیلی و حل مسئله',
        enLabel: 'Analytical & Problem Solving',
        val1: c1.cog,
        val2: c2 ? c2.cog : undefined,
        benchmark: 82,
        desc: 'ظرفیت شناختی حل معماهای فنی و مدل‌سازی چالش‌های استراتژیک',
        higherIsBetter: true
      },
      {
        key: 'res',
        label: 'تاب‌آوری در بحران و ایمنی روانی',
        enLabel: 'Crisis Resilience & Mental Safety',
        val1: c1.res,
        val2: c2 ? c2.res : undefined,
        benchmark: 75,
        desc: 'عدم فروپاشی عصبی، دوری از قهر سازمانی و مهار رفتارهای مخرب در اوج فشار SLA',
        higherIsBetter: true
      },
      {
        key: 'lead',
        label: 'جسارت رهبری و پیشبرد تیم',
        enLabel: 'Strategic Leadership & Drive',
        val1: c1.lead,
        val2: c2 ? c2.lead : undefined,
        benchmark: 75,
        desc: 'جاه‌طلبی سازنده، انگیزه هدایت افراد و پذیرش ریسک‌های حساب‌شده مدیریتی',
        higherIsBetter: true
      },
      {
        key: 'dip',
        label: 'دیپلماسی و هماهنگی بین‌معاونتی',
        enLabel: 'Cross-Unit Diplomacy',
        val1: c1.dip,
        val2: c2 ? c2.dip : undefined,
        benchmark: 70,
        desc: 'ایجاد اعتماد متقابل با واحدهای دیگر (مالی، بازاریابی، رگولاتوری) و پرهیز از بدگمانی',
        higherIsBetter: true
      },
      {
        key: 'proc',
        label: 'انضباط فرآیندی و پایداری SLA',
        enLabel: 'Process & SLA Reliability',
        val1: c1.proc,
        val2: c2 ? c2.proc : undefined,
        benchmark: 72,
        desc: 'پایبندی به آیین‌نامه‌ها، نظم اسنادی و وفاداری به تعهدات کیفیت سرویس',
        higherIsBetter: true
      }
    ];
  }, [hpi, hds, swift, activeComparisonCandidate]);

  // Dangerous derailers count (>70)
  const dangerDerailersCount1 = useMemo(() => {
    return (Object.values(hds) as number[]).filter((v) => v >= 70).length;
  }, [hds]);

  const dangerDerailersCount2 = useMemo(() => {
    if (!activeComparisonCandidate) return 0;
    return (Object.values(activeComparisonCandidate.hds) as number[]).filter((v) => v >= 70).length;
  }, [activeComparisonCandidate]);

  return (
    <div className="space-y-6" id="visual-infographics-radar-hub">
      {/* Top Banner & Multi-Candidate Comparison Control Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                <Radar className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base md:text-lg font-black text-slate-900 flex items-center gap-2">
                  <span>نمودارهای اینفوگرافیک و راداری سنجش روان‌سنجی (Psychometric Radars)</span>
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                    چندبعدی و مقایسه‌ای
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  تحلیل دیداری ۳۶۰ درجه برای تشخیص فوری نقاط قوت، دارک‌سایدهای بحرانی و مقایسه سر‌به‌سر در یک نگاه.
                </p>
              </div>
            </div>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl self-start lg:self-center border border-slate-200/60">
            <button
              type="button"
              onClick={() => setChartViewMode('radars')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                chartViewMode === 'radars'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Radar className="w-3.5 h-3.5" />
              <span>نمای راداری ۳۶۰°</span>
            </button>

            <button
              type="button"
              onClick={() => setChartViewMode('infographics')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                chartViewMode === 'infographics'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>کارت‌های تحلیلی</span>
            </button>

            <button
              type="button"
              onClick={() => setChartViewMode('headToHead')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                chartViewMode === 'headToHead'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>مقایسه در یک نگاه</span>
            </button>
          </div>
        </div>

        {/* Comparison Selector Console */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70 p-3.5 rounded-xl border">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-indigo-600" />
              <span>مقایسه همزمان با:</span>
            </span>

            <select
              value={comparisonTargetId}
              onChange={(e) => setComparisonTargetId(e.target.value)}
              className="bg-white border border-slate-300 text-slate-800 text-xs rounded-lg px-3 py-1.5 font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
            >
              <option value="none">بدون مقایسه (فقط کاندیدای جاری)</option>
              <option value="ideal-job-benchmark">🎯 بنچمارک ایده‌آل سازمان و صنعت</option>
              <optgroup label="کاندیداهای پایپ‌لاین و پرونده‌ها">
                {allComparisonOptions
                  .filter((c) => !c.isBenchmark)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      👤 {c.name} — {c.role}
                    </option>
                  ))}
              </optgroup>
            </select>

            <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer select-none mr-2">
              <input
                type="checkbox"
                checked={showBenchmarkLine}
                onChange={(e) => setShowBenchmarkLine(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <span className="text-[11px] font-medium text-emerald-800">نمایش خط بنچمارک مطلوب</span>
            </label>
          </div>

          {/* Quick Indicator Badges */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 text-indigo-900 px-2.5 py-1 rounded-lg font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
              <span>کاندیدای اصلی: {candidateName}</span>
            </span>

            {activeComparisonCandidate && (
              <span className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-900 px-2.5 py-1 rounded-lg font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span>مقایسه با: {activeComparisonCandidate.name}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* VIEW 1: RADAR CHARTS (Dedicated Radar for Every Aspect) */}
      {chartViewMode === 'radars' && (
        <div className="space-y-6">
          {/* 2x2 Grid of Dedicated Radar Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Radar 1: Hogan HDS Dark Side */}
            <RadarChartSVG
              axes={hdsRadarAxes}
              title="رادار دارک‌سایدهای بحران (Hogan HDS - The Dark Side)"
              subtitle="۱۱ بعد رفتارهای مخرب سازمانی در زمان خستگی مفرط، استرس و بحران‌های عملیاتی"
              candidate1Name={candidateName}
              candidate2Name={activeComparisonCandidate?.name}
              hasComparison={Boolean(activeComparisonCandidate)}
              showBenchmark={showBenchmarkLine}
              dangerThreshold={70}
              categoryBadge="۱۱ بعد شخصیتی"
              selectedKey={selectedAxisDetail?.key}
              onSelectAxis={(axis) => setSelectedAxisDetail(axis)}
            />

            {/* Radar 2: Hogan HPI Bright Side */}
            <RadarChartSVG
              axes={hpiRadarAxes}
              title="رادار ویژگی‌های عملکرد پایه (Hogan HPI - The Bright Side)"
              subtitle="۷ مقیاس انگیزش، دیپلماسی، جاه‌طلبی و انضباط در شرایط باثبات کاری"
              candidate1Name={candidateName}
              candidate2Name={activeComparisonCandidate?.name}
              hasComparison={Boolean(activeComparisonCandidate)}
              showBenchmark={showBenchmarkLine}
              categoryBadge="۷ بعد رفتاری"
              selectedKey={selectedAxisDetail?.key}
              onSelectAxis={(axis) => setSelectedAxisDetail(axis)}
            />

            {/* Radar 3: Swift Cognitive Aptitude */}
            <RadarChartSVG
              axes={swiftRadarAxes}
              title="رادار هوش و استعداد شناختی (Swift Cognitive Aptitude)"
              subtitle="توانمندی استدلال کلامی، محاسباتی، انتزاعی و شاخص پردازش ذهنی"
              candidate1Name={candidateName}
              candidate2Name={activeComparisonCandidate?.name}
              hasComparison={Boolean(activeComparisonCandidate)}
              showBenchmark={showBenchmarkLine}
              categoryBadge="۴ بعد شناختی"
              selectedKey={selectedAxisDetail?.key}
              onSelectAxis={(axis) => setSelectedAxisDetail(axis)}
            />

            {/* Radar 4: Composite Holistic Fit */}
            <RadarChartSVG
              axes={holisticRadarAxes}
              title="رادار جامع انطباق استراتژیک شغلی (Holistic 5-Pillar Fit)"
              subtitle="تلفیق ۵ رکن حیاتی موفقیت شغلی، پایداری در بحران و فرماندهی سازمانی"
              candidate1Name={candidateName}
              candidate2Name={activeComparisonCandidate?.name}
              hasComparison={Boolean(activeComparisonCandidate)}
              showBenchmark={showBenchmarkLine}
              categoryBadge="۵ رکن استراتژیک"
              selectedKey={selectedAxisDetail?.key}
              onSelectAxis={(axis) => setSelectedAxisDetail(axis)}
            />
          </div>

          {/* Interactive Trait Inspector Card (when an axis is clicked) */}
          {selectedAxisDetail && (
            <div className="bg-indigo-50/70 border-2 border-indigo-200 rounded-2xl p-5 shadow-sm animate-fadeIn">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-indigo-100">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span className="font-black text-indigo-950 text-sm">
                    تحلیل تفصیلی بعد انتخابی: {selectedAxisDetail.label} ({selectedAxisDetail.enLabel})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedAxisDetail(null)}
                  className="text-xs text-indigo-700 hover:text-indigo-900 bg-white px-2 py-0.5 rounded border border-indigo-200 cursor-pointer"
                >
                  بستن
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3 text-xs">
                <div className="bg-white p-3.5 rounded-xl border border-indigo-100">
                  <span className="font-bold text-slate-500 block mb-1">نمره کاندیدای اصلی ({candidateName}):</span>
                  <div className="text-2xl font-black text-indigo-700">
                    {selectedAxisDetail.val1}٪
                  </div>
                  <span className="text-[11px] text-slate-500">
                    {selectedAxisDetail.dangerThreshold && selectedAxisDetail.val1 >= selectedAxisDetail.dangerThreshold
                      ? '⚠️ در محدوده پرخطر و بحرانی'
                      : 'وضعیت در محدوده قابل مدیریت'}
                  </span>
                </div>

                {activeComparisonCandidate && selectedAxisDetail.val2 !== undefined && (
                  <div className="bg-white p-3.5 rounded-xl border border-indigo-100">
                    <span className="font-bold text-slate-500 block mb-1">
                      نمره کاندیدای مقایسه‌ای ({activeComparisonCandidate.name}):
                    </span>
                    <div className="text-2xl font-black text-amber-600">
                      {selectedAxisDetail.val2}٪
                    </div>
                    <span className="text-[11px] text-slate-500">
                      اختلاف با کاندیدای اصلی:{' '}
                      <strong className={selectedAxisDetail.val1 > selectedAxisDetail.val2 ? 'text-indigo-600' : 'text-amber-600'}>
                        {Math.abs(selectedAxisDetail.val1 - selectedAxisDetail.val2)}٪
                      </strong>
                    </span>
                  </div>
                )}

                <div className="bg-white p-3.5 rounded-xl border border-indigo-100 md:col-span-1">
                  <span className="font-bold text-slate-500 block mb-1">اثر رفتاری در محیط تلکام:</span>
                  <p className="text-slate-700 leading-relaxed">{selectedAxisDetail.desc}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: DETAILED INFOGRAPHIC GAUGES & BARS */}
      {chartViewMode === 'infographics' && (
        <div className="space-y-6">
          {/* HDS Derailer Zone with Infographic Bars */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-100">
              <div>
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-600 animate-pulse"></span>
                  طیف رفتارهای مخرب و کُشنده (Hogan HDS - The Dark Side Derailers)
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  نمرات بالاتر از ۷۰٪ ریسک‌های حاد کاندیدا در شرایط خستگی، تعارض بین‌واحدی و استرس SLA هستند.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="bg-rose-50 border border-rose-200 text-rose-800 px-3 py-1 rounded-lg font-bold">
                  {dangerDerailersCount1} صفت بحرانی شناسایی شد
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {hdsRadarAxes.map((item) => {
                const isDanger = item.val1 >= 70;
                const isModerate = item.val1 >= 35 && item.val1 < 70;
                const barColor = isDanger ? 'bg-rose-600' : isModerate ? 'bg-amber-500' : 'bg-emerald-500';

                return (
                  <div
                    key={item.key}
                    className={`p-4 rounded-xl border transition-all ${
                      isDanger
                        ? 'bg-rose-50/40 border-rose-200 ring-1 ring-rose-200'
                        : 'bg-slate-50/70 border-slate-200'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-sm text-slate-800">{item.label}</span>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-xs font-black px-2 py-0.5 rounded-md ${
                            isDanger
                              ? 'bg-rose-100 text-rose-800'
                              : isModerate
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {item.val1}٪ {isDanger && '⚠️'}
                        </span>
                        {item.val2 !== undefined && (
                          <span className="text-[11px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 font-bold">
                            مقایسه: {item.val2}٪
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500 mb-2.5">{item.desc}</p>

                    {/* Progress Track */}
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden relative">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                        style={{ width: `${item.val1}%` }}
                      ></div>
                      {/* Critical Threshold Indicator Line at 70% */}
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-rose-900/60 z-10"
                        style={{ left: '70%' }}
                        title="مرز بحرانی ۷۰٪"
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Swift Cognitive Profile Infographic */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <div className="pb-4 mb-4 border-b border-slate-100">
              <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Brain className="w-4 h-4 text-indigo-600" />
                پروفایل شناختی و سرعت پردازش ذهنی (Swift Cognitive Aptitude Profile)
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                سنجش ظرفیت استدلال کلامی، حل مسئله محاسباتی و کشف الگو در تصمیم‌گیری‌های کلان.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-4 text-center">
                <div className="text-xs text-slate-600 mb-1">استدلال کلامی (Verbal)</div>
                <div className="text-3xl font-black text-indigo-700">{swift.verbalReasoning}٪</div>
                <div className="text-[11px] text-slate-500 mt-1">اقناع در مذاکرات و درک متون</div>
                <div className="w-full bg-indigo-200/60 h-2 rounded-full mt-3 overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${swift.verbalReasoning}%` }}></div>
                </div>
              </div>

              <div className="bg-cyan-50/60 border border-cyan-100 rounded-xl p-4 text-center">
                <div className="text-xs text-slate-600 mb-1">استدلال محاسباتی (Numerical)</div>
                <div className="text-3xl font-black text-cyan-700">{swift.numericalReasoning}٪</div>
                <div className="text-[11px] text-slate-500 mt-1">تحلیل شاخص‌های شبکه، بودجه و SLA</div>
                <div className="w-full bg-cyan-200/60 h-2 rounded-full mt-3 overflow-hidden">
                  <div className="bg-cyan-600 h-full rounded-full" style={{ width: `${swift.numericalReasoning}%` }}></div>
                </div>
              </div>

              <div className="bg-purple-50/60 border border-purple-100 rounded-xl p-4 text-center">
                <div className="text-xs text-slate-600 mb-1">استدلال انتزاعی (Abstract)</div>
                <div className="text-3xl font-black text-purple-700">{swift.abstractReasoning}٪</div>
                <div className="text-[11px] text-slate-500 mt-1">تشخیص الگو در معماری‌های نوین</div>
                <div className="w-full bg-purple-200/60 h-2 rounded-full mt-3 overflow-hidden">
                  <div className="bg-purple-600 h-full rounded-full" style={{ width: `${swift.abstractReasoning}%` }}></div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
                <div className="text-xs text-slate-600 mb-1">شاخص سرعت و دقت</div>
                <div className="text-base font-bold text-slate-900 mt-1">{swift.speedVsAccuracy}</div>
                <div className="text-xs text-slate-500 mt-2">
                  صدک کل کشوری: <strong className="text-indigo-700">{swift.overallPercentile}٪</strong>
                </div>
              </div>
            </div>
          </div>

          {/* HPI Bright Side Infographic */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <div className="pb-4 mb-4 border-b border-slate-100">
              <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-sky-500"></span>
                بخش روشن شخصیت در شرایط عادی کار (Hogan HPI - The Bright Side)
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                سبک تعاملی، انگیزش پیشرفت و وجدان کاری در شرایط پایدار بدون بحران.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {hpiRadarAxes.map((item) => (
                <div key={item.key} className="bg-slate-50/70 border border-slate-200 p-4 rounded-xl">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-sm text-slate-800">{item.label}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded-full">
                        {item.val1}٪
                      </span>
                      {item.val2 !== undefined && (
                        <span className="text-[11px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 font-bold">
                          مقایسه: {item.val2}٪
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-2">{item.desc}</p>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-sky-600 rounded-full" style={{ width: `${item.val1}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: HEAD-TO-HEAD COMPARISON MATRIX (Single-Glance Multi-Candidate Decision) */}
      {chartViewMode === 'headToHead' && (
        <div className="space-y-6">
          {!activeComparisonCandidate ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center space-y-3">
              <Users className="w-10 h-10 text-slate-400 mx-auto" />
              <h4 className="text-base font-bold text-slate-800">کاندیدای دوم جهت مقایسه انتخاب نشده است</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                از منوی بالای صفحه یک کاندیدای دیگر یا بنچمارک شغلی را انتخاب کنید تا ماتریس مقایسه سر‌به‌سر فوراً فعال گردد.
              </p>
              <button
                type="button"
                onClick={() => setComparisonTargetId('telecom-core-ops-director')}
                className="bg-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-indigo-700 transition cursor-pointer inline-flex items-center gap-1.5"
              >
                <GitCompare className="w-3.5 h-3.5" />
                <span>مقایسه با علیرضا رادمهر (مدیر عملیات Core)</span>
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Top Decision Summary Cards (At a Single Glance) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Candidate 1 Summary Card */}
                <div className="bg-indigo-50/50 border-2 border-indigo-200 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 rounded-full bg-indigo-600"></span>
                      <h4 className="font-black text-indigo-950 text-base">{candidateName}</h4>
                    </div>
                    <span className="text-xs font-bold bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-md">
                      کاندیدای اصلی
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white p-2.5 rounded-lg border border-indigo-100">
                      <span className="text-[11px] text-slate-500 block">هوش شناختی (Swift):</span>
                      <span className="text-lg font-black text-indigo-700">{swift.overallPercentile}٪</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-indigo-100">
                      <span className="text-[11px] text-slate-500 block">دارک‌سایدهای خطرناک:</span>
                      <span className="text-lg font-black text-rose-600">{dangerDerailersCount1} صفت</span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-700 space-y-1 bg-white p-3 rounded-xl border border-indigo-100">
                    <strong className="text-indigo-900 block font-bold">نقاط قوت برجسته در مقایسه:</strong>
                    <ul className="list-disc list-inside text-slate-600 space-y-0.5 text-[11px]">
                      {swift.numericalReasoning > (activeComparisonCandidate?.swift.numericalReasoning || 0) && (
                        <li>استدلال محاسباتی برتر ({swift.numericalReasoning}٪ در برابر {activeComparisonCandidate?.swift.numericalReasoning}٪)</li>
                      )}
                      {hpi.inquisitive > (activeComparisonCandidate?.hpi.inquisitive || 0) && (
                        <li>کنجکاوی استراتژیک و تفکر کلان بالاتر ({hpi.inquisitive}٪ در برابر {activeComparisonCandidate?.hpi.inquisitive}٪)</li>
                      )}
                      {hpi.adjustment > (activeComparisonCandidate?.hpi.adjustment || 0) && (
                        <li>خونسردی ظاهری در تعاملات روزمره ({hpi.adjustment}٪ در برابر {activeComparisonCandidate?.hpi.adjustment}٪)</li>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Candidate 2 Summary Card */}
                <div className="bg-amber-50/50 border-2 border-amber-200 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 rounded-full bg-amber-500"></span>
                      <h4 className="font-black text-amber-950 text-base">{activeComparisonCandidate.name}</h4>
                    </div>
                    <span className="text-xs font-bold bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-md">
                      کاندیدای مقایسه‌ای
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white p-2.5 rounded-lg border border-amber-100">
                      <span className="text-[11px] text-slate-500 block">هوش شناختی (Swift):</span>
                      <span className="text-lg font-black text-amber-700">
                        {activeComparisonCandidate.swift.overallPercentile}٪
                      </span>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-amber-100">
                      <span className="text-[11px] text-slate-500 block">دارک‌سایدهای خطرناک:</span>
                      <span className="text-lg font-black text-rose-600">{dangerDerailersCount2} صفت</span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-700 space-y-1 bg-white p-3 rounded-xl border border-amber-100">
                    <strong className="text-amber-900 block font-bold">نقاط قوت برجسته در مقایسه:</strong>
                    <ul className="list-disc list-inside text-slate-600 space-y-0.5 text-[11px]">
                      {activeComparisonCandidate.hpi.ambition > hpi.ambition && (
                        <li>جاه‌طلبی و میل به لیدری قوی‌تر ({activeComparisonCandidate.hpi.ambition}٪ در برابر {hpi.ambition}٪)</li>
                      )}
                      {activeComparisonCandidate.hpi.prudence > hpi.prudence && (
                        <li>انضباط اداری و پایبندی به فرآیندها ({activeComparisonCandidate.hpi.prudence}٪ در برابر {hpi.prudence}٪)</li>
                      )}
                      {activeComparisonCandidate.swift.verbalReasoning > swift.verbalReasoning && (
                        <li>استدلال و اقناع کلامی بالاتر ({activeComparisonCandidate.swift.verbalReasoning}٪ در برابر {swift.verbalReasoning}٪)</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Head-to-Head Comparative Table with Bipolar Advantage Indicators */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm md:text-base">
                      جدول مقایسه سر‌به‌سر شاخص‌های روان‌سنجی (Head-to-Head Metric Delta)
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      تشخیص در یک نگاه: رنگ بنفش نشان‌دهنده برتری کاندیدای اول و رنگ نارنجی نشان‌دهنده برتری کاندیدای دوم است.
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-700 border-b border-slate-200">
                        <th className="p-3 font-bold">شاخص روان‌سنجی</th>
                        <th className="p-3 font-bold text-center text-indigo-700">{candidateName}</th>
                        <th className="p-3 font-bold text-center text-amber-700">{activeComparisonCandidate.name}</th>
                        <th className="p-3 font-bold text-center">اختلاف عددی (Delta)</th>
                        <th className="p-3 font-bold">قضاوت برتری در یک نگاه</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {/* Swift Aptitude Rows */}
                      <tr className="bg-slate-50/40 font-bold text-slate-700">
                        <td colSpan={5} className="p-2.5 text-xs text-indigo-900 bg-indigo-50/50">
                          🧠 استعداد و ظرفیت شناختی (Swift Cognitive)
                        </td>
                      </tr>
                      {swiftRadarAxes.map((axis) => {
                        const v1 = axis.val1;
                        const v2 = axis.val2 ?? 50;
                        const delta = v1 - v2;
                        const isC1Winner = delta > 0;
                        const isDraw = delta === 0;

                        return (
                          <tr key={axis.key} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-3 font-semibold text-slate-800">{axis.label}</td>
                            <td className="p-3 text-center font-black text-indigo-700">{v1}٪</td>
                            <td className="p-3 text-center font-black text-amber-700">{v2}٪</td>
                            <td className="p-3 text-center font-bold">
                              <span
                                className={`px-2 py-0.5 rounded text-[11px] ${
                                  isDraw
                                    ? 'bg-slate-100 text-slate-600'
                                    : isC1Winner
                                    ? 'bg-indigo-100 text-indigo-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {delta > 0 ? `+${delta}٪` : `${delta}٪`}
                              </span>
                            </td>
                            <td className="p-3">
                              {isDraw ? (
                                <span className="text-slate-500 font-medium">هم‌تراز</span>
                              ) : isC1Winner ? (
                                <span className="text-indigo-700 font-bold flex items-center gap-1">
                                  <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                                  برتری {candidateName} (+{Math.abs(delta)}٪)
                                </span>
                              ) : (
                                <span className="text-amber-700 font-bold flex items-center gap-1">
                                  <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                                  برتری {activeComparisonCandidate.name} (+{Math.abs(delta)}٪)
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}

                      {/* HDS Derailer Rows */}
                      <tr className="bg-slate-50/40 font-bold text-slate-700">
                        <td colSpan={5} className="p-2.5 text-xs text-rose-900 bg-rose-50/50">
                          ⚠️ دارک‌سایدهای پرخطر هوگان (HDS - نمره کمتر مطلوب‌تر است)
                        </td>
                      </tr>
                      {hdsRadarAxes.slice(0, 6).map((axis) => {
                        const v1 = axis.val1;
                        const v2 = axis.val2 ?? 50;
                        const delta = v1 - v2;
                        // On derailers, LOWER is better!
                        const isC1Safer = v1 < v2;
                        const isDraw = v1 === v2;

                        return (
                          <tr key={axis.key} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-3 font-semibold text-slate-800">{axis.label}</td>
                            <td
                              className={`p-3 text-center font-black ${
                                v1 >= 70 ? 'text-rose-700 bg-rose-50/50' : 'text-slate-700'
                              }`}
                            >
                              {v1}٪ {v1 >= 70 && '⚠️'}
                            </td>
                            <td
                              className={`p-3 text-center font-black ${
                                v2 >= 70 ? 'text-rose-700 bg-rose-50/50' : 'text-slate-700'
                              }`}
                            >
                              {v2}٪ {v2 >= 70 && '⚠️'}
                            </td>
                            <td className="p-3 text-center font-bold">
                              <span className="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700">
                                {Math.abs(delta)}٪ فاصله
                              </span>
                            </td>
                            <td className="p-3">
                              {isDraw ? (
                                <span className="text-slate-500 font-medium">سطح ریسک برابر</span>
                              ) : isC1Safer ? (
                                <span className="text-emerald-700 font-bold flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  ریسک کمتر و ایمن‌تر: {candidateName}
                                </span>
                              ) : (
                                <span className="text-amber-700 font-bold flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                                  ریسک کمتر و ایمن‌تر: {activeComparisonCandidate.name}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
