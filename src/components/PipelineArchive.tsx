import React, { useRef } from 'react';
import { X, Trash2, Download, Upload, Eye, Clock, Award, ShieldAlert, FileText } from 'lucide-react';
import { AssessmentReport } from '../types/assessment';

interface PipelineArchiveProps {
  isOpen: boolean;
  onClose: () => void;
  savedReports: AssessmentReport[];
  onSelectReport: (report: AssessmentReport) => void;
  onDeleteReport: (id: string) => void;
  onImportReports: (imported: AssessmentReport[]) => void;
}

export const PipelineArchive: React.FC<PipelineArchiveProps> = ({
  isOpen,
  onClose,
  savedReports,
  onSelectReport,
  onDeleteReport,
  onImportReports
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleExportAllJSON = () => {
    const dataStr = JSON.stringify(savedReports, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hr-talent-pipeline-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          onImportReports(parsed);
          alert(`${parsed.length} پرونده با موفقیت به آرشیو افزوده شد.`);
        } else if (parsed.id && parsed.candidateName) {
          onImportReports([parsed]);
          alert(`پرونده «${parsed.candidateName}» به آرشیو افزوده شد.`);
        } else {
          alert('فرمت فایل نامعتبر است.');
        }
      } catch (err) {
        alert('خطا در خواندن فایل JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end" id="pipeline-drawer-overlay">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-r border-slate-200 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="text-sm font-black text-slate-900">آرشیو ارزیابی‌ها و پایپ‌لاین کاندیداها</h3>
              <p className="text-[11px] text-slate-500">مجموعاً {savedReports.length} ارزیابی ثبت شده برای موقعیت‌های شغلی</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {savedReports.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              هنوز ارزیابی ذخیره شده‌ای در پایپ‌لاین وجود ندارد.
              <br />
              پس از اجرای هر تحلیل، با فشردن دکمه «ذخیره در آرشیو» آن را اینجا نگه دارید.
            </div>
          ) : (
            savedReports.map((item) => {
              const isDanger = item.overallRiskLevel.includes('بسیار') || item.overallRiskLevel.includes('غیرقابل');
              return (
                <div
                  key={item.id}
                  className="bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl p-3.5 transition-all space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-black text-slate-900">{item.candidateName}</h4>
                      <p className="text-[11px] text-slate-600 font-medium">{item.targetJobTitle}</p>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isDanger
                          ? 'bg-rose-100 text-rose-800'
                          : item.overallRiskLevel.includes('بالا')
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      امتیاز: {item.overallFitScore}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                    <span>{item.date}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          onSelectReport(item);
                          onClose();
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-600 text-white rounded-md text-[11px] font-bold hover:bg-indigo-700 cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        <span>مشاهده</span>
                      </button>

                      <button
                        onClick={() => onDeleteReport(item.id)}
                        className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded cursor-pointer"
                        title="حذف از آرشیو"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer actions */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-2">
          <button
            onClick={handleExportAllJSON}
            disabled={savedReports.length === 0}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>خروجی فایل پشتیبان (JSON)</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>بازیابی پرونده‌ها</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
};
