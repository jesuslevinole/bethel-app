import type { ModulePermission, NewRecord, Role, RoleKind, RolePermissions } from '../../types/index';
import { emptyPermissions, FULL_ACCESS, NO_ACCESS } from './permissions';

const VIEW_ALL: ModulePermission = { ...NO_ACCESS, view: 'all' };
const VIEW_OWN: ModulePermission = { ...NO_ACCESS, view: 'own' };
// Gestionar = agregar y editar (sin eliminar), exportar, imprimir y ver el historial.
const MANAGE_ALL: ModulePermission = { ...NO_ACCESS, create: true, edit: true, export: true, history: true, print: true, view: 'all' };
const MANAGE_OWN: ModulePermission = { ...NO_ACCESS, create: true, edit: true, print: true, view: 'own' };

const withPermissions = (changes: Partial<RolePermissions>): RolePermissions => ({ ...emptyPermissions(), ...changes });

// Roles con los que arranca la app (ids fijos). Después se ajustan libremente desde Roles.
// El maestro NO ve Alumnos ni Inscripciones: sus alumnos le llegan en la lista de cada materia asignada.
export const DEFAULT_ROLES: (NewRecord<Role> & { id: string })[] = [
  {
    description: 'Opera el instituto: alumnos, inscripciones, costos, catálogos y usuarios.',
    id: 'administracion',
    kind: 'staff',
    name: 'Administración',
    permissions: withPermissions({
      academicPeriods: FULL_ACCESS,
      accountStatement: FULL_ACCESS,
      admissions: FULL_ACCESS,
      attendance: FULL_ACCESS,
      bookInventory: FULL_ACCESS,
      catalogs: FULL_ACCESS,
      courseCosts: FULL_ACCESS,
      customization: FULL_ACCESS,
      dashboard: VIEW_ALL,
      enrollments: FULL_ACCESS,
      expenses: FULL_ACCESS,
      grades: FULL_ACCESS,
      payments: FULL_ACCESS,
      roles: VIEW_ALL,
      students: FULL_ACCESS,
      teacherAssignments: FULL_ACCESS,
      users: FULL_ACCESS,
    }),
  },
  {
    description: 'Ve todo el instituto y corrige lo académico; no borra ni administra accesos.',
    id: 'director',
    kind: 'staff',
    name: 'Director',
    permissions: withPermissions({
      academicPeriods: MANAGE_ALL,
      accountStatement: { ...VIEW_ALL, export: true, print: true },
      admissions: MANAGE_ALL,
      attendance: MANAGE_ALL,
      bookInventory: { ...VIEW_ALL, export: true },
      catalogs: VIEW_ALL,
      courseCosts: { ...VIEW_ALL, export: true },
      dashboard: VIEW_ALL,
      enrollments: MANAGE_ALL,
      expenses: { ...VIEW_ALL, export: true },
      grades: MANAGE_ALL,
      payments: { ...VIEW_ALL, export: true, print: true },
      roles: VIEW_ALL,
      students: MANAGE_ALL,
      teacherAssignments: MANAGE_ALL,
      users: { ...VIEW_ALL, viewAs: true },
    }),
  },
  {
    description: 'Ve solo sus materias del período y pasa asistencia y notas a los alumnos de esas materias.',
    id: 'maestro',
    kind: 'teacher',
    name: 'Maestro',
    permissions: withPermissions({
      attendance: MANAGE_OWN,
      grades: MANAGE_OWN,
      teacherAssignments: VIEW_OWN,
    }),
  },
  {
    description:
      'Ve su propia ficha, su inscripción, su carnet y sus pagos (sin cambiarlos). Su solicitud de admisión e inscripción no dependen de este rol.',
    id: 'estudiante',
    kind: 'student',
    name: 'Estudiante',
    permissions: withPermissions({
      enrollments: VIEW_OWN,
      // Ve sus pagos y puede imprimir sus invoices; no agrega, edita ni elimina.
      payments: { ...VIEW_OWN, print: true },
      students: { ...VIEW_OWN, print: true },
    }),
  },
];

// Tipo de un rol guardado antes de que existiera "kind": se deduce de los ids predeterminados.
export const inferRoleKind = (role: Pick<Role, 'id'> & { kind?: RoleKind }): RoleKind => {
  if (role.kind) return role.kind;
  if (role.id === 'maestro') return 'teacher';
  if (role.id === 'estudiante') return 'student';
  return 'staff';
};

export const ROLE_KIND_LABELS: Record<RoleKind, string> = {
  staff: 'Personal',
  student: 'Estudiante',
  teacher: 'Maestro',
};

export const ROLE_KIND_HINTS: Record<RoleKind, string> = {
  staff: 'Administración, dirección u otro personal. No se liga a ningún registro.',
  student: 'Al crear el usuario se liga al alumno con su mismo nombre (o se registra como alumno nuevo).',
  teacher: 'Al crear el usuario se liga al maestro con su mismo nombre (o se agrega al catálogo de maestros).',
};

export const getDefaultRole = (roleId: string) => DEFAULT_ROLES.find((role) => role.id === roleId) ?? null;
