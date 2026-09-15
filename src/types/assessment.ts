export interface JobDescription {
  jobTitle: string;
  department: string;
  industry: string;
  requiredCompetencies: string; // شایستگی‌های کلیدی و رفتاری مورد نیاز این موقعیت شغلی (تعیین‌شده توسط ارزیاب)
  operationalChallengesAndRisks?: string; // مخاطرات و چالش‌های اختیاری
  strategicGoals?: string;
  criticalSLAs?: string;
  operationalBottlenecks?: string;
  interUnitConflicts?: string;
  teamSizeAndFriction?: string;
  rawUploadedContent?: string;
}

export interface CandidateResume {
  fullName: string;
  currentRole: string;
  experienceYears: number;
  education: string;
  careerPath: string;
  claimedAccomplishments: string;
  claimedStrengths: string;
  rawUploadedContent?: string;
}

export interface HoganHPI {
  // The Bright Side (0-100 percentile)
  adjustment: number; // تطبیق‌پذیری و خونسردی
  ambition: number; // جاه‌طلبی و هدایت‌گری
  sociability: number; // جامعه‌پذیری و شبکه ارتباطی
  interpersonalSensitivity: number; // حساسیت بین‌فردی و دیپلماسی
  prudence: number; // احتیاط، سازمان‌یافتگی و وجدان کاری
  inquisitive: number; // کنجکاوی و تفکر کلان
  learningApproach: number; // رویکرد یادگیری و به‌روز بودن
}

export interface HoganHDS {
  // The Dark Side Derailers (0-100 percentile, >70 is high risk danger zone)
  excitable: number; // هیجان‌پذیری و انفجار در فشار
  skeptical: number; // بدگمانی و توهم توطئه
  cautious: number; // احتیاط افراطی و ترس از شکست (فلج تحلیلی)
  reserved: number; // انزواطلبی و قطع ارتباط در بحران
  leisurely: number; // مقاومت منفی و لجاجت پنهان
  bold: number; // تکبر، خودبزرگ‌بینی و تصمیمات پرریسک
  mischievous: number; // ریسک‌پذیری ناسالم و دور زدن قوانین
  colorful: number; // نمایشگری و جلب توجه سطحی
  imaginative: number; // خیال‌پردازی نامتعارف و توهمات استراتژیک
  diligent: number; // وسواس، ریزمدیریتی و ناتوانی در تفویض
  dutiful: number; // فرمان‌برداری کورکورانه، ناتوانی در نه گفتن و فدا کردن تیم
}

export interface SwiftCognitive {
  verbalReasoning: number; // استدلال کلامی (صدک ۰-۱۰۰)
  numericalReasoning: number; // استدلال محاسباتی (صدک ۰-۱۰۰)
  abstractReasoning: number; // استدلال انتزاعی و کشف الگو (صدک ۰-۱۰۰)
  overallPercentile: number; // صدک کل شناختی
  speedVsAccuracy: 'سرعت بالا / دقت کم' | 'متعادل' | 'دقت بالا / سرعت کم' | 'سرعت و دقت عالی' | 'سرعت و دقت پایین';
}

export interface IntersectionAnalysis {
  id: string;
  title: string;
  category: 'ANALYSIS_PARALYSIS' | 'COMMUNICATION_BREAKDOWN' | 'OPERATIONAL_BOTTLENECK' | 'TEAM_BURNOUT' | 'CRITICAL_RISK' | 'CULTURE_RISK';
  severity: 'بحرانی (قرمز)' | 'هشدار جدی (نارنجی)' | 'متوسط (زرد)' | 'کم‌خطر (سبز)';
  metricsFormula: string;
  description: string;
  operationalImpact: string; // اثر عملیاتی در پایداری SLA و شبکه
  interUnitImpact: string; // اثر بر اصطکاک بین‌واحدی
  teamImpact: string; // اثر بر انگیزه و فرسایش تیم
  crisisTrigger: string; // محرک فعال‌کننده در شرایط بحران
}

