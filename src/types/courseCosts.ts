export interface CourseBook {
  amount: number;
  title: string;
}

// Lo que se paga en un mes del curso. month = AAAA-MM.
export interface MonthlyFee {
  amount: number;
  month: string;
}

// Costos de una clase en un período: inscripción, libros, graduación y la mensualidad de cada mes
// (como la hoja de PAGOS: p. ej. $55 de septiembre a mayo y $25 en junio).
// Total curso = suma de las mensualidades; total del programa = inscripción + libros + graduación + total curso.
// Los totales se calculan con utils/courseCost.ts; no se guardan para que nunca queden desfasados.
// Registros viejos pueden traer courseTotal o no traer monthlyFees: se completan al editarlos.
export interface CourseCost {
  books: CourseBook[];
  classId: string;
  date: string;
  enrollmentFee: number;
  graduationFee: number;
  id: string;
  // Creado por Importar alumnos con datos de prueba.
  isTest?: boolean;
  monthlyFees?: MonthlyFee[];
  // Meses con mensualidad (se guarda para listas e informes).
  months: number;
  periodId: string;
}

// Fila editable de libro en el formulario: rowId solo existe en pantalla (key estable), no se guarda.
export interface CourseBookRow extends CourseBook {
  rowId: string;
}
