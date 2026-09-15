import React, { useMemo, useRef, useState } from 'react';
import {
  Briefcase,
  Upload,
  ShieldAlert,
  Sparkles,
  Brain,
  Play,
  User,
  ChevronRight,
  ChevronLeft,
  Check,
  Tag,
  Zap,
  FileText,
  Trash2,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import {
  CandidateResume,
  HoganHDS,
  HoganHPI,
  JobDescription,
  SwiftCognitive
} from '../types/assessment';
import {
  JobPosition,
  TeamMember,
  StoredDocument,
  DocumentKind,
  DOCUMENT_KINDS
} from '../types/workspace';
import { parseSwiftExcel, parseWordDocument, parseTextFile } from '../utils/fileParser';
import { formatBytes } from '../utils/documentVault';
import { sampleCaseStudies } from '../data/samplePresets';

export interface NewDocumentPayload {
  kind: DocumentKind;
  fileName: string;
  sizeBytes: number;
  extractedText: string;
  file: File;
  candidateCode: string;
}

interface DocumentIntakeWizardProps {
  position: JobPosition;
  currentMember: TeamMember;
  jd: JobDescription;
  setJd: React.Dispatch<React.SetStateAction<JobDescription>>;
  resume: CandidateResume;
  setResume: React.Dispatch<React.SetStateAction<CandidateResume>>;
  hpi: HoganHPI;
  setHpi: React.Dispatch<React.SetStateAction<HoganHPI>>;
  hds: HoganHDS;
  setHds: React.Dispatch<React.SetStateAction<HoganHDS>>;
  swift: SwiftCognitive;
  setSwift: React.Dispatch<React.SetStateAction<SwiftCognitive>>;
  sessionDocuments: StoredDocument[];
  onAddDocument: (payload: NewDocumentPayload) => Promise<void>;
  onDeleteDocument: (id: string) => void;
  onAnalyze: (useAI: boolean) => void;
  isLoading: boolean;
  onExit: () => void;
}

/* ------------------------- ساختار مراحل و صفحات ------------------------- */

interface StageDef {
  key: string;
  title: string;
  short: string; // عنوان کوتاه برای ریل مراحل تا متن بریده نشود
  icon: React.ElementType;
  pages: number[];
}

const STAGES: StageDef[] = [
  { key: 'job', title: 'شناسنامه شغل', short: 'شغل', icon: Briefcase, pages: [1, 2] },
  { key: 'intake', title: 'دریافت مدارک', short: 'مدارک', icon: Upload, pages: [3, 4, 5] },
  { key: 'hds', title: 'بخش تاریک HDS', short: 'HDS', icon: ShieldAlert, pages: [6, 7, 8] },
  { key: 'hpi', title: 'بخش روشن HPI', short: 'HPI', icon: Sparkles, pages: [9, 10] },
  { key: 'swift', title: 'شناختی Swift', short: 'Swift', icon: Brain, pages: [11, 12] },
  { key: 'review', title: 'مرور و اجرا', short: 'مرور', icon: Play, pages: [13] }
];

const TOTAL_PAGES = 13;

const PAGE_TITLES: Record<number, { title: string; desc: string }> = {
  1: { title: 'شناسنامه موقعیت شغلی', desc: 'عنوان، واحد سازمانی و صنعت این نقش' },
  2: { title: 'شایستگی‌های کلیدی و الزامات', desc: 'مبنای تدوین سوالات رفتاری مصاحبه' },
  3: { title: 'هویت و سوابق کاندیدا', desc: 'مشخصات پایه پرونده' },
  4: { title: 'بارگذاری مدارک پرونده', desc: 'رزومه، کارنامه‌های هوگان و آزمون شناختی' },
  5: { title: 'ادعاها و دستاوردهای اعلامی', desc: 'متنی که در گام تحلیل راستی‌آزمایی می‌شود' },
  6: { title: 'HDS ـ الگوهای فاصله‌گیری', desc: 'واکنش به فشار با انزوا و قطع ارتباط (۵ مقیاس)' },
  7: { title: 'HDS ـ الگوهای تهاجمی', desc: 'واکنش به فشار با تسلط‌گرایی و ریسک (۴ مقیاس)' },
  8: { title: 'HDS ـ الگوهای تسلیم‌گرایی', desc: 'واکنش به فشار با اطاعت و وسواس (۲ مقیاس)' },
  9: { title: 'HPI ـ ثبات هیجانی و روابط', desc: 'خونسردی، جاه‌طلبی و مهارت بین‌فردی (۴ مقیاس)' },
  10: { title: 'HPI ـ نظم و سبک تفکر', desc: 'وجدان کاری، کنجکاوی و یادگیری (۳ مقیاس)' },
  11: { title: 'Swift ـ توان استدلال', desc: 'استدلال کلامی، محاسباتی و انتزاعی' },
  12: { title: 'Swift ـ سرعت، دقت و صدک کل', desc: 'جمع‌بندی پروفایل شناختی' },
  13: { title: 'مرور نهایی و صدور کارنامه', desc: 'بررسی کامل بودن داده‌ها پیش از تحلیل' }
};

/* ------------------------- اجزای کوچک قابل استفاده مجدد ------------------------- */

const TextField: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}> = ({ label, value, onChange, placeholder, required }) => (
  <div>
    <label className="block text-xs font-bold text-slate-800 mb-1.5">
      {label} {required && <span className="text-rose-600">*</span>}
    </label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full text-xs p-3 bg-slate-50/70 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
    />
  </div>
);

