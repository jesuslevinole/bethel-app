// Concepto de un pago (una línea del invoice). Los nombres se copian al guardar: el invoice no cambia
// si después se renombra un tipo de pago en Catálogos, y el estudiante lo ve sin leer los catálogos.
export interface PaymentItem {
  amount: number;
  // Detalle libre ("Libro 2", "Anuario"…). En mensualidades se arma solo con el mes.
  description: string;
  // Mes que paga (AAAA-MM), solo en mensualidades; '' en los demás.
  month: string;
  paymentTypeId: string;
  paymentTypeName: string;
}

// Un pago = un invoice: alumno, clase y período, cómo pagó y uno o varios conceptos.
// invoiceNumber es correlativo para todo el instituto (counters/payments).
export interface Payment {
  bankId: string;
  bankName: string;
  classId: string;
  date: string;
  id: string;
  incomeTypeId: string;
  incomeTypeName: string;
  invoiceNumber: number;
  items: PaymentItem[];
  notes: string;
  periodId: string;
  studentId: string;
  // Suma de los conceptos (se guarda para listas e informes; se recalcula al guardar).
  total: number;
}

// Concepto que se cobra, deducido del nombre del tipo de pago (Inscripción, Libros, Graduación, Mensualidad).
export type ChargeKind = 'books' | 'enrollment' | 'graduation' | 'monthly' | 'other';

export interface MonthStatus {
  due: number;
  isDue: boolean;
  month: string;
  paid: number;
}

// Estado de cuenta de un alumno en un período (features/payments/studentAccount.ts).
export interface StudentAccount {
  balance: number;
  charges: Record<Exclude<ChargeKind, 'other'>, number>;
  dueToDate: number;
  lastPaymentDate: string | null;
  months: MonthStatus[];
  overdue: number;
  overdueMonths: string[];
  paid: number;
  paidByKind: Record<ChargeKind, number>;
  programTotal: number;
}
