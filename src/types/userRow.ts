import type { AppUser } from './appUsers';

// Usuario listo para mostrar: con el nombre del rol y de su maestro o alumno ya resueltos.
export interface UserRow {
  isCurrentUser: boolean;
  linkLabel: string;
  roleName: string;
  user: AppUser;
}
