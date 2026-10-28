import type { PermissionAction, PermissionModule, ViewScope } from '../../types/index';

export interface PermissionModuleDefinition {
  // Acciones (columnas) que tienen sentido en el módulo; las demás salen como "—".
  actions: PermissionAction[];
  description: string;
  group: 'Académico' | 'Configuración' | 'Finanzas' | 'Seguridad';
  key: PermissionModule;
  label: string;
  // Qué significa "propios" en este módulo. Sin texto, el módulo no ofrece "propios".
  ownMeaning: string | null;
  scopes: ViewScope[];
}

const CRUD: PermissionAction[] = ['create', 'edit', 'delete'];

// Un Record por módulo: si se agrega un módulo a PermissionModule y no se declara aquí, no compila.
// El orden de las llaves es el orden en la pantalla de Roles.
const MODULES: Record<PermissionModule, Omit<PermissionModuleDefinition, 'key'>> = {
  dashboard: {
    actions: [],
    description: 'Panel de inicio con números del período.',
    group: 'Académico',
    label: 'Resumen',
    ownMeaning: null,
    scopes: ['none', 'all'],
  },
  admissions: {
    actions: [...CRUD, 'export', 'print'],
    description:
      'Solicitudes de admisión y de inscripción que envían los estudiantes. Aprobar = editar. Imprimir = solicitud para firmas.',
    group: 'Académico',
    label: 'Solicitudes',
    ownMeaning: null,
    scopes: ['none', 'all'],
  },
  students: {
    actions: [...CRUD, 'export', 'print', 'history'],
    description: 'Registro de alumnos y su ficha. Imprimir = carnet y boletas; historial = expediente académico.',
    group: 'Académico',
    label: 'Alumnos',
    ownMeaning: 'Su propia ficha (usuarios con rol de tipo Estudiante).',
    scopes: ['none', 'own', 'all'],
  },
  enrollments: {
    actions: [...CRUD, 'export'],
    description: 'Alumnos inscritos en cada clase del período.',
    group: 'Académico',
    label: 'Inscripciones',
    ownMeaning: 'Sus propias inscripciones (usuarios con rol de tipo Estudiante).',
    scopes: ['none', 'own', 'all'],
  },
  teacherAssignments: {
    actions: [...CRUD, 'export'],
    description: 'Materias que da cada maestro en el período.',
    group: 'Académico',
    label: 'Materias por maestro',
    ownMeaning: 'Solo sus materias del período (usuarios con rol de tipo Maestro).',
    scopes: ['none', 'own', 'all'],
  },
  attendance: {
    actions: [...CRUD, 'export', 'print'],
    description: 'Clase del día y hoja completa: asistencia y nota diaria. Imprimir = hoja de asistencia.',
    group: 'Académico',
    label: 'Asistencia',
    ownMeaning: 'Solo la de sus materias, con sus alumnos (rol de tipo Maestro).',
    scopes: ['none', 'own', 'all'],
  },
  grades: {
    actions: [...CRUD, 'export'],
    description: 'Exámenes y proyecto; promedio y GPA se calculan solos.',
    group: 'Académico',
    label: 'Notas',
    ownMeaning: 'Solo las de sus materias, con sus alumnos (rol de tipo Maestro).',
    scopes: ['none', 'own', 'all'],
  },
  payments: {
    actions: [...CRUD, 'export', 'print'],
    description: 'Pagos de los alumnos con su invoice, estado de cuenta y reporte de deudores. Imprimir = invoice.',
    group: 'Finanzas',
    label: 'Pagos',
    ownMeaning: 'Solo sus pagos y su estado de cuenta (usuarios con rol de tipo Estudiante).',
    scopes: ['none', 'own', 'all'],
  },
  bookInventory: {
    actions: [...CRUD, 'export'],
    description: 'Libros con código y precio, entradas, salidas (dañados, regalados) y existencias. Las ventas salen de Pagos.',
    group: 'Finanzas',
    label: 'Inventario de libros',
    ownMeaning: null,
    scopes: ['none', 'all'],
  },
  expenses: {
    actions: [...CRUD, 'export'],
    description: 'Gastos del instituto (salidas de dinero) con su categoría.',
    group: 'Finanzas',
    label: 'Gastos',
    ownMeaning: null,
    scopes: ['none', 'all'],
  },
  accountStatement: {
    actions: ['export', 'print'],
    description: 'Entradas (pagos) y salidas (gastos) entre dos fechas, con el saldo.',
    group: 'Finanzas',
    label: 'Estado de cuenta',
    ownMeaning: null,
    scopes: ['none', 'all'],
  },
  academicPeriods: {
    actions: CRUD,
    description: 'Períodos académicos y sus dos semestres.',
    group: 'Configuración',
    label: 'Períodos académicos',
    ownMeaning: null,
    scopes: ['none', 'all'],
  },
  courseCosts: {
    actions: [...CRUD, 'export'],
    description: 'Inscripción, libros, mensualidad y graduación por clase.',
    group: 'Configuración',
    label: 'Costos del curso',
    ownMeaning: null,
    scopes: ['none', 'all'],
  },
  catalogs: {
    actions: [...CRUD, 'export'],
    description: 'Clases, materias, libros, maestros, tipos de pago, bancos y gastos.',
    group: 'Configuración',
    label: 'Catálogos',
    ownMeaning: null,
    scopes: ['none', 'all'],
  },
  customization: {
    actions: ['edit'],
    description: 'Nombre y orden del menú, listas desplegables del menú y nombres de las columnas de las tablas.',
    group: 'Configuración',
    label: 'Personalizar',
    ownMeaning: null,
    scopes: ['none', 'all'],
  },
  users: {
    actions: [...CRUD, 'export', 'viewAs'],
    description: 'Cuentas de acceso y su rol. Ver como = ver la app como otro rol o usuario.',
    group: 'Seguridad',
    label: 'Usuarios',
    ownMeaning: null,
    scopes: ['none', 'all'],
  },
  roles: {
    actions: CRUD,
    description: 'Esta pantalla: qué puede ver y hacer cada rol.',
    group: 'Seguridad',
    label: 'Roles',
    ownMeaning: null,
    scopes: ['none', 'all'],
  },
};

