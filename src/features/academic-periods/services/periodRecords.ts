import { COLLECTIONS } from '../../../lib/firebase/collections';
import { academicPeriodsService } from '../../../services/academicPeriodsService';
import { assertNotReferenced } from '../../../shared/data/references';
import type { AcademicPeriod } from '../../../types/index';

// Un período con registros no se borra: costos, materias, inscripciones y notas quedarían sin período.
export const deleteAcademicPeriod = async (period: AcademicPeriod) => {
  await assertNotReferenced(
    [
      { collectionName: COLLECTIONS.enrollments, field: 'periodId', label: 'Inscripciones', operator: '==' },
      { collectionName: COLLECTIONS.teacherAssignments, field: 'periodId', label: 'Materias por maestro', operator: '==' },
      { collectionName: COLLECTIONS.courseCosts, field: 'periodId', label: 'Costos del curso', operator: '==' },
      { collectionName: COLLECTIONS.attendance, field: 'periodId', label: 'Asistencia', operator: '==' },
      { collectionName: COLLECTIONS.grades, field: 'periodId', label: 'Notas', operator: '==' },
    ],
    period.id,
  );
  await academicPeriodsService.delete(period.id);
};
