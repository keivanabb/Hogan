import * as XLSX from 'xlsx';
import mammoth from 'mammoth';
import { SwiftCognitive } from '../types/assessment';

export interface ParsedDocumentResult {
  fileName: string;
  fileType: 'word' | 'excel' | 'pdf' | 'text' | 'unknown';
  extractedText: string;
  extractedScores?: Partial<SwiftCognitive>;
  detectedJobTitle?: string;
  detectedCandidateName?: string;
}

/**
 * Extracts raw text from a Word (.docx) file using mammoth
 */
export async function parseWordDocument(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  try {
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value || '';
  } catch (err) {
    console.error('Error parsing docx file with mammoth:', err);
    throw new Error('قالب فایل ورد (.docx) قابل بازخوانی نبود. لطفاً فایل معتبر انتخاب کنید.');
  }
}

/**
 * Parses an Excel or CSV file containing Swift aptitude scores
 */
export async function parseSwiftExcel(file: File): Promise<{
  scores: Partial<SwiftCognitive>;
  rawRows: any[];
  summaryText: string;
}> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error('فایل اکسل فاقد برگه (Sheet) است.');
  }

  const worksheet = workbook.Sheets[firstSheetName];
  const rows: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

  const scores: Partial<SwiftCognitive> = {};
  const foundItems: string[] = [];

  // Flatten and search for keywords or structured key-values
  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];
    if (!Array.isArray(row)) continue;

    for (let c = 0; c < row.length; c++) {
      const cellVal = String(row[c] || '').trim();
      const nextCell = row[c + 1];
      const numericVal = typeof nextCell === 'number' ? nextCell : parseFloat(String(nextCell));

      // Verbal
      if (/verbal|کلامی/i.test(cellVal) && !isNaN(numericVal) && numericVal >= 0 && numericVal <= 100) {
        scores.verbalReasoning = Math.round(numericVal);
        foundItems.push(`استدلال کلامی: ${scores.verbalReasoning}٪`);
      }

      // Numerical
      if (/numerical|محاسباتی|عددی|ریاضی/i.test(cellVal) && !isNaN(numericVal) && numericVal >= 0 && numericVal <= 100) {
        scores.numericalReasoning = Math.round(numericVal);
        foundItems.push(`استدلال محاسباتی: ${scores.numericalReasoning}٪`);
      }

      // Abstract
      if (/abstract|انتزاعی|الگو/i.test(cellVal) && !isNaN(numericVal) && numericVal >= 0 && numericVal <= 100) {
        scores.abstractReasoning = Math.round(numericVal);
        foundItems.push(`استدلال انتزاعی: ${scores.abstractReasoning}٪`);
      }

      // Overall
      if (/overall|کل|مجموع|صدک کل|iq/i.test(cellVal) && !isNaN(numericVal) && numericVal >= 0 && numericVal <= 100) {
        scores.overallPercentile = Math.round(numericVal);
        foundItems.push(`صدک کل: ${scores.overallPercentile}٪`);
      }

      // Speed vs accuracy
      if (/سرعت|دقت|speed|accuracy/i.test(cellVal)) {
        const text = String(nextCell || cellVal);
        if (text.includes('عالی')) scores.speedVsAccuracy = 'سرعت و دقت عالی';
        else if (text.includes('دقت بالا')) scores.speedVsAccuracy = 'دقت بالا / سرعت کم';
        else if (text.includes('سرعت بالا')) scores.speedVsAccuracy = 'سرعت بالا / دقت کم';
        else if (text.includes('پایین')) scores.speedVsAccuracy = 'سرعت و دقت پایین';
        else if (text.includes('متعادل')) scores.speedVsAccuracy = 'متعادل';
      }
    }
  }

  // Fallback: If headers weren't named, but rows have simple numbers
  if (!scores.overallPercentile) {
    const allNumbers: number[] = [];
    rows.forEach(r => {
      if (Array.isArray(r)) {
        r.forEach(val => {
          const n = typeof val === 'number' ? val : parseFloat(String(val));
          if (!isNaN(n) && n > 0 && n <= 100) {
            allNumbers.push(Math.round(n));
          }
        });
      }
    });

    if (allNumbers.length >= 1 && !scores.overallPercentile) scores.overallPercentile = allNumbers[0];
    if (allNumbers.length >= 2 && !scores.verbalReasoning) scores.verbalReasoning = allNumbers[1];
    if (allNumbers.length >= 3 && !scores.numericalReasoning) scores.numericalReasoning = allNumbers[2];
    if (allNumbers.length >= 4 && !scores.abstractReasoning) scores.abstractReasoning = allNumbers[3];
  }

  const summaryText = foundItems.length > 0 
    ? `امتیازات استخراج شده: ${foundItems.join(' • ')}`
    : `فایل اکسل با ${rows.length} ردیف داده بارگذاری شد.`;

  return { scores, rawRows: rows, summaryText };
}

/**
 * Parses generic text file or plain document
 */
export async function parseTextFile(file: File): Promise<string> {
  return await file.text();
}
