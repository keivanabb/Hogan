import React, { useState } from 'react';
import {
  FolderOpen,
  History,
  Plus,
  Search,
  Download,
  Trash2,
  RotateCcw,
  ArrowRight,
  FileText,
  Eye,
  X,
  User,
  Users,
  Paperclip,
  Target,
  AlertTriangle
} from 'lucide-react';
import {
  JobPosition,
  TeamMember,
  StoredDocument,
  DocumentKind,
  DOCUMENT_KINDS
} from '../types/workspace';
import { AssessmentReport } from '../types/assessment';
import { filterDocuments, formatBytes, downloadStoredDocument } from '../utils/documentVault';

interface PositionPortalProps {
  position: JobPosition;
  currentMember: TeamMember;
  savedReports: AssessmentReport[];
  documents: StoredDocument[];
  onBackToPositions: () => void;
  onStartNewAssessment: () => void;
  onRecallReport: (report: AssessmentReport) => void;
  onDeleteReport: (id: string) => void;
  onExportReport: (report: AssessmentReport) => void;
  onDeleteDocument: (id: string) => void;
}

type PortalTab = 'documents' | 'history';

const riskColor = (risk: string): string => {
  if (risk.includes('بسیار پرریسک')) return 'bg-rose-100 text-rose-800 border-rose-200';
  if (risk.includes('ریسک بالا')) return 'bg-orange-100 text-orange-800 border-orange-200';
  if (risk.includes('متوسط')) return 'bg-amber-100 text-amber-800 border-amber-200';
  return 'bg-emerald-100 text-emerald-800 border-emerald-200';
};

