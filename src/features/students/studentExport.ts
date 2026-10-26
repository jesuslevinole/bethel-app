import type { ExportColumn } from '../../shared/export/exportToExcel';
import type { Student } from '../../types/index';

export const STUDENT_EXPORT_COLUMNS: ExportColumn<Student>[] = [
  { header: 'Código', value: (student) => student.code, width: 14 },
  { header: 'Nombre', value: (student) => student.name, width: 30 },
  { header: 'Dirección', value: (student) => student.address, width: 30 },
  { header: 'Ciudad', value: (student) => student.city },
  { header: 'Iglesia', value: (student) => student.church, width: 30 },
  { header: 'Pastor', value: (student) => student.pastor, width: 26 },
];
