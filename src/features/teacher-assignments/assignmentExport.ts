import type { ExportColumn } from '../../shared/export/exportToExcel';
import type { AssignmentRow } from '../../types/index';
import { formatDate } from '../../utils/dateFormat';

export const ASSIGNMENT_EXPORT_COLUMNS: ExportColumn<AssignmentRow>[] = [
  { header: 'Fecha', value: (row) => formatDate(row.assignment.date), width: 12 },
  { header: 'Maestro', value: (row) => row.teacherName, width: 28 },
  { header: 'Clase', value: (row) => row.className },
  { header: 'Materias', value: (row) => row.subjectNames.join(', '), width: 60 },
  { header: 'Alumnos', value: (row) => row.assignment.roster?.length ?? 0, width: 10 },
];
