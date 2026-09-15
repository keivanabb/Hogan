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
  Flame,
  ChevronDown,
  ChevronUp,
  FileCode,
  Tag,
  Zap
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

interface InputFormsProps {
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
}

export const InputForms: React.FC<InputFormsProps> = ({
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
  isLoading
}) => {
  const [useAIEnrichment, setUseAIEnrichment] = useState<boolean>(true);
  const [isScoresExpanded, setIsScoresExpanded] = useState<boolean>(false);
  const [uploadFeedback, setUploadFeedback] = useState<{
    jd?: string;
    resume?: string;
    swift?: string;
  }>({});

  const jdFileInputRef = useRef<HTMLInputElement>(null);
  const resumeFileInputRef = useRef<HTMLInputElement>(null);
  const swiftFileInputRef = useRef<HTMLInputElement>(null);

  // Derailer danger count (>70)
  const dangerDerailersCount = (Object.values(hds) as number[]).filter((v) => v >= 70).length;

  // Handle Swift Excel Upload
  const handleSwiftFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { scores, summaryText } = await parseSwiftExcel(file);
      setSwift((prev) => ({
        ...prev,
        ...scores
      }));
      setUploadFeedback((prev) => ({
        ...prev,
        swift: `فایل اکسل «${file.name}» خوانده شد: ${summaryText}`
      }));
    } catch (err: any) {
      alert(err.message || 'خطا در خواندن فایل اکسل نمرات');
    }
  };

  // Handle Job Description Word/PDF/Text Upload
  const handleJdFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      let text = '';
      if (file.name.endsWith('.docx')) {
        text = await parseWordDocument(file);
      } else {
        text = await parseTextFile(file);
      }

      setJd((prev) => ({
        ...prev,
        rawUploadedContent: text,
        // If job title is empty or default, extract first non-empty line
        jobTitle: prev.jobTitle || file.name.replace(/\.[^/.]+$/, '').replace(/[_|-]/g, ' ')
      }));

      setUploadFeedback((prev) => ({
        ...prev,
        jd: `فایل شرح شغل «${file.name}» با موفقیت بارگذاری شد (${text.length.toLocaleString('fa-IR')} کاراکتر).`
      }));
    } catch (err: any) {
      alert(err.message || 'خطا در بارگذاری فایل شرح شغل');
    }
  };

  // Handle Resume Word/PDF/Text Upload
  const handleResumeFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      let text = '';
      if (file.name.endsWith('.docx')) {
        text = await parseWordDocument(file);
      } else {
        text = await parseTextFile(file);
      }

      setResume((prev) => ({
        ...prev,
        rawUploadedContent: text,
        fullName: prev.fullName || file.name.replace(/\.[^/.]+$/, '').replace(/[_|-]/g, ' ')
      }));

      setUploadFeedback((prev) => ({
        ...prev,
        resume: `فایل رزومه «${file.name}» با موفقیت دریافت شد (${text.length.toLocaleString('fa-IR')} کاراکتر).`
      }));
    } catch (err: any) {
      alert(err.message || 'خطا در بارگذاری فایل رزومه');
    }
  };

  // Quick Load Candidate Profile (Telecom Hogan Assessment)
  const handleLoadPejmanProfile = () => {
    const defaultCandidate = sampleCaseStudies[0];
    if (defaultCandidate) {
      setJd(defaultCandidate.jd);
      setResume(defaultCandidate.resume);
      setHpi(defaultCandidate.hpi);
      setHds(defaultCandidate.hds);
      setSwift(defaultCandidate.swift);
      setUploadFeedback({
        jd: 'شرح شغل، شایستگی‌های محوری و پرونده کاندیدای ارشد بارگذاری شد.',
        resume: 'اطلاعات رزومه کاندیدای ارشد بارگذاری شد.',
        swift: 'نمرات آزمون شناختی Swift کاندیدا بارگذاری شد (صدک کل: ۸۹٪).'
      });
    }
  };

  // Add custom competency tag with a click
  const handleAddCompetencyTag = (tagText: string) => {
    setJd((prev) => {
      const current = prev.requiredCompetencies || '';
      if (current.includes(tagText)) return prev;
      const separator = current.trim() ? '، ' : '';
      return {
        ...prev,
        requiredCompetencies: `${current}${separator}${tagText}`
      };
    });
  };

  // Add custom risk tag with a click
  const handleAddRiskTag = (tagText: string) => {
    setJd((prev) => {
      const current = prev.operationalChallengesAndRisks || '';
      if (current.includes(tagText)) return prev;
      const separator = current.trim() ? '، ' : '';
      return {
        ...prev,
        operationalChallengesAndRisks: `${current}${separator}${tagText}`
      };
    });
  };

  return (
    <div className="space-y-5" id="simplified-input-forms">
      {/* Top Banner / Quick Action */}
      <div className="bg-gradient-to-l from-indigo-900 to-slate-900 text-white rounded-2xl p-5 shadow-sm border border-indigo-800/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
              دریافت چندوجهی پرونده
            </span>
            <span className="text-xs text-slate-300">
              کاندیدای فعال: <strong className="text-white">{resume.fullName || 'نامشخص'}</strong>
            </span>
          </div>
          <h2 className="text-lg font-black text-white tracking-tight">
            میز کار ارزیابی روان‌سنجی و انطباق استراتژیک
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            شما می‌توانید فایل‌های ورد شرح شغل، رزومه، و فایل اکسل نمرات Swift را به سادگی آپلود نمایید. مخاطرات این شغل نیز منحصراً توسط شما تعیین می‌گردد.
          </p>
        </div>

        <button
          type="button"
          id="btn-quick-load-pejman"
          onClick={handleLoadPejmanProfile}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md transition-all shrink-0 cursor-pointer"
        >
          <Zap className="w-4 h-4 text-slate-950 fill-slate-950" />
          <span>بارگذاری پرونده پیش‌فرض: کاندیدای ارشد (تحول دیجیتال)</span>
        </button>
      </div>

      {/* SECTION 1: Document Upload Cards (Word JD, Word Resume, Excel Swift) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-black text-slate-900">
              مرکز دریافت مستقیم فایل‌ها و اسناد (Word و Excel)
            </h3>
          </div>
          <span className="text-[11px] text-slate-500">
            فایل‌ها مستقیماً در مرورگر پردازش و استخراج می‌شوند
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Job Description Word */}
          <div className="border border-slate-200 hover:border-indigo-300 bg-slate-50/60 hover:bg-indigo-50/20 rounded-xl p-4 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded">
                  Word / Text
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 mb-1">
                ۱. فایل شرح شغل (Job Description)
              </h4>
              <p className="text-[11px] text-slate-500 leading-normal mb-3">
                فایل ورد شرح شغل (.docx) یا متنی را آپلود کنید تا محتوا و ماموریت‌ها استخراج شود.
              </p>
            </div>

            <div>
              {uploadFeedback.jd ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2 text-[11px] text-emerald-800 flex items-start gap-1.5 mb-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="truncate">{uploadFeedback.jd}</span>
                </div>
              ) : null}

              <input
                type="file"
                ref={jdFileInputRef}
                onChange={handleJdFileUpload}
                accept=".docx,.doc,.txt,.pdf"
                className="hidden"
                id="jd-file-input"
              />
              <button
                type="button"
                onClick={() => jdFileInputRef.current?.click()}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-slate-600" />
                <span>انتخاب فایل ورد شرح شغل</span>
              </button>
            </div>
          </div>

          {/* Card 2: Candidate Resume Word */}
          <div className="border border-slate-200 hover:border-indigo-300 bg-slate-50/60 hover:bg-indigo-50/20 rounded-xl p-4 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-purple-100 text-purple-700">
                  <User className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded">
                  Word / Resume
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 mb-1">
                ۲. فایل رزومه کاندیدا (CV)
              </h4>
              <p className="text-[11px] text-slate-500 leading-normal mb-3">
                فایل ورد رزومه (.docx) یا متنی کاندیدا را بارگذاری کنید تا ادعاها و سوابق ثبت شوند.
              </p>
            </div>

            <div>
              {uploadFeedback.resume ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2 text-[11px] text-emerald-800 flex items-start gap-1.5 mb-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="truncate">{uploadFeedback.resume}</span>
                </div>
              ) : null}

              <input
                type="file"
                ref={resumeFileInputRef}
                onChange={handleResumeFileUpload}
                accept=".docx,.doc,.txt,.pdf"
                className="hidden"
                id="resume-file-input"
              />
              <button
                type="button"
                onClick={() => resumeFileInputRef.current?.click()}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-slate-600" />
                <span>انتخاب فایل رزومه کاندیدا</span>
              </button>
            </div>
          </div>

          {/* Card 3: Swift Scores Excel */}
          <div className="border border-emerald-200 hover:border-emerald-400 bg-emerald-50/30 hover:bg-emerald-50/50 rounded-xl p-4 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded">
                  Excel / Swift
                </span>
              </div>
              <h4 className="text-xs font-bold text-emerald-950 mb-1">
                ۳. فایل اکسل نمرات آزمون شناختی Swift
              </h4>
              <p className="text-[11px] text-slate-600 leading-normal mb-3">
                فایل اکسل (.xlsx / .csv) امتیازات سویفت را وارد کنید تا مقادیر کلامی، عددی و صدک خودکار خوانده شوند.
              </p>
            </div>

            <div>
              {uploadFeedback.swift ? (
                <div className="bg-emerald-100/70 border border-emerald-300 rounded-lg p-2 text-[11px] text-emerald-900 flex items-start gap-1.5 mb-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                  <span className="truncate">{uploadFeedback.swift}</span>
                </div>
              ) : null}

              <input
                type="file"
                ref={swiftFileInputRef}
                onChange={handleSwiftFileUpload}
                accept=".xlsx,.xls,.csv"
                className="hidden"
                id="swift-file-input"
              />
              <button
                type="button"
                onClick={() => swiftFileInputRef.current?.click()}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold text-emerald-800 bg-white border border-emerald-300 hover:bg-emerald-50 rounded-lg shadow-2xs transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-emerald-700" />
                <span>بارگذاری فایل اکسل نمرات سویفت</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Dynamic Job Competencies (User-Specified) */}
      <div className="bg-white rounded-2xl border-2 border-indigo-200 p-5 shadow-xs relative overflow-hidden" id="custom-job-competencies-section">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-800">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">
                شایستگی‌های مورد نیاز این موقعیت شغلی (تعریف‌شده توسط ارزیاب)
              </h3>
              <p className="text-[11px] text-indigo-900 font-medium mt-0.5">
                شایستگی‌های کلیدی مورد انتظار را مشخص کنید؛ سیستم بر پایه این شایستگی‌ها سوالات مصاحبه رفتارمحور و سنجه‌های انطباق را تولید می‌کند.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Suggestion Competency Tags */}
        <div className="flex flex-wrap items-center gap-1.5 my-2.5">
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Tag className="w-3 h-3" />
            افزودن سریع شایستگی:
          </span>
          {[
            'رهبری استراتژیک و هدایت تحول کلان',
            'تصمیم‌گیری قاطع در شرایط عدم قطعیت و ابهام',
            'دیپلماسی سازمانی و حل تعارض بین‌معاونتی',
            'توانمندسازی تیم و ممانعت از فرسایش منابع انسانی',
            'تحلیل‌گری داده‌محور و اجتناب از فلج تحلیلی',
            'تاب‌آوری و کنترل هیجان در بحران‌های شبانه‌روزی',
            'انضباط رویه‌ای و رعایت چارچوب‌های حاکمیت شرکتی'
          ].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleAddCompetencyTag(tag)}
              className="text-[11px] bg-slate-100 hover:bg-indigo-100 hover:text-indigo-900 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors cursor-pointer"
            >
              + {tag}
            </button>
          ))}
        </div>

        <textarea
          id="textarea-job-competencies"
          value={jd.requiredCompetencies || ''}
          onChange={(e) =>
            setJd((prev) => ({
              ...prev,
              requiredCompetencies: e.target.value
            }))
          }
          rows={3}
          placeholder="شایستگی‌های مورد نیاز این موقعیت شغلی را اینجا وارد نمایید (مثال: رهبری مقتدر، تصمیم‌گیری چابک در ابهام، ارتباط سازنده با معاونت‌های موازی، حفظ انگیزه و صیانت از تیم در شیفت‌های ۲۴ ساعته)..."
          className="w-full text-xs text-slate-800 bg-indigo-50/40 border border-indigo-300 rounded-xl p-3 focus:bg-white focus:outline-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all placeholder:text-slate-400 leading-relaxed"
        />

        {/* Secondary Collapsible: Operational Challenges (Optional) */}
        <div className="mt-3 pt-3 border-t border-slate-100">
          <details className="group">
            <summary className="text-[11px] font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 cursor-pointer select-none">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>ثبت مخاطرات و چالش‌های بحرانی محیط کار (اختیاری)</span>
              <ChevronDown className="w-3.5 h-3.5 group-open:rotate-180 transition-transform" />
            </summary>
            <div className="mt-2 space-y-2">
              <p className="text-[11px] text-slate-500">
                در صورت تمایل، می‌توانید ریسک‌ها و مخاطرات ویژه این شغل را نیز تعیین کنید:
              </p>
              <textarea
                id="textarea-job-challenges"
                value={jd.operationalChallengesAndRisks || ''}
                onChange={(e) =>
                  setJd((prev) => ({
                    ...prev,
                    operationalChallengesAndRisks: e.target.value
                  }))
                }
                rows={2}
                placeholder="مخاطرات خاص این شغل (مثال: اصطکاک با رگولاتوری، ریسک جریمه تاخیر SLA)..."
                className="w-full text-xs text-slate-800 bg-amber-50/30 border border-amber-200 rounded-xl p-2.5 focus:bg-white focus:outline-amber-600 transition-all placeholder:text-slate-400"
              />
            </div>
          </details>
        </div>
      </div>

      {/* SECTION 3: Essential Job & Candidate Info (Simplified 2-Column Grid) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Column 1: Job Meta */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 border-b border-slate-100 pb-2">
              <Briefcase className="w-4 h-4 text-indigo-600" />
              <span>مشخصات موقعیت شغلی هدف</span>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                عنوان موقعیت شغلی:
              </label>
              <input
                type="text"
                value={jd.jobTitle}
                onChange={(e) => setJd((prev) => ({ ...prev, jobTitle: e.target.value }))}
                className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white focus:outline-indigo-600"
                placeholder="مثلاً: مدیر ارشد پروژه‌های استراتژیک"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  معاونت / دپارتمان:
                </label>
                <input
                  type="text"
                  value={jd.department || ''}
                  onChange={(e) => setJd((prev) => ({ ...prev, department: e.target.value }))}
                  className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white focus:outline-indigo-600"
                  placeholder="معاونت دیجیتال"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  صنعت / حوزه:
                </label>
                <input
                  type="text"
                  value={jd.industry || ''}
                  onChange={(e) => setJd((prev) => ({ ...prev, industry: e.target.value }))}
                  className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white focus:outline-indigo-600"
                  placeholder="تلکام و فناوری"
                />
              </div>
            </div>
          </div>

          {/* Column 2: Candidate Meta */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 border-b border-slate-100 pb-2">
              <User className="w-4 h-4 text-purple-600" />
              <span>مشخصات کاندیدا</span>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                نام و نام خانوادگی:
              </label>
              <input
                type="text"
                value={resume.fullName}
                onChange={(e) => setResume((prev) => ({ ...prev, fullName: e.target.value }))}
                className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white focus:outline-indigo-600 font-bold"
                placeholder="مثال: کاندیدای ارشد (یا نام داوطلب)"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  نقش فعلی:
                </label>
                <input
                  type="text"
                  value={resume.currentRole}
                  onChange={(e) => setResume((prev) => ({ ...prev, currentRole: e.target.value }))}
                  className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white focus:outline-indigo-600"
                  placeholder="مدیر توسعه محصول"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  سابقه کار (سال):
                </label>
                <input
                  type="number"
                  value={resume.experienceYears}
                  onChange={(e) =>
                    setResume((prev) => ({ ...prev, experienceYears: parseInt(e.target.value) || 0 }))
                  }
                  className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white focus:outline-indigo-600"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: Psychometric Scores Overview (Clean, Compact, Expandable) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <h3 className="text-sm font-black text-slate-900">
              امتیازات آزمون‌های هوگان (HDS و HPI) و شناختی Swift
            </h3>
            {dangerDerailersCount > 0 ? (
              <span className="bg-rose-100 text-rose-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
                {dangerDerailersCount} دارک‌ساید در محدوده بحرانی (&gt;۷۰٪)
              </span>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => setIsScoresExpanded(!isScoresExpanded)}
            className="text-xs text-indigo-700 font-bold hover:text-indigo-900 flex items-center gap-1 cursor-pointer"
          >
            <span>{isScoresExpanded ? 'بستن تنظیمات جزییات نمرات' : 'مشاهده و ویرایش نمرات'}</span>
            {isScoresExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Quick badges preview when collapsed */}
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 flex items-center gap-2">
            <span className="text-slate-500 text-[11px]">شناختی Swift:</span>
            <span className="font-black text-cyan-700">{swift.overallPercentile}٪ کل</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-600 text-[11px]">عددی: {swift.numericalReasoning}٪</span>
            <span className="text-slate-600 text-[11px]">انتزاعی: {swift.abstractReasoning}٪</span>
            <span className="text-slate-600 text-[11px]">کلامی: {swift.verbalReasoning}٪</span>
          </div>

          <div className="bg-rose-50 border border-rose-200 rounded-xl px-3 py-2 flex items-center gap-2">
            <span className="text-rose-800 text-[11px] font-bold">دارک‌سایدهای HDS:</span>
            <span className="text-rose-700 text-[11px]">
              شکاک: <strong>{hds.skeptical}٪</strong>
            </span>
            <span className="text-rose-700 text-[11px]">
              محتاط: <strong>{hds.cautious}٪</strong>
            </span>
            <span className="text-rose-700 text-[11px]">
              تحریک‌پذیر: <strong>{hds.excitable}٪</strong>
            </span>
            <span className="text-rose-700 text-[11px]">
              تظاهرگرا: <strong>{hds.colorful}٪</strong>
            </span>
          </div>

          <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-3 py-2 flex items-center gap-2">
            <span className="text-indigo-800 text-[11px] font-bold">نقاط کلیدی HPI:</span>
            <span className="text-indigo-700 text-[11px]">کنجکاوی: <strong>{hpi.inquisitive}٪</strong></span>
            <span className="text-indigo-700 text-[11px]">یادگیری: <strong>{hpi.learningApproach}٪</strong></span>
            <span className="text-amber-800 text-[11px] font-bold">جاه‌طلبی: <strong>{hpi.ambition}٪</strong></span>
            <span className="text-amber-800 text-[11px] font-bold">انضباط رویه‌ای: <strong>{hpi.prudence}٪</strong></span>
          </div>
        </div>

        {/* Expanded detailed sliders / number inputs */}
        {isScoresExpanded && (
          <div className="mt-4 pt-4 border-t border-slate-100 space-y-4">
            {/* HDS Sliders */}
            <div>
              <h4 className="text-xs font-bold text-rose-800 mb-2 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-rose-600" />
                <span>نمرات دارک‌ساید HDS (مقادیر بالای ۷۰٪ نشانگر ریسک حاد در شرایط بحرانی هستند)</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {[
                  { key: 'excitable', label: 'تحریک‌پذیر (Excitable)', val: hds.excitable },
                  { key: 'skeptical', label: 'شکاک (Skeptical)', val: hds.skeptical },
                  { key: 'cautious', label: 'محتاط (Cautious)', val: hds.cautious },
                  { key: 'reserved', label: 'خوددار (Reserved)', val: hds.reserved },
                  { key: 'leisurely', label: 'آسوده (Leisurely)', val: hds.leisurely },
                  { key: 'bold', label: 'متهور (Bold)', val: hds.bold },
                  { key: 'mischievous', label: 'ناسازگار (Mischievous)', val: hds.mischievous },
                  { key: 'colorful', label: 'تظاهرگرا (Colorful)', val: hds.colorful },
                  { key: 'imaginative', label: 'تخیل‌گرا (Imaginative)', val: hds.imaginative },
                  { key: 'diligent', label: 'کوشا (Diligent)', val: hds.diligent },
                  { key: 'dutiful', label: 'مطیع (Dutiful)', val: hds.dutiful }
                ].map((item) => (
                  <div
                    key={item.key}
                    className={`p-2.5 rounded-lg border text-xs ${
                      item.val >= 70
                        ? 'bg-rose-50 border-rose-300 text-rose-900 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px]">{item.label}</span>
                      <span className={item.val >= 70 ? 'text-rose-700' : 'text-slate-600'}>
                        {item.val}٪
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={item.val}
                      onChange={(e) =>
                        setHds((prev) => ({
                          ...prev,
                          [item.key]: parseInt(e.target.value) || 0
                        }))
                      }
                      className="w-full accent-rose-600 h-1.5 cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* HPI Sliders */}
            <div>
              <h4 className="text-xs font-bold text-indigo-900 mb-2">
                نمرات شخصیت بهنجار HPI
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { key: 'adjustment', label: 'سازگاری (Adjustment)', val: hpi.adjustment },
                  { key: 'ambition', label: 'جاه‌طلبی (Ambition)', val: hpi.ambition },
                  { key: 'sociability', label: 'جامعه‌پذیری (Sociability)', val: hpi.sociability },
                  { key: 'interpersonalSensitivity', label: 'حساسیت بین‌فردی', val: hpi.interpersonalSensitivity },
                  { key: 'prudence', label: 'مسئولیت‌پذیری (Prudence)', val: hpi.prudence },
                  { key: 'inquisitive', label: 'کنجکاوی (Inquisitive)', val: hpi.inquisitive },
                  { key: 'learningApproach', label: 'رویکرد یادگیری', val: hpi.learningApproach }
                ].map((item) => (
                  <div key={item.key} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] text-slate-700">{item.label}</span>
                      <span className="font-bold text-indigo-700">{item.val}٪</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={item.val}
                      onChange={(e) =>
                        setHpi((prev) => ({
                          ...prev,
                          [item.key]: parseInt(e.target.value) || 0
                        }))
                      }
                      className="w-full accent-indigo-600 h-1.5 cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 5: Action Bottom Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={useAIEnrichment}
              onChange={(e) => setUseAIEnrichment(e.target.checked)}
              className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
            />
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              فعال‌سازی هوش مصنوعی (Gemini) جهت تحلیل عمیق روایی و سناریوهای BEI
            </span>
          </label>
        </div>

        <button
          type="button"
          id="btn-run-analysis"
          onClick={() => onAnalyze(useAIEnrichment)}
          disabled={isLoading}
          className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black text-white shadow-md transition-all cursor-pointer ${
            isLoading
              ? 'bg-slate-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-200'
          }`}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>در حال پردازش داده‌ها و ارزیابی دارک‌سایدها...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              <span>اجرای تحلیل جامع و تولید کارنامه استراتژیک</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
