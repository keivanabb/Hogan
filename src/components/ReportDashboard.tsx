import React, { useState } from 'react';
import {
  Award,
  AlertTriangle,
  Download,
  Printer,
  Copy,
  Check,
  BookmarkPlus,
  Brain,
  ShieldAlert,
  HelpCircle,
  FileCheck,
  Flame,
  ArrowUpRight,
  TrendingDown,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Target,
  Eye
} from 'lucide-react';
import { AssessmentReport, BEIQuestion, CompetencyQuestion, HoganValidationQuestion, IntersectionAnalysis } from '../types/assessment';
import { VisualCharts } from './VisualCharts';

interface ReportDashboardProps {
  report: AssessmentReport;
  onExportHTML: () => void;
  onSaveToPipeline: (report: AssessmentReport) => void;
  isSaved?: boolean;
  aiSource?: 'full-ai' | 'deterministic';
  savedReports?: AssessmentReport[];
}

export const ReportDashboard: React.FC<ReportDashboardProps> = ({
  report,
  onExportHTML,
  onSaveToPipeline,
  isSaved = false,
  aiSource = 'deterministic',
  savedReports = []
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'competencies' | 'hoganValidation' | 'intersections' | 'charts' | 'discrepancies' | 'bei' | 'onboarding'
  >('overview');

  const [copiedQuestionId, setCopiedQuestionId] = useState<string | null>(null);
  const [copiedFullReport, setCopiedFullReport] = useState<boolean>(false);

  const riskColor = report.overallRiskLevel.includes('غیرقابل') || report.overallRiskLevel.includes('بسیار')
    ? 'text-rose-700 bg-rose-50 border-rose-200'
    : report.overallRiskLevel.includes('بالا')
    ? 'text-orange-700 bg-orange-50 border-orange-200'
    : report.overallRiskLevel.includes('متوسط')
    ? 'text-amber-700 bg-amber-50 border-amber-200'
    : 'text-emerald-700 bg-emerald-50 border-emerald-200';

  const handleCopyQuestion = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedQuestionId(id);
    setTimeout(() => setCopiedQuestionId(null), 2500);
  };

  const handleCopyFullText = () => {
    const text = `گزارش ارزیابی روان‌سنجی کاندیدا: ${report.candidateName}
موقعیت هدف: ${report.targetJobTitle}
شاخص انطباق: ${report.overallFitScore} از ۱۰۰
سطح ریسک: ${report.overallRiskLevel}

خلاصه اجرایی:
${report.executiveSummary}

تعداد الگوهای بحرانی تقاطع: ${report.intersections.length}
`;
    navigator.clipboard.writeText(text);
    setCopiedFullReport(true);
    setTimeout(() => setCopiedFullReport(false), 2500);
  };

  return (
    <div className="space-y-6" id="report-dashboard-root">
      {/* Executive Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md">
                تاریخ ارزیابی: {report.date}
              </span>
              {aiSource === 'full-ai' ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-md">
                  <Sparkles className="w-3 h-3" />
                  تقویت‌شده با هوش مصنوعی (Gemini AI)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-0.5 rounded-md">
                  موتور تحلیلی قطعی (Deterministic Psychometrics)
                </span>
              )}
            </div>

            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              کارنامه ارزیابی استراتژیک: {report.candidateName}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              موقعیت هدف: <span className="font-semibold text-slate-800">{report.targetJobTitle}</span> ({report.jobDescription.department})
            </p>
          </div>

          {/* Action Tools */}
          <div className="flex flex-wrap items-center gap-2 no-print">
            <button
              id="btn-export-html-dashboard"
              onClick={onExportHTML}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl transition-colors cursor-pointer"
              title="دریافت فایل مستقل HTML با تایپوگرافی وزیرمتن و طراحی واکنشی"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span>دریافت فایل کامل HTML مستقل</span>
            </button>

            <button
              id="btn-print-dashboard"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>چاپ / PDF</span>
            </button>

            <button
              id="btn-copy-summary"
              onClick={handleCopyFullText}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors cursor-pointer"
            >
              {copiedFullReport ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
              <span>{copiedFullReport ? 'کپی شد' : 'کپی خلاصه'}</span>
            </button>

            <button
              id="btn-save-to-pipeline"
              onClick={() => onSaveToPipeline(report)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
                isSaved
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
              }`}
            >
              <BookmarkPlus className="w-4 h-4" />
              <span>{isSaved ? 'در پایپ‌لاین ذخیره است' : 'ذخیره در آرشیو'}</span>
            </button>
          </div>
        </div>

        {/* User-Specified Competencies Banner */}
        {report.jobDescription.requiredCompetencies && (
          <div className="mt-4 p-3.5 bg-indigo-50/90 border border-indigo-200 rounded-xl text-xs flex items-start gap-2.5">
            <Target className="w-4 h-4 text-indigo-700 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold text-indigo-950">
                شایستگی‌های کلیدی مورد نیاز این موقعیت شغلی (تعریف‌شده توسط ارزیاب):
              </span>
              <p className="text-indigo-900 leading-relaxed mt-0.5 font-medium">
                {report.jobDescription.requiredCompetencies}
              </p>
            </div>
          </div>
        )}

        {/* User-Specified Operational Challenges Banner */}
        {report.jobDescription.operationalChallengesAndRisks && (
          <div className="mt-2.5 p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold text-amber-950">
                مخاطرات و چالش‌های بحرانی شغل:
              </span>
              <p className="text-amber-900 leading-relaxed mt-0.5">
                {report.jobDescription.operationalChallengesAndRisks}
              </p>
            </div>
          </div>
        )}

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
          <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4">
            <span className="text-xs text-slate-500 font-medium">شاخص انطباق کل (Fit Index)</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-black text-slate-900">{report.overallFitScore}</span>
              <span className="text-xs text-slate-400">از ۱۰۰</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2.5 overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full"
                style={{ width: `${report.overallFitScore}%` }}
              ></div>
            </div>
          </div>

          <div className={`border rounded-xl p-4 ${riskColor}`}>
            <span className="text-xs font-semibold opacity-80">سطح ریسک استراتژیک و دارک‌سایدها</span>
            <div className="text-sm font-black mt-2 leading-tight">
              {report.overallRiskLevel}
            </div>
            <div className="text-[11px] opacity-75 mt-1">
              {report.intersections.length} الگوی بحرانی شناسایی شد
            </div>
          </div>

          <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4">
            <span className="text-xs text-slate-500 font-medium">ظرفیت شناختی Swift</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-black text-cyan-700">{report.swift.overallPercentile}</span>
              <span className="text-xs text-slate-400">صدک کشوری</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              الگو: {report.swift.speedVsAccuracy}
            </span>
          </div>

          <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4">
            <span className="text-xs text-slate-500 font-medium">دارک‌سایدهای منطقه قرمز (&gt;۷۰٪)</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-black text-rose-600">
                {(Object.values(report.hds) as number[]).filter((v) => v >= 70).length}
              </span>
              <span className="text-xs text-slate-400">صفت پرخطر از ۱۱</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              پایش مداوم در ساعات فشار SLA
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs Bar */}
      <div className="border-b border-slate-200 bg-white rounded-xl p-1.5 shadow-xs flex flex-wrap gap-1 no-print">
        <button
          type="button"
          id="btn-tab-overview"
          onClick={() => setActiveTab('overview')}
          className={`px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          📋 خلاصه اجرایی
        </button>

        <button
          type="button"
          id="btn-tab-competencies"
          onClick={() => setActiveTab('competencies')}
          className={`px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'competencies'
              ? 'bg-indigo-700 text-white shadow-xs'
              : 'text-indigo-700 hover:bg-indigo-50'
          }`}
        >
          <Target className="w-3.5 h-3.5" />
          <span>سوالات شایستگی‌محور شغل ({report.competencyQuestions?.length || 0})</span>
        </button>

        <button
          type="button"
          id="btn-tab-hogan-validation"
          onClick={() => setActiveTab('hoganValidation')}
          className={`px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'hoganValidation'
              ? 'bg-rose-700 text-white shadow-xs'
              : 'text-rose-700 hover:bg-rose-50'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>اعتبارسنجی صفات هوگان در مصاحبه ({report.hoganValidationQuestions?.length || 0})</span>
        </button>

        <button
          type="button"
          id="btn-tab-bei"
          onClick={() => setActiveTab('bei')}
          className={`px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'bei'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'text-purple-700 hover:bg-purple-50'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>مصاحبه معکوس BEI ({report.beiInterviewGuide.length})</span>
        </button>

        <button
          type="button"
          id="btn-tab-intersections"
          onClick={() => setActiveTab('intersections')}
          className={`px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'intersections'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-amber-700 hover:bg-amber-50'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>تقاطع‌های بحرانی ({report.intersections.length})</span>
        </button>

        <button
          type="button"
          id="btn-tab-charts"
          onClick={() => setActiveTab('charts')}
          className={`px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'charts'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <span>🕸️ نمودارهای راداری و اینفوگرافیک</span>
        </button>

        <button
          type="button"
          id="btn-tab-discrepancies"
          onClick={() => setActiveTab('discrepancies')}
          className={`px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'discrepancies'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          🔍 شکاف رزومه ({report.claimDiscrepancies.length})
        </button>

        <button
          type="button"
          id="btn-tab-onboarding"
          onClick={() => setActiveTab('onboarding')}
          className={`px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'onboarding'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          🛡️ طرح آنبوردینگ
        </button>
      </div>

      {/* VIEW 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 pb-3 mb-4 border-b border-slate-100 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-indigo-600" />
              رای کارشناسی روان‌شناس صنعتی-سازمانی و خلاصه اجرایی
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed font-normal whitespace-pre-line">
              {report.executiveSummary}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-600"></span>
                انطباق استراتژیک و پایداری فرهنگی در اکوسیستم تلکام
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                {report.strategicCulturalFit}
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
                چکیده وضعیت دارک‌سایدها و نقاط بحران
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                {report.darkSideDerailersSummary}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: COMPETENCY-BASED INTERVIEW QUESTIONS */}
      {activeTab === 'competencies' && (
        <div className="space-y-4">
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-xs text-indigo-950 flex items-start gap-3">
            <Target className="w-5 h-5 text-indigo-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">راهنمای سوالات شایستگی‌محور شغل (STAR Competency Probing):</span>
              <p className="mt-1 leading-relaxed text-indigo-900">
                این سوالات دقیقاً بر مبنای شایستگی‌های اعلام‌شده برای این موقعیت شغلی تنظیم شده‌اند. در جلسه مصاحبه از کاندیدا بخواهید نمونه‌های واقعی گذشته (Situation, Task, Action, Result) را شرح دهد و از پاسخ‌های کلی‌گویی و تئوریک عبور کنید.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {(report.competencyQuestions || []).map((cq, idx) => (
              <div
                key={cq.id || idx}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black bg-indigo-50 text-indigo-800 border border-indigo-200 px-3 py-1 rounded-lg flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-indigo-600" />
                      <span>شایستگی #{idx + 1}: {cq.competencyName}</span>
                    </span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                      cq.importanceLevel === 'حیاتی'
                        ? 'bg-rose-100 text-rose-800'
                        : cq.importanceLevel === 'بسیار مهم'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      اولویت: {cq.importanceLevel}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopyQuestion(cq.exactQuestion, cq.id)}
                    className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                  >
                    {copiedQuestionId === cq.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedQuestionId === cq.id ? 'کپی شد' : 'کپی سوال اصلی'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="font-bold text-slate-900 block mb-1">سناریو و بافت سازمانی:</span>
                    <p className="text-slate-700">{cq.scenario}</p>
                  </div>
                  <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
                    <span className="font-bold text-indigo-950 block mb-1">شاخص‌های رفتاری مورد انتظار:</span>
                    <p className="text-indigo-900">{cq.behavioralIndicators}</p>
                  </div>
                </div>

                <div className="bg-indigo-50/70 border-r-4 border-indigo-600 p-4 rounded-l-xl">
                  <div className="text-[11px] font-bold text-indigo-900 mb-1">سوال اصلی رفتارمحور برای طرح توسط مصاحبه‌کننده:</div>
                  <div className="text-sm font-black text-slate-900 leading-relaxed">
                    «{cq.exactQuestion}»
                  </div>
                </div>

                {/* Follow-up Probe */}
                {cq.probingFollowUp && (
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                    <span className="font-bold text-slate-800 block mb-1">
                      سوال پیگیری و تعمیق برای راستی‌آزمایی نقش واقعی کاندیدا:
                    </span>
                    <p className="text-slate-700 font-medium">«{cq.probingFollowUp}»</p>
                  </div>
                )}

                {/* Evidence Flags */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-950">
                    <span className="font-bold text-emerald-800 flex items-center gap-1 mb-2">
                      <Check className="w-4 h-4 text-emerald-600" />
                      شواهد رفتاری مثبت (Green Flags):
                    </span>
                    <ul className="space-y-1.5 list-disc list-inside text-slate-700">
                      {cq.positiveEvidence.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-rose-50/60 border border-rose-200 rounded-xl p-3.5 text-xs text-rose-950">
                    <span className="font-bold text-rose-800 flex items-center gap-1 mb-2">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      شواهد رفتاری منفی و ریسک‌ها (Red Flags):
                    </span>
                    <ul className="space-y-1.5 list-disc list-inside text-slate-700">
                      {cq.negativeEvidence.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="text-[11px] bg-slate-100/70 p-2.5 rounded-lg text-slate-700 border border-slate-200">
                  <span className="font-bold text-slate-900">راهنمای نمره‌دهی شایستگی: </span>
                  {cq.scoringGuide}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3: HOGAN TRAIT VALIDATION INTERVIEW QUESTIONS */}
      {activeTab === 'hoganValidation' && (
        <div className="space-y-4">
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-xs text-rose-950 flex items-start gap-3">
            <Eye className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">هدف از پرسش‌های اعتبارسنجی صفات هوگان در مصاحبه (Hogan In-Person Reality Check):</span>
              <p className="mt-1 leading-relaxed text-rose-900">
                این سوالات دقیقاً بر مبنای تحلیل روان‌سنجی هوگان کاندیدا طراحی شده‌اند تا در طول مصاحبه ارزیابی کنید: آیا یافته‌های آزمون (نظیر دارک‌سایدها یا نمرات خاص HPI) در رفتار کاندیدا دیده می‌شوند؟ یا اینکه فرد خودآگاهی کامل دارد و توانسته رفتارهای جبرانی اثربخش ایجاد کند؟
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {(report.hoganValidationQuestions || []).map((hv, idx) => (
              <div
                key={hv.id || idx}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black bg-rose-50 text-rose-800 border border-rose-200 px-3 py-1 rounded-lg">
                      {hv.scaleType}: {hv.traitOrDerailer}
                    </span>
                    <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded">
                      نمره آزمون: {hv.testScore}٪
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopyQuestion(hv.primaryQuestion, hv.id)}
                    className="inline-flex items-center gap-1 text-xs text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                  >
                    {copiedQuestionId === hv.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedQuestionId === hv.id ? 'کپی شد' : 'کپی سوال اعتبارسنجی'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="font-bold text-slate-900 block mb-1">یافته و فرضیه روان‌سنجی بر اساس نمره آزمون:</span>
                    <p className="text-slate-700">{hv.hypothesis}</p>
                  </div>
                  <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-200 text-amber-950">
                    <span className="font-bold text-amber-900 block mb-1">هدف ارزیاب از راستی‌آزمایی در جلسه مصاحبه:</span>
                    <p className="text-amber-800">{hv.validationObjective}</p>
                  </div>
                </div>

                {/* Primary Validation Question */}
                <div className="bg-rose-50/70 border-r-4 border-rose-600 p-4 rounded-l-xl">
                  <div className="text-[11px] font-bold text-rose-900 mb-1">سوال اصلی برای سنجش خودآگاهی و مکانیسم جبرانی:</div>
                  <div className="text-sm font-black text-slate-900 leading-relaxed">
                    «{hv.primaryQuestion}»
                  </div>
                </div>

                {/* Pressure Probe Question */}
                <div className="bg-amber-50/60 border-r-4 border-amber-600 p-4 rounded-l-xl">
                  <div className="text-[11px] font-bold text-amber-900 mb-1">سوال تعقیبی در شرایط فشار و چالش (Stress Probe):</div>
                  <div className="text-xs font-bold text-slate-800 leading-relaxed">
                    «{hv.stressProbeQuestion}»
                  </div>
                </div>

                {/* Flags Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-950">
                    <span className="font-bold text-emerald-800 flex items-center gap-1 mb-2">
                      <Check className="w-4 h-4 text-emerald-600" />
                      نشانه‌های رد فرضیه یا وجود رفتارهای جبرانی بالغ (Compensated):
                    </span>
                    <ul className="space-y-1.5 list-disc list-inside text-slate-700">
                      {hv.signsFalseOrCompensated.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-rose-50/60 border border-rose-200 rounded-xl p-3.5 text-xs text-rose-950">
                    <span className="font-bold text-rose-800 flex items-center gap-1 mb-2">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      نشانه‌های تایید فرضیه در مصاحبه (دیده‌شدن دارک‌ساید در رفتار):
                    </span>
                    <ul className="space-y-1.5 list-disc list-inside text-slate-700">
                      {hv.signsTrueInInterview.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="text-[11px] bg-slate-100/70 p-2.5 rounded-lg text-slate-700 border border-slate-200">
                  <span className="font-bold text-slate-900">راهنمای نتیجه‌گیری ارزیاب پس از شنیدن پاسخ: </span>
                  {hv.ratingVerdictPrompt}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 2: INTERSECTIONS MATRIX */}
      {activeTab === 'intersections' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">منطق تفکر تقاطعی (Intersection Thinking Model):</span>
              <p className="mt-1 leading-relaxed">
                صفات رفتاری در شرایط بحرانی به صورت مستقل عمل نمی‌کنند؛ بلکه در ترکیب با توانمندی‌های شناختی و استرس‌های محیطی تلکام، گلوگاه‌های مرگبار تصمیم‌گیری ایجاد می‌نمایند.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {report.intersections.map((item, idx) => (
              <div
                key={item.id || idx}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-xs font-bold text-slate-400 ml-2">#{idx + 1}</span>
                    <span className="text-sm font-black text-slate-900">{item.title}</span>
                  </div>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                      item.severity.includes('قرمز')
                        ? 'bg-rose-100 text-rose-800'
                        : item.severity.includes('نارنجی')
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    شدت: {item.severity}
                  </span>
                </div>

                <div className="text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-slate-700">
                  <span className="font-bold text-indigo-700 ml-1">فرمول تقاطع داده‌ها:</span>
                  {item.metricsFormula}
                </div>

                <p className="text-xs text-slate-700 leading-relaxed">
                  {item.description}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                  <div className="bg-rose-50/50 p-3 rounded-lg border border-rose-100">
                    <span className="block text-[11px] font-bold text-rose-800 mb-1">
                      اثر عملیاتی بر پایداری SLA و شبکه:
                    </span>
                    <p className="text-xs text-slate-700">{item.operationalImpact}</p>
                  </div>

                  <div className="bg-orange-50/50 p-3 rounded-lg border border-orange-100">
                    <span className="block text-[11px] font-bold text-orange-800 mb-1">
                      پیامد تعارض بین‌معاونتی:
                    </span>
                    <p className="text-xs text-slate-700">{item.interUnitImpact}</p>
                  </div>

                  <div className="bg-purple-50/50 p-3 rounded-lg border border-purple-100">
                    <span className="block text-[11px] font-bold text-purple-800 mb-1">
                      آسیب به تیم و نرخ فرسایش:
                    </span>
                    <p className="text-xs text-slate-700">{item.teamImpact}</p>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 pt-1">
                  <span className="font-semibold text-slate-700">محرک فعال‌کننده در بحران:</span> {item.crisisTrigger}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3: PSYCHOMETRIC CHARTS */}
      {activeTab === 'charts' && (
        <VisualCharts
          hpi={report.hpi}
          hds={report.hds}
          swift={report.swift}
          candidateName={report.candidateName}
          targetJobTitle={report.targetJobTitle}
          savedReports={savedReports}
        />
      )}

      {/* VIEW 4: CV VS REALITY DISCREPANCIES */}
      {activeTab === 'discrepancies' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">
              جدول اعتبارسنجی و واکاوی شکاف ادعاهای رزومه در برابر حقیقت روان‌سنجی
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              مقایسه بی‌طرفانه آنچه کاندیدا در رزومه ادعا کرده با ظرفیت‌های روانی و شناختی واقعی.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 border-b border-slate-200">
                  <th className="p-3 font-bold">ادعای کلیدی در رزومه</th>
                  <th className="p-3 font-bold">یافته عینی آزمون‌های روان‌سنجی</th>
                  <th className="p-3 font-bold">قضاوت کارشناسی</th>
                  <th className="p-3 font-bold">تحلیل ریسک سازمانی</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {report.claimDiscrepancies.map((c, i) => (
                  <tr key={i} className="hover:bg-slate-50/70">
                    <td className="p-3 font-semibold text-slate-800">
                      {c.claim}
                      <span className="block text-[10px] text-slate-400 mt-0.5">{c.source}</span>
                    </td>
                    <td className="p-3 text-slate-600 leading-relaxed">{c.psychometricReality}</td>
                    <td className="p-3">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          c.verdict.includes('بحرانی')
                            ? 'bg-rose-100 text-rose-800'
                            : c.verdict.includes('اغراق')
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {c.verdict}
                      </span>
                    </td>
                    <td className="p-3 text-slate-700 leading-relaxed">{c.riskAnalysis}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 5: BEI REVERSE-ENGINEERED INTERVIEW GUIDE */}
      {activeTab === 'bei' && (
        <div className="space-y-4">
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-xs text-indigo-950">
            <span className="font-bold">راهنمای استفاده از مصاحبه رفتارمحور معکوس (BEI):</span>
            <p className="mt-1 leading-relaxed">
              این سوالات برای تحریک اختصاصی دارک‌سایدهای کاندیدا در فضای مصاحبه استراتژیک طراحی شده‌اند. سناریوها به گونه‌ای تنظیم شده‌اند که فرد بین دو ارزش مطلوب سازمانی دچار تضاد منافع شود تا سبک دفاعی واقعی وی آشکار گردد.
            </p>
          </div>

          <div className="space-y-4">
            {report.beiInterviewGuide.map((q, idx) => (
              <div
                key={q.id || idx}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-1 rounded-lg">
                      تارگت دارک‌ساید: {q.targetDerailer}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">{q.category}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopyQuestion(q.exactQuestion, q.id)}
                    className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                  >
                    {copiedQuestionId === q.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedQuestionId === q.id ? 'کپی شد' : 'کپی متن سوال'}</span>
                  </button>
                </div>

                <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                  <div>
                    <span className="font-bold text-slate-900">سناریوی شبیه‌سازی بحران در تلکام: </span>
                    {q.scenario}
                  </div>
                  <div className="text-amber-800 pt-1">
                    <span className="font-bold">تضاد منافع تعبیه‌شده: </span>
                    {q.conflictOfInterests}
                  </div>
                </div>

                <div className="bg-indigo-50/70 border-r-4 border-indigo-600 p-4 rounded-l-xl">
                  <div className="text-[11px] font-bold text-indigo-900 mb-1">سوال دقیق برای طرح توسط مصاحبه‌کننده:</div>
                  <div className="text-sm font-black text-slate-900 leading-relaxed">
                    «{q.exactQuestion}»
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-950">
                    <span className="font-bold text-emerald-800 flex items-center gap-1 mb-2">
                      <Check className="w-4 h-4 text-emerald-600" />
                      نشانه‌های سبز و پاسخ‌های مطلوب (Look-Fors):
                    </span>
                    <ul className="space-y-1.5 list-disc list-inside text-slate-700">
                      {q.lookFors.greenFlags.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-rose-50/60 border border-rose-200 rounded-xl p-3.5 text-xs text-rose-950">
                    <span className="font-bold text-rose-800 flex items-center gap-1 mb-2">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      علائم خطر و واکنش‌های مخرب (Red Flags):
                    </span>
                    <ul className="space-y-1.5 list-disc list-inside text-slate-700">
                      {q.lookFors.redFlags.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="text-[11px] bg-slate-100/70 p-2.5 rounded-lg text-slate-600 border border-slate-200">
                  <span className="font-bold text-slate-800">سنجه نمره‌دهی مصاحبه: </span>
                  {q.evaluationRubric}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 6: ONBOARDING SAFEGUARDS */}
      {activeTab === 'onboarding' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-emerald-600" />
              پروتکل صیانت و مهار ریسک‌های دارک‌ساید در صورت تصمیم به استخدام
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              اقدامات کنترلی و خطوط حائل سازمانی برای جلوگیری از فعال شدن رفتارهای مخرب در ۶ ماهه اول خدمت.
            </p>
          </div>

          <div className="space-y-3">
            {report.onboardingSafeguards.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800"
              >
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <div className="leading-relaxed font-medium">{item}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
