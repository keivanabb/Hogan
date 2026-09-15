import React, { useState } from 'react';
import {
  Briefcase,
  Users,
  FileText,
  RotateCcw,
  Plus,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Download,
  Calendar,
  Layers,
  Sparkles,
  Building,
  Search,
  Filter,
  Trash2,
  FolderOpen,
  Award,
  Eye
} from 'lucide-react';
import { AssessmentReport } from '../types/assessment';
import { JobPosition, TeamMember } from '../types/workspace';

interface JobWorkspaceHubProps {
  positions: JobPosition[];
  activePosition: JobPosition;
  onSelectPosition: (pos: JobPosition) => void;
  onCreatePosition: (newPos: JobPosition) => void;
  savedReports: AssessmentReport[];
  onSelectReport: (report: AssessmentReport) => void;
  onDeleteReport: (id: string) => void;
  onStartNewAssessmentForPosition: (pos: JobPosition) => void;
  currentMember: TeamMember | null;
  onOpenLogin: () => void;
  onExportHTMLReport?: (report: AssessmentReport) => void;
}

export const JobWorkspaceHub: React.FC<JobWorkspaceHubProps> = ({
  positions,
  activePosition,
  onSelectPosition,
  onCreatePosition,
  savedReports,
  onSelectReport,
  onDeleteReport,
  onStartNewAssessmentForPosition,
  currentMember,
  onOpenLogin,
  onExportHTMLReport
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showOnlyActivePosition, setShowOnlyActivePosition] = useState<boolean>(true);
  const [isCreatingPosition, setIsCreatingPosition] = useState<boolean>(false);

  // New Position Form State
  const [newTitle, setNewTitle] = useState<string>('');
  const [newDept, setNewDept] = useState<string>('');
  const [newDesc, setNewDesc] = useState<string>('');
  const [newCompetencies, setNewCompetencies] = useState<string>('');

  // Filter reports
  const filteredReports = savedReports.filter((rep) => {
    const matchesSearch =
      rep.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rep.targetJobTitle.toLowerCase().includes(searchTerm.toLowerCase());

    if (!showOnlyActivePosition) return matchesSearch;

    // Filter by active position title similarity or exact match
    const matchesPosition =
      rep.targetJobTitle.includes(activePosition.title) ||
      activePosition.title.includes(rep.targetJobTitle) ||
      rep.targetJobTitle.includes(activePosition.department);

    return matchesSearch && matchesPosition;
  });

  const handleSaveNewPosition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      alert('لطفاً عنوان موقعیت شغلی را وارد فرمایید.');
      return;
    }

    const competenciesList = newCompetencies
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const newPos: JobPosition = {
      id: `pos-${Date.now()}`,
      title: newTitle.trim(),
      department: newDept.trim() || 'معاونت فنی و شبکه',
      industry: 'مخابرات و تلکام (Telecom & ICT)',
      competencies:
        competenciesList.length > 0
          ? competenciesList
          : ['مدیریت بحران شبکه و پایداری SLA', 'رهبری تیم‌های تخصصی و حل تعارضات بین‌معاونتی'],
      description: newDesc.trim() || 'مدیریت و راهبری پروژه‌های کلیدی در صنعت تلکام',
      createdAt: new Date().toLocaleDateString('fa-IR'),
      defaultJd: {
        jobTitle: newTitle.trim(),
        department: newDept.trim() || 'معاونت فنی و شبکه',
        industry: 'مخابرات و تلکام (Telecom & ICT)',
        requiredCompetencies:
          competenciesList.length > 0
            ? competenciesList.join('\n')
            : 'مدیریت بحران شبکه و پایداری SLA\nرهبری تیم‌های تخصصی و حل تعارضات بین‌معاونتی'
      }
    };

    onCreatePosition(newPos);
    setIsCreatingPosition(false);
    setNewTitle('');
    setNewDept('');
    setNewDesc('');
    setNewCompetencies('');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8" id="job-workspace-hub">
      {/* 1. TOP TEAM & WORKSPACE BANNER */}
      <div className="bg-gradient-to-l from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-black bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 px-3 py-1 rounded-full">
                میز کار ارزیابی شغلی و مدیریت پرونده‌ها
              </span>
              <span className="text-xs text-slate-300">
                موقعیت انتخابی جاری: <strong className="text-white">{activePosition.title}</strong>
              </span>
            </div>

            <h2 className="text-xl md:text-2xl font-black tracking-tight text-white">
              پرونده‌های ارزیابی، سوابق و تحلیل شایستگی‌ها
            </h2>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
              موقعیت شغلی مورد نظر خود را انتخاب کنید تا به کلیه فایل‌های رزومه، نتایج آزمون‌های هوگان (HDS/HPI) و گزارش‌های تحلیلی ذخیره‌شده دسترسی داشته و بتوانید آن‌ها را در هر زمان مجدداً فراخوانی کنید.
            </p>
          </div>

          {/* User Status Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 flex items-center justify-between gap-4 shrink-0">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-2xl ${
                  currentMember?.avatarBg || 'bg-indigo-600'
                } text-white font-black text-base flex items-center justify-center shadow-md`}
              >
                {currentMember?.avatarInitials || 'ار'}
              </div>
              <div>
                <div className="text-xs text-slate-300">کاربر فعال ارزیاب:</div>
                <div className="font-bold text-sm text-white">
                  {currentMember?.name || 'کاربر مهمان'}
                </div>
                <div className="text-[11px] text-indigo-300 font-medium">
                  {currentMember?.role || 'ارزیاب تلنت'}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenLogin}
              className="text-xs font-bold bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-xl transition cursor-pointer border border-white/20"
            >
              تعویض کاربر
            </button>
          </div>
        </div>
      </div>

      {/* 2. JOB POSITIONS CARDS SELECTOR */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-600" />
              <span>موقعیت‌های شغلی استراتژیک (Job Positions)</span>
            </h3>
            <p className="text-xs text-slate-500">
              برای مشاهده و مدیریت پرونده‌ها، موقعیت شغلی مورد نظر را انتخاب کنید:
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsCreatingPosition(true)}
            className="text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ تعریف موقعیت شغلی جدید</span>
          </button>
        </div>

        {/* Positions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {positions.map((pos) => {
            const isSelected = activePosition.id === pos.id;
            const countForThisPos = savedReports.filter(
              (r) =>
                r.targetJobTitle.includes(pos.title) ||
                pos.title.includes(r.targetJobTitle) ||
                r.targetJobTitle.includes(pos.department)
            ).length;

            return (
              <div
                key={pos.id}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-500/20 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                }`}
                onClick={() => onSelectPosition(pos)}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${
                        isSelected
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {isSelected ? 'موقعیت انتخابی' : 'انتخاب'}
                    </span>

                    <span className="text-xs font-bold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                      {countForThisPos} پرونده ارزیابی‌شده
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-slate-900 leading-snug">{pos.title}</h4>
                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      <span>{pos.department}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {pos.description}
                  </p>

                  {/* Competency Chips preview */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {pos.competencies.slice(0, 2).map((c, i) => (
                      <span
                        key={i}
                        className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md truncate max-w-full"
                      >
                        {c}
                      </span>
                    ))}
                    {pos.competencies.length > 2 && (
                      <span className="text-[10px] text-slate-400 self-center">
                        +{pos.competencies.length - 2} شایستگی دیگر
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartNewAssessmentForPosition(pos);
                    }}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                  >
                    <span>+ ارزیابی کاندیدای جدید</span>
                  </button>

                  <span className="text-[11px] text-slate-400">تاریخ ایجاد: {pos.createdAt}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. CANDIDATE FILES & RECALL SECTION */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-indigo-600" />
              <span>فایل‌ها و سوابق تحلیلی کاندیداها</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              پرونده‌های ارزیابی‌شده را مشاهده کرده و برای واکاوی مجدد، روی «فراخوانی گزارش» کلیک فرمایید.
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-3">
            {/* Filter Toggle */}
            <button
              type="button"
              onClick={() => setShowOnlyActivePosition(!showOnlyActivePosition)}
              className={`text-xs font-bold px-3 py-2 rounded-xl border transition cursor-pointer flex items-center gap-1.5 ${
                showOnlyActivePosition
                  ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>
                {showOnlyActivePosition
                  ? `فقط موقعیت: ${activePosition.title}`
                  : 'نمایش همه موقعیت‌ها'}
              </span>
            </button>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="جستجوی نام کاندیدا..."
                className="text-xs pr-8 pl-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48"
              />
            </div>

            {/* Quick Assess Button */}
            <button
              type="button"
              onClick={() => onStartNewAssessmentForPosition(activePosition)}
              className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>ارزیابی کاندیدای جدید</span>
            </button>
          </div>
        </div>

        {/* CANDIDATE FILES LIST / CARDS */}
        {filteredReports.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredReports.map((report) => {
              const dangerCount = (Object.values(report.hds) as number[]).filter(
                (v) => v >= 70
              ).length;

              return (
                <div
                  key={report.id}
                  className="bg-slate-50/60 rounded-2xl border border-slate-200 p-5 hover:border-indigo-200 hover:bg-indigo-50/20 hover:shadow-sm transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold bg-white text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200">
                        {report.targetJobTitle}
                      </span>

                      <span className="text-xs font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                        تطبیق: {report.strategicFitScore}٪
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-base text-slate-900">{report.candidateName}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {report.currentRole || 'کاندیدای ارشد تلکام'}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      <div className="bg-white p-2 rounded-xl border border-slate-200">
                        <span className="text-slate-400 block text-[10px]">دارک‌ساید بحرانی:</span>
                        <span
                          className={`font-black ${
                            dangerCount > 0 ? 'text-rose-600' : 'text-emerald-600'
                          }`}
                        >
                          {dangerCount > 0 ? `⚠️ ${dangerCount} صفت خطرناک` : 'بدون دارک‌ساید حاد'}
                        </span>
                      </div>

                      <div className="bg-white p-2 rounded-xl border border-slate-200">
                        <span className="text-slate-400 block text-[10px]">تقاطع‌های پرخطر:</span>
                        <span className="font-bold text-slate-700">
                          {report.intersections.length} تعارض سازمانی
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* RECALL BUTTON & ACTIONS */}
                  <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => onSelectReport(report)}
                      className="flex-1 text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 px-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                      title="فراخوانی گزارش و مشاهده کارنامه، سوالات مصاحبه و نمودارهای راداری"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>فراخوانی و مشاهده گزارش</span>
                    </button>

                    {onExportHTMLReport && (
                      <button
                        type="button"
                        onClick={() => onExportHTMLReport(report)}
                        className="p-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl transition cursor-pointer"
                        title="دانلود فایل مستقل HTML"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`آیا از حذف پرونده «${report.candidateName}» اطمینان دارید؟`)) {
                          onDeleteReport(report.id);
                        }
                      }}
                      className="p-2.5 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-300 hover:border-rose-200 rounded-xl transition cursor-pointer"
                      title="حذف پرونده"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50 space-y-3">
            <FileText className="w-12 h-12 text-slate-300 mx-auto" />
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-slate-800">
                هنوز پرونده ارزیابی برای این موقعیت شغلی ذخیره نشده است
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                می‌توانید با کلیک روی دکمه زیر، اولین کاندیدا را با فرم گام‌به‌گام ارزیابی کرده و در سوابق این شغل ذخیره نمایید.
              </p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => onStartNewAssessmentForPosition(activePosition)}
                className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-5 py-2.5 rounded-xl transition cursor-pointer shadow-xs inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>+ ثبت و ارزیابی کاندیدای جدید برای «{activePosition.title}»</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: CREATE NEW JOB POSITION */}
      {isCreatingPosition && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-fadeIn">
            <div className="bg-slate-900 p-6 text-white text-right">
              <h3 className="text-lg font-black">تعریف موقعیت شغلی استراتژیک جدید</h3>
              <p className="text-xs text-slate-300 mt-1">
                اطلاعات موقعیت شغلی و شایستگی‌های کلیدی مورد انتظار را مشخص فرمایید:
              </p>
            </div>

            <form onSubmit={handleSaveNewPosition} className="p-6 space-y-4 text-right text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  عنوان موقعیت شغلی <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="مثال: مدیر تحول دیجیتال و کلود تلکام"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  معاونت / واحد سازمانی:
                </label>
                <input
                  type="text"
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value)}
                  placeholder="مثال: معاونت فناوری اطلاعات و تحول دیجیتال"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  شرح مختصر ماموریت شغلی:
                </label>
                <input
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="مثال: راهبری مهاجرت سامانه‌ها به معماری ابری و تضمین چابکی سازمانی"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  شایستگی‌های کلیدی مورد نیاز (هر شایستگی در یک خط):
                </label>
                <textarea
                  rows={4}
                  value={newCompetencies}
                  onChange={(e) => setNewCompetencies(e.target.value)}
                  placeholder="مدیریت معماری ابری&#10;رهبری چابک تیم‌های نرم‌افزاری&#10;تاب‌آوری در بحران‌های اختلال سرویس"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl leading-relaxed"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingPosition(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black transition cursor-pointer shadow-xs"
                >
                  ذخیره موقعیت شغلی
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
