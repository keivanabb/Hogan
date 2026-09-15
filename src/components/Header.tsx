import React, { useState } from 'react';
import {
  Sparkles,
  FileText,
  History,
  RefreshCw,
  Download,
  Award,
  ShieldAlert,
  FileCode,
  ExternalLink,
  X,
  User,
  Briefcase,
  Layers,
  ChevronDown
} from 'lucide-react';
import { sampleCaseStudies } from '../data/samplePresets';
import { TeamMember, JobPosition } from '../types/workspace';

interface HeaderProps {
  onSelectPreset: (presetId: string) => void;
  onReset: () => void;
  onOpenHistory: () => void;
  onExportHTML?: () => void;
  historyCount: number;
  hasActiveReport: boolean;
  activeCandidateName?: string;
  currentMember: TeamMember | null;
  onOpenLogin: () => void;
  activePosition: JobPosition;
  activeView: 'workspace' | 'wizard' | 'report';
  setActiveView: (view: 'workspace' | 'wizard' | 'report') => void;
}

export const Header: React.FC<HeaderProps> = ({
  onSelectPreset,
  onReset,
  onOpenHistory,
  onExportHTML,
  historyCount,
  hasActiveReport,
  activeCandidateName,
  currentMember,
  onOpenLogin,
  activePosition,
  activeView,
  setActiveView
}) => {
  const [showColabModal, setShowColabModal] = useState<boolean>(false);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs" id="app-main-header">
      {/* Top Bar: Brand + User Profile + Quick Position */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 border-b border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0">
              <Award className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black text-slate-900 tracking-tight">
                  سامانه ارزیابی استراتژیک تلنت و روان‌سنجی شغلی
                </h1>
                <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-md hidden md:inline-block">
                  تلکام و مدیریت ارشد
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                تحلیل انطباق شایستگی‌ها • آزمون‌های هوگان (HDS/HPI) • استعداد شناختی Swift
              </p>
            </div>
          </div>

          {/* User Profile & Active Position Controls */}
          <div className="flex items-center flex-wrap gap-2 text-xs">
            {/* Active Position Badge */}
            <div
              onClick={() => setActiveView('workspace')}
              className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 px-2.5 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5"
              title="موقعیت شغلی فعال جاری (برای تغییر کلیک کنید)"
            >
              <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
              <span className="max-w-[140px] truncate">{activePosition.title}</span>
            </div>

            {/* Current Member Badge */}
            <button
              type="button"
              onClick={onOpenLogin}
              className="bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-900 px-2.5 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5"
              title="تغییر کاربر ارزیاب"
            >
              <div
                className={`w-5 h-5 rounded-full ${
                  currentMember?.avatarBg || 'bg-indigo-600'
                } text-white text-[10px] flex items-center justify-center font-black`}
              >
                {currentMember?.avatarInitials || 'ار'}
              </div>
              <span className="max-w-[120px] truncate">
                {currentMember?.name || 'ورود ارزیاب'}
              </span>
            </button>

            {/* Export HTML button if active report */}
            {hasActiveReport && onExportHTML && (
              <button
                type="button"
                onClick={onExportHTML}
                className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 px-2.5 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1"
                title="دانلود فایل مستقل HTML"
              >
                <Download className="w-3.5 h-3.5 text-emerald-700" />
                <span className="hidden sm:inline">دانلود HTML</span>
              </button>
            )}

            {/* Colab Notebook Button */}
            <button
              type="button"
              onClick={() => setShowColabModal(true)}
              className="text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-2.5 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1"
              title="کد پایتون برای گوگل کولب"
            >
              <FileCode className="w-3.5 h-3.5 text-amber-700" />
              <span className="hidden sm:inline">Google Colab</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs Bar: Clutter-Free & Crystal Clear */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex items-center justify-between gap-3">
          <nav className="flex items-center gap-1.5 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveView('workspace')}
              className={`px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
                activeView === 'workspace'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Briefcase className="w-4 h-4 text-indigo-400" />
              <span>میز کار و سوابق موقعیت‌های شغلی</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('wizard')}
              className={`px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
                activeView === 'wizard'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>ارزیابی کاندیدای جدید (مرحله‌به‌مرحله)</span>
            </button>

            {hasActiveReport && (
              <button
                type="button"
                onClick={() => setActiveView('report')}
                className={`px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
                  activeView === 'report'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-indigo-700 hover:bg-indigo-50 font-black'
                }`}
              >
                <Award className="w-4 h-4 text-emerald-400" />
                <span>
                  کارنامه و تحلیل فعال {activeCandidateName ? `(${activeCandidateName})` : ''}
                </span>
              </button>
            )}
          </nav>

          {/* Quick Presets selector for quick testing */}
          <div className="hidden lg:flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">نمونه‌های پیش‌فرض:</span>
            <select
              aria-label="بارگذاری کاندیدای نمونه"
              onChange={(e) => {
                if (e.target.value) {
                  onSelectPreset(e.target.value);
                }
              }}
              defaultValue=""
              className="text-[11px] bg-slate-50 border border-slate-300 text-slate-700 py-1.5 px-2 rounded-lg cursor-pointer"
            >
              <option value="" disabled>
                انتخاب پرونده نمونه تلکام...
              </option>
              {sampleCaseStudies.map((cs) => (
                <option key={cs.id} value={cs.id}>
                  {cs.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Google Colab Modal */}
      {showColabModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 text-right space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 font-black text-base text-slate-900">
                <FileCode className="w-5 h-5 text-amber-600" />
                <span>دفترچه محاسباتی Google Colab (.ipynb)</span>
              </div>
              <button
                type="button"
                onClick={() => setShowColabModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              این سامانه مدل ریاضی روان‌سنجی تقاطعی هوگان (HDS/HPI) و استدلال شناختی Swift را در قالب یک اسکریپت پایتون مستقل نیز پشتیبانی می‌کند که می‌توانید مستقیماً در نوت‌بوک‌های سازمانی یا Google Colab اجرا فرمایید.
            </p>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowColabModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
