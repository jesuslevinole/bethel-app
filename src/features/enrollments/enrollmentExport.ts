import type { ExportColumn } from '../../shared/export/exportToExcel';
import type { EnrollmentRow } from '../../types/index';
import { formatDate } from '../../utils/dateFormat';

export const ENROLLMENT_EXPORT_COLUMNS: ExportColumn<EnrollmentRow>[] = [
  { header: 'Fecha', value: (row) => formatDate(row.enrollment.date), width: 12 },
  { header: 'Código', value: (row) => row.studentCode, width: 14 },
  { header: 'Alumno', value: (row) => row.studentName, width: 30 },
  { header: 'Clase', value: (row) => row.className },
];