const TextAreaField: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  hint?: string;
}> = ({ label, value, onChange, placeholder, rows = 4, hint }) => (
  <div>
    <div className="flex items-center justify-between mb-1.5">
      <label className="text-xs font-bold text-slate-800">{label}</label>
      {hint && <span className="text-[11px] text-slate-400">{hint}</span>}
    </div>
    <textarea
      rows={rows}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full text-xs p-3 bg-slate-50/70 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none leading-relaxed"
    />
  </div>
);

const ScaleField: React.FC<{
  label: string;
  desc: string;
  value: number;
  onChange: (v: number) => void;
  tone: 'risk' | 'bright' | 'cognitive';
}> = ({ label, desc, value, onChange, tone }) => {
  const isDanger = tone === 'risk' && value >= 70;
  const badgeClass =
    tone === 'risk'
      ? isDanger
        ? 'bg-rose-100 text-rose-800'
        : value >= 35
        ? 'bg-amber-100 text-amber-800'
        : 'bg-emerald-100 text-emerald-800'
      : value >= 65
      ? 'bg-emerald-100 text-emerald-800'
      : value >= 35
      ? 'bg-amber-100 text-amber-800'
      : 'bg-slate-200 text-slate-700';

  const accent =
    tone === 'risk' ? 'accent-rose-600' : tone === 'bright' ? 'accent-indigo-600' : 'accent-sky-600';

  return (
    <div
      className={`p-4 rounded-2xl border ${
        isDanger ? 'bg-rose-50 border-rose-200' : 'bg-white border-slate-200'
      }`}
    >
      <div className="flex justify-between items-center mb-1">
        <span className="font-bold text-xs text-slate-900">{label}</span>
        <span className={`text-xs font-black px-2 py-0.5 rounded-md ${badgeClass}`}>
          {value}٪ {isDanger && '⚠️'}
        </span>
      </div>
      <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">{desc}</p>
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`w-full ${accent} cursor-pointer h-1.5`}
      />
    </div>
  );
};

/* ------------------------- تعریف مقیاس‌ها ------------------------- */

const HDS_AWAY = [
  { key: 'excitable', label: 'هیجان‌پذیری (Excitable)', desc: 'انفجار خلقی، بی‌صبری و نوسان احساسی در فشار کاری' },
  { key: 'skeptical', label: 'بدگمانی (Skeptical)', desc: 'سوءظن مزمن، توهم توطئه و شک به صداقت همکاران' },
  { key: 'cautious', label: 'احتیاط افراطی (Cautious)', desc: 'فلج تحلیلی، ترس از شکست و به تعویق انداختن تصمیم' },
  { key: 'reserved', label: 'انزواطلبی (Reserved)', desc: 'سکوت، قطع ارتباط و انزوای مدیریتی در بحران' },
  { key: 'leisurely', label: 'مقاومت منفی (Leisurely)', desc: 'لجاجت پنهان، تاخیر عامدانه و تظاهر به توافق' }
];