export interface ClaimDiscrepancy {
  claim: string;
  source: string;
  psychometricReality: string;
  verdict: 'مغایرت بحرانی' | 'اغراق محتمل' | 'انطباق نسبی' | 'تایید شده';
  riskAnalysis: string;
}

// سوالات مصاحبه شایستگی‌محور (بر اساس شایستگی‌های وارد شده توسط ارزیاب)
export interface CompetencyQuestion {
  id: string;
  competencyName: string; // نام شایستگی
  importanceLevel: 'حیاتی' | 'بسیار مهم' | 'مهم';
  behavioralIndicators: string; // شاخص‌های رفتاری مورد انتظار
  scenario: string; // سناریوی زمینه
  exactQuestion: string; // سوال رفتاری BEI
  probingFollowUp: string; // سوال تعقیبی عمیق
  positiveEvidence: string[]; // شواهد رفتاری مثبت (Green Flags)
  negativeEvidence: string[]; // شواهد رفتاری منفی (Red Flags)
  scoringGuide: string; // راهنمای نمره‌دهی ۱ تا ۵
}

// سوالات اعتبارسنجی فرضیات آزمون هوگان در جلسه مصاحبه
export interface HoganValidationQuestion {
  id: string;
  traitOrDerailer: string; // عنوان صفت یا دارک‌ساید با ذکر نمره
  scaleType: 'HDS (Dark Side)' | 'HPI (Bright Side)';
  testScore: number; // نمره آزمون
  hypothesis: string; // فرضیه استخراج‌شده از تحلیل آزمون (آنچه کارنامه پیش‌بینی می‌کند)
  validationObjective: string; // هدف ارزیاب از راستی‌آزمایی در جلسه مصاحبه
  primaryQuestion: string; // سوال اصلی اعتبارسنجی
  stressProbeQuestion: string; // سوال تعقیبی در شرایط فشار و چالش
  signsTrueInInterview: string[]; // نشانه‌های تایید فرضیه در مصاحبه (دیده‌شدن دارک‌ساید در رفتار فرد)
  signsFalseOrCompensated: string[]; // نشانه‌های رد فرضیه یا وجود خودآگاهی و رفتارهای جبرانی بالغ
  ratingVerdictPrompt: string; // راهنمای نتیجه‌گیری ارزیاب پس از شنیدن پاسخ
}

export interface BEIQuestion {
  id: string;
  targetDerailer: string;
  category: string;
  scenario: string;
  conflictOfInterests: string;
  exactQuestion: string;
  lookFors: {
    greenFlags: string[];
    redFlags: string[];
  };
  evaluationRubric: string;
}

export interface AssessmentReport {
  id: string;
  date: string;
  candidateName: string;
  targetJobTitle: string;
  overallFitScore: number; // 0-100
  overallRiskLevel: 'بسیار پرریسک (غیرقابل توصیه)' | 'ریسک بالا (نیازمند مصاحبه دقیق و کنترل‌های سخت‌گیرانه)' | 'ریسک متوسط (قابل مدیریت با آنبوردینگ هدایت‌شده)' | 'انطباق مطلوب و کم‌ریسک';
  executiveSummary: string;
  strategicCulturalFit: string;
  cognitiveProfileSummary: string;
  darkSideDerailersSummary: string;
  intersections: IntersectionAnalysis[];
  claimDiscrepancies: ClaimDiscrepancy[];
  competencyQuestions: CompetencyQuestion[]; // سوالات مصاحبه شایستگی‌های شغل
  hoganValidationQuestions: HoganValidationQuestion[]; // سوالات اعتبارسنجی فرضیات هوگان در مصاحبه
  beiInterviewGuide: BEIQuestion[]; // مصاحبه رفتارمحور تقاطعی
  onboardingSafeguards: string[];
  jobDescription: JobDescription;
  resume: CandidateResume;
  hpi: HoganHPI;
  hds: HoganHDS;
  swift: SwiftCognitive;
  createdAt: string;
  notes?: string;
}
