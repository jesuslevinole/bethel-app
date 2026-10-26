// Descarga una lista como archivo de Excel (.xlsx). La librería se carga solo al exportar.
export interface ExportColumn<Row> {
  header: string;
  value: (row: Row) => number | string | null | undefined;
  width?: number;
}

const DEFAULT_WIDTH = 18;

// "Alumnos" → "Alumnos 10-23-2026.xlsx" (fecha local en MM-DD-AAAA, como el resto de la app).
const buildFileName = (baseName: string) => {
  const now = new Date();
  const stamp = [now.getMonth() + 1, now.getDate()].map((part) => String(part).padStart(2, '0')).join('-');
  return `${baseName} ${stamp}-${now.getFullYear()}.xlsx`;
};

export const exportToExcel = async <Row>(baseName: string, columns: ExportColumn<Row>[], rows: Row[]) => {
  const { default: writeExcelFile } = await import('write-excel-file/browser');
  const headerRow = columns.map((column) => ({ fontWeight: 'bold' as const, value: column.header }));
  const bodyRows = rows.map((row) =>
    columns.map((column) => {
      const value = column.value(row);
      return value === null || value === undefined || value === '' ? null : value;
    }),
  );
  await writeExcelFile([headerRow, ...bodyRows], {
    columns: columns.map((column) => ({ width: column.width ?? DEFAULT_WIDTH })),
    sheet: baseName.slice(0, 31),
    stickyRowsCount: 1,
  }).toFile(buildFileName(baseName));
};
