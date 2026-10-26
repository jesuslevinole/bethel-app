import { COLLECTIONS } from '../../../lib/firebase/collections';
import ListSkeleton from '../../../shared/components/ListSkeleton';
import { useLiveDocument } from '../../../shared/data/useLiveDocument';
import { keepClassSessions } from '../../../utils/classDays';
import type { AcademicPeriod, GradeSheet, TeachingGroup } from '../../../types/index';
import { useGroupSessions } from '../hooks/useGroupSessions';
import { getGradeSheetId } from '../sheetIds';
import AttendanceSheetEditor from './AttendanceSheetEditor';
import DailySessionEditor from './DailySessionEditor';
import GradesEditor from './GradesEditor';
import type { SessionMode } from '../sessionModes';
import RosterEmptyState from './RosterEmptyState';

interface GroupSessionProps {
  group: TeachingGroup;
  mode: SessionMode;
  period: AcademicPeriod;
}

// Los alumnos salen de la lista del propio registro de materias (roster): el maestro no lee Alumnos.
const GroupSession = ({ group, mode, period }: GroupSessionProps) => {
  const students = group.assignment.roster ?? [];
  const groupSessions = useGroupSessions(group);
  // Solo miércoles de clase del período: lo demás no se muestra ni cuenta.
  const sessions = { ...groupSessions, sessions: keepClassSessions(groupSessions.sessions, period) };
  const gradeSheetId = mode === 'grades' ? getGradeSheetId(group.assignment.id, group.subjectId) : null;
  const gradeSheet = useLiveDocument<GradeSheet>(COLLECTIONS.grades, gradeSheetId);

  if (students.length === 0) return <RosterEmptyState group={group} />;
  if (sessions.isLoading || gradeSheet.isLoading) return <ListSkeleton rows={6} />;

  const sheetError = sessions.error ?? gradeSheet.error;
  if (sheetError) return <p className="form-alert">No se pudo abrir la hoja. Revisa tu conexión o tus permisos.</p>;

  if (mode === 'grades') {
    return (
      <GradesEditor
        group={group}
        key={`${gradeSheetId}-${students.length}`}
        savedScores={gradeSheet.data?.scores ?? null}
        sessions={sessions.sessions}
        students={students}
      />
    );
  }

  if (mode === 'day') {
    return (
      <DailySessionEditor
        group={group}
        key={`${group.key}-${students.length}`}
        period={period}
        sessions={sessions.sessions}
        students={students}
      />
    );
  }

  return (
    <AttendanceSheetEditor
      group={group}
      key={`${group.key}-${students.length}`}
      period={period}
      sessions={sessions.sessions}
      students={students}
    />
  );
};

export default GroupSession;
