import { useEffect, useState } from 'react';
import type { AttendanceSheet, GradeSheet } from '../../../types/index';
import { getErrorMessage } from '../../../utils/firebaseErrors';
import { getClassAcademicRecord } from '../services/studentAcademicRecord';

interface ClassRecordState {
  attendanceSheets: AttendanceSheet[];
  error: string | null;
  gradeSheets: GradeSheet[];
  requestKey: string | null;
}

// Asistencia y notas de la clase del alumno en el período (se leen una vez al abrir la ficha).
export const useClassAcademicRecord = (periodId: string | null, classId: string | null) => {
  const requestKey = periodId && classId ? `${periodId}|${classId}` : null;
  const [state, setState] = useState<ClassRecordState>({ attendanceSheets: [], error: null, gradeSheets: [], requestKey: null });

  useEffect(() => {
    if (!periodId || !classId) return undefined;
    let isCurrentRequest = true;
    const loadRecord = async () => {
      const key = `${periodId}|${classId}`;
      try {
        const record = await getClassAcademicRecord(periodId, classId);
        if (isCurrentRequest) setState({ ...record, error: null, requestKey: key });
      } catch (error) {
        console.error(error);
        if (isCurrentRequest) setState({ attendanceSheets: [], error: getErrorMessage(error), gradeSheets: [], requestKey: key });
      }
    };
    void loadRecord();
    return () => {
      isCurrentRequest = false;
    };
  }, [classId, periodId]);

  const isCurrent = state.requestKey === requestKey;
  return {
    attendanceSheets: isCurrent ? state.attendanceSheets : [],
    error: isCurrent ? state.error : null,
    gradeSheets: isCurrent ? state.gradeSheets : [],
    isLoading: Boolean(requestKey) && !isCurrent,
  };
};
