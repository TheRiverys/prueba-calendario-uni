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
  const fileName = file.name.toLowerCase();

  try {
    const workbook = new ExcelJS.Workbook();

    // Detectar si es CSV o Excel
    const isCSV = fileName.endsWith('.csv') ||
                  file.type === 'text/csv' ||
                  file.type === 'application/csv';

    if (isCSV) {
      // Para archivos CSV, usar una aproximación más simple
      const csvContent = new TextDecoder('utf-8').decode(buffer);

      // Crear una hoja de trabajo manualmente con los datos CSV
      const worksheet = workbook.addWorksheet('Sheet1');

      // Dividir el CSV en líneas y procesar
      const lines = csvContent.split('\n').filter(line => line.trim());
      lines.forEach((line, index) => {
        const values = line.split(',').map(val => val.trim().replace(/"/g, ''));
        const row = worksheet.getRow(index + 1);
        values.forEach((value, colIndex) => {
          row.getCell(colIndex + 1).value = value;
        });
      });
    } else {
      // Para archivos Excel, usar xlsx.load()
      await workbook.xlsx.load(buffer);
    }

    const worksheetNames = workbook.worksheets.map(ws => ws.name);
    if (worksheetNames.length === 0) {
      return [];
    }

    const worksheet = workbook.getWorksheet(isCSV ? 'Sheet1' : worksheetNames[0]);
    if (!worksheet) {
      return [];
    }

    const imported: ImportedDelivery[] = [];

    // Iterar sobre todas las filas (empezando desde la fila 1)
    worksheet.eachRow((row, rowNumber) => {
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
    console.error('Error parsing file:', error);

    // Proporcionar mensajes de error más específicos
    if (error instanceof Error) {
      if (error.message.includes('zip file')) {
        throw new Error('El archivo parece ser un CSV. Asegúrate de que el archivo tenga extensión .csv o .xlsx.');
      }
      if (error.message.includes('CSV')) {
        throw new Error('Error al procesar el archivo CSV. Verifica que el formato sea correcto.');
      }
    }

    throw new Error('No se pudo procesar el archivo. Asegúrate de que sea un archivo Excel (.xlsx) o CSV válido.');
  }
};
