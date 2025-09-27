import ExcelJS from 'exceljs';
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

  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);

    const worksheetNames = workbook.worksheets.map(ws => ws.name);
    if (worksheetNames.length === 0) {
      return [];
    }

    const worksheet = workbook.getWorksheet(worksheetNames[0]);
    if (!worksheet) {
      return [];
    }
    const imported: ImportedDelivery[] = [];
    const targetWorksheet = worksheet;

    // Iterar sobre todas las filas (empezando desde la fila 1)
    targetWorksheet.eachRow((row, rowNumber) => {
      // Saltar la primera fila si es header
      if (rowNumber === 1) {
        const firstCell = row.getCell(1).value;
        if (firstCell && typeof firstCell === 'string' && firstCell.toLowerCase().includes('asign')) {
          return; // Es header, saltar
        }
      }

      const rowData: RawCell[] = [];
      row.eachCell((cell) => {
        rowData.push(cell.value as RawCell);
      });

      const sanitized = sanitizeRow(rowData);
      if (sanitized) {
        imported.push(sanitized);
      }
    });

    return imported;
  } catch (error) {
    console.error('Error parsing Excel file:', error);
    throw new Error('No se pudo procesar el archivo. Asegúrate de que sea un archivo Excel válido.');
  }
};
