import { normalizeText } from '../../../utils/search';

// Una fila de la lista que se importa (tabla de Word, CSV o texto pegado).
export interface ImportRow {
  code: string;
  // Año / clase de la lista (1 = Primer, 2 = Segundo…); null si no trae.
  year: number | null;
  key: string;
  monthlyFee: number | null;
  name: string;
}

const CODE_PATTERN = /^\d{4,}$/;
const HAS_LETTERS = /[a-záéíóúñ]/i;

interface ColumnMap {
  code: number;
  fee: number;
  name: number;
  year: number;
}

// Columnas por su encabezado: "Estudiante #" / "Código" / "ID", "Nombre", "Año" / "Clase", "Mensualidad".
const findColumns = (header: string[]): ColumnMap | null => {
  const cells = header.map(normalizeText);
  const find = (test: (cell: string) => boolean) => cells.findIndex(test);
  const name = find((cell) => cell.includes('nombre'));
  if (name < 0) return null;
  return {
    code: find((cell) => cell.includes('estudiante #') || cell.includes('codigo') || cell === 'id' || cell.includes('estudiante#')),
    fee: find((cell) => cell.includes('mensualidad')),
    name,
    year: find((cell) => cell.startsWith('ano') || cell.includes('clase')),
  };
};

const parseNumber = (text: string | undefined) => {
  const value = Number.parseFloat((text ?? '').replace(/[$,\s]/g, ''));
  return Number.isFinite(value) ? value : null;
};

// Sin encabezado: el código es la primera celda con 4+ dígitos y el nombre la primera con letras.
const guessRow = (cells: string[]): Omit<ImportRow, 'key'> | null => {
  const name = cells.find((cell) => HAS_LETTERS.test(cell)) ?? '';
  if (!name) return null;
  return { code: cells.find((cell) => CODE_PATTERN.test(cell)) ?? '', monthlyFee: null, name, year: null };
};

// Tabla (filas × celdas) → alumnos. Ignora filas vacías o sin nombre (como las filas 16 y 17 de la hoja).
export const parseStudentTable = (table: string[][]): ImportRow[] => {
  const cleanTable = table
    .map((row) => row.map((cell) => cell.replace(/\s+/g, ' ').trim()))
    .filter((row) => row.some(Boolean));
  const headerIndex = cleanTable.findIndex((row) => findColumns(row) !== null);
  const columns = headerIndex >= 0 ? findColumns(cleanTable[headerIndex]) : null;
  const dataRows = headerIndex >= 0 ? cleanTable.slice(headerIndex + 1) : cleanTable;

  return dataRows
    .map((cells): Omit<ImportRow, 'key'> | null => {
      if (!columns) return guessRow(cells);
      const name = cells[columns.name] ?? '';
      if (!HAS_LETTERS.test(name)) return null;
      const year = columns.year >= 0 ? parseNumber(cells[columns.year]) : null;
      return {
        code: columns.code >= 0 && CODE_PATTERN.test(cells[columns.code] ?? '') ? cells[columns.code] : '',
        monthlyFee: columns.fee >= 0 ? parseNumber(cells[columns.fee]) : null,
        name,
        year: year !== null && Number.isInteger(year) ? year : null,
      };
    })
    .filter((row): row is Omit<ImportRow, 'key'> => row !== null)
    .map((row, index) => ({ ...row, key: `${index}-${row.code}-${row.name}` }));
};

// Texto pegado (de Word o Excel: columnas separadas por tabulador) o CSV (coma o punto y coma).
export const parseStudentText = (text: string) => {
  const lines = text.split(/\r?\n/);
  const separator = lines.some((line) => line.includes('\t')) ? '\t' : lines.some((line) => line.includes(';')) ? ';' : ',';
  return parseStudentTable(lines.map((line) => line.split(separator)));
};
