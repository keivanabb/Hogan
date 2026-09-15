import { JobDescription } from './assessment';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  avatarBg: string;
  avatarInitials: string;
  email?: string;
}

export interface JobPosition {
  id: string;
  title: string;
  department: string;
  industry: string;
  competencies: string[];
  description: string;
  defaultJd: JobDescription;
  createdAt: string;
}

export const DEFAULT_TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'dr-keyhani',
    name: 'دکتر فرزاد کیهانی',
    role: 'رئیس کمیته روان‌سنجی و ارزیابی استراتژیک',
    department: 'مرکز ارزیابی تلنت‌های اجرایی',
    avatarBg: 'bg-indigo-600',
    avatarInitials: 'ف‌ک',
    email: 'f.keyhani@telecom-talent.ir'
  },
  {
    id: 'eng-kazemi',
    name: 'مهندس مریم کاظمی',
    role: 'مدیر ارشد جذب و ارزیابی تلنت‌های تلکام',
    department: 'معاونت سرمایه انسانی',
    avatarBg: 'bg-emerald-600',
    avatarInitials: 'م‌ک',
    email: 'm.kazemi@telecom-talent.ir'
  },
  {
    id: 'dr-sabour',
    name: 'دکتر کامبیز صبور',
    role: 'مشاور روان‌شناسی صنعتی و ارزیاب رفتارهای رهبری',
    department: 'کمیته انتصابات راهبردی',
    avatarBg: 'bg-purple-600',
    avatarInitials: 'ک‌ص',
    email: 'k.sabour@telecom-talent.ir'
  }
];

