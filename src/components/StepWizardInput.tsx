import React, { useState, useRef } from 'react';
import {
  Briefcase,
  User,
  Brain,
  ShieldAlert,
  Play,
  Sparkles,
  Upload,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  Tag,
  Zap,
  RotateCcw,
  Check,
  HelpCircle,
  Clock,
  Layers,
  FileCode
} from 'lucide-react';
import {
  CandidateResume,
  HoganHDS,
  HoganHPI,
  JobDescription,
  SwiftCognitive
} from '../types/assessment';
import { parseSwiftExcel, parseWordDocument, parseTextFile } from '../utils/fileParser';
import { sampleCaseStudies } from '../data/samplePresets';
import { JobPosition } from '../types/workspace';

interface StepWizardInputProps {
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
  onAnalyze: (useAI: boolean) => void;
  isLoading: boolean;
  activeJobPosition?: JobPosition | null;
  onCancelOrBackToWorkspace?: () => void;
}

export const StepWizardInput: React.FC<StepWizardInputProps> = ({
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
  onAnalyze,
  isLoading,
  activeJobPosition,
  onCancelOrBackToWorkspace
}) => {
  // Current step: 1 to 6
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [useAIEnrichment, setUseAIEnrichment] = useState<boolean>(true);
  const [showAdvancedJobFields, setShowAdvancedJobFields] = useState<boolean>(false);

  // File upload refs
  const resumeFileRef = useRef<HTMLInputElement | null>(null);
  const swiftFileRef = useRef<HTMLInputElement | null>(null);

  // Suggested competencies for one-click add
  const suggestedCompetencies = [
    'مدیریت بحران و حفظ خونسردی در اختلالات حاد شبکه',
    'رهبری استراتژیک تیم‌های ماتریسی و حل تعارضات بین‌معاونتی',
    'انضباط فرآیندی و تعهد خدشه‌ناپذیر به SLAهای سخت‌گیرانه',
    'تفکر تحلیلی عمیق و مدل‌سازی چالش‌های فنی چندبعدی',
    'دیپلماسی سازمانی و اقناع ذی‌نفعان در مذاکرات بالادستی',
    'تاب‌آوری عصبی و تصمیم‌گیری عقلانی در اوج فشار',
    'دقت وسواس‌گونه به استانداردهای امنیتی و کیفیت سرویس'
  ];

  const handleAddCompetencyTag = (tag: string) => {
    if (!jd.requiredCompetencies.includes(tag)) {
      const updated = jd.requiredCompetencies.trim()
        ? `${jd.requiredCompetencies.trim()}\n${tag}`
        : tag;
      setJd((prev) => ({ ...prev, requiredCompetencies: updated }));
    }
  };

  // Upload handler for resume
  const handleResumeFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      let extractedText = '';
      if (file.name.endsWith('.docx')) {
        extractedText = await parseWordDocument(file);
      } else {
        extractedText = await parseTextFile(file);
      }

      setResume((prev) => ({
        ...prev,
        claimedAccomplishments: `${prev.claimedAccomplishments}\n\n[متن بارگذاری‌شده از فایل ${file.name}]:\n${extractedText.slice(0, 1500)}`,
        rawUploadedContent: extractedText
      }));
      alert(`فایل «${file.name}» با موفقیت بارگذاری و متن آن استخراج شد.`);
    } catch (err) {
      console.error(err);
      alert('خطا در خواندن فایل رزومه.');
    }
    e.target.value = '';
  };

  // Upload handler for Swift cognitive Excel
  const handleSwiftFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const parsed = await parseSwiftExcel(file);
      setSwift((prev) => ({
        ...prev,
        verbalReasoning: parsed.scores.verbalReasoning ?? prev.verbalReasoning,
        numericalReasoning: parsed.scores.numericalReasoning ?? prev.numericalReasoning,
        abstractReasoning: parsed.scores.abstractReasoning ?? prev.abstractReasoning,
        overallPercentile: parsed.scores.overallPercentile ?? prev.overallPercentile,
        speedVsAccuracy: parsed.scores.speedVsAccuracy ?? prev.speedVsAccuracy
      }));
      alert(`کارنامه شناختی سویفت از فایل «${file.name}» با موفقیت بارگذاری شد.`);
    } catch (err) {
      console.error(err);
      alert('خطا در پردازش فایل اکسل سویفت.');
    }
    e.target.value = '';
  };

  // Load sample case study
  const handleLoadSample = (index = 0) => {
    const cs = sampleCaseStudies[index] || sampleCaseStudies[0];
    setJd(cs.jd);
    setResume(cs.resume);
    setHpi(cs.hpi);
    setHds(cs.hds);
    setSwift(cs.swift);
  };

  // Step definitions
  const steps = [
    { num: 1, title: 'موقعیت و شایستگی‌ها', icon: Briefcase, desc: 'عنوان و شایستگی‌های حیاتی' },
    { num: 2, title: 'مشخصات و رزومه', icon: User, desc: 'پروفایل و تجارب کاندیدا' },
    { num: 3, title: 'بخش تاریک (HDS)', icon: ShieldAlert, desc: '۱۱ دارک‌ساید در بحران' },
    { num: 4, title: 'بخش روشن (HPI)', icon: Sparkles, desc: '۷ صفت عملکرد روزمره' },
    { num: 5, title: 'هوش شناختی سویفت', icon: Brain, desc: 'استدلال کلامی و محاسباتی' },
    { num: 6, title: 'مرور نهایی و اجرا', icon: Play, desc: 'صدور کارنامه روان‌سنجی' }
  ];

  // HDS Trait Groups
  const hdsMovingAway = [
    { key: 'excitable', label: 'هیجان‌پذیری (Excitable)', desc: 'انفجار خلقی، بی‌صبری و نوسان احساسی در فشار کاری' },
    { key: 'skeptical', label: 'بدگمانی (Skeptical)', desc: 'سوءظن مزمن، توهم توطئه و شک به صداقت همکاران' },
    { key: 'cautious', label: 'احتیاط افراطی (Cautious)', desc: 'فلج تحلیلی، ترس از شکست و به تعویق انداختن تصمیم' },
    { key: 'reserved', label: 'انزواطلبی (Reserved)', desc: 'سکوت، قطع ارتباط و انزوای مدیریتی در بحران' },
    { key: 'leisurely', label: 'مقاومت منفی (Leisurely)', desc: 'لجاجت پنهان، تاخیر عامدانه و تظاهر به توافق' }
  ];

  const hdsMovingAgainst = [
    { key: 'bold', label: 'تکبر و خودشیفتگی (Bold)', desc: 'توهم خطاناپذیری، عدم پذیرش انتقاد و بی‌پروایی' },
    { key: 'mischievous', label: 'ریسک ناسالم (Mischievous)', desc: 'قانون‌گریزی، دور زدن مقررات و تعهدات غیرواقعی' },
    { key: 'colorful', label: 'نمایشگری (Colorful)', desc: 'جلب توجه سطحی در جلسات و غفلت از جزئیات عملیات' },
    { key: 'imaginative', label: 'خیال‌پردازی (Imaginative)', desc: 'ارائه طرح‌های دور از ذهن بدون لحاظ محدودیت‌ها' }
  ];

  const hdsMovingToward = [
    { key: 'diligent', label: 'وسواس و ریزمدیریتی (Diligent)', desc: 'میکرومنیجمنت شدید، ناتوانی در تفویض و فرسایش تیم' },
    { key: 'dutiful', label: 'فرمان‌برداری کورکورانه (Dutiful)', desc: 'ناتوانی در نه گفتن به مدیران ارشد و فدا کردن ظرفیت تیم' }
  ];

  // HPI Trait Groups
  const hpiEmotionalLeadership = [
    { key: 'adjustment', label: 'تطبیق‌پذیری (Adjustment)', desc: 'خونسردی، مدیریت استرس و عدم انتقال اضطراب به تیم' },
    { key: 'ambition', label: 'جاه‌طلبی (Ambition)', desc: 'انگیزه هدایت تیم، رقابت‌پذیری و پذیرش مسئولیت لیدری' }
  ];

  const hpiInterpersonal = [
    { key: 'sociability', label: 'جامعه‌پذیری (Sociability)', desc: 'برقراری ارتباطات شبکه‌ای و حضور پررنگ در جمع' },
    { key: 'interpersonalSensitivity', label: 'حساسیت بین‌فردی (Sensitivity)', desc: 'همدلی، مهارت‌های دیپلماتیک و ایجاد اعتماد' }
  ];

  const hpiDisciplineIntellect = [
    { key: 'prudence', label: 'احتیاط و وجدان (Prudence)', desc: 'نظم کاری، دقت به آیین‌نامه‌ها و سازمان‌یافتگی' },
    { key: 'inquisitive', label: 'کنجکاوی فکری (Inquisitive)', desc: 'تفکر استراتژیک کلان، خلاقیت و ایده‌های نوین' },
    { key: 'learningApproach', label: 'رویکرد یادگیری (Learning)', desc: 'اشتیاق به یادگیری دانش تخصصی و به‌روز نگه‌داشتن داده‌ها' }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6" id="step-wizard-container">
      {/* Top Header & Breadcrumb */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg border border-indigo-100">
              ارزیابی مرحله‌به‌مرحله (Step Wizard)
            </span>
            {activeJobPosition && (
              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                موقعیت انتخابی: {activeJobPosition.title}
              </span>
            )}
          </div>
          <h2 className="text-lg font-black text-slate-900 mt-1">
            ورود اطلاعات کاندیدا و سنجه‌های روان‌سنجی
          </h2>
          <p className="text-xs text-slate-500">
            صفحه به صفحه داده‌ها را ثبت کنید؛ برای دریافت خروجی دقیق تنها کافیست فیلدهای هر مرحله را بررسی فرمایید.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleLoadSample(0)}
            className="text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5"
            title="تکمیل خودکار فرم با داده‌های واقعی یک مدیر تلکام"
          >
            <Zap className="w-3.5 h-3.5 text-indigo-600" />
            <span>بارگذاری نمونه آماده</span>
          </button>

          {onCancelOrBackToWorkspace && (
            <button
              type="button"
              onClick={onCancelOrBackToWorkspace}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition cursor-pointer"
            >
              بازگشت به میز کار
            </button>
          )}
        </div>
      </div>

      {/* Modern Stepper Indicator Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {steps.map((s) => {
            const isCurrent = currentStep === s.num;
            const isCompleted = currentStep > s.num;
            const Icon = s.icon;

            return (
              <button
                key={s.num}
                type="button"
                onClick={() => setCurrentStep(s.num)}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-right transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                    : isCompleted
                    ? 'bg-indigo-50/60 border-indigo-200 text-indigo-900 hover:bg-indigo-100/70'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs ${
                    isCurrent
                      ? 'bg-white/20 text-white'
                      : isCompleted
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-slate-500 border border-slate-200'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : s.num}
                </div>

                <div className="overflow-hidden">
                  <div className="text-xs font-bold truncate leading-tight">{s.title}</div>
                  <div
                    className={`text-[10px] truncate ${
                      isCurrent ? 'text-indigo-100' : 'text-slate-400'
                    }`}
                  >
                    {s.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Linear Progress Bar */}
        <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
          <div
            className="bg-indigo-600 h-full transition-all duration-300 rounded-full"
            style={{ width: `${((currentStep - 1) / 5) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* STEP CONTENT CONTAINER */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6">
        {/* ================= STEP 1: JOB PROFILE & COMPETENCIES ================= */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-xs font-black text-indigo-600 uppercase tracking-wider">
                مرحله ۱ از ۶
              </span>
              <h3 className="text-lg font-black text-slate-900 mt-1 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-indigo-600" />
                <span>تعریف موقعیت شغلی و شایستگی‌های رفتاری مورد نیاز</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                شایستگی‌هایی که برای موفقیت در این نقش استراتژیک حیاتی هستند را وارد نمایید تا سوالات تخصصی مصاحبه بر اساس آن‌ها تدوین گردد.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  عنوان موقعیت شغلی <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={jd.jobTitle}
                  onChange={(e) => setJd((prev) => ({ ...prev, jobTitle: e.target.value }))}
                  placeholder="مثال: مدیر ارشد پروژه‌های استراتژیک تلکام"
                  className="w-full text-xs p-3 bg-slate-50/70 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  معاونت / واحد سازمانی <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={jd.department}
                  onChange={(e) => setJd((prev) => ({ ...prev, department: e.target.value }))}
                  placeholder="مثال: معاونت برنامه‌ریزی راهبردی و تحول شبکه"
                  className="w-full text-xs p-3 bg-slate-50/70 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Core Competencies Box with Suggestion Tags */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-indigo-600" />
                  <span>شایستگی‌های کلیدی مورد نیاز (هر شایستگی در یک خط):</span>
                </label>
                <span className="text-[11px] text-slate-400">مبنای تدوین سوالات رفتاری BEI</span>
              </div>

              <textarea
                rows={4}
                value={jd.requiredCompetencies}
                onChange={(e) => setJd((prev) => ({ ...prev, requiredCompetencies: e.target.value }))}
                placeholder="شایستگی‌های رفتاری و مدیریتی مورد نیاز..."
                className="w-full text-xs p-3 bg-slate-50/70 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none leading-relaxed"
              />

              {/* Quick Suggestion Chips */}
              <div className="pt-1">
                <span className="text-[11px] font-bold text-slate-500 block mb-1.5">
                  شایستگی‌های پرتکرار سازمانی (جهت افزودن سریع کلیک کنید):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {suggestedCompetencies.map((comp, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAddCompetencyTag(comp)}
                      className="text-[11px] bg-slate-100 hover:bg-indigo-50 hover:text-indigo-800 hover:border-indigo-300 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 transition cursor-pointer"
                    >
                      + {comp}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Optional Challenges Accordion */}
            <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50">
              <button
                type="button"
                onClick={() => setShowAdvancedJobFields(!showAdvancedJobFields)}
                className="w-full flex items-center justify-between text-xs font-bold text-slate-700 cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>مخاطرات و الزامات خاص محیط کار (اختیاری)</span>
                </span>
                <span className="text-indigo-600 text-[11px]">
                  {showAdvancedJobFields ? 'بستن تنظیمات پیشرفته ▲' : 'مشاهده و تکمیل ▼'}
                </span>
              </button>

              {showAdvancedJobFields && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-200 animate-fadeIn text-xs">
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">
                      مخاطرات و چالش‌های حاد شبکه:
                    </label>
                    <input
                      type="text"
                      value={jd.operationalChallengesAndRisks || ''}
                      onChange={(e) =>
                        setJd((prev) => ({ ...prev, operationalChallengesAndRisks: e.target.value }))
                      }
                      placeholder="مثال: جریمه‌های تاخیر رگولاتوری، شیفت‌های فشرده"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">
                      تعهدات و سنجه‌های حساس SLA:
                    </label>
                    <input
                      type="text"
                      value={jd.criticalSLAs || ''}
                      onChange={(e) => setJd((prev) => ({ ...prev, criticalSLAs: e.target.value }))}
                      placeholder="مثال: زمان بازیابی MTTR زیر ۱۵ دقیقه"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= STEP 2: CANDIDATE BIO & RESUME ================= */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-xs font-black text-indigo-600 uppercase tracking-wider">
                مرحله ۲ از ۶
              </span>
              <h3 className="text-lg font-black text-slate-900 mt-1 flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-600" />
                <span>مشخصات فردی و بارگذاری رزومه کاندیدا</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                سوابق شغلی، تجارب و ادعاهای رزومه را وارد نمایید تا واکاوی شکاف ادعاها در برابر حقیقت روان‌سنجی انجام شود.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  نام و نام خانوادگی کاندیدا <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={resume.fullName}
                  onChange={(e) => setResume((prev) => ({ ...prev, fullName: e.target.value }))}
                  placeholder="مثال: کاندیدای ارشد (یا نام داوطلب)"
                  className="w-full text-xs p-3 bg-slate-50/70 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  سمت یا نقش کنونی
                </label>
                <input
                  type="text"
                  value={resume.currentRole}
                  onChange={(e) => setResume((prev) => ({ ...prev, currentRole: e.target.value }))}
                  placeholder="مثال: مدیر ارشد برنامه‌ریزی فنی"
                  className="w-full text-xs p-3 bg-slate-50/70 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  سابقه کار مدیریتی (سال)
                </label>
                <input
                  type="number"
                  value={resume.experienceYears}
                  onChange={(e) =>
                    setResume((prev) => ({ ...prev, experienceYears: Number(e.target.value) || 0 }))
                  }
                  className="w-full text-xs p-3 bg-slate-50/70 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold"
                />
              </div>
            </div>

            {/* Resume Upload Box */}
            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-5 bg-slate-50/60 text-center space-y-3">
              <Upload className="w-8 h-8 text-indigo-600 mx-auto" />
              <div>
                <h4 className="text-xs font-bold text-slate-800">
                  بارگذاری مستقیم فایل رزومه (Word یا Text)
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  فایل .docx یا .txt کاندیدا را اینجا رها کنید یا با کلیک انتخاب نمایید.
                </p>
              </div>

              <input
                ref={resumeFileRef}
                type="file"
                accept=".docx,.txt"
                onChange={handleResumeFileUpload}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => resumeFileRef.current?.click()}
                className="text-xs font-bold bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 px-4 py-2 rounded-xl transition cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
              >
                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                <span>انتخاب فایل رزومه از کامپیوتر...</span>
              </button>
            </div>

            {/* Resume Accomplishments & Claims */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                خلاصه دستاوردها و ادعاهای کلیدی در رزومه:
              </label>
              <textarea
                rows={4}
                value={resume.claimedAccomplishments}
                onChange={(e) =>
                  setResume((prev) => ({ ...prev, claimedAccomplishments: e.target.value }))
                }
                placeholder="پروژه‌های تحویل‌شده، افتخارات، ادعاهای رهبری و دستاوردهای برجسته..."
                className="w-full text-xs p-3 bg-slate-50/70 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* ================= STEP 3: HOGAN HDS (DARK SIDE DERAILERS) ================= */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-xs font-black text-rose-600 uppercase tracking-wider">
                مرحله ۳ از ۶
              </span>
              <h3 className="text-lg font-black text-slate-900 mt-1 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                <span>نتایج آزمون بخش تاریک هوگان (Hogan HDS - Dark Side)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                ۱۱ مقیاس رفتارهای مخرب در شرایط خستگی، تعارضات بین‌معاونتی و بحران. نمرات بالای ۷۰٪ منطقه خطر محسوب می‌شوند.
              </p>
            </div>

            {/* Sub-Group 1: Moving Away (فاصله‌گیری) */}
            <div className="space-y-3 bg-slate-50/80 border border-slate-200 rounded-2xl p-4">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  <span>الگوهای فاصله‌گیری از دیگران (Moving Away)</span>
                </span>
                <span className="text-[11px] text-slate-400">واکنش به استرس با قطع ارتباط و انزوا</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {hdsMovingAway.map((item) => {
                  const val = hds[item.key as keyof HoganHDS];
                  const isDanger = val >= 70;
                  return (
                    <div
                      key={item.key}
                      className={`p-3 rounded-xl border ${
                        isDanger ? 'bg-rose-50 border-rose-200' : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-xs text-slate-800">{item.label}</span>
                        <span
                          className={`text-xs font-black px-2 py-0.5 rounded-md ${
                            isDanger
                              ? 'bg-rose-100 text-rose-800'
                              : val >= 35
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {val}٪ {isDanger && '⚠️'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mb-2">{item.desc}</p>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={val}
                        onChange={(e) =>
                          setHds((prev) => ({ ...prev, [item.key]: Number(e.target.value) }))
                        }
                        className="w-full accent-rose-600 cursor-pointer h-1.5"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sub-Group 2: Moving Against (تهاجمی و تسلط‌گرایی) */}
            <div className="space-y-3 bg-slate-50/80 border border-slate-200 rounded-2xl p-4">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span>الگوهای تهاجمی و تسلط‌گرایی (Moving Against)</span>
                </span>
                <span className="text-[11px] text-slate-400">واکنش به استرس با تکبر و تحمیل اراده</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {hdsMovingAgainst.map((item) => {
                  const val = hds[item.key as keyof HoganHDS];
                  const isDanger = val >= 70;
                  return (
                    <div
                      key={item.key}
                      className={`p-3 rounded-xl border ${
                        isDanger ? 'bg-rose-50 border-rose-200' : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-xs text-slate-800">{item.label}</span>
                        <span
                          className={`text-xs font-black px-2 py-0.5 rounded-md ${
                            isDanger
                              ? 'bg-rose-100 text-rose-800'
                              : val >= 35
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {val}٪ {isDanger && '⚠️'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mb-2">{item.desc}</p>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={val}
                        onChange={(e) =>
                          setHds((prev) => ({ ...prev, [item.key]: Number(e.target.value) }))
                        }
                        className="w-full accent-rose-600 cursor-pointer h-1.5"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sub-Group 3: Moving Toward (تسلیم و اطاعت‌گری) */}
            <div className="space-y-3 bg-slate-50/80 border border-slate-200 rounded-2xl p-4">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                  <span>الگوهای تسلیم و اطاعت‌گری (Moving Toward)</span>
                </span>
                <span className="text-[11px] text-slate-400">واکنش به استرس با وسواس یا راضی نگه داشتن دیگران</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {hdsMovingToward.map((item) => {
                  const val = hds[item.key as keyof HoganHDS];
                  const isDanger = val >= 70;
                  return (
                    <div
                      key={item.key}
                      className={`p-3 rounded-xl border ${
                        isDanger ? 'bg-rose-50 border-rose-200' : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-xs text-slate-800">{item.label}</span>
                        <span
                          className={`text-xs font-black px-2 py-0.5 rounded-md ${
                            isDanger
                              ? 'bg-rose-100 text-rose-800'
                              : val >= 35
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {val}٪ {isDanger && '⚠️'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mb-2">{item.desc}</p>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={val}
                        onChange={(e) =>
                          setHds((prev) => ({ ...prev, [item.key]: Number(e.target.value) }))
                        }
                        className="w-full accent-rose-600 cursor-pointer h-1.5"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 4: HOGAN HPI (BRIGHT SIDE TRAITS) ================= */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-xs font-black text-sky-600 uppercase tracking-wider">
                مرحله ۴ از ۶
              </span>
              <h3 className="text-lg font-black text-slate-900 mt-1 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-sky-600" />
                <span>نتایج آزمون بخش روشن هوگان (Hogan HPI - Bright Side)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                ۷ مقیاس عملکرد روزمره، انگیزش و سبک تعاملی در شرایط پایدار سازمانی (صدک ۰ تا ۱۰۰).
              </p>
            </div>

            {/* Sub-Group 1: Emotional Stability & Leadership */}
            <div className="space-y-3 bg-slate-50/80 border border-slate-200 rounded-2xl p-4">
              <span className="text-xs font-bold text-slate-800 block border-b border-slate-200 pb-1.5">
                ثبات هیجانی و هدایت‌گری سازمانی
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {hpiEmotionalLeadership.map((item) => (
                  <div key={item.key} className="bg-white p-3 rounded-xl border border-slate-200">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-xs text-slate-800">{item.label}</span>
                      <span className="text-xs font-bold bg-sky-100 text-sky-800 px-2 py-0.5 rounded-md">
                        {hpi[item.key as keyof HoganHPI]}٪
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mb-2">{item.desc}</p>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={hpi[item.key as keyof HoganHPI]}
                      onChange={(e) =>
                        setHpi((prev) => ({ ...prev, [item.key]: Number(e.target.value) }))
                      }
                      className="w-full accent-sky-600 cursor-pointer h-1.5"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Sub-Group 2: Interpersonal & Social */}
            <div className="space-y-3 bg-slate-50/80 border border-slate-200 rounded-2xl p-4">
              <span className="text-xs font-bold text-slate-800 block border-b border-slate-200 pb-1.5">
                مهارت‌های ارتباطی و حساسیت بین‌فردی
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {hpiInterpersonal.map((item) => (
                  <div key={item.key} className="bg-white p-3 rounded-xl border border-slate-200">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-xs text-slate-800">{item.label}</span>
                      <span className="text-xs font-bold bg-sky-100 text-sky-800 px-2 py-0.5 rounded-md">
                        {hpi[item.key as keyof HoganHPI]}٪
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mb-2">{item.desc}</p>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={hpi[item.key as keyof HoganHPI]}
                      onChange={(e) =>
                        setHpi((prev) => ({ ...prev, [item.key]: Number(e.target.value) }))
                      }
                      className="w-full accent-sky-600 cursor-pointer h-1.5"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Sub-Group 3: Discipline & Thinking Style */}
            <div className="space-y-3 bg-slate-50/80 border border-slate-200 rounded-2xl p-4">
              <span className="text-xs font-bold text-slate-800 block border-b border-slate-200 pb-1.5">
                انضباط، کنجکاوی و یادگیری مستمر
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {hpiDisciplineIntellect.map((item) => (
                  <div key={item.key} className="bg-white p-3 rounded-xl border border-slate-200">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-xs text-slate-800">{item.label}</span>
                      <span className="text-xs font-bold bg-sky-100 text-sky-800 px-2 py-0.5 rounded-md">
                        {hpi[item.key as keyof HoganHPI]}٪
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mb-2">{item.desc}</p>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={hpi[item.key as keyof HoganHPI]}
                      onChange={(e) =>
                        setHpi((prev) => ({ ...prev, [item.key]: Number(e.target.value) }))
                      }
                      className="w-full accent-sky-600 cursor-pointer h-1.5"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 5: SWIFT COGNITIVE APTITUDE ================= */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-xs font-black text-indigo-600 uppercase tracking-wider">
                مرحله ۵ از ۶
              </span>
              <h3 className="text-lg font-black text-slate-900 mt-1 flex items-center gap-2">
                <Brain className="w-5 h-5 text-indigo-600" />
                <span>نتایج آزمون هوش و استعداد شناختی سویفت (Swift Cognitive)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                سنجش ظرفیت حل مسئله، استدلال تحلیلی و نسبت سرعت در برابر دقت در آزمون استاندارد Swift.
              </p>
            </div>

            {/* Swift Excel Upload */}
            <div className="border border-indigo-200 bg-indigo-50/50 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="w-8 h-8 text-indigo-600 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-indigo-950">
                    بارگذاری نمرات از فایل اکسل Swift
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    استخراج خودکار صدک‌های کلامی، محاسباتی، انتزاعی و شاخص سرعت/دقت
                  </p>
                </div>
              </div>

              <input
                ref={swiftFileRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleSwiftFileUpload}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => swiftFileRef.current?.click()}
                className="text-xs font-bold bg-white hover:bg-slate-50 text-indigo-700 border border-indigo-200 px-3.5 py-2 rounded-xl transition cursor-pointer"
              >
                انتخاب فایل اکسل سویفت...
              </button>
            </div>

            {/* Cognitive Scales Sliders */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-xs text-slate-800">استدلال کلامی (Verbal)</span>
                  <span className="text-sm font-black text-indigo-700">{swift.verbalReasoning}٪</span>
                </div>
                <p className="text-[10px] text-slate-500 mb-3">
                  درک گزارش‌های استراتژیک و اقناع منطقی در جلسات
                </p>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={swift.verbalReasoning}
                  onChange={(e) =>
                    setSwift((prev) => ({ ...prev, verbalReasoning: Number(e.target.value) }))
                  }
                  className="w-full accent-indigo-600 cursor-pointer h-1.5"
                />
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-xs text-slate-800">استدلال محاسباتی (Numerical)</span>
                  <span className="text-sm font-black text-indigo-700">{swift.numericalReasoning}٪</span>
                </div>
                <p className="text-[10px] text-slate-500 mb-3">
                  تحلیل داده‌های ترافیک شبکه، بودجه مالی و سنجه‌های SLA
                </p>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={swift.numericalReasoning}
                  onChange={(e) =>
                    setSwift((prev) => ({ ...prev, numericalReasoning: Number(e.target.value) }))
                  }
                  className="w-full accent-indigo-600 cursor-pointer h-1.5"
                />
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-xs text-slate-800">استدلال انتزاعی (Abstract)</span>
                  <span className="text-sm font-black text-indigo-700">{swift.abstractReasoning}٪</span>
                </div>
                <p className="text-[10px] text-slate-500 mb-3">
                  تشخیص الگو در معماری‌های جدید و حل مسائل مفهومی
                </p>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={swift.abstractReasoning}
                  onChange={(e) =>
                    setSwift((prev) => ({ ...prev, abstractReasoning: Number(e.target.value) }))
                  }
                  className="w-full accent-indigo-600 cursor-pointer h-1.5"
                />
              </div>
            </div>

            {/* Speed vs Accuracy & Overall Percentile */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  الگوی سرعت در برابر دقت (Speed vs Accuracy):
                </label>
                <select
                  value={swift.speedVsAccuracy}
                  onChange={(e) =>
                    setSwift((prev) => ({
                      ...prev,
                      speedVsAccuracy: e.target.value as SwiftCognitive['speedVsAccuracy']
                    }))
                  }
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800"
                >
                  <option value="متعادل">متعادل (تعادل مطلوب سرعت و دقت)</option>
                  <option value="دقت بالا / سرعت کم">دقت بالا / سرعت کم (احتیاط زیاد و تعمیق)</option>
                  <option value="سرعت بالا / دقت کم">سرعت بالا / دقت کم (ریسک شتاب‌زدگی و خطای تحلیلی)</option>
                  <option value="سرعت و دقت عالی">سرعت و دقت عالی (عملکرد نخبه شناختی)</option>
                  <option value="سرعت و دقت پایین">سرعت و دقت پایین (محدودیت ظرفیت پردازش ذهنی)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  صدک هوش کل (Overall Cognitive Percentile):
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={swift.overallPercentile}
                  onChange={(e) =>
                    setSwift((prev) => ({ ...prev, overallPercentile: Number(e.target.value) }))
                  }
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl font-black text-indigo-700"
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 6: FINAL REVIEW & LAUNCH ================= */}
        {currentStep === 6 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-xs font-black text-emerald-600 uppercase tracking-wider">
                مرحله ۶ از ۶
              </span>
              <h3 className="text-lg font-black text-slate-900 mt-1 flex items-center gap-2">
                <Play className="w-5 h-5 text-emerald-600" />
                <span>مرور نهایی و اجرای ارزیابی استراتژیک کاندیدا</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                اطلاعات ثبت‌شده را بازبینی کنید و با کلیک روی دکمه زیر، گزارش تحلیلی کامل را با نمودارهای راداری تولید فرمایید.
              </p>
            </div>

            {/* Quick Summary Card */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block mb-1">کاندیدا:</span>
                  <div className="font-bold text-sm text-slate-900">{resume.fullName || 'بدون نام'}</div>
                  <div className="text-slate-500">{resume.currentRole} ({resume.experienceYears} سال سابقه)</div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block mb-1">موقعیت شغلی هدف:</span>
                  <div className="font-bold text-sm text-slate-900">{jd.jobTitle || 'بدون عنوان'}</div>
                  <div className="text-slate-500">{jd.department}</div>
                </div>
              </div>

              {/* Psychometrics Snapshot */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[11px]">دارک‌سایدهای خطرناک (&gt;۷۰٪):</span>
                  <span className="text-base font-black text-rose-600">
                    {(Object.values(hds) as number[]).filter((v) => v >= 70).length} صفت
                  </span>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[11px]">میانگین صفات پایه (HPI):</span>
                  <span className="text-base font-black text-sky-600">
                    {Math.round(
                      (Object.values(hpi) as number[]).reduce((a, b) => a + b, 0) / 7
                    )}٪
                  </span>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[11px]">صدک هوش کل سویفت:</span>
                  <span className="text-base font-black text-indigo-700">
                    {swift.overallPercentile}٪
                  </span>
                </div>
              </div>

              {/* AI Enrichment Option */}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={useAIEnrichment}
                    onChange={(e) => setUseAIEnrichment(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>غنی‌سازی هوشمند تحلیل و پرسش‌های عمیق با هوش مصنوعی (Gemini API)</span>
                </label>
                <span className="text-[11px] text-slate-400">تحلیل قطعی روان‌سنجی همواره فعال است</span>
              </div>
            </div>

            {/* Launch Assessment Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => onAnalyze(useAIEnrichment)}
                disabled={isLoading}
                className="w-full py-4 px-6 bg-gradient-to-l from-indigo-700 via-indigo-600 to-indigo-800 hover:from-indigo-800 hover:to-indigo-900 text-white font-black text-base rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>در حال ارزیابی تقاطعی، پردازش دارک‌سایدها و رسم نمودارها...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-amber-300" />
                    <span>صدور کارنامه روان‌سنجی و گزارش استراتژیک انطباق شایستگی‌ها</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* NAVIGATION CONTROLS (Footer of each step) */}
        <div className="border-t border-slate-100 pt-5 flex items-center justify-between">
          <div>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => prev - 1)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
                <span>مرحله قبل</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">
              گام {currentStep} از ۶
            </span>

            {currentStep < 6 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => prev + 1)}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>مرحله بعد</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onAnalyze(useAIEnrichment)}
                disabled={isLoading}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                <Play className="w-4 h-4" />
                <span>اجرای تحلیل نهایی</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
