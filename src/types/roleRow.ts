import type { Role } from './roles';

// Rol listo para la tabla de Roles: con sus módulos visibles y cuántos usuarios lo tienen.
export interface RoleRow {
  role: Role;
  userCount: number | null;
  visibleModules: number;
}
