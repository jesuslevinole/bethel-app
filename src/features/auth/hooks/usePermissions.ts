import { useMemo } from 'react';
import { completePermissions, fullPermissions, hasAction } from '../../roles/permissions';
import type { PermissionAction, PermissionModule } from '../../../types/index';
import { useAppSession } from '../appSessionContext';

// Qué puede ver y hacer el usuario actual. El propietario puede todo siempre.
// Las reglas de Firestore aplican lo mismo del lado del servidor: esto solo decide qué se muestra.
export const usePermissions = () => {
  const { appUser, isOwner, role } = useAppSession();

  return useMemo(() => {
    const permissions = isOwner ? fullPermissions() : completePermissions(role?.permissions);
    const scope = (module: PermissionModule) => permissions[module].view;
    return {
      can: (module: PermissionModule, action: PermissionAction) => hasAction(permissions[module], action),
      canView: (module: PermissionModule) => scope(module) !== 'none',
      isOwner,
      scope,
      studentId: appUser?.studentId ?? null,
      teacherId: appUser?.teacherId ?? null,
    };
  }, [appUser, isOwner, role]);
};

export type Permissions = ReturnType<typeof usePermissions>;

// Permisos de fila (editar / eliminar) de un módulo, listos para pasar a tablas y tarjetas.
export const useRowPermissions = (module: PermissionModule) => {
  const permissions = usePermissions();
  return useMemo(
    () => ({ canDelete: permissions.can(module, 'delete'), canEdit: permissions.can(module, 'edit') }),
    [module, permissions],
  );
};
