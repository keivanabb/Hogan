import { AssessmentReport } from '../types/assessment';

function renderSvgRadarHtml(axes: Array<{ label: string; val: number }>, dangerThreshold?: number, color = '#4f46e5'): string {
  const cx = 220, cy = 190, maxR = 115;
  const n = axes.length;
  const polyPoints = axes.map((a, i) => {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2;
    const r = (Math.max(0, Math.min(100, a.val)) / 100) * maxR;
    return `${(cx + r * Math.cos(angle)).toFixed(1)},${(cy + r * Math.sin(angle)).toFixed(1)}`;
  }).join(' ');

  const rings = [20, 40, 60, 80, 100];
  const ringsSvg = rings.map(pct => {
    const r = (pct / 100) * maxR;
    const pts = Array.from({ length: n }).map((_, i) => {
      const angle = (2 * Math.PI * i) / n - Math.PI / 2;
      return `${(cx + r * Math.cos(angle)).toFixed(1)},${(cy + r * Math.sin(angle)).toFixed(1)}`;
    }).join(' ');
    const isDanger = dangerThreshold && pct === 70;
    return `<polygon points="${pts}" fill="${pct === 100 ? '#f8fafc' : 'none'}" stroke="${isDanger ? '#ef4444' : '#e2e8f0'}" stroke-width="${isDanger ? '1.5' : '1'}" stroke-dasharray="${isDanger ? '4,3' : 'none'}" />`;
  }).join('');

  const axesSvg = axes.map((_, i) => {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2;
    return `<line x1="${cx}" y1="${cy}" x2="${(cx + maxR * Math.cos(angle)).toFixed(1)}" y2="${(cy + maxR * Math.sin(angle)).toFixed(1)}" stroke="#cbd5e1" stroke-dasharray="2,2" />`;
  }).join('');

  const labelsSvg = axes.map((a, i) => {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2;
    const lx = cx + (maxR + 24) * Math.cos(angle);
    const ly = cy + (maxR + 24) * Math.sin(angle);
    const cosAngle = Math.cos(angle);
    const textAnchor = cosAngle > 0.3 ? 'start' : cosAngle < -0.3 ? 'end' : 'middle';
    const isDanger = dangerThreshold && a.val >= dangerThreshold;
    return `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="${textAnchor}" font-size="9.5" font-family="Vazirmatn, sans-serif" fill="${isDanger ? '#dc2626' : '#334155'}" font-weight="${isDanger ? 'bold' : 'normal'}">${a.label} (${a.val}%)</text>`;
  }).join('');

  return `
    <div style="text-align: center; margin: 16px auto; max-width: 440px;">
      <svg viewBox="0 0 440 380" style="width: 100%; height: auto;">
        ${ringsSvg}
        ${axesSvg}
        <polygon points="${polyPoints}" fill="${color}33" stroke="${color}" stroke-width="2.5" />
        ${axes.map((a, i) => {
          const angle = (2 * Math.PI * i) / n - Math.PI / 2;
          const r = (Math.max(0, Math.min(100, a.val)) / 100) * maxR;
          const isDanger = dangerThreshold && a.val >= dangerThreshold;
          return `<circle cx="${(cx + r * Math.cos(angle)).toFixed(1)}" cy="${(cy + r * Math.sin(angle)).toFixed(1)}" r="4.5" fill="${isDanger ? '#ef4444' : color}" stroke="#fff" stroke-width="1.5" />`;
        }).join('')}
        ${labelsSvg}
      </svg>
    </div>
  `;
}

