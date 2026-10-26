import { enrollmentsService } from '../../../services/enrollmentsService';
import type { Enrollment, NewRecord } from '../../../types/index';
import { syncClassRosters } from '../../teacher-assignments/services/rosterSync';

// Guardar o borrar una inscripción actualiza la lista de alumnos de los maestros de esa clase.
export const saveEnrollment = async (enrollment: Enrollment | null, data: NewRecord<Enrollment>) => {
  if (enrollment) await enrollmentsService.update(enrollment.id, data);
  else await enrollmentsService.create(data);
  await syncClassRosters([data, ...(enrollment ? [enrollment] : [])]);
};

export const deleteEnrollment = async (enrollment: Enrollment) => {
  await enrollmentsService.delete(enrollment.id);
  await syncClassRosters([enrollment]);
};