export const PositionPortal: React.FC<PositionPortalProps> = ({
  position,
  currentMember,
  savedReports,
  documents,
  onBackToPositions,
  onStartNewAssessment,
  onRecallReport,
  onDeleteReport,
  onExportReport,
  onDeleteDocument
}) => {
  const [tab, setTab] = useState<PortalTab>('history');
  const [onlyMine, setOnlyMine] = useState<boolean>(false);
  const [query, setQuery] = useState<string>('');
  const [kindFilter, setKindFilter] = useState<DocumentKind | 'all'>('all');
  const [previewDoc, setPreviewDoc] = useState<StoredDocument | null>(null);

  const positionReports = savedReports
    .filter((r) => r.positionId === position.id || r.targetJobTitle === position.title)
    .filter((r) => (onlyMine ? r.ownerId === currentMember.id : true))
    .filter((r) => {
      if (!query.trim()) return true;
      const q = query.trim().toLowerCase();
      return (
        r.candidateName.toLowerCase().includes(q) ||
        (r.ownerName || '').toLowerCase().includes(q) ||
        r.overallRiskLevel.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

  const positionDocuments = filterDocuments(documents, {
    positionId: position.id,
    kind: kindFilter,
    ownerId: onlyMine ? currentMember.id : undefined,
    query
  });

  const documentsOfReport = (report: AssessmentReport): StoredDocument[] =>
    documents.filter(
      (d) =>
        d.linkedReportId === report.id ||
        (report.documentIds || []).includes(d.id) ||
        (d.positionId === position.id && d.candidateCode === report.candidateName)
    );

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* سربرگ موقعیت شغلی */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <button
          type="button"
          onClick={onBackToPositions}
          className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 mb-3"
        >
          <ArrowRight className="w-3.5 h-3.5" />
          <span>همه موقعیت‌های شغلی</span>
        </button>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-slate-900">{position.title}</h2>
            <p className="text-xs text-slate-500 mt-1">
              {position.department} • {position.industry}
            </p>

            {position.competencies.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {position.competencies.slice(0, 4).map((c, i) => (
                  <span
                    key={i}
                    className="text-[10px] bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-md"
                  >
                    <Target className="w-2.5 h-2.5 inline-block ml-1 text-indigo-500" />
                    {c.length > 42 ? `${c.slice(0, 42)}…` : c}
                  </span>
                ))}
                {position.competencies.length > 4 && (
                  <span className="text-[10px] text-slate-400 px-1 py-0.5">
                    +{position.competencies.length - 4} شایستگی دیگر
                  </span>
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onStartNewAssessment}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black px-4 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>دریافت مدارک کاندیدای جدید</span>
          </button>
        </div>
      </div>

      {/* تب‌ها و فیلترها */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-xs font-bold">
          <button
            type="button"
            onClick={() => setTab('history')}
            className={`px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
              tab === 'history'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <History className="w-4 h-4" />
            <span>سوابق تحلیل ({positionReports.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('documents')}
            className={`px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
              tab === 'documents'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FolderOpen className="w-4 h-4" />
            <span>مدارک بایگانی‌شده ({positionDocuments.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setOnlyMine(!onlyMine)}
            className={`text-xs font-bold px-3 py-2 rounded-xl border transition cursor-pointer flex items-center gap-1.5 ${
              onlyMine
                ? 'bg-indigo-50 border-indigo-300 text-indigo-800'
                : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {onlyMine ? <User className="w-3.5 h-3.5" /> : <Users className="w-3.5 h-3.5" />}
            <span>{onlyMine ? 'فقط موارد من' : 'کل تیم'}</span>
          </button>

          {tab === 'documents' && (
            <select
              aria-label="فیلتر نوع مدرک"
              value={kindFilter}
              onChange={(e) => setKindFilter(e.target.value as DocumentKind | 'all')}
              className="text-xs bg-slate-50 border border-slate-300 text-slate-700 py-2 px-2.5 rounded-xl cursor-pointer"
            >
              <option value="all">همه انواع مدرک</option>
              {DOCUMENT_KINDS.map((k) => (
                <option key={k.kind} value={k.kind}>
                  {k.label}
                </option>
              ))}
            </select>
          )}

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="جست‌وجو..."
              className="text-xs w-44 pr-8 pl-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* محتوای تب سوابق تحلیل */}
      {tab === 'history' && (
        <div className="space-y-3">
          {positionReports.map((report) => {
            const relatedDocs = documentsOfReport(report);
            return (
              <div
                key={report.id}
                className="bg-white border border-slate-200 rounded-2xl p-4 hover:border-indigo-300 transition"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-black text-slate-900">{report.candidateName}</h4>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${riskColor(
                          report.overallRiskLevel
                        )}`}
                      >
                        {report.overallRiskLevel}
                      </span>
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                        امتیاز انطباق: {report.overallFitScore}٪
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span>تاریخ: {report.date}</span>
                      {report.ownerName && (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          ثبت‌کننده: {report.ownerName}
                        </span>
                      )}
                      {relatedDocs.length > 0 && (
                        <span className="flex items-center gap-1 text-indigo-600 font-bold">
                          <Paperclip className="w-3 h-3" />
                          {relatedDocs.length} مدرک پیوست
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => onRecallReport(report)}
                      className="text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5"
                      title="بازخوانی کامل تحلیل و داده‌های ورودی"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>فراخوانی مجدد تحلیل</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onExportReport(report)}
                      className="text-slate-600 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-50 p-2 rounded-xl transition cursor-pointer"
                      title="دانلود گزارش HTML"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`پرونده «${report.candidateName}» حذف شود؟`)) {
                          onDeleteReport(report.id);
                        }
                      }}
                      className="text-slate-400 hover:text-rose-700 bg-slate-100 hover:bg-rose-50 p-2 rounded-xl transition cursor-pointer"
                      title="حذف پرونده"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {relatedDocs.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-100">
                    {relatedDocs.map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => setPreviewDoc(d)}
                        className="text-[10px] bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-slate-700 px-2 py-1 rounded-lg transition cursor-pointer flex items-center gap-1"
                      >
                        <FileText className="w-3 h-3 text-indigo-500" />
                        <span className="max-w-[180px] truncate">{d.fileName}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {positionReports.length === 0 && (
            <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-10 text-center">
              <p className="text-sm font-bold text-slate-600">
                هنوز تحلیلی برای این موقعیت ثبت نشده است.
              </p>
              <button
                type="button"
                onClick={onStartNewAssessment}
                className="mt-3 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-4 py-2 rounded-xl transition cursor-pointer"
              >
                شروع دریافت مدارک اولین کاندیدا
              </button>
            </div>
          )}
        </div>
      )}

      {/* محتوای تب مدارک */}
      {tab === 'documents' && (
        <div className="space-y-3">
          {positionDocuments.map((doc) => {
            const kindMeta = DOCUMENT_KINDS.find((k) => k.kind === doc.kind);
            return (
              <div
                key={doc.id}
                className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 hover:border-indigo-300 transition"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs font-black text-slate-900 truncate max-w-[280px]">
                        {doc.fileName}
                      </h4>
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                        {kindMeta?.label || 'سایر'}
                      </span>
                      {!doc.dataUrl && (
                        <span
                          className="text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md"
                          title="به دلیل محدودیت فضای مرورگر فقط متن استخراج‌شده نگهداری شده است"
                        >
                          فقط متن استخراج‌شده
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-slate-500 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span>پرونده: {doc.candidateCode || '—'}</span>
                      <span>{formatBytes(doc.sizeBytes)}</span>
                      <span>بارگذاری: {new Date(doc.uploadedAt).toLocaleDateString('fa-IR')}</span>
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {doc.uploadedByName}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setPreviewDoc(doc)}
                    className="text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>پیش‌نمایش</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => downloadStoredDocument(doc)}
                    className="text-slate-600 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-50 p-2 rounded-xl transition cursor-pointer"
                    title={doc.dataUrl ? 'دانلود فایل اصلی' : 'دانلود متن استخراج‌شده'}
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`مدرک «${doc.fileName}» حذف شود؟`)) onDeleteDocument(doc.id);
                    }}
                    className="text-slate-400 hover:text-rose-700 bg-slate-100 hover:bg-rose-50 p-2 rounded-xl transition cursor-pointer"
                    title="حذف مدرک"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}

          {positionDocuments.length === 0 && (
            <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-10 text-center">
              <p className="text-sm font-bold text-slate-600">
                برای این موقعیت مدرکی بایگانی نشده است.
              </p>
              <p className="text-xs text-slate-400 mt-1">
                مدارک در مرحله «دریافت مدارک» بارگذاری و به‌صورت خودکار اینجا بایگانی می‌شوند.
              </p>
            </div>
          )}
        </div>
      )}

      {/* مودال پیش‌نمایش مدرک */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="min-w-0">
                <h3 className="text-sm font-black text-slate-900 truncate">{previewDoc.fileName}</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {DOCUMENT_KINDS.find((k) => k.kind === previewDoc.kind)?.label} • پرونده{' '}
                  {previewDoc.candidateCode || '—'} • {previewDoc.uploadedByName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1">
              {previewDoc.extractedText ? (
                <pre className="text-[11px] text-slate-700 whitespace-pre-wrap leading-relaxed font-sans bg-slate-50 border border-slate-200 rounded-xl p-4">
                  {previewDoc.extractedText}
                </pre>
              ) : (
                <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    متنی از این فایل استخراج نشده است (فایل‌های تصویری یا PDF اسکن‌شده قابل
                    استخراج نیستند). در صورت وجود، نسخه اصل را دانلود کنید.
                  </span>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => downloadStoredDocument(previewDoc)}
                className="text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>{previewDoc.dataUrl ? 'دانلود فایل اصلی' : 'دانلود متن استخراج‌شده'}</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition cursor-pointer"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
