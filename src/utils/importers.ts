import { read, utils } from 'xlsx';
import { format, parse, parseISO, isValid } from 'date-fns';
import type { ImportedDelivery } from '../types';

type RawCell = string | number | Date | null | undefined;

const DATE_FORMATS = ['yyyy-MM-dd', 'dd/MM/yyyy', 'dd-MM-yyyy', 'MM/dd/yyyy'];

const normalizeDate = (value: RawCell): string | null => {
  if (!value && value !== 0) {
    return null;
  }

  if (value instanceof Date) {
    return isValid(value) ? format(value, 'yyyy-MM-dd') : null;
  }

  if (typeof value === 'number') {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const milliseconds = value * 24 * 60 * 60 * 1000;
    const date = new Date(excelEpoch.getTime() + milliseconds);
    return isValid(date) ? format(date, 'yyyy-MM-dd') : null;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }

    const iso = parseISO(trimmed);
    if (isValid(iso)) {
      return format(iso, 'yyyy-MM-dd');
    }

    for (const pattern of DATE_FORMATS) {
      const parsed = parse(trimmed, pattern, new Date());
      if (isValid(parsed)) {
        return format(parsed, 'yyyy-MM-dd');
      }
    }
  }

  return null;
};

const sanitizeRow = (row: RawCell[]): ImportedDelivery | null => {
  if (row.length < 3) {
    return null;
  }

  const [rawSubject, rawName, rawDate] = row;
  const subject = typeof rawSubject === 'string' ? rawSubject.trim() : String(rawSubject ?? '').trim();
  const name = typeof rawName === 'string' ? rawName.trim() : String(rawName ?? '').trim();
  const dueDate = normalizeDate(rawDate);

  if (!subject || !name || !dueDate) {
    return null;
  }

  return { subject, name, dueDate };
};

export const parseDeliveriesFile = async (file: File): Promise<ImportedDelivery[]> => {
  const buffer = await file.arrayBuffer();
  const workbook = read(buffer, {
    type: 'array',
    cellDates: true,
    dense: true
  });

  if (workbook.SheetNames.length === 0) {
    return [];
  }

  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = utils.sheet_to_json<RawCell[]>(sheet, {
    header: 1,
    blankrows: false,
    defval: ''
  });

  const imported: ImportedDelivery[] = [];

  rows.forEach((row: RawCell[], index: number) => {
    if (!Array.isArray(row)) {
      return;
    }

    const isHeader = index === 0 && row[0] && typeof row[0] === 'string' && row[0].toLowerCase().includes('asign');
    if (isHeader) {
      return;
    }

    const sanitized = sanitizeRow(row);
    if (sanitized) {
      imported.push(sanitized);
    }
  });

  return imported;
};
