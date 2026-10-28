// Tablas cuyos encabezados se pueden renombrar en Personalizar → Columnas.
// Una tabla nueva se agrega aquí y en su componente usa useColumnLabels('<tabla>').
export interface TableDefinition {
  columns: Record<string, string>;
  title: string;
}

export const TABLE_COLUMNS = {
  students: {
    columns: {
      address: 'Dirección',
      church: 'Iglesia',
      city: 'Ciudad',
      code: 'Código',
      id: 'ID',
      name: 'Alumno',
      pastor: 'Pastor',
    },
    title: 'Alumnos',
  },
  enrollments: {
    columns: { className: 'Clase', date: 'Fecha', id: 'ID', studentCode: 'ID alumno', studentName: 'Alumno' },
    title: 'Inscripciones',
  },
  teacherAssignments: {
    columns: {
      className: 'Clase',
      date: 'Fecha',
      id: 'ID',
      students: 'Alumnos',
      subjects: 'Materias',
      teacher: 'Maestro',
    },
    title: 'Materias por maestro',
  },
  dailySession: {
    columns: {
      attendance: 'Asistencia',
      average: 'Promedio ND',
      dailyScore: 'Nota del día',
      number: '#',
      student: 'Alumno',
    },
    title: 'Clase del día',
  },
  admissions: {
    columns: {
      church: 'Iglesia',
      date: 'Enviada',
      email: 'Correo',
      name: 'Solicitante',
      phone: 'Teléfono',
      status: 'Estado',
    },
    title: 'Solicitudes de admisión',
  },
  enrollmentRequests: {
    columns: { className: 'Clase', date: 'Fecha', period: 'Período', status: 'Estado', student: 'Alumno' },
    title: 'Solicitudes de inscripción',
  },
  payments: {
    columns: {
      amount: 'Monto',
      className: 'Clase',
      concepts: 'Conceptos',
      date: 'Fecha',
      invoice: 'Invoice',
      method: 'Forma de pago',
      student: 'Alumno',
    },
    title: 'Pagos registrados',
  },
  studentAccounts: {
    columns: {
      balance: 'Saldo',
      className: 'Clase',
      lastPayment: 'Último pago',
      overdue: 'Vencido',
      paid: 'Pagado',
      programTotal: 'Total programa',
      status: 'Estado',
      student: 'Alumno',
    },
    title: 'Estado de cuenta de alumnos',
  },
  bookStock: {
    columns: {
      className: 'Clase',
      code: 'Código',
      in: 'Entrada',
      name: 'Libro',
      out: 'Salida',
      price: 'Precio del libro',
      sold: 'Venta',
      stock: 'Stock',
    },
    title: 'Inventario de libros',
  },
  bookMovements: {
    columns: { book: 'Libro', date: 'Fecha', detail: 'Detalle', kind: 'Movimiento', quantity: 'Cantidad' },
    title: 'Movimientos de libros',
  },
  expenses: {
    columns: {
      amount: 'Monto',
      category: 'Categoría',
      date: 'Fecha',
      description: 'Descripción',
      method: 'Forma de pago',
    },
    title: 'Gastos',
  },
  statementIncome: {
    columns: { amount: 'Monto', date: 'Fecha', invoice: 'Invoice', method: 'Forma de pago', student: 'Alumno' },
    title: 'Estado de cuenta: entradas',
  },
  statementExpenses: {
    columns: { amount: 'Monto', category: 'Categoría', date: 'Fecha', description: 'Descripción' },
    title: 'Estado de cuenta: salidas',
  },
  courseCosts: {
    columns: {
      books: 'Libros',
      className: 'Clase',
      courseTotal: 'Total curso',
      date: 'Fecha',
      enrollment: 'Inscripción',
      graduation: 'Graduación',
      id: 'ID',
      monthly: 'Mensualidad',
      programTotal: 'Total programa',
    },
    title: 'Costos del curso',
  },
  users: {
    columns: { email: 'Correo', link: 'Registrado como', name: 'Nombre', role: 'Rol', status: 'Estado' },
    title: 'Usuarios',
  },
  roles: {
    columns: {
      actions: 'Acciones',
      description: 'Descripción',
      kind: 'Tipo',
      modules: 'Módulos visibles',
      name: 'Rol',
      users: 'Usuarios',
    },
    title: 'Roles',
  },
} satisfies Record<string, TableDefinition>;

export type TableId = keyof typeof TABLE_COLUMNS;

export type ColumnKey<Table extends TableId> = keyof (typeof TABLE_COLUMNS)[Table]['columns'] & string;

export const TABLE_IDS = Object.keys(TABLE_COLUMNS) as TableId[];
