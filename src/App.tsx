import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Sliders,
  FileCheck,
  Download,
  AlertCircle,
  Sparkles,
  ArrowDown,
  Layers,
  Award,
  RotateCcw,
  ArrowRight
} from 'lucide-react';
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
  DEFAULT_TEAM_MEMBERS,
  DEFAULT_JOB_POSITIONS
} from './types/workspace';
import { sampleCaseStudies } from './data/samplePresets';
import { runPsychometricAssessment } from './utils/psychometricEngine';
import { generateStandaloneHTMLReport } from './utils/htmlReportGenerator';
import { analyzeCandidate } from './services/analysisService';
import { Header } from './components/Header';
import { StepWizardInput } from './components/StepWizardInput';
import { JobWorkspaceHub } from './components/JobWorkspaceHub';
import { LoginModal } from './components/LoginModal';
import { ReportDashboard } from './components/ReportDashboard';
import { PipelineArchive } from './components/PipelineArchive';

const LOCAL_STORAGE_REPORTS_KEY = 'hr_talent_pipeline_evaluations_v3';
const LOCAL_STORAGE_POSITIONS_KEY = 'hr_talent_job_positions_v3';
const LOCAL_STORAGE_MEMBER_KEY = 'hr_talent_active_member_v3';

export default function App() {
  // 1. Team Member & Authentication State
  const [currentMember, setCurrentMember] = useState<TeamMember>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_MEMBER_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_TEAM_MEMBERS[0];
    } catch {
      return DEFAULT_TEAM_MEMBERS[0];
    }
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  // 2. Job Positions State
  const [positions, setPositions] = useState<JobPosition[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_POSITIONS_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_JOB_POSITIONS;
    } catch {
      return DEFAULT_JOB_POSITIONS;
    }
  });
  const [activePosition, setActivePosition] = useState<JobPosition>(positions[0] || DEFAULT_JOB_POSITIONS[0]);

  // 3. Active Candidate Input Form State
  const initialCase = sampleCaseStudies[0];
  const [jd, setJd] = useState<JobDescription>(initialCase.jd);
  const [resume, setResume] = useState<CandidateResume>(initialCase.resume);
  const [hpi, setHpi] = useState<HoganHPI>(initialCase.hpi);
  const [hds, setHds] = useState<HoganHDS>(initialCase.hds);
  const [swift, setSwift] = useState<SwiftCognitive>(initialCase.swift);

  // 4. Saved candidate evaluations pipeline (with automatic privacy sanitizer)
  const [savedReports, setSavedReports] = useState<AssessmentReport[]>(() => {
    try {
      const stored =
        localStorage.getItem(LOCAL_STORAGE_REPORTS_KEY) ||
        localStorage.getItem('hr_talent_pipeline_evaluations_v2');

      if (stored) {
        let cleanStored = stored;
        // Strip legacy real name if it exists in browser cache
        cleanStored = cleanStored
          .replace(new RegExp('\\u067e\\u0698\\u0645\\u0627\\u0646\\s+\\u0646\\u0648\\u0631\\u0648\\u0632\\u06cc', 'g'), 'کاندیدای ارشد (کد C-101)')
          .replace(new RegExp('\\u067e\\u0698\\u0645\\u0627\\u0646', 'g'), 'کاندیدا')
          .replace(new RegExp('\\u0646\\u0648\\u0631\\u0648\\u0632\\u06cc', 'g'), '');

        const parsed = JSON.parse(cleanStored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      // Initialize with preset case study reports
      return sampleCaseStudies.map((cs) =>
        runPsychometricAssessment(cs.jd, cs.resume, cs.hpi, cs.hds, cs.swift)
      );
    } catch {
      return sampleCaseStudies.map((cs) =>
        runPsychometricAssessment(cs.jd, cs.resume, cs.hpi, cs.hds, cs.swift)
      );
    }
  });

  // 5. Active Report & UI View State
  const [currentReport, setCurrentReport] = useState<AssessmentReport | null>(() => {
    return runPsychometricAssessment(
      initialCase.jd,
      initialCase.resume,
      initialCase.hpi,
      initialCase.hds,
      initialCase.swift
    );
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [aiSource, setAiSource] = useState<'full-ai' | 'deterministic'>('deterministic');
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState<boolean>(false);

  // Main View: 'workspace' (Jobs & archives) | 'wizard' (Step by step entry) | 'report' (Active analysis dashboard)
  const [activeView, setActiveView] = useState<'workspace' | 'wizard' | 'report'>('workspace');

  // Persistence effects
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_MEMBER_KEY, JSON.stringify(currentMember));
    } catch (e) {
      console.error(e);
    }
  }, [currentMember]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_POSITIONS_KEY, JSON.stringify(positions));
    } catch (e) {
      console.error(e);
    }
  }, [positions]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_REPORTS_KEY, JSON.stringify(savedReports));
    } catch (e) {
      console.error(e);
    }
  }, [savedReports]);

  // Handle Login / Member Selection
  const handleLogin = (member: TeamMember) => {
    setCurrentMember(member);
    setIsLoginModalOpen(false);
  };

  // Handle Position Selection
  const handleSelectPosition = (pos: JobPosition) => {
    setActivePosition(pos);
    setJd(pos.defaultJd);
  };

  // Create new position
  const handleCreatePosition = (newPos: JobPosition) => {
    setPositions((prev) => [newPos, ...prev]);
    setActivePosition(newPos);
    setJd(newPos.defaultJd);
  };

  // Start new assessment for a job position
  const handleStartNewAssessmentForPosition = (pos: JobPosition) => {
    setActivePosition(pos);
    setJd(pos.defaultJd);
    // Reset resume to clean state
    setResume({
      fullName: '',
      currentRole: '',
      experienceYears: 6,
      education: 'کارشناسی ارشد مهندسی / مدیریت',
      careerPath: '',
      claimedAccomplishments: '',
      claimedStrengths: ''
    });
    setActiveView('wizard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Recall a report from history / position hub
  const handleRecallReport = (rep: AssessmentReport) => {
    setJd(rep.jobDescription);
    setResume(rep.resume);
    setHpi(rep.hpi);
    setHds(rep.hds);
    setSwift(rep.swift);
    setCurrentReport(rep);
    setActiveView('report');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Preset Selection
  const handleSelectPreset = (presetId: string) => {
    const found = sampleCaseStudies.find((c) => c.id === presetId);
    if (!found) return;

    setJd(found.jd);
    setResume(found.resume);
    setHpi(found.hpi);
    setHds(found.hds);
    setSwift(found.swift);

    const report = runPsychometricAssessment(found.jd, found.resume, found.hpi, found.hds, found.swift);
    setCurrentReport(report);
    setAiSource('deterministic');
    setActiveView('report');
  };

  // Run Assessment from Wizard
  const handleAnalyze = async (useAI: boolean) => {
    setIsLoading(true);
    try {
      const result = await analyzeCandidate(jd, resume, hpi, hds, swift, useAI);
      setCurrentReport(result.report);
      setAiSource(result.source);

      // Auto-save to pipeline
      setSavedReports((prev) => {
        const filtered = prev.filter((item) => item.id !== result.report.id);
        return [result.report, ...filtered];
      });

      setActiveView('report');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Analysis error:', err);
      const fallback = runPsychometricAssessment(jd, resume, hpi, hds, swift);
      setCurrentReport(fallback);
      setAiSource('deterministic');

      setSavedReports((prev) => {
        const filtered = prev.filter((item) => item.id !== fallback.id);
        return [fallback, ...filtered];
      });

      setActiveView('report');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsLoading(false);
    }
  };

  // Export standalone HTML
  const handleExportHTML = (targetRep?: AssessmentReport) => {
    const rep = targetRep || currentReport;
    if (!rep) return;
    const html = generateStandaloneHTMLReport(rep);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeName = rep.candidateName.replace(/\s+/g, '_') || 'candidate';
    link.href = url;
    link.download = `گزارش_روان_سنجی_استراتژیک_${safeName}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Delete from pipeline
  const handleDeleteReport = (id: string) => {
    setSavedReports((prev) => prev.filter((item) => item.id !== id));
  };

  const isCurrentReportSaved = savedReports.some((r) => r.id === currentReport?.id);

  return (
    <div className="min-h-screen bg-slate-50/70 flex flex-col selection:bg-indigo-100 selection:text-indigo-900">
      {/* 1. Header with User Status, Position Badge & Main Navigation */}
      <Header
        onSelectPreset={handleSelectPreset}
        onReset={() => handleStartNewAssessmentForPosition(activePosition)}
        onOpenHistory={() => setIsHistoryDrawerOpen(true)}
        onExportHTML={currentReport ? () => handleExportHTML(currentReport) : undefined}
        historyCount={savedReports.length}
        hasActiveReport={Boolean(currentReport)}
        activeCandidateName={currentReport?.candidateName}
        currentMember={currentMember}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        activePosition={activePosition}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      {/* 2. Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* VIEW A: JOB POSITIONS WORKSPACE & CANDIDATE ARCHIVES HUB */}
        {activeView === 'workspace' && (
          <JobWorkspaceHub
            positions={positions}
            activePosition={activePosition}
            onSelectPosition={handleSelectPosition}
            onCreatePosition={handleCreatePosition}
            savedReports={savedReports}
            onSelectReport={handleRecallReport}
            onDeleteReport={handleDeleteReport}
            onStartNewAssessmentForPosition={handleStartNewAssessmentForPosition}
            currentMember={currentMember}
            onOpenLogin={() => setIsLoginModalOpen(true)}
            onExportHTMLReport={(rep) => handleExportHTML(rep)}
          />
        )}

        {/* VIEW B: STEP-BY-STEP GUIDED WIZARD (PAGE BY PAGE - NO CLUTTER) */}
        {activeView === 'wizard' && (
          <StepWizardInput
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
            onAnalyze={handleAnalyze}
            isLoading={isLoading}
            activeJobPosition={activePosition}
            onCancelOrBackToWorkspace={() => setActiveView('workspace')}
          />
        )}

        {/* VIEW C: REPORT DASHBOARD (RECALLED OR GENERATED ANALYSIS) */}
        {activeView === 'report' && currentReport && (
          <div className="space-y-4 animate-fadeIn">
            {/* Context Navigation Bar */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setActiveView('workspace')}
                  className="text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>بازگشت به میز کار موقعیت‌های شغلی</span>
                </button>

                <span className="text-xs text-slate-400">|</span>

                <div className="text-xs font-bold text-slate-700">
                  پرونده کاندیدا: <span className="text-indigo-900">{currentReport.candidateName}</span>
                </div>

                <span className="text-xs text-slate-400">|</span>

                <div className="text-xs font-medium text-slate-500">
                  موقعیت: {currentReport.targetJobTitle}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleStartNewAssessmentForPosition(activePosition)}
                  className="text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3.5 py-2 rounded-xl transition cursor-pointer"
                >
                  + ارزیابی کاندیدای جدید
                </button>
              </div>
            </div>

            {/* Comprehensive Report Dashboard with Visual Radar Charts */}
            <ReportDashboard
              report={currentReport}
              onExportHTML={() => handleExportHTML(currentReport)}
              onSaveToPipeline={(rep) => {
                setSavedReports((prev) => {
                  const exists = prev.some((item) => item.id === rep.id);
                  if (exists) return prev;
                  return [rep, ...prev];
                });
              }}
              isSaved={isCurrentReportSaved}
              aiSource={aiSource}
              savedReports={savedReports}
            />
          </div>
        )}
      </main>

      {/* Team Login / Switcher Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleLogin}
        currentMember={currentMember}
      />

      {/* Global Archive Drawer */}
      <PipelineArchive
        isOpen={isHistoryDrawerOpen}
        onClose={() => setIsHistoryDrawerOpen(false)}
        savedReports={savedReports}
        onSelectReport={handleRecallReport}
        onDeleteReport={handleDeleteReport}
        onImportReports={(imported) => setSavedReports((prev) => [...imported, ...prev])}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            سامانه ارزیابی استراتژیک تلنت و روان‌شناسی صنعتی-سازمانی • میز کار تفکیک‌شده موقعیت‌های شغلی و آرشیو ارزیابی
          </span>
          <span className="font-semibold text-slate-600">
            فونت Vazirmatn • پشتیبانی کامل از استانداردهای راست‌چین (RTL)
          </span>
        </div>
      </footer>
    </div>
  );
}