export const DEFAULT_JOB_POSITIONS: JobPosition[] = [
  {
    id: 'telecom-strategic-pm',
    title: 'مدیر ارشد پروژه‌های استراتژیک تلکام',
    department: 'معاونت برنامه‌ریزی راهبردی و تحول دیجیتال',
    industry: 'مخابرات و تلکام (Telecom & ICT)',
    competencies: [
      'مدیریت بحران و حفظ خونسردی در اختلالات حاد شبکه',
      'رهبری استراتژیک تیم‌های ماتریسی و حل تعارضات بین‌معاونتی',
      'انضباط فرآیندی و تعهد خدشه‌ناپذیر به SLAهای سخت‌گیرانه',
      'تفکر تحلیلی عمیق و مدل‌سازی چالش‌های فنی چندبعدی',
      'دیپلماسی سازمانی و اقناع ذی‌نفعان در مذاکرات بالادستی'
    ],
    description: 'هدایت پروژه‌های کلان زیرساخت دیجیتال، فیبرنوری و توسعه نسل پنجم شبکه با تعهدات زمانی سخت‌گیرانه.',
    createdAt: '1403/08/10',
    defaultJd: {
      jobTitle: 'مدیر ارشد پروژه‌های استراتژیک تلکام',
      department: 'معاونت برنامه‌ریزی راهبردی و تحول دیجیتال',
      industry: 'مخابرات و تلکام (Telecom & ICT)',
      requiredCompetencies: 'مدیریت بحران و حفظ خونسردی در اختلالات حاد شبکه\nرهبری استراتژیک تیم‌های ماتریسی و حل تعارضات بین‌معاونتی\nانضباط فرآیندی و تعهد خدشه‌ناپذیر به SLAهای سخت‌گیرانه\nتفکر تحلیلی عمیق و مدل‌سازی چالش‌های فنی چندبعدی\nدیپلماسی سازمانی و اقناع ذی‌نفعان در مذاکرات بالادستی',
      operationalChallengesAndRisks: 'فشارهای زمانی تحویل پروژه با جرایم مالی سنگین رگولاتوری\nفرسایش تیم‌های فنی به دلیل شیفت‌های طولانی هنگام راه‌اندازی Core\nتعارضات شدید با معاونت مالی و زنجیره تامین قطعات',
      criticalSLAs: 'پایداری ۹۹.۹۹٪ سرویس‌های حیاتی و جبران خسارت روزانه در تاخیر',
      teamSizeAndFriction: 'تیم مرکزی ۲۰ نفره به علاوه ۶۰ نفر کارشناس پیمانکار'
    }
  },
  {
    id: 'telecom-core-ops',
    title: 'مدیر عملیات شبکه Core و سوئیچینگ',
    department: 'معاونت مهندسی شبکه و زیرساخت',
    industry: 'مخابرات و تلکام (Telecom & ICT)',
    competencies: [
      'تاب‌آوری عصبی و تصمیم‌گیری عقلانی در اوج حوادث قطعی Core',
      'دقت وسواس‌گونه به استانداردهای امنیتی و پروتکل‌های فنی',
      'توانایی آرام‌سازی تیم‌های شیفت عملیات در بحران‌های شبانه',
      'تحلیل داده‌های آماری ترافیک شبکه و پیش‌بینی گلوگاه‌ها',
      'شفافیت اخلاقی و گزارش‌دهی صادقانه خطاها به مراجع نظارتی'
    ],
    description: 'راهبری مرکز عملیات شبکه (NOC) و تضمین پایداری بدون وقفه بسترهای سوئیچینگ و زیرساخت ارتباطی کشور.',
    createdAt: '1403/09/01',
    defaultJd: {
      jobTitle: 'مدیر عملیات شبکه Core و سوئیچینگ',
      department: 'معاونت مهندسی شبکه و زیرساخت',
      industry: 'مخابرات و تلکام (Telecom & ICT)',
      requiredCompetencies: 'تاب‌آوری عصبی و تصمیم‌گیری عقلانی در اوج حوادث قطعی Core\nدقت وسواس‌گونه به استانداردهای امنیتی و پروتکل‌های فنی\nتوانایی آرام‌سازی تیم‌های شیفت عملیات در بحران‌های شبانه\nتحلیل داده‌های آماری ترافیک شبکه و پیش‌بینی گلوگاه‌ها\nشفافیت اخلاقی و گزارش‌دهی صادقانه خطاها به مراجع نظارتی',
      operationalChallengesAndRisks: 'حملات سایبری و قطعی‌های ناگهانی لینک‌های بین‌استانی\nشیفت‌های فشرده و خستگی مفرط نیروهای NOC',
      criticalSLAs: 'زمان بازیابی (MTTR) زیر ۱۵ دقیقه در بحران‌های بحرانی',
      teamSizeAndFriction: '۳۵ نفر مهندس شبکه و سوئیچینگ ۲۴/۷'
    }
  },
  {
    id: 'telecom-b2b-director',
    title: 'مدیر توسعه راهکارهای تجاری و سازمانی B2B',
    department: 'معاونت تجاری و فروش شرکتی',
    industry: 'مخابرات سازمانی و اینترنت اشیاء (IoT)',
    competencies: [
      'مذاکره قدرتمند و اقناع هیئت مدیره شرکت‌های بزرگ و بانک‌ها',
      'هوش تجاری و تحلیل سودآوری قراردادهای کلان Enterprise',
      'انگیزش و مدیریت هیجان تیم فروش تحت تارگت‌های سنگین فصلی',
      'هماهنگی بدون اصطکاک با تیم فنی جهت تطبیق راه‌حل با نیاز مشتری',
      'صداقت حرفه‌ای و پرهیز از وعده‌های توخالی فراتر از توان شبکه'
    ],
    description: 'توسعه بازار راهکارهای ارتباطی ابری، APN اختصاصی و پروژه‌های اینترنت اشیاء برای بانک‌ها، وزارتخانه‌ها و صنایع بزرگ.',
    createdAt: '1403/09/15',
    defaultJd: {
      jobTitle: 'مدیر توسعه راهکارهای تجاری و سازمانی B2B',
      department: 'معاونت تجاری و فروش شرکتی',
      industry: 'مخابرات سازمانی و اینترنت اشیاء (IoT)',
      requiredCompetencies: 'مذاکره قدرتمند و اقناع هیئت مدیره شرکت‌های بزرگ و بانک‌ها\nهوش تجاری و تحلیل سودآوری قراردادهای کلان Enterprise\nانگیزش و مدیریت هیجان تیم فروش تحت تارگت‌های سنگین فصلی\nهماهنگی بدون اصطکاک با تیم فنی جهت تطبیق راه‌حل با نیاز مشتری\nصداقت حرفه‌ای و پرهیز از وعده‌های توخالی فراتر از توان شبکه',
      operationalChallengesAndRisks: 'رقابت نفس‌گیر با رقبا بر سر مناقصات صد میلیاردی\nتاخیر بخش فنی در تحویل سرویس به مشتریان خاص',
      criticalSLAs: 'تضمین تحویل سرویس تجاری در مهلت تعیین‌شده در SLA مناقصه',
      teamSizeAndFriction: '۱۵ مدیر حساب مشتریان و مهندسین فروش پیش از قرارداد'
    }
  }
];