export function generateStandaloneHTMLReport(report: AssessmentReport): string {
  const hdsEntries = [
    { key: 'excitable', label: 'هیجان‌پذیری و تندخویی در فشار (Excitable)', val: report.hds.excitable },
    { key: 'skeptical', label: 'بدگمانی و توهم توطئه (Skeptical)', val: report.hds.skeptical },
    { key: 'cautious', label: 'احتیاط افراطی / فلج تحلیلی (Cautious)', val: report.hds.cautious },
    { key: 'reserved', label: 'انزواطلبی و سکوت در بحران (Reserved)', val: report.hds.reserved },
    { key: 'leisurely', label: 'مقاومت منفی و لجاجت پنهان (Leisurely)', val: report.hds.leisurely },
    { key: 'bold', label: 'تکبر و خودشیفتگی (Bold)', val: report.hds.bold },
    { key: 'mischievous', label: 'ریسک‌پذیری ناسالم و دور زدن قانون (Mischievous)', val: report.hds.mischievous },
    { key: 'colorful', label: 'نمایشگری و جلب توجه (Colorful)', val: report.hds.colorful },
    { key: 'imaginative', label: 'خیال‌پردازی و دوری از واقعیت (Imaginative)', val: report.hds.imaginative },
    { key: 'diligent', label: 'وسواس و ریزمدیریتی مفرط (Diligent)', val: report.hds.diligent },
    { key: 'dutiful', label: 'فرمان‌برداری کورکورانه / فرسایش تیم (Dutiful)', val: report.hds.dutiful }
  ];

  const hpiEntries = [
    { key: 'adjustment', label: 'تطبیق‌پذیری و خونسردی (Adjustment)', val: report.hpi.adjustment },
    { key: 'ambition', label: 'جاه‌طلبی و هدایت‌گری (Ambition)', val: report.hpi.ambition },
    { key: 'sociability', label: 'جامعه‌پذیری و شبکه ارتباطی (Sociability)', val: report.hpi.sociability },
    { key: 'interpersonalSensitivity', label: 'حساسیت بین‌فردی و دیپلماسی (Sensitivity)', val: report.hpi.interpersonalSensitivity },
    { key: 'prudence', label: 'احتیاط و وجدان‌کاری (Prudence)', val: report.hpi.prudence },
    { key: 'inquisitive', label: 'کنجکاوی و نگاه استراتژیک (Inquisitive)', val: report.hpi.inquisitive },
    { key: 'learningApproach', label: 'رویکرد یادگیری و به‌روز بودن (Learning)', val: report.hpi.learningApproach }
  ];

  const riskColor = report.overallRiskLevel.includes('غیرقابل') || report.overallRiskLevel.includes('بسیار')
    ? '#dc2626'
    : report.overallRiskLevel.includes('بالا')
    ? '#ea580c'
    : report.overallRiskLevel.includes('متوسط')
    ? '#d97706'
    : '#16a34a';

  return `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>گزارش جامع روان‌سنجی و ارزیابی استراتژیک | ${report.candidateName}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #1e293b;
      --accent: #4f46e5;
      --accent-light: #eef2ff;
      --danger: #dc2626;
      --danger-light: #fef2f2;
      --warning: #d97706;
      --warning-light: #fffbeb;
      --success: #16a34a;
      --success-light: #f0fdf4;
      --border: #e2e8f0;
      --bg: #f8fafc;
      --card: #ffffff;
      --text: #0f172a;
      --text-muted: #64748b;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: 'Vazirmatn', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    body {
      background-color: var(--bg);
      color: var(--text);
      line-height: 1.7;
      direction: rtl;
      text-align: right;
      padding: 32px 16px;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    header {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 32px;
      margin-bottom: 24px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    .header-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
      border-bottom: 1px solid var(--border);
      padding-bottom: 20px;
      margin-bottom: 20px;
    }
    .badge {
      display: inline-block;
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 13px;
      font-weight: 600;
    }
    .badge-primary { background: var(--accent-light); color: var(--accent); }
    .badge-danger { background: var(--danger-light); color: var(--danger); }
    .badge-warning { background: var(--warning-light); color: var(--warning); }
    .badge-success { background: var(--success-light); color: var(--success); }
    .badge-dark { background: #f1f5f9; color: #334155; }
    
    h1 {
      font-size: 26px;
      font-weight: 800;
      color: var(--primary);
      margin-bottom: 6px;
    }
    h2 {
      font-size: 20px;
      font-weight: 700;
      color: var(--primary);
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    h3 {
      font-size: 16px;
      font-weight: 700;
      color: var(--primary);
      margin-bottom: 8px;
    }
    .subtitle {
      color: var(--text-muted);
      font-size: 14px;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
    }
    .meta-item {
      background: #f8fafc;
      padding: 14px;
      border-radius: 10px;
      border: 1px solid var(--border);
    }
    .meta-label {
      font-size: 12px;
      color: var(--text-muted);
      margin-bottom: 4px;
    }
    .meta-value {
      font-size: 15px;
      font-weight: 700;
      color: var(--primary);
    }
    .kpi-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
    }
    .kpi-card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 24px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.02);
    }
    .kpi-score {
      font-size: 42px;
      font-weight: 900;
      line-height: 1;
      margin: 12px 0 6px;
    }
    .card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 28px;
      margin-bottom: 24px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.02);
    }
    .card-title-bar {
      border-bottom: 1px solid var(--border);
      padding-bottom: 14px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .prose {
      font-size: 15px;
      color: #334155;
      line-height: 1.8;
    }
    
    /* Charts & Meters */
    .meter-list {
      display: grid;
      grid-template-columns: 1fr;
      gap: 12px;
    }
    @media (min-width: 768px) {
      .meter-list-2col {
        grid-template-columns: 1fr 1fr;
      }
    }
    .meter-item {
      background: #f8fafc;
      padding: 12px 16px;
      border-radius: 10px;
      border: 1px solid var(--border);
    }
    .meter-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
      font-size: 14px;
      font-weight: 600;
    }
    .meter-bar-track {
      height: 10px;
      background: #e2e8f0;
      border-radius: 9999px;
      overflow: hidden;
      position: relative;
    }
    .meter-bar-fill {
      height: 100%;
      border-radius: 9999px;
      transition: width 0.3s ease;
    }
    .zone-marker {
      position: absolute;
      top: 0;
      bottom: 0;
      width: 2px;
      background: rgba(220, 38, 38, 0.4);
      left: 30%; /* Since RTL, 70% from right is 30% from left */
    }

    /* Tables */
    .table-container {
      overflow-x: auto;
      border: 1px solid var(--border);
      border-radius: 12px;
      background: var(--card);
    }
    table {
      width: 100%;
      border-collapse: collapse;
      text-align: right;
      font-size: 14px;
    }
    th {
      background: #f1f5f9;
      padding: 14px 16px;
      font-weight: 700;
      color: var(--primary);
      border-bottom: 1px solid var(--border);
    }
    td {
      padding: 14px 16px;
      border-bottom: 1px solid var(--border);
      vertical-align: top;
    }
    tr:last-child td {
      border-bottom: none;
    }
    tr:hover td {
      background: #f8fafc;
    }

    /* BEI Question Box */
    .bei-box {
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 16px;
      background: #fafafa;
    }
    .bei-title {
      font-weight: 700;
      font-size: 16px;
      color: var(--primary);
      margin-bottom: 8px;
    }
    .bei-meta {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin-bottom: 12px;
    }
    .bei-question-text {
      background: #eef2ff;
      border-right: 4px solid var(--accent);
      padding: 14px 16px;
      border-radius: 0 8px 8px 0;
      font-weight: 600;
      font-size: 15px;
      color: #1e1b4b;
      margin: 14px 0;
    }
    .flags-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 16px;
      margin-top: 14px;
    }
    @media (min-width: 768px) {
      .flags-grid {
        grid-template-columns: 1fr 1fr;
      }
    }
    .flag-box {
      padding: 14px;
      border-radius: 10px;
      font-size: 13px;
    }
    .flag-green {
      background: var(--success-light);
      border: 1px solid #bbf7d0;
      color: #14532d;
    }
    .flag-red {
      background: var(--danger-light);
      border: 1px solid #fecaca;
      color: #7f1d1d;
    }
    .flag-box ul {
      padding-right: 20px;
      margin-top: 6px;
    }

    /* Print Controls */
    .print-controls {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-bottom: 16px;
    }
    .btn {
      padding: 10px 18px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      border: 1px solid var(--border);
      background: white;
      color: var(--text);
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    .btn-primary {
      background: var(--accent);
      color: white;
      border-color: var(--accent);
    }
    .btn:hover {
      opacity: 0.9;
    }
    @media print {
      body {
        background: white !important;
        padding: 0 !important;
      }
      .no-print {
        display: none !important;
      }
      .card, header {
        box-shadow: none !important;
        border: 1px solid #ccc !important;
        break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="print-controls no-print">
      <button class="btn" onclick="window.print()">
        🖨️ چاپ یا ذخیره PDF
      </button>
      <button class="btn btn-primary" onclick="alert('این فایل کاملاً مستقل بوده و بدون نیاز به اینترنت یا سرور در هر مرورگری قابل اجراست.')">
        ✅ فایل مستقل آماده بایگانی
      </button>
    </div>

    <!-- Header -->
    <header>
      <div class="header-top">
        <div>
          <span class="badge badge-primary">ارزیابی استراتژیک تلنت و روان‌شناسی صنعتی-سازمانی</span>
          <h1 style="margin-top: 8px;">کارنامه جامع انطباق روان‌سنجی و تحلیل دارک‌سایدها</h1>
          <p class="subtitle">صنعت مخابرات، ارتباطات و موقعیت‌های حساس مدیریتی (Telecommunications Leadership)</p>
        </div>
        <div>
          <span class="badge" style="background: ${riskColor}15; color: ${riskColor}; font-size: 15px; border: 1px solid ${riskColor}40;">
            وضعیت ریسک: ${report.overallRiskLevel}
          </span>
        </div>
      </div>
      
      <div class="meta-grid">
        <div class="meta-item">
          <div class="meta-label">نام کاندیدا</div>
          <div class="meta-value">${report.candidateName}</div>
        </div>
        <div class="meta-item">
          <div class="meta-label">عنوان موقعیت شغلی هدف</div>
          <div class="meta-value">${report.targetJobTitle}</div>
        </div>
        <div class="meta-item">
          <div class="meta-label">واحد سازمانی / حوزه</div>
          <div class="meta-value">${report.jobDescription.department}</div>
        </div>
        <div class="meta-item">
          <div class="meta-label">تاریخ ارزیابی و نسخه</div>
          <div class="meta-value">${report.date} (نهایی)</div>
        </div>
      </div>

      ${report.jobDescription.requiredCompetencies ? `
      <div style="margin-top: 16px; padding: 14px 18px; background: #eef2ff; border: 1px solid #c7d2fe; border-radius: 10px; font-size: 14px; color: #312e81; line-height: 1.7;">
        <strong style="color: #1e1b4b;">🎯 شایستگی‌های کلیدی مورد نیاز شغل (تعیین‌شده توسط ارزیاب):</strong>
        <span>${report.jobDescription.requiredCompetencies}</span>
      </div>
      ` : ''}

      ${report.jobDescription.operationalChallengesAndRisks ? `
      <div style="margin-top: 12px; padding: 14px 18px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; font-size: 14px; color: #92400e; line-height: 1.7;">
        <strong style="color: #78350f;">⚠️ مخاطرات و چالش‌های کلیدی شغل:</strong>
        <span>${report.jobDescription.operationalChallengesAndRisks}</span>
      </div>
      ` : ''}
    </header>

    <!-- KPI Summary Cards -->
    <div class="kpi-cards">
      <div class="kpi-card">
        <div class="meta-label">شاخص کل انطباق شغلی (Fit Index)</div>
        <div class="kpi-score" style="color: ${riskColor};">${report.overallFitScore}<span style="font-size: 20px; font-weight: 500; color: #94a3b8;"> از ۱۰۰</span></div>
        <div class="meta-label" style="font-size: 13px;">تلفیق رزومه، توانایی شناختی و صفات شخصیتی</div>
      </div>
      <div class="kpi-card">
        <div class="meta-label">سطح هشدار دارک‌سایدهای بحران (Derailers)</div>
        <div class="kpi-score" style="color: ${report.intersections.length > 0 ? '#dc2626' : '#16a34a'};">
          ${report.intersections.length} <span style="font-size: 18px; font-weight: 600;">الگوی تقاطعی حاد</span>
        </div>
        <div class="meta-label" style="font-size: 13px;">محرک‌های فرسایش تیم و قطع سرویس در بحران</div>
      </div>
      <div class="kpi-card">
        <div class="meta-label">ظرفیت پردازش شناختی کل (Swift Aptitude)</div>
        <div class="kpi-score" style="color: #4f46e5;">
          ${report.swift.overallPercentile} <span style="font-size: 18px; font-weight: 600;">صدک کشوری</span>
        </div>
        <div class="meta-label" style="font-size: 13px;">شاخص سرعت و دقت: ${report.swift.speedVsAccuracy}</div>
      </div>
    </div>

    <!-- Executive Summary -->
    <section class="card">
      <div class="card-title-bar">
        <h2>📋 خلاصه اجرایی و رای کارشناسی روان‌شناس صنعتی-سازمانی</h2>
        <span class="badge badge-dark">Executive Summary</span>
      </div>
      <p class="prose" style="margin-bottom: 16px;">
        ${report.executiveSummary}
      </p>
      <div style="background: #f8fafc; border: 1px solid var(--border); border-radius: 12px; padding: 16px;">
        <h3 style="color: #334155; margin-bottom: 6px;">تحلیل انطباق فرهنگی-استراتژیک با اکوسیستم تلکام:</h3>
        <p class="prose" style="font-size: 14px;">
          ${report.strategicCulturalFit}
        </p>
      </div>
    </section>

    <!-- SECTION: INTERSECTION THINKING ANALYSIS -->
    <section class="card">
      <div class="card-title-bar">
        <h2>⚡ تحلیل تقاطعی دارک‌سایدها و شرایط بحرانی (Intersection Model)</h2>
        <span class="badge badge-danger">Cross-Referencing Analytics</span>
      </div>
      <p class="prose" style="margin-bottom: 20px;">
        در روان‌شناسی صنعتی مدرن، صفات به صورت ایزوله تحلیل نمی‌شوند. ترکیب هم‌زمان دو یا چند ویژگی در شرایط تنش‌های تلکام (نظیر قطعی سراسری، فشار SLA رگولاتوری و تعارض بین‌معاونتی) می‌تواند پیامدهای مرگبار سازمانی ایجاد کند:
      </p>

      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th style="width: 25%;">الگوی تقاطع و فرمول</th>
              <th style="width: 12%;">شدت ریسک</th>
              <th style="width: 25%;">اثر مستقیم بر پایداری SLA و شبکه</th>
              <th style="width: 20%;">پیامد تعارض بین‌واحدی</th>
              <th style="width: 18%;">آسیب به تیم و فرسایش</th>
            </tr>
          </thead>
          <tbody>
            ${report.intersections.map(item => `
              <tr>
                <td>
                  <strong>${item.title}</strong>
                  <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">
                    ${item.metricsFormula}
                  </div>
                  <div style="font-size: 12px; color: #475569; margin-top: 6px;">
                    <strong>محرک بحران:</strong> ${item.crisisTrigger}
                  </div>
                </td>
                <td>
                  <span class="badge ${item.severity.includes('قرمز') ? 'badge-danger' : item.severity.includes('نارنجی') ? 'badge-warning' : 'badge-primary'}">
                    ${item.severity}
                  </span>
                </td>
                <td>${item.operationalImpact}</td>
                <td>${item.interUnitImpact}</td>
                <td>${item.teamImpact}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </section>

    <!-- SECTION: PSYCHOMETRIC TEST DETAIL BARS -->
    <section class="card">
      <div class="card-title-bar">
        <h2>📊 پروفایل تفصیلی آزمون‌های شخصیت و شناخت (Hogan & Swift)</h2>
        <span class="badge badge-dark">Quantitative Psychometrics</span>
      </div>

      <div style="margin-bottom: 28px;">
        <h3 style="color: #dc2626; display: flex; align-items: center; gap: 8px;">
          <span>🛑 آزمون بخش تاریک هوگان (HDS - Dark Side Derailers):</span>
          <span style="font-size: 12px; font-weight: normal; color: var(--text-muted);">(نمرات بالای ۷۰٪ در منطقه پرخطر و بحرانی قرار دارند)</span>
        </h3>
        ${renderSvgRadarHtml(hdsEntries.map(h => ({ label: h.key, val: h.val })), 70, '#dc2626')}
        <div class="meter-list meter-list-2col" style="margin-top: 14px;">
          ${hdsEntries.map(h => {
            const isHighRisk = h.val >= 70;
            const barColor = isHighRisk ? '#dc2626' : h.val >= 40 ? '#d97706' : '#16a34a';
            return `
              <div class="meter-item" style="${isHighRisk ? 'background: #fef2f2; border-color: #fecaca;' : ''}">
                <div class="meter-header">
                  <span>${h.label}</span>
                  <span style="color: ${barColor}; font-weight: 800;">${h.val}٪ ${isHighRisk ? '⚠️ (خطرناک)' : ''}</span>
                </div>
                <div class="meter-bar-track">
                  <div class="meter-bar-fill" style="width: ${h.val}%; background: ${barColor};"></div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <div style="margin-bottom: 28px;">
        <h3 style="color: #4f46e5; margin-bottom: 12px;">☀️ آزمون بخش روشن هوگان در شرایط عادی (HPI - Bright Side):</h3>
        ${renderSvgRadarHtml(hpiEntries.map(h => ({ label: h.key, val: h.val })), undefined, '#4f46e5')}
        <div class="meter-list meter-list-2col">
          ${hpiEntries.map(h => `
            <div class="meter-item">
              <div class="meter-header">
                <span>${h.label}</span>
                <span style="color: #4f46e5; font-weight: 700;">${h.val}٪</span>
              </div>
              <div class="meter-bar-track">
                <div class="meter-bar-fill" style="width: ${h.val}%; background: #4f46e5;"></div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <div>
        <h3 style="color: #0284c7; margin-bottom: 12px;">🧠 آزمون توانمندی شناختی سویفت (Swift Cognitive Aptitude):</h3>
        ${renderSvgRadarHtml([
          { label: 'کلامی', val: report.swift.verbalReasoning },
          { label: 'محاسباتی', val: report.swift.numericalReasoning },
          { label: 'انتزاعی', val: report.swift.abstractReasoning },
          { label: 'شاخص کل', val: report.swift.overallPercentile }
        ], undefined, '#0284c7')}
        <div class="meter-list" style="grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));">
          <div class="meter-item">
            <div class="meter-header">
              <span>استدلال کلامی (Verbal Reasoning)</span>
              <span style="font-weight: 700;">${report.swift.verbalReasoning}٪</span>
            </div>
            <div class="meter-bar-track">
              <div class="meter-bar-fill" style="width: ${report.swift.verbalReasoning}%; background: ${report.swift.verbalReasoning < 45 ? '#ea580c' : '#0284c7'};"></div>
            </div>
          </div>
          <div class="meter-item">
            <div class="meter-header">
              <span>استدلال محاسباتی (Numerical)</span>
              <span style="font-weight: 700;">${report.swift.numericalReasoning}٪</span>
            </div>
            <div class="meter-bar-track">
              <div class="meter-bar-fill" style="width: ${report.swift.numericalReasoning}%; background: #0284c7;"></div>
            </div>
          </div>
          <div class="meter-item">
            <div class="meter-header">
              <span>استدلال انتزاعی و کشف الگو (Abstract)</span>
              <span style="font-weight: 700;">${report.swift.abstractReasoning}٪</span>
            </div>
            <div class="meter-bar-track">
              <div class="meter-bar-fill" style="width: ${report.swift.abstractReasoning}%; background: #0284c7;"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- SECTION: CLAIM VS REALITY -->
    <section class="card">
      <div class="card-title-bar">
        <h2>🔍 جدول واکاوی شکاف ادعای رزومه در برابر حقیقت روان‌سنجی</h2>
        <span class="badge badge-warning">Claim vs Reality Gap</span>
      </div>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th style="width: 25%;">ادعای کلیدی کاندیدا در رزومه</th>
              <th style="width: 30%;">یافته عینی آزمون‌های روان‌سنجی</th>
              <th style="width: 15%;">قضاوت کارشناسی</th>
              <th style="width: 30%;">تحلیل ریسک عملیاتی در سازمان</th>
            </tr>
          </thead>
          <tbody>
            ${report.claimDiscrepancies.map(c => `
              <tr>
                <td><strong>${c.claim}</strong><br><span style="font-size: 12px; color: var(--text-muted);">${c.source}</span></td>
                <td>${c.psychometricReality}</td>
                <td>
                  <span class="badge ${c.verdict.includes('بحرانی') ? 'badge-danger' : c.verdict.includes('اغراق') ? 'badge-warning' : 'badge-success'}">
                    ${c.verdict}
                  </span>
                </td>
                <td>${c.riskAnalysis}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </section>

    <!-- SECTION: COMPETENCY-BASED INTERVIEW QUESTIONS -->
    ${report.competencyQuestions && report.competencyQuestions.length > 0 ? `
    <section class="card">
      <div class="card-title-bar">
        <h2>🎯 سوالات مصاحبه بر پایه شایستگی‌های مورد نیاز شغل (STAR Competency Questions)</h2>
        <span class="badge badge-primary">Job Competencies Focus</span>
      </div>
      <p class="prose" style="margin-bottom: 20px;">
        این سوالات مستقیماً بر مبنای شایستگی‌های کلیدی تعیین‌شده توسط ارزیاب برای این موقعیت شغلی تدوین شده‌اند تا تسلط، رفتار گذشته و شیوه حل مسئله کاندیدا محک زده شود:
      </p>

      ${report.competencyQuestions.map((cq, idx) => `
        <div class="bei-box">
          <div class="bei-meta">
            <span class="badge badge-primary">شایستگی #${idx + 1}: ${cq.competencyName}</span>
            <span class="badge badge-dark">اولویت: ${cq.importanceLevel}</span>
          </div>
          <div style="font-size: 13px; color: #475569; margin-bottom: 6px;">
            <strong>سناریو و بافت سازمانی:</strong> ${cq.scenario}
          </div>
          <div style="font-size: 13px; color: #312e81; margin-bottom: 8px;">
            <strong>شاخص‌های رفتاری مورد انتظار:</strong> ${cq.behavioralIndicators}
          </div>
          <div class="bei-question-text" style="border-right-color: #4f46e5; background: #eef2ff;">
            <strong>سوال اصلی رفتارمحور:</strong> «${cq.exactQuestion}»
          </div>

          ${cq.probingFollowUp ? `
          <div style="margin-top: 10px; font-size: 13px; background: #f8fafc; padding: 10px 14px; border-radius: 8px; border: 1px solid #e2e8f0;">
            <strong style="color: #334155;">سوال پیگیری و تعمیق (Probing):</strong>
            <p style="margin-top: 4px; color: #475569;">«${cq.probingFollowUp}»</p>
          </div>
          ` : ''}

          <div class="flags-grid">
            <div class="flag-box flag-green">
              <strong>✅ شواهد رفتاری مثبت (Green Flags):</strong>
              <ul>
                ${cq.positiveEvidence.map(item => `<li>${item}</li>`).join('')}
              </ul>
            </div>
            <div class="flag-box flag-red">
              <strong>🚩 شواهد رفتاری منفی و ریسک‌ها (Red Flags):</strong>
              <ul>
                ${cq.negativeEvidence.map(item => `<li>${item}</li>`).join('')}
              </ul>
            </div>
          </div>
          <div style="margin-top: 12px; font-size: 12px; color: #475569; background: #f1f5f9; padding: 8px 12px; border-radius: 6px;">
            <strong>راهنمای نمره‌دهی شایستگی:</strong> ${cq.scoringGuide}
          </div>
        </div>
      `).join('')}
    </section>
    ` : ''}

    <!-- SECTION: HOGAN TRAIT VALIDATION IN INTERVIEW -->
    ${report.hoganValidationQuestions && report.hoganValidationQuestions.length > 0 ? `
    <section class="card">
      <div class="card-title-bar">
        <h2>🧪 راهنمای اعتبارسنجی صفات هوگان در مصاحبه (Hogan In-Person Reality Check)</h2>
        <span class="badge badge-danger">Traits & Derailer Validation</span>
      </div>
      <p class="prose" style="margin-bottom: 20px;">
        این سوالات اختصاصاً برای راستی‌آزمایی یافته‌های روان‌سنجی آزمون هوگان در اتاق مصاحبه طراحی شده‌اند تا مشخص شود آیا دارک‌سایدها و ویژگی‌های روانی فرد در رفتار واقعی و حضوری وی نمود دارند یا اینکه کاندیدا توانسته مکانیسم‌های جبرانی و خودآگاهی موثر ایجاد کند:
      </p>

      ${report.hoganValidationQuestions.map((hv, idx) => `
        <div class="bei-box" style="border-color: #fecaca; background: #fffdfd;">
          <div class="bei-meta">
            <span class="badge badge-danger">${hv.scaleType}: ${hv.traitOrDerailer}</span>
            <span class="badge badge-dark">نمره آزمون: ${hv.testScore}٪</span>
          </div>
          <div style="font-size: 13px; color: #334155; margin-bottom: 6px;">
            <strong>یافته و فرضیه روان‌سنجی:</strong> ${hv.hypothesis}
          </div>
          <div style="font-size: 13px; color: #92400e; margin-bottom: 10px;">
            <strong>هدف ارزیاب از راستی‌آزمایی در جلسه مصاحبه:</strong> ${hv.validationObjective}
          </div>

          <div class="bei-question-text" style="border-right-color: #dc2626; background: #fef2f2; margin-bottom: 10px;">
            <strong>سوال اصلی برای سنجش خودآگاهی:</strong> «${hv.primaryQuestion}»
          </div>

          <div class="bei-question-text" style="border-right-color: #d97706; background: #fffbeb; margin-bottom: 10px;">
            <strong>سوال تعقیبی در شرایط فشار و چالش (Stress Probe):</strong> «${hv.stressProbeQuestion}»
          </div>

          <div class="flags-grid">
            <div class="flag-box flag-green">
              <strong>✅ نشانه‌های رد فرضیه یا وجود رفتارهای جبرانی بالغ (Compensated):</strong>
              <ul>
                ${hv.signsFalseOrCompensated.map(item => `<li>${item}</li>`).join('')}
              </ul>
            </div>
            <div class="flag-box flag-red">
              <strong>🚩 نشانه‌های تایید فرضیه در مصاحبه (دیده‌شدن دارک‌ساید در رفتار):</strong>
              <ul>
                ${hv.signsTrueInInterview.map(item => `<li>${item}</li>`).join('')}
              </ul>
            </div>
          </div>

          <div style="margin-top: 12px; font-size: 12px; color: #475569; background: #f1f5f9; padding: 8px 12px; border-radius: 6px;">
            <strong>راهنمای نتیجه‌گیری ارزیاب پس از شنیدن پاسخ:</strong> ${hv.ratingVerdictPrompt}
          </div>
        </div>
      `).join('')}
    </section>
    ` : ''}

    <!-- SECTION: BEI INTERVIEW QUESTIONS -->
    <section class="card">
      <div class="card-title-bar">
        <h2>🎯 راهنمای مهندسی معکوس مصاحبه رفتارمحور (BEI Interview Guide)</h2>
        <span class="badge badge-primary">Reverse-Engineered Probing</span>
      </div>
      <p class="prose" style="margin-bottom: 20px;">
        این سوالات اختصاصاً بر پایه دارک‌سایدهای کشف‌شده کاندیدا طراحی شده‌اند تا در جلسه مصاحبه تخصصی، وی را در شرایط تضاد منافع قرار داده و نحوه واکنش واقعی او را آشکار سازند:
      </p>

      ${report.beiInterviewGuide.map((q, idx) => `
        <div class="bei-box">
          <div class="bei-meta">
            <span class="badge badge-danger">هدف: ${q.targetDerailer}</span>
            <span class="badge badge-dark">محور: ${q.category}</span>
          </div>
          <div style="font-size: 14px; color: #334155; margin-bottom: 8px;">
            <strong>سناریوی تحریک در صنعت تلکام:</strong> ${q.scenario}
          </div>
          <div style="font-size: 13px; color: #d97706; margin-bottom: 8px;">
            <strong>تضاد منافع طراحی‌شده:</strong> ${q.conflictOfInterests}
          </div>
          <div class="bei-question-text">
            سوال دقیق برای طرح در مصاحبه: «${q.exactQuestion}»
          </div>
          <div class="flags-grid">
            <div class="flag-box flag-green">
              <strong>✅ نشانه‌های مثبت و مطلوب (Green Flags):</strong>
              <ul>
                ${q.lookFors.greenFlags.map(item => `<li>${item}</li>`).join('')}
              </ul>
            </div>
            <div class="flag-box flag-red">
              <strong>🚩 علائم هشدار و رفتار مخرب (Red Flags):</strong>
              <ul>
                ${q.lookFors.redFlags.map(item => `<li>${item}</li>`).join('')}
              </ul>
            </div>
          </div>
          <div style="margin-top: 12px; font-size: 12px; color: #475569; background: #f1f5f9; padding: 8px 12px; border-radius: 6px;">
            <strong>سنجه نمره‌دهی:</strong> ${q.evaluationRubric}
          </div>
        </div>
      `).join('')}
    </section>

    <!-- SECTION: ONBOARDING SAFEGUARDS -->
    <section class="card">
      <div class="card-title-bar">
        <h2>🛡️ پروتکل صیانت و مدیریت دارک‌سایدها در صورت استخدام (Onboarding Safeguards)</h2>
        <span class="badge badge-success">Risk Mitigation Plan</span>
      </div>
      <p class="prose" style="margin-bottom: 14px;">
        چنانچه سازمان به دلایل فنی یا اضطرار بازار ناگزیر به جذب کاندیدا باشد، الزامات زیر باید به عنوان ضمیمه قرارداد و برنامه مهار ریسک در ۶ ماه نخست اجرایی شوند:
      </p>
      <ul style="padding-right: 24px; font-size: 14px; color: #334155; line-height: 2;">
        ${report.onboardingSafeguards.map(item => `<li>${item}</li>`).join('')}
      </ul>
    </section>

    <footer style="text-align: center; color: var(--text-muted); font-size: 13px; margin-top: 40px; padding: 20px 0; border-top: 1px solid var(--border);">
      تولید شده توسط سامانه تخصصی ارزیابی استراتژیک تلنت و تحلیل روان‌سنجی شغلی | منطبق بر استانداردهای روان‌شناسی صنعتی-سازمانی و هوگان
    </footer>
  </div>
</body>
</html>`;
}
