import { COLLECTIONS } from '../../../lib/firebase/collections';
import { rolesService } from '../../../services/rolesService';
import { assertNotReferenced } from '../../../shared/data/references';
import type { NewRecord, Role } from '../../../types/index';
import { DEFAULT_ROLES } from '../defaultRoles';
import { PERMISSION_MODULES } from '../permissionModules';

// Crea solo los roles predeterminados que falten (nunca pisa uno que ya existe).
export const seedDefaultRoles = async (existingRoleIds: string[]) => {
  const missingRoles = DEFAULT_ROLES.filter((role) => !existingRoleIds.includes(role.id));
  await Promise.all(missingRoles.map(({ id, ...role }) => rolesService.set(id, role)));
};

export const saveRole = async (roleId: string | null, role: NewRecord<Role>) => {
  if (roleId) {
    await rolesService.update(roleId, role);
    return roleId;
  }
  return rolesService.create(role);
};

// Un rol con usuarios no se borra: esos usuarios se quedarían sin acceso.
export const deleteRole = async (role: Role) => {
  await assertNotReferenced(
    [{ collectionName: COLLECTIONS.appUsers, field: 'roleId', label: 'Usuarios', operator: '==' }],
    role.id,
  );
  await rolesService.delete(role.id);
};

// Roles predeterminados guardados antes de que existieran algunos módulos (no los traen en permissions).
export const findRolesMissingModules = (roles: Role[]) =>
  roles
    .map((role) => ({
      missingModules: PERMISSION_MODULES.filter(({ key }) => !(key in (role.permissions ?? {}))),
      role,
    }))
    .filter(({ missingModules, role }) => missingModules.length > 0 && DEFAULT_ROLES.some((preset) => preset.id === role.id));

// Les agrega a esos roles los permisos sugeridos de los módulos que les faltan (sin tocar lo que ya tenían).
export const addMissingModulePermissions = async (roles: Role[]) => {
  await Promise.all(
    findRolesMissingModules(roles).map(({ missingModules, role }) => {
      const preset = DEFAULT_ROLES.find((candidate) => candidate.id === role.id);
      const additions = Object.fromEntries(missingModules.map(({ key }) => [key, preset?.permissions[key]]));
      return rolesService.update(role.id, { permissions: { ...role.permissions, ...additions } });
    }),
  );
};
