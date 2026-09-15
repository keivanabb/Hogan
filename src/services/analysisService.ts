import {
  AssessmentReport,
  CandidateResume,
  HoganHDS,
  HoganHPI,
  JobDescription,
  SwiftCognitive
} from '../types/assessment';
import { runPsychometricAssessment } from '../utils/psychometricEngine';

export interface AIEnrichment {
  executiveNarrative?: string;
  criticalRisksAnalysis?: string;
  interUnitConflictPrediction?: string;
  teamBurnoutAssessment?: string;
  tailoredBeiAdvice?: string;
}

export async function analyzeCandidate(
  jd: JobDescription,
  resume: CandidateResume,
  hpi: HoganHPI,
  hds: HoganHDS,
  swift: SwiftCognitive,
  useAI: boolean = true
): Promise<{ report: AssessmentReport; aiEnrichment: AIEnrichment | null; source: 'full-ai' | 'deterministic' }> {
  // Always compute deterministic psychometric baseline
  const baseReport = runPsychometricAssessment(jd, resume, hpi, hds, swift);

  if (!useAI) {
    return { report: baseReport, aiEnrichment: null, source: 'deterministic' };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout

    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jd, resume, hpi, hds, swift }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn('API returned non-OK status:', res.status);
      return { report: baseReport, aiEnrichment: null, source: 'deterministic' };
    }

    const data = await res.json();
    if (data.success && data.aiAnalysis) {
      const enrichment: AIEnrichment = data.aiAnalysis;
      // Enrich base report summary if available
      if (enrichment.executiveNarrative) {
        baseReport.executiveSummary = enrichment.executiveNarrative;
      }
      if (enrichment.criticalRisksAnalysis) {
        baseReport.darkSideDerailersSummary = enrichment.criticalRisksAnalysis;
      }
      if (enrichment.teamBurnoutAssessment) {
        baseReport.strategicCulturalFit += `\n\n📌 ارزیابی فرسایش سازمانی: ${enrichment.teamBurnoutAssessment}`;
      }
      return { report: baseReport, aiEnrichment: enrichment, source: 'full-ai' };
    }

    return { report: baseReport, aiEnrichment: null, source: 'deterministic' };
  } catch (err) {
    console.warn('AI analysis call failed or timed out, utilizing robust deterministic engine:', err);
    return { report: baseReport, aiEnrichment: null, source: 'deterministic' };
  }
}
