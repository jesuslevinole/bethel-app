// Rutas de la app en un solo lugar (las usan App.tsx y el menú lateral).
export const PATHS = {
  academicPeriods: '/app/periodos',
  app: '/app',
  attendance: '/app/asistencia-notas',
  catalogs: '/app/catalogos',
  courseCosts: '/app/costos-curso',
  dashboard: '/app/resumen',
  enrollments: '/app/inscripciones',
  login: '/login',
  myPayments: '/app/mis-pagos',
  myProfile: '/app/mi-ficha',
  payments: '/app/pagos',
  portal: '/',
  roles: '/app/roles',
  studentDetail: '/app/alumnos/:studentId',
  students: '/app/alumnos',
  teacherAssignments: '/app/materias-maestros',
  users: '/app/usuarios',
} as const;

export const buildStudentDetailPath = (studentId: string) => PATHS.studentDetail.replace(':studentId', studentId);

// Un catálogo abierto directamente (la pantalla de Catálogos lee ?catalogo=).
export const CATALOG_QUERY_PARAM = 'catalogo';
export const buildCatalogPath = (catalogKey: string) => `${PATHS.catalogs}?${CATALOG_QUERY_PARAM}=${catalogKey}`;
