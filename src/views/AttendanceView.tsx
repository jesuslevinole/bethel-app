import { useAcademicPeriod } from '../features/academic-periods/academicPeriodContext';
import AttendanceWorkspace from '../features/attendance/components/AttendanceWorkspace';
import { MODE_MODULES, type SessionMode } from '../features/attendance/sessionModes';
import { usePermissions } from '../features/auth/hooks/usePermissions';
import ListSkeleton from '../shared/components/ListSkeleton';
import NoPeriodState from '../shared/components/NoPeriodState';
import ViewHeader from '../shared/components/ViewHeader';
import { useScopedPeriodCollection } from '../shared/data/useScopedData';

// La clase del día va primero: es lo que el maestro hace cada vez.
const SESSION_MODES: SessionMode[] = ['day', 'attendance', 'grades'];

// Asistencia y notas para cualquier rol que las vea: maestros (sus grupos), dirección y administración (todos).
const AttendanceView = () => {
  const permissions = usePermissions();
  const { isLoading: isLoadingPeriods, selectedPeriod } = useAcademicPeriod();
  const { data: assignments, isLoading } = useScopedPeriodCollection('teacherAssignments', selectedPeriod?.id ?? null);
  const availableModes = SESSION_MODES.filter((mode) => permissions.canView(MODE_MODULES[mode]));
  const showNoPeriod = !isLoadingPeriods && !selectedPeriod;

  return (
    <div className="view">
      <ViewHeader subtitle={selectedPeriod?.name ?? 'Sin período académico'} title="Asistencia y notas" />
      {showNoPeriod && <NoPeriodState />}
      {selectedPeriod && isLoading && <ListSkeleton />}
      {selectedPeriod && !isLoading && <AttendanceWorkspace assignments={assignments} availableModes={availableModes} period={selectedPeriod} />}
    </div>
  );
};

export default AttendanceView;
