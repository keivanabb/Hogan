import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import { GoogleGenAI } from '@google/genai';

function geminiApiPlugin(): Plugin {
  return {
    name: 'gemini-api-plugin',
    configureServer(server) {
      server.middlewares.use('/api/analyze', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let body = '';
        req.on('data', chunk => {
          body += chunk;
        });

        req.on('end', async () => {
          try {
            const data = JSON.parse(body || '{}');
            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, fallback: true, message: 'GEMINI_API_KEY is not defined' }));
              return;
            }

            const ai = new GoogleGenAI();
            const userJobChallenges = data.jd?.operationalChallengesAndRisks || 'مشخص نشده است';
            const uploadedJdText = data.jd?.rawUploadedContent ? `\nمتن استخراج‌شده از فایل شرح شغل پیوست:\n${data.jd.rawUploadedContent.slice(0, 2000)}` : '';
            const uploadedResumeText = data.resume?.rawUploadedContent ? `\nمتن استخراج‌شده از رزومه پیوست:\n${data.resume.rawUploadedContent.slice(0, 2000)}` : '';

            const prompt = `شما یک متخصص ارشد منابع انسانی و روان‌شناس صنعتی-سازمانی هستید. وظیفه شما تحلیل بی‌طرفانه انطباق کاندیدا با موقعیت شغلی بر اساس رزومه، شرح شغل، نتایج تست‌های هوگان (HPI و HDS) و تست شناختی Swift است.

مهم‌ترین اصل: مخاطرات و چالش‌های بحرانی این موقعیت شغلی مستقیماً توسط ارزیاب تعیین شده است:
«مخاطرات و چالش‌های کلیدی شغل: ${userJobChallenges}»

شرح شغل و دپارتمان:
${JSON.stringify(data.jd, null, 2)}
${uploadedJdText}

رزومه و سوابق کاندیدا:
${JSON.stringify(data.resume, null, 2)}
${uploadedResumeText}

نمرات آزمون هوگان (HPI بهنجار و HDS دارک‌ساید):
HPI: ${JSON.stringify(data.hpi, null, 2)}
HDS: ${JSON.stringify(data.hds, null, 2)}

آزمون شناختی Swift:
${JSON.stringify(data.swift, null, 2)}

لطفاً تحلیل تقاطعی داده‌ها را با تمرکز مستقیم بر دارک‌سایدها (HDS)، مخاطرات مشخص‌شده توسط ارزیاب، و رفتار در شرایط بحرانی ارائه دهید. پاسخ را به صورت JSON معتبر با ساختار زیر خروجی دهید:
{
  "executiveNarrative": "تحلیل روایی جامع اجرایی از انطباق روان‌سنجی کاندیدا با مخاطرات مشخص‌شده توسط ارزیاب",
  "criticalRisksAnalysis": "واکاوی دارک‌سایدهای بالای ۷۰٪ و اثر مستقیم آنها بر چالش‌های عملیاتی عنوان‌شده",
  "interUnitConflictPrediction": "پیش‌بینی نحوه اصطکاک و تعارض با سایر معاونت‌ها در شرایط فشار",
  "teamBurnoutAssessment": "ارزیابی ریسک فرسایش تیم، فشار کار و انگیزه نیروهای تحت امر",
  "tailoredBeiAdvice": "توصیه‌های تکمیلی و سوالات چالشی برای مصاحبه عمیق رفتارمحور (BEI)"
}`;

            try {
              const response = await ai.models.generateContent({
                model: 'gemini-3.6-flash',
                contents: prompt,
                config: {
                  responseMimeType: 'application/json'
                }
              });

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                success: true,
                aiAnalysis: response.text ? JSON.parse(response.text) : null
              }));
            } catch (genError: any) {
              console.warn('Gemini generateContent notice (falling back gracefully):', genError?.message);
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                success: false,
                fallback: true,
                message: genError?.message || 'Model fallback'
              }));
            }
          } catch (err: any) {
            console.error('API Parse Error in /api/analyze:', err);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, fallback: true, error: err.message || 'Internal error' }));
          }
        });
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), geminiApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
