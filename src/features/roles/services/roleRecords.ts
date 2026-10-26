import { COLLECTIONS } from '../../../lib/firebase/collections';
import { rolesService } from '../../../services/rolesService';
import { assertNotReferenced } from '../../../shared/data/references';
import type { NewRecord, Role } from '../../../types/index';
import { DEFAULT_ROLES } from '../defaultRoles';

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
