// Módulos de la app que se controlan desde Roles. Uno nuevo se agrega aquí y TypeScript obliga a
// declararlo en features/roles/permissionModules.ts (si no, no compila). Después: roles predeterminados
// y security/firestore.rules.
export type PermissionModule =
  | 'academicPeriods'
  | 'attendance'
  | 'catalogs'
  | 'courseCosts'
  | 'dashboard'
  | 'enrollments'
  | 'grades'
  | 'payments'
  | 'roles'
  | 'students'
  | 'teacherAssignments'
  | 'users';

// Qué registros puede ver: ninguno, solo los propios (los ligados a su maestro o alumno) o todos.
export type ViewScope = 'all' | 'none' | 'own';

// create / edit / delete los aplican también las reglas de Firestore. Los demás deciden qué botones salen:
// export = Exportar a Excel, print = Imprimir, history = Expediente académico, viewAs = Ver como (Usuarios).
export type PermissionAction = 'create' | 'delete' | 'edit' | 'export' | 'history' | 'print' | 'viewAs';

// Todas las acciones solo aplican sobre lo que el rol puede ver.
export interface ModulePermission {
  create: boolean;
  delete: boolean;
  edit: boolean;
  export: boolean;
  history: boolean;
  print: boolean;
  viewAs: boolean;
  view: ViewScope;
}

export type RolePermissions = Record<PermissionModule, ModulePermission>;

// Qué tipo de persona tiene el rol. Maestro y Estudiante se ligan solos a su registro al crear el usuario
// (por eso "ver solo los propios" sabe qué es suyo). Personal = administración, dirección, etc.
export type RoleKind = 'staff' | 'student' | 'teacher';

export interface Role {
  description: string;
  id: string;
  kind: RoleKind;
  name: string;
  permissions: RolePermissions;
}
