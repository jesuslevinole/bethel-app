import { useMemo } from 'react';
import { useLiveCollection } from '../../../shared/data/liveCollections';
import { useScopedPeriodData } from '../../../shared/data/useScopedData';
import { useAcademicPeriod } from '../../academic-periods/academicPeriodContext';
import { usePermissions } from '../../auth/hooks/usePermissions';
import { buildNotifications } from '../notificationRules';

// Avisos del usuario actual. Usa los mismos listeners compartidos que las vistas (no agrega lecturas nuevas
// salvo los costos, inscripciones y materias del período, que el rol ya puede ver).
export const useNotifications = () => {
  const permissions = usePermissions();
  const { periods, selectedPeriod } = useAcademicPeriod();
  const periodId = selectedPeriod?.id ?? null;
  const { data: classes } = useLiveCollection('classes');
  const { data: subjects } = useLiveCollection('subjects');
  const { data: teachers } = useLiveCollection('teachers');
  const { data: roles } = useLiveCollection('roles');
  const courseCosts = useScopedPeriodData('courseCosts', periodId);
  const enrollments = useScopedPeriodData('enrollments', periodId);
  const assignments = useScopedPeriodData('teacherAssignments', periodId);

  return useMemo(
    () =>
      buildNotifications({
        assignments,
        classes,
        courseCosts,
        enrollments,
        periods,
        permissions,
        roles,
        selectedPeriod,
        subjects,
        teachers,
      }),
    [assignments, classes, courseCosts, enrollments, periods, permissions, roles, selectedPeriod, subjects, teachers],
  );
};
