import ExcelJS from 'exceljs';
import { format, parse, parseISO, isValid } from 'date-fns';
import type { ImportResult, ImportValidationError, ImportedDelivery } from '../types';

type RawCell = string | number | Date | null | undefined;
type ImportableColumn = 'subject' | 'name' | 'dueDate';
type ColumnMapping = Record<ImportableColumn, number>;

interface DateNormalizationResult {
  normalized: string | null;
  reason?: 'missing' | 'invalid';
}

const DATE_FORMATS = ['yyyy-MM-dd', 'dd/MM/yyyy', 'dd-MM-yyyy', 'MM/dd/yyyy'];
const HEADER_ALIASES: Record<ImportableColumn, string[]> = {
  subject: ['subject', 'materia', 'asignatura', 'curso', 'clase'],
  name: ['name', 'nombre', 'titulo', 'tarea', 'actividad', 'trabajo'],
  dueDate: ['fecha', 'fecha limite', 'fecha de entrega', 'entrega', 'due', 'due date']
};
const COLUMN_LABELS: Record<ImportableColumn, string> = {
  subject: 'materia/asignatura',
  name: 'título/tarea',
  dueDate: 'fecha de entrega'
};
const REQUIRED_COLUMNS: ImportableColumn[] = ['subject', 'name', 'dueDate'];
const EXCEL_EPOCH = new Date(Date.UTC(1899, 11, 30));
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

const createDefaultMapping = (): ColumnMapping => ({
  subject: 0,
  name: 1,
  dueDate: 2
});

const normalizeHeaderToken = (value: RawCell): string | null => {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  return trimmed
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 ]+/gi, ' ')
    .replace(/\s+/g, ' ')
    .toLowerCase();
};

const toCellString = (value: RawCell): string => {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'string') {
    return value.trim();
  }

  if (typeof value === 'number') {
    return String(value).trim();
  }

  if (value instanceof Date) {
    return isValid(value) ? format(value, 'yyyy-MM-dd') : '';
  }

  return String(value).trim();
};

const detectColumnMapping = (row: RawCell[]): Partial<Record<ImportableColumn, number>> => {
  const mapping: Partial<Record<ImportableColumn, number>> = {};

  row.forEach((value, index) => {
    const normalized = normalizeHeaderToken(value);

    if (!normalized) {
      return;
    }

    (Object.entries(HEADER_ALIASES) as Array<[ImportableColumn, string[]]>).some(([column, aliases]) => {
      if (aliases.includes(normalized) && mapping[column] === undefined) {
        mapping[column] = index;
        return true;
      }
      return false;
    });
  });

  return mapping;
};

const normalizeDate = (value: RawCell): DateNormalizationResult => {
  if (value === null || value === undefined) {
    return { normalized: null, reason: 'missing' };
  }

  if (value instanceof Date) {
    return isValid(value)
      ? { normalized: format(value, 'yyyy-MM-dd') }
      : { normalized: null, reason: 'invalid' };
  }

  if (typeof value === 'number') {
    const milliseconds = value * MILLISECONDS_PER_DAY;
    const date = new Date(EXCEL_EPOCH.getTime() + milliseconds);

    return isValid(date)
      ? { normalized: format(date, 'yyyy-MM-dd') }
      : { normalized: null, reason: 'invalid' };
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return { normalized: null, reason: 'missing' };
    }

    const iso = parseISO(trimmed);
    if (isValid(iso)) {
      return { normalized: format(iso, 'yyyy-MM-dd') };
    }

    for (const pattern of DATE_FORMATS) {
      const parsed = parse(trimmed, pattern, new Date());
      if (isValid(parsed)) {
        return { normalized: format(parsed, 'yyyy-MM-dd') };
      }
    }

    return { normalized: null, reason: 'invalid' };
  }

  return { normalized: null, reason: 'invalid' };
};

const isRowEmpty = (row: RawCell[]): boolean =>
  row.every(value => {
    if (value === null || value === undefined) {
      return true;
    }
    if (typeof value === 'string') {
      return value.trim().length === 0;
    }
    return false;
  });

