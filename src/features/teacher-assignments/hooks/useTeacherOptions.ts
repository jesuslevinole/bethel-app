import { useMemo } from 'react';
import { useLiveCollection } from '../../../shared/data/liveCollections';
import type { Teacher } from '../../../types/index';
import { usePermissions } from '../../auth/hooks/usePermissions';
import { buildTeacherOptions } from '../teacherOptions';

// Opciones de "Maestro". Los usuarios solo se leen si el rol ve todos los usuarios (las reglas lo exigen);
// si no, la lista es solo el catálogo de maestros.
export const useTeacherOptions = (teachers: Teacher[]) => {
  const permissions = usePermissions();
  const canReadUsers = permissions.scope('users') === 'all';
  const { data: users } = useLiveCollection('appUsers', canReadUsers);
  const { data: roles } = useLiveCollection('roles');

  const options = useMemo(() => buildTeacherOptions({ roles, teachers, users }), [roles, teachers, users]);
  return { options, users };
};
