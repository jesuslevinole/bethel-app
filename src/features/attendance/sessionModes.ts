import type { PermissionModule } from '../../types/index';

// day = pasar lista y nota de un día; attendance = hoja completa del período (todas las fechas); grades = exámenes.
export type SessionMode = 'attendance' | 'day' | 'grades';

// Módulo de permisos que controla cada pestaña (la del día y la hoja completa son Asistencia).
export const MODE_MODULES: Record<SessionMode, PermissionModule> = {
  attendance: 'attendance',
  day: 'attendance',
  grades: 'grades',
};