const HDS_AGAINST = [
  { key: 'bold', label: 'تکبر و خودشیفتگی (Bold)', desc: 'توهم خطاناپذیری، عدم پذیرش انتقاد و بی‌پروایی' },
  { key: 'mischievous', label: 'ریسک ناسالم (Mischievous)', desc: 'قانون‌گریزی، دور زدن مقررات و تعهدات غیرواقعی' },
  { key: 'colorful', label: 'نمایشگری (Colorful)', desc: 'جلب توجه سطحی در جلسات و غفلت از جزئیات عملیات' },
  { key: 'imaginative', label: 'خیال‌پردازی (Imaginative)', desc: 'ارائه طرح‌های دور از ذهن بدون لحاظ محدودیت‌ها' }
];

const HDS_TOWARD = [
  { key: 'diligent', label: 'وسواس و ریزمدیریتی (Diligent)', desc: 'میکرومنیجمنت شدید، ناتوانی در تفویض و فرسایش تیم' },
  { key: 'dutiful', label: 'فرمان‌برداری کورکورانه (Dutiful)', desc: 'ناتوانی در نه گفتن به مدیران ارشد و فدا کردن ظرفیت تیم' }
];

const HPI_CORE = [
  { key: 'adjustment', label: 'تطبیق‌پذیری (Adjustment)', desc: 'خونسردی، مدیریت استرس و عدم انتقال اضطراب به تیم' },
  { key: 'ambition', label: 'جاه‌طلبی (Ambition)', desc: 'انگیزه هدایت تیم، رقابت‌پذیری و پذیرش مسئولیت لیدری' },
  { key: 'sociability', label: 'جامعه‌پذیری (Sociability)', desc: 'برقراری ارتباطات شبکه‌ای و حضور پررنگ در جمع' },
  { key: 'interpersonalSensitivity', label: 'حساسیت بین‌فردی (Sensitivity)', desc: 'همدلی، مهارت‌های دیپلماتیک و ایجاد اعتماد' }
];

const HPI_DISCIPLINE = [
  { key: 'prudence', label: 'احتیاط و وجدان (Prudence)', desc: 'نظم کاری، دقت به آیین‌نامه‌ها و سازمان‌یافتگی' },
  { key: 'inquisitive', label: 'کنجکاوی فکری (Inquisitive)', desc: 'تفکر استراتژیک کلان، خلاقیت و ایده‌های نوین' },
  { key: 'learningApproach', label: 'رویکرد یادگیری (Learning)', desc: 'اشتیاق به یادگیری تخصصی و به‌روز نگه‌داشتن دانش' }
];

const SUGGESTED_COMPETENCIES = [
  'مدیریت بحران و حفظ خونسردی در اختلالات حاد شبکه',
  'رهبری استراتژیک تیم‌های ماتریسی و حل تعارضات بین‌معاونتی',
  'انضباط فرآیندی و تعهد خدشه‌ناپذیر به SLAهای سخت‌گیرانه',
  'تفکر تحلیلی عمیق و مدل‌سازی چالش‌های فنی چندبعدی',
  'دیپلماسی سازمانی و اقناع ذی‌نفعان در مذاکرات بالادستی'
];

/* ------------------------- کامپوننت اصلی ------------------------- */