/* ------------------------------------------------------------------
 * مخزن مدارک (Document Vault)
 * مدارک بارگذاری‌شده به تفکیک «موقعیت شغلی» و «پرونده کاندیدا» نگهداری
 * می‌شوند تا اعضای تیم بتوانند بعداً آن‌ها را فراخوانی کنند.
 * ------------------------------------------------------------------ */

export type DocumentKind = 'jd' | 'resume' | 'hds' | 'hpi' | 'swift' | 'other';

export interface DocumentKindMeta {
  kind: DocumentKind;
  label: string;
  hint: string;
  accept: string;
}

export const DOCUMENT_KINDS: DocumentKindMeta[] = [
  {
    kind: 'jd',
    label: 'شرح شغل و شایستگی‌ها',
    hint: 'فایل شرح وظایف، چارت سازمانی یا مدل شایستگی این موقعیت',
    accept: '.docx,.txt,.md,.csv'
  },
  {
    kind: 'resume',
    label: 'رزومه و سوابق کاندیدا',
    hint: 'رزومه (Word/متن)، فرم درخواست شغل یا خلاصه سوابق',
    accept: '.docx,.txt,.md'
  },
  {
    kind: 'hds',
    label: 'کارنامه هوگان HDS (بخش تاریک)',
    hint: 'گزارش خام آزمون دارک‌ساید جهت بایگانی و ارجاع بعدی',
    accept: '.docx,.txt,.md,.xlsx,.xls,.csv'
  },
  {
    kind: 'hpi',
    label: 'کارنامه هوگان HPI (بخش روشن)',
    hint: 'گزارش خام صفات عملکرد روزمره',
    accept: '.docx,.txt,.md,.xlsx,.xls,.csv'
  },
  {
    kind: 'swift',
    label: 'کارنامه شناختی Swift',
    hint: 'فایل اکسل نمرات استدلال کلامی، محاسباتی و انتزاعی',
    accept: '.xlsx,.xls,.csv'
  },
  {
    kind: 'other',
    label: 'سایر مدارک پرونده',
    hint: 'گواهی‌نامه‌ها، فرم‌های ارزیابی قبلی، یادداشت مصاحبه',
    accept: '.docx,.txt,.md,.xlsx,.xls,.csv'
  }
];

export interface StoredDocument {
  id: string;
  positionId: string;
  positionTitle: string;
  candidateCode: string; // نام یا کد پرونده کاندیدا
  kind: DocumentKind;
  fileName: string;
  sizeBytes: number;
  uploadedAt: string; // ISO
  uploadedById: string;
  uploadedByName: string;
  extractedText: string; // متن استخراج‌شده (برای جست‌وجو و پیش‌نمایش)
  dataUrl?: string; // نسخه اصل فایل (در صورت وجود فضای کافی در مرورگر)
  linkedReportId?: string;
  note?: string;
}
