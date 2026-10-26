import type { ExportColumn } from '../../shared/export/exportToExcel';
import type { CourseCost } from '../../types/index';
import { formatMonth, getBooksTotal, getCourseTotal, getProgramTotal, summarizeMonthlyFees } from '../../utils/courseCost';
import { formatDate } from '../../utils/dateFormat';
import { getRelationName } from '../../utils/relations';

export const getCourseCostExportColumns = (classNames: Map<string, string>): ExportColumn<CourseCost>[] => [
  { header: 'Fecha', value: (cost) => formatDate(cost.date), width: 12 },
  { header: 'Clase', value: (cost) => getRelationName(classNames, cost.classId) },
  { header: 'Inscripción', value: (cost) => cost.enrollmentFee, width: 14 },
  { header: 'Libros', value: (cost) => getBooksTotal(cost.books), width: 14 },
  { header: 'Graduación', value: (cost) => cost.graduationFee, width: 14 },
  { header: 'Mensualidad', value: (cost) => summarizeMonthlyFees(cost.monthlyFees), width: 24 },
  { header: 'Total curso', value: (cost) => getCourseTotal(cost), width: 14 },
  { header: 'Total programa', value: (cost) => getProgramTotal(cost), width: 16 },
  {
    header: 'Mensualidad por mes',
    value: (cost) => (cost.monthlyFees ?? []).map((fee) => `${formatMonth(fee.month)}: ${fee.amount}`).join(', '),
    width: 60,
  },
  { header: 'Detalle de libros', value: (cost) => cost.books.map((book) => `${book.title} (${book.amount})`).join(', '), width: 50 },
];
