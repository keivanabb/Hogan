import { StoredDocument, DocumentKind } from '../types/workspace';

/**
 * مخزن مدارک مبتنی بر localStorage.
 *
 * محدودیت واقعی: سهمیه localStorage در مرورگرها حدود ۵ مگابایت است، بنابراین
 * نگهداری «اصل فایل» فقط تا سقف بودجه تعیین‌شده انجام می‌شود و در صورت پر شدن
 * فضا، قدیمی‌ترین فایل‌های اصلی حذف می‌شوند ولی متن استخراج‌شده و شناسنامه سند
 * همیشه باقی می‌ماند. برای بایگانی دائمی و چندکاربره به سرویس سمت سرور نیاز است.
 */

const VAULT_KEY = 'hr_talent_document_vault_v1';

/** سقف حجم نسخه اصل فایل‌ها در مرورگر (بایت) */
export const RAW_FILE_BUDGET_BYTES = 3 * 1024 * 1024;
/** حداکثر حجم یک فایل برای نگهداری نسخه اصل */
export const MAX_SINGLE_RAW_FILE_BYTES = 1.2 * 1024 * 1024;
/** حداکثر طول متن استخراج‌شده ذخیره‌شده */
export const MAX_EXTRACTED_TEXT_CHARS = 8000;

export interface VaultWriteResult {
  documents: StoredDocument[];
  rawFileDropped: boolean;
  message?: string;
}

export function loadVault(): StoredDocument[] {
  try {
    const raw = localStorage.getItem(VAULT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as StoredDocument[]) : [];
  } catch (err) {
    console.error('خطا در خواندن مخزن مدارک:', err);
    return [];
  }
}

function approximateSize(docs: StoredDocument[]): number {
  return docs.reduce((sum, d) => sum + (d.dataUrl ? d.dataUrl.length : 0), 0);
}

/**
 * ذخیره لیست مدارک با محافظ سهمیه: اگر مرورگر فضا نداشت، نسخه اصل فایل‌ها
 * از قدیمی‌ترین سند به بعد حذف می‌شود تا نوشتن موفق شود.
 */
export function persistVault(docs: StoredDocument[]): VaultWriteResult {
  let working = [...docs];
  let dropped = false;

  const attempt = (): boolean => {
    try {
      localStorage.setItem(VAULT_KEY, JSON.stringify(working));
      return true;
    } catch {
      return false;
    }
  };

  // ۱) رعایت بودجه نسخه اصل فایل‌ها پیش از نوشتن
  while (approximateSize(working) > RAW_FILE_BUDGET_BYTES) {
    const oldestWithRaw = [...working]
      .filter((d) => d.dataUrl)
      .sort((a, b) => a.uploadedAt.localeCompare(b.uploadedAt))[0];
    if (!oldestWithRaw) break;
    working = working.map((d) => (d.id === oldestWithRaw.id ? { ...d, dataUrl: undefined } : d));
    dropped = true;
  }

  // ۲) تلاش برای نوشتن و آزادسازی تدریجی در صورت پر بودن سهمیه مرورگر
  while (!attempt()) {
    const oldestWithRaw = [...working]
      .filter((d) => d.dataUrl)
      .sort((a, b) => a.uploadedAt.localeCompare(b.uploadedAt))[0];

    if (oldestWithRaw) {
      working = working.map((d) => (d.id === oldestWithRaw.id ? { ...d, dataUrl: undefined } : d));
      dropped = true;
      continue;
    }

    // دیگر فایل اصلی برای حذف نمانده است؛ نوشتن ممکن نیست
    return {
      documents: working,
      rawFileDropped: dropped,
      message:
        'فضای ذخیره‌سازی مرورگر تکمیل است. شناسنامه مدارک ذخیره نشد؛ لطفاً چند سند قدیمی را حذف کنید.'
    };
  }

  return {
    documents: working,
    rawFileDropped: dropped,
    message: dropped
      ? 'به دلیل محدودیت فضای مرورگر، نسخه اصل قدیمی‌ترین فایل‌ها حذف شد؛ متن استخراج‌شده و شناسنامه اسناد محفوظ است.'
      : undefined
  };
}

export async function fileToDataUrl(file: File): Promise<string | undefined> {
  if (file.size > MAX_SINGLE_RAW_FILE_BYTES) return undefined;
  return await new Promise<string | undefined>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : undefined);
    reader.onerror = () => resolve(undefined);
    reader.readAsDataURL(file);
  });
}

export function buildDocumentId(): string {
  return `doc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function filterDocuments(
  docs: StoredDocument[],
  options: {
    positionId?: string;
    kind?: DocumentKind | 'all';
    ownerId?: string;
    query?: string;
  }
): StoredDocument[] {
  const { positionId, kind, ownerId, query } = options;
  const normalizedQuery = (query || '').trim().toLowerCase();

  return docs
    .filter((d) => (positionId ? d.positionId === positionId : true))
    .filter((d) => (kind && kind !== 'all' ? d.kind === kind : true))
    .filter((d) => (ownerId ? d.uploadedById === ownerId : true))
    .filter((d) => {
      if (!normalizedQuery) return true;
      return (
        d.fileName.toLowerCase().includes(normalizedQuery) ||
        d.candidateCode.toLowerCase().includes(normalizedQuery) ||
        d.uploadedByName.toLowerCase().includes(normalizedQuery) ||
        d.extractedText.toLowerCase().includes(normalizedQuery)
      );
    })
    .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
}

export function formatBytes(bytes: number): string {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} بایت`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} کیلوبایت`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} مگابایت`;
}

export function downloadStoredDocument(doc: StoredDocument): void {
  if (doc.dataUrl) {
    const link = document.createElement('a');
    link.href = doc.dataUrl;
    link.download = doc.fileName;
    link.click();
    return;
  }

  // نسخه اصل موجود نیست؛ متن استخراج‌شده تحویل داده می‌شود
  const blob = new Blob([doc.extractedText || 'متنی از این سند استخراج نشده است.'], {
    type: 'text/plain;charset=utf-8;'
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${doc.fileName.replace(/\.[^.]+$/, '')}_متن-استخراج-شده.txt`;
  link.click();
  URL.revokeObjectURL(url);
}