// Lista de módulos que aparecen en la pantalla de Roles, en el orden en que se muestran.
export const PERMISSION_MODULES: PermissionModuleDefinition[] = (
  Object.entries(MODULES) as [PermissionModule, Omit<PermissionModuleDefinition, 'key'>][]
).map(([key, definition]) => ({ ...definition, key }));

export const SCOPE_LABELS: Record<ViewScope, string> = {
  all: 'Todos',
  none: 'Ninguno',
  own: 'Propios',
};

// Columnas de la matriz de permisos, en orden. hint = qué hace (se ve al pasar el mouse).
export const ACTION_COLUMNS: { action: PermissionAction; hint: string; label: string }[] = [
  { action: 'create', hint: 'Agregar registros nuevos.', label: 'Agregar' },
  { action: 'edit', hint: 'Cambiar registros guardados.', label: 'Editar' },
  { action: 'delete', hint: 'Eliminar registros.', label: 'Eliminar' },
  { action: 'export', hint: 'Descargar la lista en un archivo de Excel.', label: 'Exportar Excel' },
  { action: 'print', hint: 'Imprimir documentos (carnet, boletas, hoja de asistencia).', label: 'Imprimir' },
  { action: 'history', hint: 'Ver el expediente académico de todos los períodos.', label: 'Historial' },
  { action: 'viewAs', hint: 'Ver la app como otro rol o usuario.', label: 'Ver como' },
];

export const ALL_PERMISSION_ACTIONS: PermissionAction[] = ACTION_COLUMNS.map(({ action }) => action);

export const ACTION_LABELS = Object.fromEntries(
  ACTION_COLUMNS.map(({ action, label }) => [action, label]),
) as Record<PermissionAction, string>;
