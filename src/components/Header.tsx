import React, { useState } from 'react';
import {
  Award,
  Briefcase,
  Upload,
  FileBarChart,
  LogOut,
  ChevronDown,
  Archive,
  FileCode,
  Download,
  X
} from 'lucide-react';
import { TeamMember, JobPosition } from '../types/workspace';

export type AppView = 'positions' | 'portal' | 'intake' | 'report';

interface HeaderProps {
  currentMember: TeamMember;
  activePosition: JobPosition | null;
  activeView: AppView;
  hasActiveReport: boolean;
  activeCandidateName?: string;
  onGoPositions: () => void;
  onGoPortal: () => void;
  onGoReport: () => void;
  onOpenArchive: () => void;
  onExportHTML?: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentMember,
  activePosition,
  activeView,
  hasActiveReport,
  activeCandidateName,
  onGoPositions,
  onGoPortal,
  onGoReport,
  onOpenArchive,
  onExportHTML,
  onLogout
}) => {
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
  const [showColabModal, setShowColabModal] = useState<boolean>(false);

  const tabClass = (isActive: boolean): string =>
    `px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
      isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40" id="app-main-header">
      {/* ردیف ۱: برند، مسیر و حساب کاربری */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onGoPositions}
            className="flex items-center gap-2.5 cursor-pointer text-right min-w-0"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
              <Award className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-black text-slate-900 tracking-tight truncate">
                سامانه ارزیابی استراتژیک تلنت
              </h1>
              <p className="text-[11px] text-slate-500 truncate">
                {activePosition ? activePosition.title : 'هوگان HDS/HPI • شناختی Swift'}
              </p>
            </div>
          </button>

          <div className="flex items-center gap-2 text-xs shrink-0">
            {hasActiveReport && onExportHTML && (
              <button
                type="button"
                onClick={onExportHTML}
                className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 px-2.5 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1"
                title="دانلود گزارش مستقل HTML"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">دانلود گزارش</span>
              </button>
            )}

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 px-2.5 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5"
              >
                <div
                  className={`w-5 h-5 rounded-full ${currentMember.avatarBg} text-white text-[10px] flex items-center justify-center font-black`}
                >
                  {currentMember.avatarInitials}
                </div>
                <span className="max-w-[110px] truncate hidden sm:inline">{currentMember.name}</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserMenu(false)}
                  ></div>
                  <div className="absolute left-0 mt-2 w-60 bg-white border border-slate-200 rounded-2xl shadow-lg z-50 overflow-hidden text-right">
                    <div className="p-3.5 border-b border-slate-100 bg-slate-50">
                      <div className="text-xs font-black text-slate-900">{currentMember.name}</div>
                      <div className="text-[11px] text-indigo-700">{currentMember.role}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {currentMember.department}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenArchive();
                      }}
                      className="w-full text-right px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer flex items-center gap-2"
                    >
                      <Archive className="w-4 h-4 text-slate-500" />
                      <span>بایگانی کل و پشتیبان‌گیری</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowUserMenu(false);
                        setShowColabModal(true);
                      }}
                      className="w-full text-right px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer flex items-center gap-2"
                    >
                      <FileCode className="w-4 h-4 text-amber-600" />
                      <span>نسخه محاسباتی Google Colab</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowUserMenu(false);
                        onLogout();
                      }}
                      className="w-full text-right px-3.5 py-2.5 text-xs font-bold text-rose-700 hover:bg-rose-50 transition cursor-pointer flex items-center gap-2 border-t border-slate-100"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>خروج از حساب کاربری</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ردیف ۲: ناوبری سه‌گانه (فقط داخل یک موقعیت شغلی) */}
      {activePosition && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-2 border-t border-slate-100 pt-2">
          <nav className="flex items-center gap-1.5 text-xs font-bold overflow-x-auto">
            <button type="button" onClick={onGoPositions} className={tabClass(activeView === 'positions')}>
              <Briefcase className="w-4 h-4 text-indigo-400" />
              <span>موقعیت‌های شغلی</span>
            </button>

            <button type="button" onClick={onGoPortal} className={tabClass(activeView === 'portal')}>
              <Archive className="w-4 h-4 text-indigo-400" />
              <span>میز کار و بایگانی این موقعیت</span>
            </button>

            {activeView === 'intake' && (
              <span className={tabClass(true)}>
                <Upload className="w-4 h-4 text-amber-300" />
                <span>دریافت مدارک</span>
              </span>
            )}

            {hasActiveReport && (
              <button type="button" onClick={onGoReport} className={tabClass(activeView === 'report')}>
                <FileBarChart className="w-4 h-4 text-emerald-400" />
                <span className="truncate max-w-[220px]">
                  کارنامه فعال{activeCandidateName ? ` — ${activeCandidateName}` : ''}
                </span>
              </button>
            )}
          </nav>
        </div>
      )}

      {/* مودال کولب */}
      {showColabModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 text-right space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 font-black text-base text-slate-900">
                <FileCode className="w-5 h-5 text-amber-600" />
                <span>دفترچه محاسباتی Google Colab</span>
              </div>
              <button
                type="button"
                onClick={() => setShowColabModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              مدل ریاضی روان‌سنجی تقاطعی هوگان (HDS/HPI) و استدلال شناختی Swift به‌صورت یک اسکریپت
              پایتون مستقل نیز در دسترس است و می‌توانید آن را در نوت‌بوک‌های سازمانی یا Google Colab
              اجرا کنید.
            </p>

            <div className="flex justify-end gap-2">
              <a
                href="/psychometric_assessment_colab.ipynb"
                download
                className="px-4 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                دانلود فایل ipynb
              </a>
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