export const DocumentIntakeWizard: React.FC<DocumentIntakeWizardProps> = ({
  position,
  currentMember,
  jd,
  setJd,
  resume,
  setResume,
  hpi,
  setHpi,
  hds,
  setHds,
  swift,
  setSwift,
  sessionDocuments,
  onAddDocument,
  onDeleteDocument,
  onAnalyze,
  isLoading,
  onExit
}) => {
  const [page, setPage] = useState<number>(1);
  const [useAIEnrichment, setUseAIEnrichment] = useState<boolean>(true);
  const [uploadingKind, setUploadingKind] = useState<DocumentKind | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string>('');
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

  const currentStageIndex = useMemo(
    () => STAGES.findIndex((s) => s.pages.includes(page)),
    [page]
  );
  const currentStage = STAGES[currentStageIndex] || STAGES[0];
  const pageInStage = currentStage.pages.indexOf(page) + 1;

  const candidateCode = resume.fullName.trim() || 'پرونده بدون نام';

  /* --------- بارگذاری مدرک: استخراج متن/نمره + بایگانی در مخزن --------- */
  const handleUpload = async (kind: DocumentKind, file: File) => {
    setUploadingKind(kind);
    setUploadMessage('');

    try {
      let extractedText = '';

      if (kind === 'swift' || /\.(xlsx|xls|csv)$/i.test(file.name)) {
        const parsed = await parseSwiftExcel(file);
        extractedText = parsed.summaryText;

        if (kind === 'swift') {
          setSwift((prev) => ({
            ...prev,
            verbalReasoning: parsed.scores.verbalReasoning ?? prev.verbalReasoning,
            numericalReasoning: parsed.scores.numericalReasoning ?? prev.numericalReasoning,
            abstractReasoning: parsed.scores.abstractReasoning ?? prev.abstractReasoning,
            overallPercentile: parsed.scores.overallPercentile ?? prev.overallPercentile,
            speedVsAccuracy: parsed.scores.speedVsAccuracy ?? prev.speedVsAccuracy
          }));
        }
      } else if (/\.docx$/i.test(file.name)) {
        extractedText = await parseWordDocument(file);
      } else {
        extractedText = await parseTextFile(file);
      }

      if (kind === 'resume' && extractedText.trim()) {
        setResume((prev) => ({ ...prev, rawUploadedContent: extractedText }));
      }
      if (kind === 'jd' && extractedText.trim()) {
        setJd((prev) => ({ ...prev, rawUploadedContent: extractedText }));
      }

      await onAddDocument({
        kind,
        fileName: file.name,
        sizeBytes: file.size,
        extractedText,
        file,
        candidateCode
      });

      setUploadMessage(`فایل «${file.name}» بایگانی شد.`);
    } catch (err) {
      console.error(err);
      setUploadMessage(
        err instanceof Error ? err.message : 'خواندن این فایل ممکن نبود؛ قالب فایل را بررسی کنید.'
      );
    } finally {
      setUploadingKind(null);
    }
  };

  const handleLoadSample = () => {
    const cs = sampleCaseStudies[0];
    setJd(cs.jd);
    setResume(cs.resume);
    setHpi(cs.hpi);
    setHds(cs.hds);
    setSwift(cs.swift);
    setUploadMessage('داده‌های نمونه در همه مراحل بارگذاری شد.');
  };

  /* --------- شاخص کامل بودن داده‌ها برای صفحه مرور --------- */
  const checklist = [
    { label: 'عنوان موقعیت شغلی', done: Boolean(jd.jobTitle.trim()) },
    { label: 'شایستگی‌های کلیدی', done: jd.requiredCompetencies.trim().length > 10 },
    { label: 'نام یا کد کاندیدا', done: Boolean(resume.fullName.trim()) },
    { label: 'مدرک بارگذاری‌شده', done: sessionDocuments.length > 0 },
    { label: 'ادعاها و دستاوردها', done: resume.claimedAccomplishments.trim().length > 10 }
  ];
  const missingCount = checklist.filter((c) => !c.done).length;

  const goTo = (target: number) => {
    setPage(Math.min(TOTAL_PAGES, Math.max(1, target)));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* سربرگ و مسیر */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg border border-indigo-100">
              دریافت مدارک — صفحه‌به‌صفحه
            </span>
            <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg truncate max-w-[260px]">
              {position.title}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5">
            ثبت‌کننده: {currentMember.name} • پرونده: {candidateCode}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleLoadSample}
            className="text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5"
            title="تکمیل خودکار همه مراحل با یک نمونه واقعی"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>نمونه آماده</span>
          </button>

          <button
            type="button"
            onClick={onExit}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>انصراف</span>
          </button>
        </div>
      </div>

      {/* ریل مراحل (۶ مرحله) + نوار پیشرفت */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3">
        <div className="grid grid-cols-3 md:grid-cols-6 gap-1.5">
          {STAGES.map((stage, idx) => {
            const Icon = stage.icon;
            const isCurrent = idx === currentStageIndex;
            const isDone = idx < currentStageIndex;
            return (
              <button
                key={stage.key}
                type="button"
                onClick={() => goTo(stage.pages[0])}
                className={`px-2 py-2 rounded-xl border text-center transition cursor-pointer ${
                  isCurrent
                    ? 'bg-indigo-600 border-indigo-600 text-white'
                    : isDone
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-800 hover:bg-indigo-100'
                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-center gap-1.5">
                  {isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Icon className="w-3.5 h-3.5" />}
                  <span className="text-[11px] font-bold truncate">{stage.short}</span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3 mt-3">
          <div className="flex-1 bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-full transition-all duration-300 rounded-full"
              style={{ width: `${((page - 1) / (TOTAL_PAGES - 1)) * 100}%` }}
            ></div>
          </div>
          <span className="text-[11px] font-bold text-slate-500 shrink-0">
            صفحه {page} از {TOTAL_PAGES} • مرحله {currentStageIndex + 1} از {STAGES.length} (بخش{' '}
            {pageInStage} از {currentStage.pages.length})
          </span>
        </div>
      </div>

      {/* محتوای صفحه */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 space-y-5 animate-fadeIn">
        <div className="border-b border-slate-100 pb-4">
          <span className="text-[11px] font-black text-indigo-600">
            {currentStage.title}
          </span>
          <h3 className="text-base font-black text-slate-900 mt-1">{PAGE_TITLES[page].title}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{PAGE_TITLES[page].desc}</p>
        </div>

        {/* صفحه ۱ */}
        {page === 1 && (
          <div className="space-y-4">
            <TextField
              label="عنوان موقعیت شغلی"
              required
              value={jd.jobTitle}
              onChange={(v) => setJd((prev) => ({ ...prev, jobTitle: v }))}
              placeholder="مثال: مدیر ارشد پروژه‌های استراتژیک تلکام"
            />
            <TextField
              label="معاونت / واحد سازمانی"
              value={jd.department}
              onChange={(v) => setJd((prev) => ({ ...prev, department: v }))}
              placeholder="مثال: معاونت برنامه‌ریزی راهبردی"
            />
            <TextField
              label="صنعت"
              value={jd.industry}
              onChange={(v) => setJd((prev) => ({ ...prev, industry: v }))}
              placeholder="مثال: مخابرات و تلکام"
            />
          </div>
        )}

        {/* صفحه ۲ */}
        {page === 2 && (
          <div className="space-y-4">
            <TextAreaField
              label="شایستگی‌های کلیدی مورد نیاز (هر مورد در یک خط)"
              hint="مبنای تدوین سوالات رفتاری BEI"
              rows={5}
              value={jd.requiredCompetencies}
              onChange={(v) => setJd((prev) => ({ ...prev, requiredCompetencies: v }))}
              placeholder="شایستگی‌های رفتاری و مدیریتی مورد نیاز..."
            />

            <div>
              <span className="text-[11px] font-bold text-slate-500 mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-indigo-600" />
                <span>افزودن سریع شایستگی‌های پرتکرار:</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_COMPETENCIES.map((comp, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() =>
                      setJd((prev) =>
                        prev.requiredCompetencies.includes(comp)
                          ? prev
                          : {
                              ...prev,
                              requiredCompetencies: prev.requiredCompetencies.trim()
                                ? `${prev.requiredCompetencies.trim()}\n${comp}`
                                : comp
                            }
                      )
                    }
                    className="text-[11px] bg-slate-100 hover:bg-indigo-50 hover:text-indigo-800 hover:border-indigo-300 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 transition cursor-pointer"
                  >
                    + {comp}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-slate-100">
              <TextField
                label="مخاطرات و چالش‌های حاد (اختیاری)"
                value={jd.operationalChallengesAndRisks || ''}
                onChange={(v) => setJd((prev) => ({ ...prev, operationalChallengesAndRisks: v }))}
                placeholder="مثال: جریمه‌های تاخیر رگولاتوری"
              />
              <TextField
                label="تعهدات حساس SLA (اختیاری)"
                value={jd.criticalSLAs || ''}
                onChange={(v) => setJd((prev) => ({ ...prev, criticalSLAs: v }))}
                placeholder="مثال: MTTR زیر ۱۵ دقیقه"
              />
            </div>
          </div>
        )}

        {/* صفحه ۳ */}
        {page === 3 && (
          <div className="space-y-4">
            <TextField
              label="نام یا کد پرونده کاندیدا"
              required
              value={resume.fullName}
              onChange={(v) => setResume((prev) => ({ ...prev, fullName: v }))}
              placeholder="مثال: کاندیدای ارشد (کد C-101)"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField
                label="سمت فعلی"
                value={resume.currentRole}
                onChange={(v) => setResume((prev) => ({ ...prev, currentRole: v }))}
                placeholder="مثال: مدیر پروژه زیرساخت"
              />
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  سنوات تجربه مرتبط
                </label>
                <input
                  type="number"
                  min={0}
                  max={45}
                  value={resume.experienceYears}
                  onChange={(e) =>
                    setResume((prev) => ({ ...prev, experienceYears: Number(e.target.value) }))
                  }
                  className="w-full text-xs p-3 bg-slate-50/70 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>
            <TextField
              label="تحصیلات"
              value={resume.education}
              onChange={(v) => setResume((prev) => ({ ...prev, education: v }))}
              placeholder="مثال: کارشناسی ارشد مهندسی مخابرات"
            />
          </div>
        )}

        {/* صفحه ۴: مرکز بارگذاری مدارک */}
        {page === 4 && (
          <div className="space-y-4">
            <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-3.5 text-[11px] text-indigo-900 leading-relaxed">
              مدارک این صفحه ذیل موقعیت «{position.title}» و پرونده «{candidateCode}» بایگانی
              می‌شوند و هر عضو تیم می‌تواند بعداً آن‌ها را از میز کار همین موقعیت فراخوانی کند.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DOCUMENT_KINDS.map((meta) => {
                const count = sessionDocuments.filter((d) => d.kind === meta.kind).length;
                const isBusy = uploadingKind === meta.kind;
                return (
                  <div
                    key={meta.kind}
                    className="border border-dashed border-slate-300 rounded-2xl p-4 hover:border-indigo-400 transition bg-slate-50/50"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-black text-slate-800">{meta.label}</span>
                      {count > 0 && (
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                          {count} فایل
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed mb-3">{meta.hint}</p>

                    <input
                      ref={(el) => {
                        fileInputs.current[meta.kind] = el;
                      }}
                      type="file"
                      accept={meta.accept}
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUpload(meta.kind, file);
                        e.target.value = '';
                      }}
                    />

                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => fileInputs.current[meta.kind]?.click()}
                      className="w-full text-xs font-bold text-indigo-700 bg-white hover:bg-indigo-50 border border-indigo-200 px-3 py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-60"
                    >
                      {isBusy ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Upload className="w-3.5 h-3.5" />
                      )}
                      <span>{isBusy ? 'در حال پردازش...' : 'انتخاب فایل'}</span>
                    </button>
                  </div>
                );
              })}
            </div>

            {uploadMessage && (
              <div className="text-[11px] font-bold bg-slate-100 border border-slate-200 text-slate-700 rounded-xl p-3">
                {uploadMessage}
              </div>
            )}

            {sessionDocuments.length > 0 && (
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <span className="text-xs font-bold text-slate-700">
                  مدارک بارگذاری‌شده این پرونده ({sessionDocuments.length}):
                </span>
                {sessionDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between gap-2 bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-[11px] font-bold text-slate-800 truncate max-w-[280px]">
                          {doc.fileName}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {DOCUMENT_KINDS.find((k) => k.kind === doc.kind)?.label} •{' '}
                          {formatBytes(doc.sizeBytes)}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onDeleteDocument(doc.id)}
                      className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg transition cursor-pointer shrink-0"
                      title="حذف این مدرک"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* صفحه ۵ */}
        {page === 5 && (
          <div className="space-y-4">
            <TextAreaField
              label="مسیر شغلی و سوابق کلیدی"
              rows={3}
              value={resume.careerPath}
              onChange={(v) => setResume((prev) => ({ ...prev, careerPath: v }))}
              placeholder="سیر ارتقای شغلی، شرکت‌ها و نقش‌های پیشین..."
            />
            <TextAreaField
              label="دستاوردهای ادعاشده در رزومه"
              rows={4}
              hint="در تحلیل با نتایج روان‌سنجی تطبیق داده می‌شود"
              value={resume.claimedAccomplishments}
              onChange={(v) => setResume((prev) => ({ ...prev, claimedAccomplishments: v }))}
              placeholder="مثال: راهبری پروژه فیبرنوری با ۳۰٪ کاهش زمان تحویل..."
            />
            <TextAreaField
              label="نقاط قوت ادعایی کاندیدا"
              rows={3}
              value={resume.claimedStrengths}
              onChange={(v) => setResume((prev) => ({ ...prev, claimedStrengths: v }))}
              placeholder="مثال: خونسردی در بحران، مهارت مذاکره..."
            />

            {resume.rawUploadedContent && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-[11px] text-emerald-900 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  متن رزومه بارگذاری‌شده ({resume.rawUploadedContent.length} نویسه) ضمیمه این پرونده
                  است و در تحلیل لحاظ می‌شود.
                </span>
              </div>
            )}
          </div>
        )}

        {/* صفحات ۶ تا ۸: HDS */}
        {page === 6 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {HDS_AWAY.map((item) => (
              <ScaleField
                key={item.key}
                label={item.label}
                desc={item.desc}
                tone="risk"
                value={hds[item.key as keyof HoganHDS]}
                onChange={(v) => setHds((prev) => ({ ...prev, [item.key]: v }))}
              />
            ))}
          </div>
        )}

        {page === 7 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {HDS_AGAINST.map((item) => (
              <ScaleField
                key={item.key}
                label={item.label}
                desc={item.desc}
                tone="risk"
                value={hds[item.key as keyof HoganHDS]}
                onChange={(v) => setHds((prev) => ({ ...prev, [item.key]: v }))}
              />
            ))}
          </div>
        )}

        {page === 8 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {HDS_TOWARD.map((item) => (
              <ScaleField
                key={item.key}
                label={item.label}
                desc={item.desc}
                tone="risk"
                value={hds[item.key as keyof HoganHDS]}
                onChange={(v) => setHds((prev) => ({ ...prev, [item.key]: v }))}
              />
            ))}
          </div>
        )}

        {/* صفحات ۹ و ۱۰: HPI */}
        {page === 9 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {HPI_CORE.map((item) => (
              <ScaleField
                key={item.key}
                label={item.label}
                desc={item.desc}
                tone="bright"
                value={hpi[item.key as keyof HoganHPI]}
                onChange={(v) => setHpi((prev) => ({ ...prev, [item.key]: v }))}
              />
            ))}
          </div>
        )}

        {page === 10 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {HPI_DISCIPLINE.map((item) => (
              <ScaleField
                key={item.key}
                label={item.label}
                desc={item.desc}
                tone="bright"
                value={hpi[item.key as keyof HoganHPI]}
                onChange={(v) => setHpi((prev) => ({ ...prev, [item.key]: v }))}
              />
            ))}
          </div>
        )}

        {/* صفحه ۱۱ و ۱۲: Swift */}
        {page === 11 && (
          <div className="space-y-3">
            <ScaleField
              label="استدلال کلامی (Verbal)"
              desc="درک متون فنی، تفسیر مفاد قرارداد و گزارش‌نویسی دقیق"
              tone="cognitive"
              value={swift.verbalReasoning}
              onChange={(v) => setSwift((prev) => ({ ...prev, verbalReasoning: v }))}
            />
            <ScaleField
              label="استدلال محاسباتی (Numerical)"
              desc="تحلیل داده‌های ترافیک، بودجه و شاخص‌های عملکردی"
              tone="cognitive"
              value={swift.numericalReasoning}
              onChange={(v) => setSwift((prev) => ({ ...prev, numericalReasoning: v }))}
            />
            <ScaleField
              label="استدلال انتزاعی (Abstract)"
              desc="کشف الگو در خطاهای شبکه و حل مسائل بی‌سابقه"
              tone="cognitive"
              value={swift.abstractReasoning}
              onChange={(v) => setSwift((prev) => ({ ...prev, abstractReasoning: v }))}
            />
          </div>
        )}

        {page === 12 && (
          <div className="space-y-4">
            <ScaleField
              label="صدک کل شناختی"
              desc="جمع‌بندی توان پردازش شناختی نسبت به گروه هنجار"
              tone="cognitive"
              value={swift.overallPercentile}
              onChange={(v) => setSwift((prev) => ({ ...prev, overallPercentile: v }))}
            />

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                الگوی سرعت در برابر دقت
              </label>
              <select
                value={swift.speedVsAccuracy}
                onChange={(e) =>
                  setSwift((prev) => ({
                    ...prev,
                    speedVsAccuracy: e.target.value as SwiftCognitive['speedVsAccuracy']
                  }))
                }
                className="w-full text-xs p-3 bg-slate-50/70 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
              >
                <option value="سرعت و دقت عالی">سرعت و دقت عالی</option>
                <option value="متعادل">متعادل</option>
                <option value="دقت بالا / سرعت کم">دقت بالا / سرعت کم</option>
                <option value="سرعت بالا / دقت کم">سرعت بالا / دقت کم</option>
                <option value="سرعت و دقت پایین">سرعت و دقت پایین</option>
              </select>
            </div>
          </div>
        )}

        {/* صفحه ۱۳: مرور نهایی */}
        {page === 13 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-1.5">
                <div className="font-black text-slate-900 flex items-center gap-1.5 mb-2">
                  <User className="w-4 h-4 text-indigo-600" />
                  <span>پرونده کاندیدا</span>
                </div>
                <div className="text-slate-600">نام/کد: {candidateCode}</div>
                <div className="text-slate-600">سمت فعلی: {resume.currentRole || '—'}</div>
                <div className="text-slate-600">سنوات: {resume.experienceYears} سال</div>
                <div className="text-slate-600">مدارک بایگانی‌شده: {sessionDocuments.length}</div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-1.5">
                <div className="font-black text-slate-900 flex items-center gap-1.5 mb-2">
                  <Brain className="w-4 h-4 text-indigo-600" />
                  <span>خلاصه سنجه‌ها</span>
                </div>
                <div className="text-slate-600">
                  بیشترین دارک‌ساید:{' '}
                  {Math.max(...(Object.values(hds) as number[]))}٪
                </div>
                <div className="text-slate-600">تطبیق‌پذیری (HPI): {hpi.adjustment}٪</div>
                <div className="text-slate-600">صدک کل شناختی: {swift.overallPercentile}٪</div>
                <div className="text-slate-600">الگوی شناختی: {swift.speedVsAccuracy}</div>
              </div>
            </div>

            {/* چک‌لیست کامل بودن */}
            <div className="border border-slate-200 rounded-2xl p-4 space-y-2">
              <span className="text-xs font-black text-slate-900">وضعیت کامل بودن داده‌ها:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-1">
                {checklist.map((item) => (
                  <div
                    key={item.label}
                    className={`text-[11px] font-bold flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg ${
                      item.done
                        ? 'bg-emerald-50 text-emerald-800'
                        : 'bg-amber-50 text-amber-800'
                    }`}
                  >
                    {item.done ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5" />
                    )}
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
              {missingCount > 0 && (
                <p className="text-[11px] text-slate-500 pt-1">
                  {missingCount} مورد تکمیل نشده است. تحلیل اجرا می‌شود، اما دقت آن با تکمیل این
                  موارد بالاتر می‌رود.
                </p>
              )}
            </div>

            <label className="flex items-start gap-2.5 bg-indigo-50/60 border border-indigo-100 rounded-2xl p-3.5 cursor-pointer">
              <input
                type="checkbox"
                checked={useAIEnrichment}
                onChange={(e) => setUseAIEnrichment(e.target.checked)}
                className="mt-0.5 accent-indigo-600 cursor-pointer"
              />
              <span className="text-[11px] text-indigo-900 leading-relaxed">
                <span className="font-black block mb-0.5">غنی‌سازی تحلیل با مدل زبانی</span>
                در صورت در دسترس نبودن سرویس، موتور محاسباتی قطعی سامانه به‌تنهایی کارنامه را صادر
                می‌کند.
              </span>
            </label>

            <button
              type="button"
              onClick={() => onAnalyze(useAIEnrichment)}
              disabled={isLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm py-3.5 rounded-2xl transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              <span>{isLoading ? 'در حال تحلیل...' : 'صدور کارنامه روان‌سنجی'}</span>
            </button>
          </div>
        )}

        {/* ناوبری صفحه */}
        <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => goTo(page - 1)}
            disabled={page === 1}
            className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
            <span>صفحه قبل</span>
          </button>

          {page < TOTAL_PAGES && (
            <button
              type="button"
              onClick={() => goTo(page + 1)}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>صفحه بعد</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
