import React, { useState, useEffect } from 'react';
import { ArrowRight, Plus } from 'lucide-react';
import {
  AssessmentReport,
  CandidateResume,
  HoganHDS,
  HoganHPI,
  JobDescription,
  SwiftCognitive
} from './types/assessment';
import {
  TeamMember,
  JobPosition,
  StoredDocument,
  DEFAULT_TEAM_MEMBERS,
  DEFAULT_JOB_POSITIONS
} from './types/workspace';
import { sampleCaseStudies } from './data/samplePresets';
import { runPsychometricAssessment } from './utils/psychometricEngine';
import { generateStandaloneHTMLReport } from './utils/htmlReportGenerator';
import { analyzeCandidate } from './services/analysisService';
import {
  loadVault,
  persistVault,
  fileToDataUrl,
  buildDocumentId,
  MAX_EXTRACTED_TEXT_CHARS
} from './utils/documentVault';
import { Header, AppView } from './components/Header';
import { LoginScreen } from './components/LoginScreen';
import { PositionSelectScreen } from './components/PositionSelectScreen';
import { PositionPortal } from './components/PositionPortal';
import { DocumentIntakeWizard, NewDocumentPayload } from './components/DocumentIntakeWizard';
import { ReportDashboard } from './components/ReportDashboard';
import { PipelineArchive } from './components/PipelineArchive';

const REPORTS_KEY = 'hr_talent_pipeline_evaluations_v3';
const POSITIONS_KEY = 'hr_talent_job_positions_v3';
const SESSION_KEY = 'hr_talent_active_session_v4';
const MEMBERS_KEY = 'hr_talent_known_members_v4';

/** مقادیر پیش‌فرض خنثی برای شروع یک پرونده جدید (بدون آلودگی داده نمونه) */
const BLANK_RESUME: CandidateResume = {
  fullName: '',
  currentRole: '',
  experienceYears: 6,
  education: '',
  careerPath: '',
  claimedAccomplishments: '',
  claimedStrengths: ''
};

const BLANK_HDS: HoganHDS = {
  excitable: 50,
  skeptical: 50,
  cautious: 50,
  reserved: 50,
  leisurely: 50,
  bold: 50,
  mischievous: 50,
  colorful: 50,
  imaginative: 50,
  diligent: 50,
  dutiful: 50
};

const BLANK_HPI: HoganHPI = {
  adjustment: 50,
  ambition: 50,
  sociability: 50,
  interpersonalSensitivity: 50,
  prudence: 50,
  inquisitive: 50,
  learningApproach: 50
};

