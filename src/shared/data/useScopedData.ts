import { useMemo } from 'react';
import { usePermissions } from '../../features/auth/hooks/usePermissions';
import { COLLECTIONS } from '../../lib/firebase/collections';
import type { PermissionModule, Student } from '../../types/index';
import { useLiveCollection, useLivePeriodCollection, type OwnerFilter, type PeriodCollectionKey } from './liveCollections';
import { useLiveDocument } from './useLiveDocument';

interface ScopeConfig {
  module: PermissionModule;
  ownerField: OwnerFilter['field'] | null;
}

// Qué módulo de permisos controla cada colección por período, y qué campo dice de quién es un registro.
const PERIOD_SCOPES: Record<PeriodCollectionKey, ScopeConfig> = {
  courseCosts: { module: 'courseCosts', ownerField: null },
  enrollments: { module: 'enrollments', ownerField: 'studentId' },
  payments: { module: 'payments', ownerField: 'studentId' },
  teacherAssignments: { module: 'teacherAssignments', ownerField: 'teacherId' },
};

// Registros del período que el rol puede ver: todos, solo los propios (filtrados por dueño) o ninguno.
// Las vistas usan esto en vez de useLivePeriodCollection para no pedir lo que las reglas rechazarían.
export const useScopedPeriodCollection = <Key extends PeriodCollectionKey>(key: Key, periodId: string | null) => {
  const permissions = usePermissions();
  const { module, ownerField } = PERIOD_SCOPES[key];
  const scope = permissions.scope(module);
  const ownerId = ownerField === 'studentId' ? permissions.studentId : permissions.teacherId;
  const ownerFilter = scope === 'own' && ownerField && ownerId ? { field: ownerField, value: ownerId } : null;
  const canQuery = scope === 'all' || Boolean(ownerFilter);
  return useLivePeriodCollection(key, canQuery ? periodId : null, ownerFilter);
};

export const useScopedPeriodData = <Key extends PeriodCollectionKey>(key: Key, periodId: string | null) =>
  useScopedPeriodCollection(key, periodId).data;

// Alumnos que el rol puede ver: la lista completa, solo el suyo (usuario ligado a un alumno) o ninguno.
export const useStudentDirectory = () => {
  const permissions = usePermissions();
  const scope = permissions.scope('students');
  const allStudents = useLiveCollection('students', scope === 'all');
  const ownStudentId = scope === 'own' ? permissions.studentId : null;
  const ownStudent = useLiveDocument<Student>(COLLECTIONS.students, ownStudentId);

  return useMemo(() => {
    if (scope === 'all') return allStudents;
    const ownData = ownStudent.data ? [ownStudent.data] : [];
    return { data: ownData, error: ownStudent.error, isLoading: ownStudent.isLoading };
  }, [allStudents, ownStudent, scope]);
};
