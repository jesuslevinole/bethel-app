import type { AppSession, AppUser, Role } from '../../types/index';
import { completePermissions, intersectPermissions } from '../roles/permissions';
import type { ViewAsTarget } from './viewAsContext';

interface ViewAsSources {
  realSession: AppSession;
  roles: Role[];
  target: ViewAsTarget;
  users: AppUser[];
}

export interface ViewAsSession {
  label: string;
  session: AppSession;
}

// La sesión tal como la vería el rol o usuario elegido: sin permisos de propietario, con su rol y su vínculo.
// null si el rol o el usuario ya no existe (o aún no carga): se sigue con la sesión real.
export const buildViewAsSession = ({ realSession, roles, target, users }: ViewAsSources): ViewAsSession | null => {
  const appUser =
    target.kind === 'user'
      ? users.find((user) => user.id === target.userId)
      : {
          active: true,
          email: '',
          id: `view-as-${target.roleId}`,
          name: roles.find((role) => role.id === target.roleId)?.name ?? '',
          roleId: target.roleId,
          studentId: null,
          teacherId: null,
        };
  const role = roles.find((candidate) => candidate.id === appUser?.roleId);
  if (!appUser || !role) return null;

  const label = target.kind === 'user' ? `${appUser.name} · ${role.name}` : `el rol ${role.name}`;
  // Quien no es propietario nunca ve más de lo que su propio rol le deja leer.
  const permissions = realSession.isOwner
    ? completePermissions(role.permissions)
    : intersectPermissions(completePermissions(role.permissions), completePermissions(realSession.role?.permissions));
  return {
    label,
    session: { ...realSession, appUser, isOwner: false, owner: null, role: { ...role, permissions } },
  };
};
