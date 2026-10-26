import { useEffect, useState } from 'react';
import { getErrorMessage } from '../../../utils/firebaseErrors';
import { getStudentHistory, type EnrollmentRecordSource } from '../services/studentAcademicRecord';

interface HistoryState {
  error: string | null;
  history: EnrollmentRecordSource[];
  studentId: string | null;
}

// Historial completo del alumno (todos los períodos). Se pide al abrir el expediente, no con la ficha.
export const useStudentHistory = (studentId: string) => {
  const [state, setState] = useState<HistoryState>({ error: null, history: [], studentId: null });

  useEffect(() => {
    let isCurrentRequest = true;
    const loadHistory = async () => {
      try {
        const history = await getStudentHistory(studentId);
        if (isCurrentRequest) setState({ error: null, history, studentId });
      } catch (error) {
        console.error(error);
        if (isCurrentRequest) setState({ error: getErrorMessage(error), history: [], studentId });
      }
    };
    void loadHistory();
    return () => {
      isCurrentRequest = false;
    };
  }, [studentId]);

  const isCurrent = state.studentId === studentId;
  return {
    error: isCurrent ? state.error : null,
    history: isCurrent ? state.history : [],
    isLoading: !isCurrent,
  };
};
