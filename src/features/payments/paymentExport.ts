import type { ExportColumn } from '../../shared/export/exportToExcel';
import type { Payment } from '../../types/index';
import { formatMonth } from '../../utils/courseCost';
import { formatDate } from '../../utils/dateFormat';
import { getRelationName } from '../../utils/relations';
import type { AccountRow } from './accountRows';
import { formatInvoiceNumber } from './services/paymentRecords';
import { ACCOUNT_STATUS_LABELS } from './studentAccount';

interface PaymentExportLookups {
  classNames: Map<string, string>;
  studentCodes: Map<string, string>;
  studentNames: Map<string, string>;
}

export const getPaymentExportColumns = ({
  classNames,
  studentCodes,
  studentNames,
}: PaymentExportLookups): ExportColumn<Payment>[] => [
  { header: 'Invoice', value: (payment) => formatInvoiceNumber(payment.invoiceNumber), width: 13 },
  { header: 'Fecha', value: (payment) => formatDate(payment.date), width: 12 },
  { header: 'Código', value: (payment) => studentCodes.get(payment.studentId) ?? '', width: 14 },
  { header: 'Alumno', value: (payment) => getRelationName(studentNames, payment.studentId), width: 28 },
  { header: 'Clase', value: (payment) => getRelationName(classNames, payment.classId) },
  {
    header: 'Conceptos',
    value: (payment) =>
      payment.items
        .map((item) => [item.paymentTypeName, item.month ? formatMonth(item.month) : item.description].filter(Boolean).join(' '))
        .join(', '),
    width: 44,
  },
  { header: 'Forma de pago', value: (payment) => payment.incomeTypeName, width: 16 },
  { header: 'Banco', value: (payment) => payment.bankName, width: 16 },
  { header: 'Monto', value: (payment) => payment.total, width: 12 },
];

// Reporte de deudores: quién tiene pagos vencidos a la fecha y cuánto.
export const DEBTOR_EXPORT_COLUMNS: ExportColumn<AccountRow>[] = [
  { header: 'Código', value: (row) => row.studentCode, width: 14 },
  { header: 'Alumno', value: (row) => row.studentName, width: 28 },
  { header: 'Clase', value: (row) => row.className },
  { header: 'Total del programa', value: (row) => row.account.programTotal, width: 18 },
  { header: 'Pagado', value: (row) => row.account.paid, width: 12 },
  { header: 'Vencido a la fecha', value: (row) => row.account.overdue, width: 18 },
  { header: 'Saldo total', value: (row) => row.account.balance, width: 13 },
  {
    header: 'Mensualidades vencidas',
    value: (row) => row.account.overdueMonths.map(formatMonth).join(', '),
    width: 44,
  },
  { header: 'Último pago', value: (row) => (row.account.lastPaymentDate ? formatDate(row.account.lastPaymentDate) : 'Sin pagos'), width: 13 },
  { header: 'Estado', value: (row) => ACCOUNT_STATUS_LABELS[row.status], width: 10 },
];
