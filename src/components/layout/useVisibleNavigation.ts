import { useMemo } from 'react';
import { useAppSession } from '../../features/auth/appSessionContext';
import { usePermissions } from '../../features/auth/hooks/usePermissions';
import { inferRoleKind } from '../../features/roles/defaultRoles';
import type { RoleKind } from '../../types/index';
import { NAVIGATION, type NavigationItem } from './navigation';

// Tipo de rol de la sesión (el propietario cuenta como personal).
export const useSessionRoleKind = (): RoleKind => {
  const { isOwner, role } = useAppSession();
  if (isOwner || !role) return 'staff';
  return inferRoleKind(role);
};

// El menú del usuario actual: solo los grupos e ítems que su rol puede ver. El estudiante que aún no es
// alumno (cuenta nueva, solicitud sin aprobar) solo ve Inicio y Mi solicitud: lo demás estaría vacío.
export const useVisibleNavigation = () => {
  const permissions = usePermissions();
  const roleKind = useSessionRoleKind();

  return useMemo(() => {
    const isApplicant = roleKind === 'student' && !permissions.studentId;
    const isVisible = (item: NavigationItem) => {
      if (item.roleKinds && !item.roleKinds.includes(roleKind)) return false;
      if (item.modules.length === 0) return true;
      if (isApplicant) return false;
      return item.modules.some((module) =>
        item.scope ? permissions.scope(module) === item.scope : permissions.canView(module),
      );
    };
    return NAVIGATION.map((group) => ({ ...group, items: group.items.filter(isVisible) })).filter(
      (group) => group.items.length > 0,
    );
  }, [permissions, roleKind]);
};
