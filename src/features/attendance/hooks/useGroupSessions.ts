import { useEffect, useState } from 'react';
import type { AttendanceSheet, TeachingGroup } from '../../../types/index';
import { usePermissions } from '../../auth/hooks/usePermissions';
import { listenToGroupSessions } from '../services/attendanceSheets';

interface SessionsState {
  error: string | null;
  groupKey: string | null;
  sessions: AttendanceSheet[];
}

// Las clases (fechas) guardadas de un grupo, en vivo.
export const useGroupSessions = (group: TeachingGroup) => {
  const permissions = usePermissions();
  const ownTeacherId = permissions.scope('attendance') === 'own' ? permissions.teacherId : null;
  const [state, setState] = useState<SessionsState>({ error: null, groupKey: null, sessions: [] });

  const { key: groupKey, subjectId } = group;
  const assignmentId = group.assignment.id;

  useEffect(
    () =>
      listenToGroupSessions(
        assignmentId,
        subjectId,
        ownTeacherId,
        (sessions) => setState({ error: null, groupKey, sessions }),
        (error) => setState({ error, groupKey, sessions: [] }),
      ),
    [assignmentId, groupKey, ownTeacherId, subjectId],
  );

  const isCurrent = state.groupKey === groupKey;
  return {
    error: isCurrent ? state.error : null,
    isLoading: !isCurrent,
    sessions: isCurrent ? state.sessions : [],
  };
};