const BLANK_SWIFT: SwiftCognitive = {
  verbalReasoning: 50,
  numericalReasoning: 50,
  abstractReasoning: 50,
  overallPercentile: 50,
  speedVsAccuracy: 'متعادل'
};

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export default function App() {
  /* ---------------- احراز هویت و نشست ---------------- */
  const [currentMember, setCurrentMember] = useState<TeamMember | null>(() =>
    readJSON<TeamMember | null>(SESSION_KEY, null)
  );
  const [knownMembers, setKnownMembers] = useState<TeamMember[]>(() =>
    readJSON<TeamMember[]>(MEMBERS_KEY, DEFAULT_TEAM_MEMBERS)
  );

  /* ---------------- موقعیت‌های شغلی ---------------- */
  const [positions, setPositions] = useState<JobPosition[]>(() =>
    readJSON<JobPosition[]>(POSITIONS_KEY, DEFAULT_JOB_POSITIONS)
  );
  const [activePosition, setActivePosition] = useState<JobPosition | null>(null);

  /* ---------------- مخزن مدارک ---------------- */
  const [documents, setDocuments] = useState<StoredDocument[]>(() => loadVault());
  const [intakeDocIds, setIntakeDocIds] = useState<string[]>([]);
  const [vaultNotice, setVaultNotice] = useState<string>('');

  /* ---------------- داده‌های فرم پرونده جاری ---------------- */
  const [jd, setJd] = useState<JobDescription>(sampleCaseStudies[0].jd);
  const [resume, setResume] = useState<CandidateResume>(BLANK_RESUME);
  const [hpi, setHpi] = useState<HoganHPI>(BLANK_HPI);
  const [hds, setHds] = useState<HoganHDS>(BLANK_HDS);
  const [swift, setSwift] = useState<SwiftCognitive>(BLANK_SWIFT);

  /* ---------------- سوابق تحلیل ---------------- */
  const [savedReports, setSavedReports] = useState<AssessmentReport[]>(() => {
    const stored = readJSON<AssessmentReport[] | null>(REPORTS_KEY, null);
    if (stored && Array.isArray(stored) && stored.length > 0) return stored;
    // بارگذاری اولیه با پرونده‌های نمونه
    return sampleCaseStudies.map((cs, index) => {
      const report = runPsychometricAssessment(cs.jd, cs.resume, cs.hpi, cs.hds, cs.swift);
      // هر پرونده نمونه باید ذیل یکی از موقعیت‌ها دیده شود؛ در غیر این صورت
      // فقط در «بایگانی کل» قابل مشاهده می‌ماند.
      const matchedPosition =
        DEFAULT_JOB_POSITIONS.find((p) => p.title === cs.jd.jobTitle) ||
        DEFAULT_JOB_POSITIONS[index % DEFAULT_JOB_POSITIONS.length];
      return {
        ...report,
        positionId: matchedPosition?.id,
        ownerId: DEFAULT_TEAM_MEMBERS[0].id,
        ownerName: DEFAULT_TEAM_MEMBERS[0].name
      };
    });
  });

  const [currentReport, setCurrentReport] = useState<AssessmentReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [aiSource, setAiSource] = useState<'full-ai' | 'deterministic'>('deterministic');
  const [isArchiveOpen, setIsArchiveOpen] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<AppView>('positions');

  /* ---------------- ماندگارسازی ---------------- */
  useEffect(() => {
    try {
      if (currentMember) localStorage.setItem(SESSION_KEY, JSON.stringify(currentMember));
      else localStorage.removeItem(SESSION_KEY);
    } catch (e) {
      console.error(e);
    }
  }, [currentMember]);

  useEffect(() => {
    try {
      localStorage.setItem(MEMBERS_KEY, JSON.stringify(knownMembers));
      localStorage.setItem(POSITIONS_KEY, JSON.stringify(positions));
      localStorage.setItem(REPORTS_KEY, JSON.stringify(savedReports));
    } catch (e) {
      console.error('ذخیره‌سازی محلی با خطا مواجه شد:', e);
    }
  }, [knownMembers, positions, savedReports]);

  /* ---------------- ورود و خروج ---------------- */
  const handleLogin = (member: TeamMember) => {
    setCurrentMember(member);
    setKnownMembers((prev) =>
      prev.some((m) => m.id === member.id) ? prev : [...prev, member]
    );
    setActivePosition(null);
    setActiveView('positions');
  };

  const handleLogout = () => {
    setCurrentMember(null);
    setActivePosition(null);
    setCurrentReport(null);
    setActiveView('positions');
  };

  /* ---------------- موقعیت شغلی ---------------- */
  const handleOpenPosition = (position: JobPosition) => {
    setActivePosition(position);
    setJd(position.defaultJd);
    setActiveView('portal');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCreatePosition = (position: JobPosition) => {
    setPositions((prev) => [position, ...prev]);
    handleOpenPosition(position);
  };

  /* ---------------- شروع دریافت مدارک کاندیدای جدید ---------------- */
  const handleStartIntake = () => {
    if (!activePosition) return;
    setJd(activePosition.defaultJd);
    setResume(BLANK_RESUME);
    setHds(BLANK_HDS);
    setHpi(BLANK_HPI);
    setSwift(BLANK_SWIFT);
    setIntakeDocIds([]);
    setActiveView('intake');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* ---------------- بایگانی مدرک در مخزن ---------------- */
  const handleAddDocument = async (payload: NewDocumentPayload) => {
    if (!activePosition || !currentMember) return;

    const dataUrl = await fileToDataUrl(payload.file);
    const newDoc: StoredDocument = {
      id: buildDocumentId(),
      positionId: activePosition.id,
      positionTitle: activePosition.title,
      candidateCode: payload.candidateCode,
      kind: payload.kind,
      fileName: payload.fileName,
      sizeBytes: payload.sizeBytes,
      uploadedAt: new Date().toISOString(),
      uploadedById: currentMember.id,
      uploadedByName: currentMember.name,
      extractedText: (payload.extractedText || '').slice(0, MAX_EXTRACTED_TEXT_CHARS),
      dataUrl
    };

    const result = persistVault([newDoc, ...documents]);
    setDocuments(result.documents);
    setIntakeDocIds((prev) => [...prev, newDoc.id]);
    setVaultNotice(result.message || '');
  };

  const handleDeleteDocument = (id: string) => {
    const result = persistVault(documents.filter((d) => d.id !== id));
    setDocuments(result.documents);
    setIntakeDocIds((prev) => prev.filter((docId) => docId !== id));
  };

  /* ---------------- اجرای تحلیل ---------------- */
  const handleAnalyze = async (useAI: boolean) => {
    if (!currentMember) return;
    setIsLoading(true);

    try {
      let report: AssessmentReport;
      let source: 'full-ai' | 'deterministic' = 'deterministic';

      try {
        const result = await analyzeCandidate(jd, resume, hpi, hds, swift, useAI);
        report = result.report;
        source = result.source;
      } catch (err) {
        console.error('خطا در سرویس تحلیل؛ موتور قطعی جایگزین شد:', err);
        report = runPsychometricAssessment(jd, resume, hpi, hds, swift);
      }

      const enriched: AssessmentReport = {
        ...report,
        positionId: activePosition?.id,
        ownerId: currentMember.id,
        ownerName: currentMember.name,
        documentIds: intakeDocIds
      };

      // اتصال مدارک این پرونده به کارنامه صادرشده
      if (intakeDocIds.length > 0) {
        const linked = documents.map((d) =>
          intakeDocIds.includes(d.id) ? { ...d, linkedReportId: enriched.id } : d
        );
        const result = persistVault(linked);
        setDocuments(result.documents);
      }

      setCurrentReport(enriched);
      setAiSource(source);
      setSavedReports((prev) => [enriched, ...prev.filter((item) => item.id !== enriched.id)]);
      setActiveView('report');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------------- فراخوانی مجدد یک پرونده ---------------- */
  const handleRecallReport = (report: AssessmentReport) => {
    setJd(report.jobDescription);
    setResume(report.resume);
    setHpi(report.hpi);
    setHds(report.hds);
    setSwift(report.swift);
    setCurrentReport(report);
    setIntakeDocIds(report.documentIds || []);

    const matched =
      positions.find((p) => p.id === report.positionId) ||
      positions.find((p) => p.title === report.targetJobTitle);
    if (matched) setActivePosition(matched);

    setActiveView('report');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* ---------------- خروجی و حذف ---------------- */
  const handleExportHTML = (target?: AssessmentReport) => {
    const rep = target || currentReport;
    if (!rep) return;
    const html = generateStandaloneHTMLReport(rep);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `گزارش_روان_سنجی_${rep.candidateName.replace(/\s+/g, '_') || 'candidate'}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteReport = (id: string) => {
    setSavedReports((prev) => prev.filter((item) => item.id !== id));
    if (currentReport?.id === id) setCurrentReport(null);
  };

  /* ---------------- صفحه ورود ---------------- */
  if (!currentMember) {
    return (
      <LoginScreen
        onLogin={handleLogin}
        savedMembers={knownMembers}
        lastMemberId={knownMembers[0]?.id}
      />
    );
  }

  const intakeDocuments = documents.filter((d) => intakeDocIds.includes(d.id));

  return (
    <div className="min-h-screen bg-slate-50/70 flex flex-col">
      <Header
        currentMember={currentMember}
        activePosition={activePosition}
        activeView={activeView}
        hasActiveReport={Boolean(currentReport)}
        activeCandidateName={currentReport?.candidateName}
        onGoPositions={() => {
          setActivePosition(null);
          setActiveView('positions');
        }}
        onGoPortal={() => setActiveView('portal')}
        onGoReport={() => setActiveView('report')}
        onOpenArchive={() => setIsArchiveOpen(true)}
        onExportHTML={currentReport ? () => handleExportHTML(currentReport) : undefined}
        onLogout={handleLogout}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
        {vaultNotice && (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold rounded-2xl p-3.5 flex items-center justify-between gap-3">
            <span>{vaultNotice}</span>
            <button
              type="button"
              onClick={() => setVaultNotice('')}
              className="text-amber-700 hover:text-amber-900 cursor-pointer shrink-0"
            >
              بستن
            </button>
          </div>
        )}

        {/* نما ۱: انتخاب موقعیت شغلی */}
        {activeView === 'positions' && (
          <PositionSelectScreen
            positions={positions}
            currentMember={currentMember}
            savedReports={savedReports}
            documents={documents}
            onOpenPosition={handleOpenPosition}
            onCreatePosition={handleCreatePosition}
          />
        )}

        {/* نما ۲: میز کار موقعیت (مدارک و سوابق) */}
        {activeView === 'portal' && activePosition && (
          <PositionPortal
            position={activePosition}
            currentMember={currentMember}
            savedReports={savedReports}
            documents={documents}
            onBackToPositions={() => {
              setActivePosition(null);
              setActiveView('positions');
            }}
            onStartNewAssessment={handleStartIntake}
            onRecallReport={handleRecallReport}
            onDeleteReport={handleDeleteReport}
            onExportReport={(rep) => handleExportHTML(rep)}
            onDeleteDocument={handleDeleteDocument}
          />
        )}

        {/* نما ۳: دریافت مدارک صفحه‌به‌صفحه */}
        {activeView === 'intake' && activePosition && (
          <DocumentIntakeWizard
            position={activePosition}
            currentMember={currentMember}
            jd={jd}
            setJd={setJd}
            resume={resume}
            setResume={setResume}
            hpi={hpi}
            setHpi={setHpi}
            hds={hds}
            setHds={setHds}
            swift={swift}
            setSwift={setSwift}
            sessionDocuments={intakeDocuments}
            onAddDocument={handleAddDocument}
            onDeleteDocument={handleDeleteDocument}
            onAnalyze={handleAnalyze}
            isLoading={isLoading}
            onExit={() => setActiveView('portal')}
          />
        )}

        {/* نما ۴: کارنامه تحلیل */}
        {activeView === 'report' && currentReport && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setActiveView(activePosition ? 'portal' : 'positions')}
                  className="text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>بازگشت به میز کار موقعیت</span>
                </button>

                <div className="text-xs font-bold text-slate-700">
                  پرونده: <span className="text-indigo-900">{currentReport.candidateName}</span>
                </div>
                <span className="text-xs text-slate-400">|</span>
                <div className="text-xs text-slate-500">موقعیت: {currentReport.targetJobTitle}</div>
                {currentReport.ownerName && (
                  <>
                    <span className="text-xs text-slate-400">|</span>
                    <div className="text-xs text-slate-500">
                      ثبت‌کننده: {currentReport.ownerName}
                    </div>
                  </>
                )}
              </div>

              {activePosition && (
                <button
                  type="button"
                  onClick={handleStartIntake}
                  className="text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>کاندیدای جدید در این موقعیت</span>
                </button>
              )}
            </div>

            <ReportDashboard
              report={currentReport}
              onExportHTML={() => handleExportHTML(currentReport)}
              onSaveToPipeline={(rep) =>
                setSavedReports((prev) =>
                  prev.some((item) => item.id === rep.id) ? prev : [rep, ...prev]
                )
              }
              isSaved={savedReports.some((r) => r.id === currentReport.id)}
              aiSource={aiSource}
              savedReports={savedReports}
            />
          </div>
        )}
      </main>

      <PipelineArchive
        isOpen={isArchiveOpen}
        onClose={() => setIsArchiveOpen(false)}
        savedReports={savedReports}
        onSelectReport={(rep) => {
          setIsArchiveOpen(false);
          handleRecallReport(rep);
        }}
        onDeleteReport={handleDeleteReport}
        onImportReports={(imported) => setSavedReports((prev) => [...imported, ...prev])}
      />

      <footer className="mt-auto border-t border-slate-200 bg-white py-3.5 text-center text-[11px] text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>سامانه ارزیابی استراتژیک تلنت • میز کار تفکیک‌شده موقعیت‌های شغلی</span>
          <span className="font-semibold text-slate-600">
            داده‌ها روی همین مرورگر ذخیره می‌شوند
          </span>
        </div>
      </footer>
    </div>
  );
}
