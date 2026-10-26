import type { NewRecord, Role, RoleKind, RolePermissions } from '../../types/index';
import { inferRoleKind } from './defaultRoles';
import { ALL_PERMISSION_ACTIONS, PERMISSION_MODULES } from './permissionModules';
import { completePermissions, emptyPermissions, normalizePermission } from './permissions';

export interface RoleFormValues {
  description: string;
  kind: RoleKind;
  name: string;
  permissions: RolePermissions;
}

export const toRoleFormValues = (role: Role | null): RoleFormValues => ({
  description: role?.description ?? '',
  kind: role ? inferRoleKind(role) : 'staff',
  name: role?.name ?? '',
  permissions: role ? completePermissions(role.permissions) : emptyPermissions(),
});

export const validateRole = (values: RoleFormValues, roles: Role[], ownId?: string) => {
  const name = values.name.trim();
  if (!name) return 'Escribe el nombre del rol.';
  const isDuplicate = roles.some((role) => role.id !== ownId && role.name.trim().toLowerCase() === name.toLowerCase());
  return isDuplicate ? `Ya existe un rol llamado "${name}".` : null;
};

// Guarda permisos coherentes: sin "ver" no quedan acciones marcadas, y solo alcances y acciones que el módulo admite.
export const toRoleData = (values: RoleFormValues): NewRecord<Role> => ({
  description: values.description.trim(),
  kind: values.kind,
  name: values.name.trim(),
  permissions: Object.fromEntries(
    PERMISSION_MODULES.map(({ actions, key, scopes }) => {
      const permission = normalizePermission(values.permissions[key], scopes);
      const actionValues = Object.fromEntries(
        ALL_PERMISSION_ACTIONS.map((action) => [action, actions.includes(action) && permission[action]]),
      );
      return [key, { ...actionValues, view: permission.view }];
    }),
  ) as RolePermissions,
});

// Cuántos módulos ve el rol (para la columna "Módulos visibles").
export const countVisibleModules = (permissions: Partial<RolePermissions> | undefined) =>
  PERMISSION_MODULES.filter(({ key }) => (permissions?.[key]?.view ?? 'none') !== 'none').length;

// Cuántas casillas activas tiene el rol (ver + acciones), para el contador del editor.
export const countActivePermissions = (permissions: RolePermissions) =>
  PERMISSION_MODULES.reduce((total, { actions, key }) => {
    const permission = permissions[key];
    if (permission.view === 'none') return total;
    return total + 1 + actions.filter((action) => permission[action]).length;
  }, 0);