export const parseDeliveriesFile = async (file: File): Promise<ImportResult> => {
  const buffer = await file.arrayBuffer();
  const fileName = file.name.toLowerCase();
  const errors: ImportValidationError[] = [];

  try {
    const workbook = new ExcelJS.Workbook();

    const isCSV =
      fileName.endsWith('.csv') ||
      file.type === 'text/csv' ||
      file.type === 'application/csv';

    if (isCSV) {
      const csvContent = new TextDecoder('utf-8').decode(buffer);
      const worksheet = workbook.addWorksheet('Sheet1');
      const lines = csvContent.split(/\r?\n/).filter(line => line.trim().length > 0);

      lines.forEach((line, index) => {
        const values = line.split(',').map(cell => cell.trim().replace(/\"/g, ''));
        const row = worksheet.getRow(index + 1);
        values.forEach((value, columnIndex) => {
          row.getCell(columnIndex + 1).value = value;
        });
      });
    } else {
      await workbook.xlsx.load(buffer);
    }

    if (workbook.worksheets.length === 0) {
      errors.push({
        row: 0,
        column: 'structure',
        message: 'El archivo no contiene hojas. Añade al menos una pestaña con datos.'
      });
      return { deliveries: [], errors };
    }

    const worksheet = workbook.getWorksheet(isCSV ? 'Sheet1' : workbook.worksheets[0].name);

    if (!worksheet) {
      errors.push({
        row: 0,
        column: 'structure',
        message: 'No se pudo leer la hoja de cálculo principal.'
      });
      return { deliveries: [], errors };
    }

    const rows: Array<{ rowNumber: number; values: RawCell[] }> = [];
    worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
      const cellCount = Math.max(row.cellCount, REQUIRED_COLUMNS.length);
      const values: RawCell[] = [];
      for (let columnIndex = 1; columnIndex <= cellCount; columnIndex += 1) {
        values.push(row.getCell(columnIndex).value as RawCell);
      }
      rows.push({ rowNumber, values });
    });

    if (rows.length === 0) {
      errors.push({
        row: 0,
        column: 'structure',
        message: 'El archivo está vacío. Asegúrate de incluir encabezados y filas con datos.'
      });
      return { deliveries: [], errors };
    }

    const firstRow = rows[0];
    const headerMapping = detectColumnMapping(firstRow.values);
    let dataRows = rows;
    let mapping: ColumnMapping = createDefaultMapping();

    if (Object.keys(headerMapping).length > 0) {
      dataRows = rows.slice(1);

      const missingColumns = REQUIRED_COLUMNS.filter(column => headerMapping[column] === undefined);
      if (missingColumns.length > 0) {
        const missingLabels = missingColumns.map(column => COLUMN_LABELS[column]).join(', ');
        errors.push({
          row: firstRow.rowNumber,
          column: 'header',
          message: `La cabecera debe incluir las columnas: ${missingLabels}.`,
          value: firstRow.values.map(toCellString).filter(Boolean).join(', ')
        });
        return { deliveries: [], errors };
      }

      mapping = headerMapping as ColumnMapping;
    } else if (firstRow.values.length < REQUIRED_COLUMNS.length) {
      errors.push({
        row: firstRow.rowNumber,
        column: 'header',
        message: `La primera fila debe incluir al menos ${REQUIRED_COLUMNS.length} columnas (materia, título, fecha).`,
        value: firstRow.values.map(toCellString).join(', ')
      });
      return { deliveries: [], errors };
    }

    if (dataRows.length === 0) {
      errors.push({
        row: 0,
        column: 'structure',
        message: 'No se encontraron filas de datos después de la cabecera.'
      });
      return { deliveries: [], errors };
    }

    const deliveries: ImportedDelivery[] = [];

    for (const { values, rowNumber } of dataRows) {
      if (isRowEmpty(values)) {
        continue;
      }

      const rowErrors: ImportValidationError[] = [];

      const subjectValue = values[mapping.subject];
      const nameValue = values[mapping.name];
      const dueDateValue = values[mapping.dueDate];

      const subject = toCellString(subjectValue);
      if (!subject) {
        rowErrors.push({
          row: rowNumber,
          column: 'subject',
          message: 'La materia es obligatoria.',
          value: toCellString(subjectValue)
        });
      }

      const name = toCellString(nameValue);
      if (!name) {
        rowErrors.push({
          row: rowNumber,
          column: 'name',
          message: 'El título o descripción de la entrega es obligatorio.',
          value: toCellString(nameValue)
        });
      }

      const dateNormalization = normalizeDate(dueDateValue);
      const dueDateCandidate = dateNormalization.normalized;
      if (!dueDateCandidate) {
        const message =
          dateNormalization.reason === 'missing'
            ? 'La fecha de entrega es obligatoria.'
            : 'La fecha de entrega no tiene un formato reconocido (usa AAAA-MM-DD, DD/MM/AAAA, DD-MM-AAAA o MM/DD/AAAA).';

        rowErrors.push({
          row: rowNumber,
          column: 'dueDate',
          message,
          value: toCellString(dueDateValue)
        });
      }

      if (rowErrors.length > 0) {
        errors.push(...rowErrors);
        continue;
      }

      const dueDate = dueDateCandidate;
      if (!dueDate) {
        continue;
      }

      deliveries.push({ subject, name, dueDate });
    }

    return { deliveries, errors };
  } catch (error) {
    console.error('Error parsing file:', error);

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

